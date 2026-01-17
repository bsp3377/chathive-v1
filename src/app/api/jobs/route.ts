import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/jobs - List jobs with filters (for kanban)
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

        const status = searchParams.get("status");
        const stageId = searchParams.get("stage_id");
        const assignedTo = searchParams.get("assigned_to");
        const customerId = searchParams.get("customer_id");

        let query = supabase
            .from("jobs")
            .select(`
        *,
        customer:customers(id, name, phone, avatar_url),
        stage:job_stages(id, name, color, display_order),
        assigned_user:users!jobs_assigned_to_fkey(id, first_name, last_name, avatar_url)
      `)
            .eq("organization_id", membership.organization_id)
            .order("created_at", { ascending: false });

        if (status) {
            query = query.in("status", status.split(","));
        }

        if (stageId) {
            query = query.eq("stage_id", stageId);
        }

        if (assignedTo) {
            query = query.eq("assigned_to", assignedTo);
        }

        if (customerId) {
            query = query.eq("customer_id", customerId);
        }

        const { data: jobs, error } = await query;

        if (error) {
            console.error("Error fetching jobs:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also fetch stages for kanban columns
        const { data: stages } = await supabase
            .from("job_stages")
            .select("*")
            .eq("organization_id", membership.organization_id)
            .order("display_order", { ascending: true });

        return NextResponse.json({
            jobs,
            stages,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/jobs - Create a new job/enquiry
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

        // Generate job number
        const { data: lastJob } = await supabase
            .from("jobs")
            .select("job_number")
            .eq("organization_id", membership.organization_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        const year = new Date().getFullYear();
        let sequence = 1;
        if (lastJob?.job_number) {
            const match = lastJob.job_number.match(/(\d+)$/);
            if (match) {
                sequence = parseInt(match[1]) + 1;
            }
        }
        const jobNumber = `JOB-${year}-${String(sequence).padStart(5, "0")}`;

        // Get default stage
        const { data: defaultStage } = await supabase
            .from("job_stages")
            .select("id")
            .eq("organization_id", membership.organization_id)
            .eq("is_default", true)
            .single();

        const jobData = {
            organization_id: membership.organization_id,
            customer_id: body.customer_id,
            job_number: jobNumber,
            title: body.title,
            description: body.description,
            stage_id: body.stage_id || defaultStage?.id,
            priority: body.priority || "normal",
            assigned_to: body.assigned_to,
            due_date: body.due_date,
            source: body.source,
            conversation_id: body.conversation_id,
            estimated_value: body.estimated_value,
            currency: body.currency,
            custom_fields: body.custom_fields || {},
        };

        const { data: job, error } = await supabase
            .from("jobs")
            .insert(jobData)
            .select(`
        *,
        customer:customers(id, name, phone),
        stage:job_stages(id, name, color)
      `)
            .single();

        if (error) {
            console.error("Error creating job:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
