-- =============================================================
-- CHATHIVE DATABASE RESET & SETUP
-- This script drops all existing ChatHive tables and recreates them
-- Run this in Supabase SQL Editor
-- =============================================================

-- First, drop all existing policies (to avoid dependency errors)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'organizations', 'users', 'organization_members', 'customers', 
            'tags', 'customer_tags', 'custom_field_definitions', 'conversations', 
            'messages', 'services', 'availability_schedules', 'availability_overrides',
            'bookings', 'tax_rates', 'products', 'invoices', 'invoice_line_items',
            'payments', 'job_stages', 'jobs', 'message_templates', 'canned_responses',
            'notifications', 'audit_logs'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Drop triggers that might cause issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_organization_created_stages ON organizations;
DROP TRIGGER IF EXISTS on_message_insert ON messages;
DROP TRIGGER IF EXISTS on_booking_insert ON bookings;
DROP TRIGGER IF EXISTS on_payment_insert ON payments;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
DROP TRIGGER IF EXISTS update_organization_members_updated_at ON organization_members;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_conversation_on_message() CASCADE;
DROP FUNCTION IF EXISTS update_customer_booking_count() CASCADE;
DROP FUNCTION IF EXISTS update_invoice_on_payment() CASCADE;
DROP FUNCTION IF EXISTS create_default_job_stages() CASCADE;
DROP FUNCTION IF EXISTS get_user_organization_ids() CASCADE;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS canned_responses CASCADE;
DROP TABLE IF EXISTS message_templates CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS job_stages CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoice_line_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS tax_rates CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS availability_overrides CASCADE;
DROP TABLE IF EXISTS availability_schedules CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS custom_field_definitions CASCADE;
DROP TABLE IF EXISTS customer_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- =============================================================
-- NOW CREATE EVERYTHING FRESH
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- ORGANIZATIONS
-- =============================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    logo_url TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- WhatsApp
    whatsapp_phone_number_id VARCHAR(100),
    whatsapp_waba_id VARCHAR(100),
    whatsapp_access_token_encrypted TEXT,
    whatsapp_connected_at TIMESTAMPTZ,
    
    -- Subscription
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    
    -- Settings
    settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_slug ON organizations(slug);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- USERS & MEMBERS
-- =============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_auth ON users(auth_user_id);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_member_org ON organization_members(organization_id);
CREATE INDEX idx_member_user ON organization_members(user_id);

CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_user_id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- CUSTOMERS
-- =============================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    whatsapp_id VARCHAR(50),
    phone VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    company_name VARCHAR(255),
    notes TEXT,
    total_conversations INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_invoices INTEGER DEFAULT 0,
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    first_contact_at TIMESTAMPTZ,
    last_contact_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    is_opted_in BOOLEAN DEFAULT TRUE,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, phone)
);

CREATE INDEX idx_customer_org ON customers(organization_id);
CREATE INDEX idx_customer_phone ON customers(organization_id, phone);

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366F1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE TABLE customer_tags (
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, tag_id)
);

CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, entity_type, field_name)
);

-- =============================================================
-- CONVERSATIONS & MESSAGES
-- =============================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    message_count INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    last_message_direction VARCHAR(10),
    priority VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conv_org ON conversations(organization_id);
CREATE INDEX idx_conv_customer ON conversations(customer_id);

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    whatsapp_message_id VARCHAR(100),
    direction VARCHAR(10) NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    sender_user_id UUID REFERENCES users(id),
    message_type VARCHAR(50) NOT NULL,
    content TEXT,
    media_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_msg_conversation ON messages(conversation_id, created_at DESC);

-- Update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        message_count = message_count + 1,
        unread_count = CASE WHEN NEW.direction = 'inbound' THEN unread_count + 1 ELSE unread_count END,
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        last_message_direction = NEW.direction,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_message_insert
    AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- =============================================================
-- SERVICES & BOOKINGS
-- =============================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2),
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE availability_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE availability_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_id UUID REFERENCES services(id),
    assigned_to UUID REFERENCES users(id),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    title VARCHAR(255),
    notes TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_org ON bookings(organization_id);
CREATE INDEX idx_booking_date ON bookings(organization_id, starts_at);

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- INVOICES & PAYMENTS
-- =============================================================
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    currency VARCHAR(3) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, invoice_number)
);

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_method VARCHAR(50),
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- JOBS (KANBAN)
-- =============================================================
CREATE TABLE job_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366F1',
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    job_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    stage_id UUID REFERENCES job_stages(id),
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'normal',
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, job_number)
);

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Default stages for new orgs
CREATE OR REPLACE FUNCTION create_default_job_stages()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO job_stages (organization_id, name, color, display_order, is_default, is_closed)
    VALUES
        (NEW.id, 'New', '#6366F1', 0, TRUE, FALSE),
        (NEW.id, 'In Progress', '#F59E0B', 1, FALSE, FALSE),
        (NEW.id, 'Won', '#10B981', 2, FALSE, TRUE),
        (NEW.id, 'Lost', '#EF4444', 3, FALSE, TRUE);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_organization_created_stages
    AFTER INSERT ON organizations FOR EACH ROW EXECUTE FUNCTION create_default_job_stages();

-- =============================================================
-- TEMPLATES & CANNED RESPONSES
-- =============================================================
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    body_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE canned_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    shortcut VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- NOTIFICATIONS & AUDIT
-- =============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notifications(user_id, created_at DESC);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    actor_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

-- Enable RLS
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

-- Helper function
CREATE OR REPLACE FUNCTION get_user_organization_ids()
RETURNS UUID[] AS $$
DECLARE
    org_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(om.organization_id)
    INTO org_ids
    FROM organization_members om
    INNER JOIN users u ON u.id = om.user_id
    WHERE u.auth_user_id = auth.uid();
    
    RETURN COALESCE(org_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY users_select ON users FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY users_update ON users FOR UPDATE USING (auth_user_id = auth.uid());

-- Allow insert for new signups (needed for the trigger)
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (true);

-- Organizations - allow insert for new orgs during signup
CREATE POLICY org_insert ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY org_select ON organizations FOR SELECT USING (id = ANY(get_user_organization_ids()));
CREATE POLICY org_update ON organizations FOR UPDATE USING (id = ANY(get_user_organization_ids()));

-- Members - allow insert during signup
CREATE POLICY members_insert ON organization_members FOR INSERT WITH CHECK (true);
CREATE POLICY members_select ON organization_members FOR SELECT USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY members_update ON organization_members FOR UPDATE USING (organization_id = ANY(get_user_organization_ids()));

-- Tenant data policies
CREATE POLICY customers_all ON customers FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY tags_all ON tags FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY customer_tags_all ON customer_tags FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE organization_id = ANY(get_user_organization_ids()))
);
CREATE POLICY custom_fields_all ON custom_field_definitions FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY conversations_all ON conversations FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY messages_all ON messages FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY services_all ON services FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY availability_all ON availability_schedules FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY overrides_all ON availability_overrides FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY bookings_all ON bookings FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY tax_rates_all ON tax_rates FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY products_all ON products FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY invoices_all ON invoices FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY line_items_all ON invoice_line_items FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE organization_id = ANY(get_user_organization_ids()))
);
CREATE POLICY payments_all ON payments FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY job_stages_all ON job_stages FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY jobs_all ON jobs FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY templates_all ON message_templates FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY canned_all ON canned_responses FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY notifications_all ON notifications FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);
CREATE POLICY audit_all ON audit_logs FOR SELECT USING (organization_id = ANY(get_user_organization_ids()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================================
-- DONE! All tables created successfully.
-- =============================================================
