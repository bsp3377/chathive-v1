-- Conversations (Chat Threads)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- WhatsApp Context
    whatsapp_conversation_id VARCHAR(100),
    conversation_origin VARCHAR(50), -- 'user_initiated', 'business_initiated', 'referral_conversion'
    
    -- Status
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'closed', 'snoozed', 'waiting'
    snoozed_until TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES users(id),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES users(id),
    
    -- Metrics
    message_count INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,
    last_message_direction VARCHAR(10), -- 'inbound', 'outbound'
    
    -- 24-hour window tracking
    customer_service_window_expires_at TIMESTAMPTZ,
    
    -- Metadata
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
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

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- WhatsApp Message IDs
    whatsapp_message_id VARCHAR(100) UNIQUE,
    
    -- Direction & Sender
    direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'user', 'system', 'bot'
    sender_user_id UUID REFERENCES users(id),
    
    -- Content
    message_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'document', 'audio', 'video', 'location', 'contacts', 'interactive', 'template', 'sticker'
    content TEXT,
    
    -- Media
    media_url TEXT,
    media_mime_type VARCHAR(100),
    media_filename VARCHAR(255),
    media_size_bytes INTEGER,
    media_sha256 VARCHAR(64),
    
    -- Template (for outbound templates)
    template_name VARCHAR(255),
    template_language VARCHAR(10),
    
    -- Reply Context
    reply_to_message_id UUID REFERENCES messages(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    status_updated_at TIMESTAMPTZ,
    error_code VARCHAR(50),
    error_message TEXT,
    
    -- Timestamps
    whatsapp_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_msg_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_msg_org ON messages(organization_id, created_at DESC);
CREATE INDEX idx_msg_whatsapp_id ON messages(whatsapp_message_id);
CREATE INDEX idx_msg_status ON messages(conversation_id, status) WHERE status NOT IN ('read', 'delivered');

-- Full-text search on messages
ALTER TABLE messages ADD COLUMN search_vector tsvector 
    GENERATED ALWAYS AS (to_tsvector('english', COALESCE(content, ''))) STORED;
CREATE INDEX idx_msg_search ON messages USING GIN(search_vector);

-- Function to update conversation stats when message is added
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
    
    -- Also update customer last_message_at
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
