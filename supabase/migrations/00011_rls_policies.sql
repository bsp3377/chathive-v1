-- =============================================================
-- ROW-LEVEL SECURITY POLICIES
-- All tenant data is isolated by organization_id
-- =============================================================

-- Enable RLS on all tenant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- HELPER FUNCTION: Get user's organization IDs
-- =============================================================
CREATE OR REPLACE FUNCTION get_user_organization_ids()
RETURNS UUID[] AS $$
DECLARE
    user_uuid UUID;
    org_ids UUID[];
BEGIN
    -- Get the user ID from the JWT
    SELECT (auth.jwt() ->> 'sub')::uuid INTO user_uuid;
    
    -- Get all organizations the user belongs to
    SELECT ARRAY_AGG(om.organization_id)
    INTO org_ids
    FROM organization_members om
    INNER JOIN users u ON u.id = om.user_id
    WHERE u.auth_user_id = user_uuid;
    
    RETURN COALESCE(org_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- USERS POLICIES
-- =============================================================

-- Users can read their own profile
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- =============================================================
-- ORGANIZATIONS POLICIES
-- =============================================================

-- Users can see organizations they belong to
CREATE POLICY org_select_member ON organizations
    FOR SELECT USING (id = ANY(get_user_organization_ids()));

-- Only owners can update their organization
CREATE POLICY org_update_owner ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT om.organization_id 
            FROM organization_members om
            INNER JOIN users u ON u.id = om.user_id
            WHERE u.auth_user_id = auth.uid() AND om.role = 'owner'
        )
    );

-- =============================================================
-- ORGANIZATION MEMBERS POLICIES
-- =============================================================

-- Members can see other members in their org
CREATE POLICY members_select ON organization_members
    FOR SELECT USING (organization_id = ANY(get_user_organization_ids()));

-- Only admins/owners can manage members
CREATE POLICY members_insert ON organization_members
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT om.organization_id 
            FROM organization_members om
            INNER JOIN users u ON u.id = om.user_id
            WHERE u.auth_user_id = auth.uid() AND om.role IN ('owner', 'admin')
        )
    );

CREATE POLICY members_update ON organization_members
    FOR UPDATE USING (
        organization_id IN (
            SELECT om.organization_id 
            FROM organization_members om
            INNER JOIN users u ON u.id = om.user_id
            WHERE u.auth_user_id = auth.uid() AND om.role IN ('owner', 'admin')
        )
    );

CREATE POLICY members_delete ON organization_members
    FOR DELETE USING (
        organization_id IN (
            SELECT om.organization_id 
            FROM organization_members om
            INNER JOIN users u ON u.id = om.user_id
            WHERE u.auth_user_id = auth.uid() AND om.role IN ('owner', 'admin')
        )
    );

-- =============================================================
-- TENANT DATA POLICIES (Customers, Conversations, Bookings, etc.)
-- All use the same pattern: organization_id must match user's orgs
-- =============================================================

-- Customers
CREATE POLICY customers_tenant ON customers
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Tags
CREATE POLICY tags_tenant ON tags
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Customer Tags (join table - check via customer)
CREATE POLICY customer_tags_tenant ON customer_tags
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM customers WHERE organization_id = ANY(get_user_organization_ids())
        )
    );

-- Custom Field Definitions
CREATE POLICY custom_fields_tenant ON custom_field_definitions
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Conversations
CREATE POLICY conversations_tenant ON conversations
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Messages
CREATE POLICY messages_tenant ON messages
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Services
CREATE POLICY services_tenant ON services
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Availability Schedules
CREATE POLICY availability_schedules_tenant ON availability_schedules
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Availability Overrides
CREATE POLICY availability_overrides_tenant ON availability_overrides
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Bookings
CREATE POLICY bookings_tenant ON bookings
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Tax Rates
CREATE POLICY tax_rates_tenant ON tax_rates
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Products
CREATE POLICY products_tenant ON products
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Invoices
CREATE POLICY invoices_tenant ON invoices
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Invoice Line Items (check via invoice)
CREATE POLICY line_items_tenant ON invoice_line_items
    FOR ALL USING (
        invoice_id IN (
            SELECT id FROM invoices WHERE organization_id = ANY(get_user_organization_ids())
        )
    );

-- Payments
CREATE POLICY payments_tenant ON payments
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Job Stages
CREATE POLICY job_stages_tenant ON job_stages
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Jobs
CREATE POLICY jobs_tenant ON jobs
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Message Templates
CREATE POLICY templates_tenant ON message_templates
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Canned Responses
CREATE POLICY canned_tenant ON canned_responses
    FOR ALL USING (organization_id = ANY(get_user_organization_ids()));

-- Notifications (user's own notifications)
CREATE POLICY notifications_own ON notifications
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Audit Logs (org members with admin+ can view)
CREATE POLICY audit_logs_admin ON audit_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT om.organization_id 
            FROM organization_members om
            INNER JOIN users u ON u.id = om.user_id
            WHERE u.auth_user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')
        )
    );

-- =============================================================
-- SERVICE ROLE BYPASS
-- For API routes using service role key
-- =============================================================

-- Enable service role to bypass RLS for webhook handlers etc.
ALTER TABLE messages FORCE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
