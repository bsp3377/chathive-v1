import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/invoices - List invoices with filters
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: membership } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "25");
        const status = searchParams.get("status");
        const customerId = searchParams.get("customer_id");

        const offset = (page - 1) * limit;

        let query = supabase
            .from("invoices")
            .select(`
        *,
        customer:customers(id, name, phone, email),
        line_items:invoice_line_items(id, description, quantity, unit_price, total)
      `, { count: "exact" })
            .eq("organization_id", membership.organization_id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.in("status", status.split(","));
        }

        if (customerId) {
            query = query.eq("customer_id", customerId);
        }

        const { data: invoices, count, error } = await query;

        if (error) {
            console.error("Error fetching invoices:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data: invoices,
            total: count || 0,
            page,
            limit,
            has_more: (count || 0) > offset + limit,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: membership } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        // Generate invoice number
        const { data: lastInvoice } = await supabase
            .from("invoices")
            .select("invoice_number")
            .eq("organization_id", membership.organization_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        const year = new Date().getFullYear();
        let sequence = 1;
        if (lastInvoice?.invoice_number) {
            const match = lastInvoice.invoice_number.match(/(\d+)$/);
            if (match) {
                sequence = parseInt(match[1]) + 1;
            }
        }
        const invoiceNumber = `INV-${year}-${String(sequence).padStart(5, "0")}`;

        // Calculate due date based on payment terms
        const issueDate = new Date(body.issue_date || Date.now());
        let dueDate = new Date(issueDate);
        switch (body.payment_terms) {
            case "net_7": dueDate.setDate(dueDate.getDate() + 7); break;
            case "net_14": dueDate.setDate(dueDate.getDate() + 14); break;
            case "net_30": dueDate.setDate(dueDate.getDate() + 30); break;
            case "net_60": dueDate.setDate(dueDate.getDate() + 60); break;
            default: break; // due_on_receipt
        }

        const invoiceData = {
            organization_id: membership.organization_id,
            customer_id: body.customer_id,
            invoice_number: invoiceNumber,
            issue_date: issueDate.toISOString().split("T")[0],
            due_date: body.due_date || dueDate.toISOString().split("T")[0],
            currency: body.currency || "USD",
            payment_terms: body.payment_terms,
            payment_instructions: body.payment_instructions,
            notes: body.notes,
            internal_notes: body.internal_notes,
            footer_text: body.footer_text,
            booking_id: body.booking_id,
            conversation_id: body.conversation_id,
            subtotal: 0,
            tax_amount: 0,
            total: 0,
        };

        const { data: invoice, error } = await supabase
            .from("invoices")
            .insert(invoiceData)
            .select()
            .single();

        if (error) {
            console.error("Error creating invoice:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Create line items if provided
        if (body.line_items && body.line_items.length > 0) {
            const lineItems = body.line_items.map((item: any, index: number) => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity || 1,
                unit_price: item.unit_price,
                discount_amount: item.discount_amount || 0,
                tax_rate_id: item.tax_rate_id,
                tax_amount: item.tax_amount || 0,
                total: (item.quantity || 1) * item.unit_price - (item.discount_amount || 0) + (item.tax_amount || 0),
                display_order: index,
            }));

            await supabase.from("invoice_line_items").insert(lineItems);

            // Update invoice totals
            const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
            const taxAmount = lineItems.reduce((sum: number, item: any) => sum + item.tax_amount, 0);
            const discountAmount = lineItems.reduce((sum: number, item: any) => sum + item.discount_amount, 0);
            const total = subtotal - discountAmount + taxAmount;

            await supabase
                .from("invoices")
                .update({ subtotal, tax_amount: taxAmount, discount_amount: discountAmount, total })
                .eq("id", invoice.id);
        }

        // Fetch complete invoice
        const { data: completeInvoice } = await supabase
            .from("invoices")
            .select(`
        *,
        customer:customers(id, name, phone, email),
        line_items:invoice_line_items(*)
      `)
            .eq("id", invoice.id)
            .single();

        return NextResponse.json(completeInvoice, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
