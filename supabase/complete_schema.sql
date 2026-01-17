-- =============================================================
-- CHATHIVE COMPLETE DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- =============================================================

-- =============================================================
-- 1. EXTENSIONS
-- =============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- 2. ORGANIZATIONS (TENANTS)
-- =============================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address JSONB,
    logo_url TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    tax_id VARCHAR(100),
    
    -- WhatsApp Integration
    whatsapp_phone_number_id VARCHAR(100),
    whatsapp_waba_id VARCHAR(100),
    whatsapp_access_token_encrypted TEXT,
    whatsapp_webhook_verify_token VARCHAR(255),
    whatsapp_display_name VARCHAR(100),
    whatsapp_quality_rating VARCHAR(20),
    whatsapp_messaging_tier INTEGER DEFAULT 1,
    whatsapp_connected_at TIMESTAMPTZ,
    
    -- Subscription
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_started_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    
    -- Settings
    settings JSONB DEFAULT '{}',
    onboarding_completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_whatsapp_phone ON organizations(whatsapp_phone_number_id);

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
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- 3. USERS & MEMBERS
-- =============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(50),
    last_login_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_auth ON users(auth_user_id);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    is_available BOOLEAN DEFAULT TRUE,
    max_concurrent_chats INTEGER DEFAULT 10,
    notification_preferences JSONB DEFAULT '{}',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_member_org ON organization_members(organization_id);
CREATE INDEX idx_member_user ON organization_members(user_id);

CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_user_id, email, first_name, last_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- 4. CUSTOMERS (CRM)
-- =============================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    whatsapp_id VARCHAR(50),
    phone VARCHAR(50) NOT NULL,
    phone_country_code VARCHAR(5),
    name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    address JSONB,
    notes TEXT,
    total_conversations INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_invoices INTEGER DEFAULT 0,
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    first_contact_at TIMESTAMPTZ,
    last_contact_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    is_opted_in BOOLEAN DEFAULT TRUE,
    opted_in_at TIMESTAMPTZ,
    opted_out_at TIMESTAMPTZ,
    opt_out_reason TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, phone)
);

CREATE INDEX idx_customer_org ON customers(organization_id);
CREATE INDEX idx_customer_phone ON customers(organization_id, phone);
CREATE INDEX idx_customer_whatsapp ON customers(organization_id, whatsapp_id);
CREATE INDEX idx_customer_last_contact ON customers(organization_id, last_contact_at DESC);
CREATE INDEX idx_customer_name ON customers(organization_id, name);

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366F1',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

CREATE INDEX idx_tags_org ON tags(organization_id);

CREATE TABLE customer_tags (
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (customer_id, tag_id)
);

CREATE INDEX idx_customer_tags_customer ON customer_tags(customer_id);
CREATE INDEX idx_customer_tags_tag ON customer_tags(tag_id);

-- Custom Field Definitions
CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    options JSONB,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, entity_type, field_name)
);

-- =============================================================
-- 5. CONVERSATIONS & MESSAGES
-- =============================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    whatsapp_conversation_id VARCHAR(100),
    conversation_origin VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    snoozed_until TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES users(id),
    message_count INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    last_message_direction VARCHAR(10),
    customer_service_window_expires_at TIMESTAMPTZ,
    priority VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conv_org_status ON conversations(organization_id, status);
CREATE INDEX idx_conv_org_assigned ON conversations(organization_id, assigned_to);
CREATE INDEX idx_conv_customer ON conversations(customer_id);
CREATE INDEX idx_conv_last_message ON conversations(organization_id, last_message_at DESC);
CREATE INDEX idx_conv_unread ON conversations(organization_id, unread_count DESC) WHERE unread_count > 0;

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    whatsapp_message_id VARCHAR(100) UNIQUE,
    direction VARCHAR(10) NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    sender_user_id UUID REFERENCES users(id),
    message_type VARCHAR(50) NOT NULL,
    content TEXT,
    media_url TEXT,
    media_mime_type VARCHAR(100),
    media_filename VARCHAR(255),
    media_size_bytes INTEGER,
    media_sha256 VARCHAR(64),
    template_name VARCHAR(255),
    template_language VARCHAR(10),
    reply_to_message_id UUID REFERENCES messages(id),
    status VARCHAR(20) DEFAULT 'pending',
    status_updated_at TIMESTAMPTZ,
    error_code VARCHAR(50),
    error_message TEXT,
    whatsapp_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_msg_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_msg_org ON messages(organization_id, created_at DESC);
CREATE INDEX idx_msg_whatsapp_id ON messages(whatsapp_message_id);
CREATE INDEX idx_msg_status ON messages(conversation_id, status) WHERE status NOT IN ('read', 'delivered');

-- Full-text search
ALTER TABLE messages ADD COLUMN search_vector tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', COALESCE(content, ''))) STORED;
CREATE INDEX idx_msg_search ON messages USING GIN(search_vector);

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
    
    UPDATE customers
    SET 
        last_message_at = NEW.created_at,
        last_contact_at = NEW.created_at,
        total_conversations = (
            SELECT COUNT(DISTINCT conversation_id) 
            FROM messages 
            WHERE customer_id = NEW.customer_id
        )
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- =============================================================
-- 6. BOOKINGS
-- =============================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    buffer_before_minutes INTEGER DEFAULT 0,
    buffer_after_minutes INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    max_bookings_per_slot INTEGER DEFAULT 1,
    requires_confirmation BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_org ON services(organization_id);
CREATE INDEX idx_service_active ON services(organization_id, is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE availability_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id, day_of_week, start_time)
);

CREATE INDEX idx_availability_org ON availability_schedules(organization_id);
CREATE INDEX idx_availability_user ON availability_schedules(user_id);

CREATE TABLE availability_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id, date, start_time)
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
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    title VARCHAR(255),
    notes TEXT,
    internal_notes TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    reminder_sent_at TIMESTAMPTZ,
    confirmation_sent_at TIMESTAMPTZ,
    invoice_id UUID,
    conversation_id UUID REFERENCES conversations(id),
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_org ON bookings(organization_id);
CREATE INDEX idx_booking_customer ON bookings(customer_id);
CREATE INDEX idx_booking_assigned ON bookings(assigned_to);
CREATE INDEX idx_booking_date ON bookings(organization_id, starts_at);
CREATE INDEX idx_booking_status ON bookings(organization_id, status);

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_customer_booking_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers
    SET total_bookings = (
        SELECT COUNT(*) FROM bookings WHERE customer_id = NEW.customer_id
    )
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_booking_insert
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_booking_count();

-- =============================================================
-- 7. INVOICES
-- =============================================================
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    is_compound BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tax_rates_org ON tax_rates(organization_id);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3),
    tax_rate_id UUID REFERENCES tax_rates(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_org ON products(organization_id);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    currency VARCHAR(3) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_type VARCHAR(20),
    discount_value DECIMAL(10,2),
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_due DECIMAL(12,2) GENERATED ALWAYS AS (total - amount_paid) STORED,
    payment_terms VARCHAR(50),
    payment_instructions TEXT,
    notes TEXT,
    internal_notes TEXT,
    footer_text TEXT,
    booking_id UUID REFERENCES bookings(id),
    conversation_id UUID REFERENCES conversations(id),
    pdf_url TEXT,
    pdf_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, invoice_number)
);

CREATE INDEX idx_invoice_org ON invoices(organization_id);
CREATE INDEX idx_invoice_customer ON invoices(customer_id);
CREATE INDEX idx_invoice_status ON invoices(organization_id, status);
CREATE INDEX idx_invoice_due ON invoices(organization_id, due_date) WHERE status NOT IN ('paid', 'cancelled');

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_rate_id UUID REFERENCES tax_rates(id),
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_line_item_invoice ON invoice_line_items(invoice_id);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(255),
    stripe_payment_intent_id VARCHAR(100),
    stripe_charge_id VARCHAR(100),
    notes TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_invoice ON payments(invoice_id);
CREATE INDEX idx_payment_org ON payments(organization_id);

CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices
    SET 
        amount_paid = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id),
        status = CASE 
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total THEN 'paid'
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) > 0 THEN 'partial'
            ELSE status
        END,
        paid_at = CASE 
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total THEN NOW()
            ELSE paid_at
        END,
        updated_at = NOW()
    WHERE id = NEW.invoice_id;
    
    UPDATE customers
    SET 
        lifetime_value = (
            SELECT COALESCE(SUM(amount_paid), 0) 
            FROM invoices 
            WHERE customer_id = (SELECT customer_id FROM invoices WHERE id = NEW.invoice_id)
        ),
        total_invoices = (
            SELECT COUNT(*) FROM invoices WHERE customer_id = (SELECT customer_id FROM invoices WHERE id = NEW.invoice_id)
        )
    WHERE id = (SELECT customer_id FROM invoices WHERE id = NEW.invoice_id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_payment_insert
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_on_payment();

ALTER TABLE bookings 
ADD CONSTRAINT fk_booking_invoice 
FOREIGN KEY (invoice_id) REFERENCES invoices(id);

-- =============================================================
-- 8. JOBS (KANBAN)
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

CREATE INDEX idx_job_stages_org ON job_stages(organization_id);

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
    completed_at TIMESTAMPTZ,
    source VARCHAR(100),
    conversation_id UUID REFERENCES conversations(id),
    estimated_value DECIMAL(12,2),
    actual_value DECIMAL(12,2),
    currency VARCHAR(3),
    booking_id UUID REFERENCES bookings(id),
    invoice_id UUID REFERENCES invoices(id),
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, job_number)
);

CREATE INDEX idx_job_org ON jobs(organization_id);
CREATE INDEX idx_job_customer ON jobs(customer_id);
CREATE INDEX idx_job_stage ON jobs(stage_id);
CREATE INDEX idx_job_assigned ON jobs(assigned_to);
CREATE INDEX idx_job_status ON jobs(organization_id, status);

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Default job stages for new orgs
CREATE OR REPLACE FUNCTION create_default_job_stages()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO job_stages (organization_id, name, color, display_order, is_default, is_closed)
    VALUES
        (NEW.id, 'New', '#6366F1', 0, TRUE, FALSE),
        (NEW.id, 'In Progress', '#F59E0B', 1, FALSE, FALSE),
        (NEW.id, 'Quoted', '#3B82F6', 2, FALSE, FALSE),
        (NEW.id, 'Won', '#10B981', 3, FALSE, TRUE),
        (NEW.id, 'Lost', '#EF4444', 4, FALSE, TRUE);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_organization_created_stages
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION create_default_job_stages();

-- =============================================================
-- 9. TEMPLATES & CANNED RESPONSES
-- =============================================================
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    whatsapp_template_id VARCHAR(100),
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en_US',
    category VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    rejection_reason TEXT,
    header_type VARCHAR(20),
    header_text TEXT,
    body_text TEXT NOT NULL,
    footer_text TEXT,
    components JSONB NOT NULL DEFAULT '[]',
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name, language)
);

CREATE INDEX idx_templates_org ON message_templates(organization_id);
CREATE INDEX idx_templates_status ON message_templates(organization_id, status);

CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE canned_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    shortcut VARCHAR(50),
    category VARCHAR(100),
    created_by UUID REFERENCES users(id),
    is_shared BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_canned_org ON canned_responses(organization_id);
CREATE INDEX idx_canned_shortcut ON canned_responses(organization_id, shortcut);

-- =============================================================
-- 10. NOTIFICATIONS & AUDIT
-- =============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    entity_type VARCHAR(50),
    entity_id UUID,
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    push_sent_at TIMESTAMPTZ,
    email_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notification_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_notification_org ON notifications(organization_id);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    actor_type VARCHAR(50) NOT NULL,
    actor_ip INET,
    actor_user_agent TEXT,
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    changes JSONB,
    metadata JSONB,
    request_id UUID,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_event ON audit_logs(organization_id, event_type);

-- =============================================================
-- 11. ROW LEVEL SECURITY
-- =============================================================

-- Enable RLS on all tables
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

-- Helper function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organization_ids()
RETURNS UUID[] AS $$
DECLARE
    user_uuid UUID;
    org_ids UUID[];
BEGIN
    SELECT (auth.jwt() ->> 'sub')::uuid INTO user_uuid;
    
    SELECT ARRAY_AGG(om.organization_id)
    INTO org_ids
    FROM organization_members om
    INNER JOIN users u ON u.id = om.user_id
    WHERE u.auth_user_id = user_uuid;
    
    RETURN COALESCE(org_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY users_select_own ON users FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth_user_id = auth.uid());

-- Organizations policies
CREATE POLICY org_select_member ON organizations FOR SELECT USING (id = ANY(get_user_organization_ids()));
CREATE POLICY org_update_owner ON organizations FOR UPDATE USING (
    id IN (
        SELECT om.organization_id 
        FROM organization_members om
        INNER JOIN users u ON u.id = om.user_id
        WHERE u.auth_user_id = auth.uid() AND om.role = 'owner'
    )
);

-- Members policies
CREATE POLICY members_select ON organization_members FOR SELECT USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY members_insert ON organization_members FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT om.organization_id 
        FROM organization_members om
        INNER JOIN users u ON u.id = om.user_id
        WHERE u.auth_user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
);
CREATE POLICY members_update ON organization_members FOR UPDATE USING (
    organization_id IN (
        SELECT om.organization_id 
        FROM organization_members om
        INNER JOIN users u ON u.id = om.user_id
        WHERE u.auth_user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
);
CREATE POLICY members_delete ON organization_members FOR DELETE USING (
    organization_id IN (
        SELECT om.organization_id 
        FROM organization_members om
        INNER JOIN users u ON u.id = om.user_id
        WHERE u.auth_user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
);

-- Tenant data policies (all use org_id check)
CREATE POLICY customers_tenant ON customers FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY tags_tenant ON tags FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY customer_tags_tenant ON customer_tags FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE organization_id = ANY(get_user_organization_ids()))
);
CREATE POLICY custom_fields_tenant ON custom_field_definitions FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY conversations_tenant ON conversations FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY messages_tenant ON messages FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY services_tenant ON services FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY availability_schedules_tenant ON availability_schedules FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY availability_overrides_tenant ON availability_overrides FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY bookings_tenant ON bookings FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY tax_rates_tenant ON tax_rates FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY products_tenant ON products FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY invoices_tenant ON invoices FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY line_items_tenant ON invoice_line_items FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE organization_id = ANY(get_user_organization_ids()))
);
CREATE POLICY payments_tenant ON payments FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY job_stages_tenant ON job_stages FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY jobs_tenant ON jobs FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY templates_tenant ON message_templates FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY canned_tenant ON canned_responses FOR ALL USING (organization_id = ANY(get_user_organization_ids()));
CREATE POLICY notifications_own ON notifications FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
);
CREATE POLICY audit_logs_admin ON audit_logs FOR SELECT USING (
    organization_id IN (
        SELECT om.organization_id 
        FROM organization_members om
        INNER JOIN users u ON u.id = om.user_id
        WHERE u.auth_user_id = auth.uid() AND om.role IN ('owner', 'admin', 'manager')
    )
);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================================
-- SETUP COMPLETE!
-- =============================================================
