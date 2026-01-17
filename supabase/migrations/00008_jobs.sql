-- Enquiry/Job Stages (Kanban columns)
CREATE TABLE job_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366F1',
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE, -- Marks completion stages
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_stages_org ON job_stages(organization_id);

-- Jobs/Enquiries
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Reference
    job_number VARCHAR(50) NOT NULL,
    
    -- Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Status & Stage
    stage_id UUID REFERENCES job_stages(id),
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    
    -- Dates
    due_date DATE,
    completed_at TIMESTAMPTZ,
    
    -- Source
    source VARCHAR(100), -- 'whatsapp', 'website', 'phone', 'walk_in', 'referral'
    conversation_id UUID REFERENCES conversations(id),
    
    -- Value
    estimated_value DECIMAL(12,2),
    actual_value DECIMAL(12,2),
    currency VARCHAR(3),
    
    -- Linking
    booking_id UUID REFERENCES bookings(id),
    invoice_id UUID REFERENCES invoices(id),
    
    -- Custom fields
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

-- Default job stages for new organizations
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
