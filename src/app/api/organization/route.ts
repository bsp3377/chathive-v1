import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/organization - Get current user's organization
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user profile
        const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", user.id)
            .single();

        // Get user's organization membership
        const { data: membership } = await supabase
            .from("organization_members")
            .select(`
        *,
        organization:organizations(*)
      `)
            .eq("user_id", userProfile?.id)
            .single();

        if (!membership) {
            return NextResponse.json({
                user: userProfile,
                organization: null,
                membership: null
            });
        }

        return NextResponse.json({
            user: userProfile,
            organization: membership.organization,
            membership: {
                id: membership.id,
                role: membership.role,
                is_available: membership.is_available,
                max_concurrent_chats: membership.max_concurrent_chats,
                notification_preferences: membership.notification_preferences,
            },
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/organization - Create organization (during onboarding)
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create user profile
        let userProfile = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", user.id)
            .single();

        if (!userProfile.data) {
            const { data: newUser } = await supabase
                .from("users")
                .insert({
                    auth_user_id: user.id,
                    email: user.email!,
                    first_name: body.first_name,
                    last_name: body.last_name,
                })
                .select()
                .single();
            userProfile = { data: newUser, error: null };
        }

        // Generate slug from name
        const slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        // Create organization
        const { data: organization, error: orgError } = await supabase
            .from("organizations")
            .insert({
                name: body.name,
                slug: `${slug}-${Date.now().toString(36)}`,
                email: body.email || user.email,
                phone: body.phone,
                timezone: body.timezone || "UTC",
                currency: body.currency || "USD",
                settings: body.settings || {},
            })
            .select()
            .single();

        if (orgError) {
            console.error("Error creating organization:", orgError);
            return NextResponse.json({ error: orgError.message }, { status: 500 });
        }

        // Add user as owner
        const { error: memberError } = await supabase
            .from("organization_members")
            .insert({
                organization_id: organization.id,
                user_id: userProfile.data!.id,
                role: "owner",
                joined_at: new Date().toISOString(),
            });

        if (memberError) {
            console.error("Error adding member:", memberError);
            // Rollback organization creation
            await supabase.from("organizations").delete().eq("id", organization.id);
            return NextResponse.json({ error: memberError.message }, { status: 500 });
        }

        return NextResponse.json({
            organization,
            message: "Organization created successfully",
        }, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
