-- WhatsApp Message Templates
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- WhatsApp Template Info
    whatsapp_template_id VARCHAR(100),
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en_US',
    category VARCHAR(50) NOT NULL, -- 'MARKETING', 'UTILITY', 'AUTHENTICATION'
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paused', 'disabled'
    rejection_reason TEXT,
    
    -- Content
    header_type VARCHAR(20), -- 'NONE', 'TEXT', 'IMAGE', 'DOCUMENT', 'VIDEO'
    header_text TEXT,
    body_text TEXT NOT NULL,
    footer_text TEXT,
    
    -- Components (for sending)
    components JSONB NOT NULL DEFAULT '[]',
    
    -- Usage
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

-- Canned Responses (Quick Replies)
CREATE TABLE canned_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    shortcut VARCHAR(50), -- e.g., "/hours" for quick insertion
    category VARCHAR(100),
    
    created_by UUID REFERENCES users(id),
    is_shared BOOLEAN DEFAULT TRUE, -- Available to all team members
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_canned_org ON canned_responses(organization_id);
CREATE INDEX idx_canned_shortcut ON canned_responses(organization_id, shortcut);
