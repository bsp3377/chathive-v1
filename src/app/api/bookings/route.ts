import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/bookings - List bookings with filters
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
            .select("organization_id, user_id")
            .eq("user_id", user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        // Parse query params
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "25");
        const status = searchParams.get("status");
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");
        const customerId = searchParams.get("customer_id");
        const assignedTo = searchParams.get("assigned_to");

        const offset = (page - 1) * limit;

        let query = supabase
            .from("bookings")
            .select(`
        *,
        customer:customers(id, name, phone, avatar_url),
        service:services(id, name, duration_minutes, color),
        assigned_user:users!bookings_assigned_to_fkey(id, first_name, last_name)
      `, { count: "exact" })
            .eq("organization_id", membership.organization_id)
            .order("starts_at", { ascending: true })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.in("status", status.split(","));
        }

        if (startDate) {
            query = query.gte("starts_at", startDate);
        }

        if (endDate) {
            query = query.lte("starts_at", endDate);
        }

        if (customerId) {
            query = query.eq("customer_id", customerId);
        }

        if (assignedTo) {
            query = query.eq("assigned_to", assignedTo);
        }

        const { data: bookings, count, error } = await query;

        if (error) {
            console.error("Error fetching bookings:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data: bookings,
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

// POST /api/bookings - Create a new booking
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

        // Get service details if provided
        let serviceDuration = 60;
        if (body.service_id) {
            const { data: service } = await supabase
                .from("services")
                .select("duration_minutes, price, currency")
                .eq("id", body.service_id)
                .single();

            if (service) {
                serviceDuration = service.duration_minutes;
            }
        }

        // Calculate end time
        const startsAt = new Date(body.starts_at);
        const endsAt = new Date(startsAt.getTime() + serviceDuration * 60 * 1000);

        const bookingData = {
            organization_id: membership.organization_id,
            customer_id: body.customer_id,
            service_id: body.service_id,
            assigned_to: body.assigned_to,
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
            timezone: body.timezone || "UTC",
            status: body.status || "confirmed",
            title: body.title,
            notes: body.notes,
            internal_notes: body.internal_notes,
            price: body.price,
            currency: body.currency,
            conversation_id: body.conversation_id,
            custom_fields: body.custom_fields || {},
        };

        const { data: booking, error } = await supabase
            .from("bookings")
            .insert(bookingData)
            .select(`
        *,
        customer:customers(id, name, phone),
        service:services(id, name, duration_minutes, color)
      `)
            .single();

        if (error) {
            console.error("Error creating booking:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
