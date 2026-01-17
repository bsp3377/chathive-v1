import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/customers/[id] - Get single customer
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: customer, error } = await supabase
            .from("customers")
            .select(`
        *,
        tags:customer_tags(tag:tags(*)),
        conversations(id, status, last_message_at, unread_count),
        bookings(id, starts_at, status, service:services(name)),
        invoices(id, invoice_number, status, total, amount_due)
      `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching customer:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/customers/[id] - Update customer
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only allow updating certain fields
        const allowedFields = [
            "name", "email", "phone", "phone_country_code",
            "company_name", "job_title", "address", "notes", "custom_fields"
        ];

        const updateData: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (field in body) {
                updateData[field] = body[field];
            }
        }

        const { data: customer, error } = await supabase
            .from("customers")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating customer:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/customers/[id] - Delete customer (GDPR compliance)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting customer:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
