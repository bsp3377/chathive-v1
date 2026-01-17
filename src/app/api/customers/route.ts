import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Customer } from "@/types/database";

// GET /api/customers - List customers with filters
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        // Get current user and their organization
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's organization
        const { data: membership } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        // Parse query params
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "25");
        const search = searchParams.get("search");
        const tag = searchParams.get("tag");
        const sortBy = searchParams.get("sort") || "-last_contact_at";

        const offset = (page - 1) * limit;
        const ascending = !sortBy.startsWith("-");
        const sortColumn = sortBy.replace("-", "");

        // Build query
        let query = supabase
            .from("customers")
            .select("*, tags:customer_tags(tag:tags(*))", { count: "exact" })
            .eq("organization_id", membership.organization_id)
            .order(sortColumn, { ascending })
            .range(offset, offset + limit - 1);

        // Apply search filter
        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data: customers, count, error } = await query;

        if (error) {
            console.error("Error fetching customers:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data: customers,
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

// POST /api/customers - Create a new customer
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Get current user and their organization
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

        // Create customer
        const customerData = {
            organization_id: membership.organization_id,
            phone: body.phone,
            name: body.name,
            email: body.email,
            whatsapp_id: body.whatsapp_id,
            phone_country_code: body.phone_country_code,
            company_name: body.company_name,
            job_title: body.job_title,
            address: body.address,
            notes: body.notes,
            custom_fields: body.custom_fields || {},
            first_contact_at: new Date().toISOString(),
        };

        const { data: customer, error } = await supabase
            .from("customers")
            .insert(customerData)
            .select()
            .single();

        if (error) {
            console.error("Error creating customer:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
