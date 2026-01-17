-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(100) NOT NULL, -- 'new_message', 'booking_created', 'invoice_paid', 'assignment'
    title VARCHAR(255) NOT NULL,
    body TEXT,
    
    -- Reference
    entity_type VARCHAR(50),
    entity_id UUID,
    
    -- Status
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    -- Delivery
    push_sent_at TIMESTAMPTZ,
    email_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notification_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_notification_org ON notifications(organization_id);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Actor
    actor_id UUID REFERENCES users(id),
    actor_type VARCHAR(50) NOT NULL, -- 'user', 'api_key', 'system', 'webhook'
    actor_ip INET,
    actor_user_agent TEXT,
    
    -- Event
    event_type VARCHAR(100) NOT NULL, -- 'booking.created', 'invoice.sent', 'user.login'
    action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'login', 'export'
    
    -- Resource
    resource_type VARCHAR(100),
    resource_id UUID,
    
    -- Changes
    changes JSONB, -- {"field": {"old": x, "new": y}}
    metadata JSONB,
    
    -- Correlation
    request_id UUID,
    
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_event ON audit_logs(organization_id, event_type);
