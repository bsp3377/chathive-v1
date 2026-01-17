-- Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address JSONB, -- {street, city, state, postal_code, country}
    logo_url TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    tax_id VARCHAR(100),
    
    -- WhatsApp Integration
    whatsapp_phone_number_id VARCHAR(100),
    whatsapp_waba_id VARCHAR(100),
    whatsapp_access_token_encrypted TEXT, -- Encrypted token
    whatsapp_webhook_verify_token VARCHAR(255),
    whatsapp_display_name VARCHAR(100),
    whatsapp_quality_rating VARCHAR(20), -- 'GREEN', 'YELLOW', 'RED'
    whatsapp_messaging_tier INTEGER DEFAULT 1,
    whatsapp_connected_at TIMESTAMPTZ,
    
    -- Subscription
    subscription_plan VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'pro', 'enterprise'
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

-- Trigger to update updated_at
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
