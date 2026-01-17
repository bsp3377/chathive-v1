-- Customers/Contacts (CRM)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- WhatsApp Identity
    whatsapp_id VARCHAR(50), -- wa_id from webhook
    phone VARCHAR(50) NOT NULL,
    phone_country_code VARCHAR(5),
    
    -- Profile
    name VARCHAR(255),
    email VARCHAR(255),
    avatar_url TEXT,
    
    -- CRM Data
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    address JSONB,
    notes TEXT,
    
    -- Engagement Metrics
    total_conversations INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_invoices INTEGER DEFAULT 0,
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    
    first_contact_at TIMESTAMPTZ,
    last_contact_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    
    -- Status
    is_opted_in BOOLEAN DEFAULT TRUE,
    opted_in_at TIMESTAMPTZ,
    opted_out_at TIMESTAMPTZ,
    opt_out_reason TEXT,
    
    -- Custom Fields
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

-- Customer Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366F1', -- Hex color
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
    entity_type VARCHAR(50) NOT NULL, -- 'customer', 'booking', 'job'
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'date', 'select', 'multiselect', 'phone', 'url', 'currency'
    field_label VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    options JSONB, -- For select/multiselect
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, entity_type, field_name)
);
