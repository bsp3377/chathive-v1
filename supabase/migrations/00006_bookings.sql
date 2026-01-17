-- Service Types
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
    
    -- Booking settings
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

-- Staff Availability Schedules
CREATE TABLE availability_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL = organization-wide
    
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    is_available BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, user_id, day_of_week, start_time)
);

CREATE INDEX idx_availability_org ON availability_schedules(organization_id);
CREATE INDEX idx_availability_user ON availability_schedules(user_id);

-- Date-specific overrides (holidays, special hours)
CREATE TABLE availability_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL,
    start_time TIME, -- NULL if whole day unavailable
    end_time TIME,
    reason VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, user_id, date, start_time)
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_id UUID REFERENCES services(id),
    assigned_to UUID REFERENCES users(id),
    
    -- Timing
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    
    -- Details
    title VARCHAR(255),
    notes TEXT,
    internal_notes TEXT,
    
    -- Pricing
    price DECIMAL(10,2),
    currency VARCHAR(3),
    
    -- Reminders
    reminder_sent_at TIMESTAMPTZ,
    confirmation_sent_at TIMESTAMPTZ,
    
    -- Linking
    invoice_id UUID, -- Set after invoicing
    conversation_id UUID REFERENCES conversations(id),
    
    -- Custom fields
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

-- Update customer booking count on insert
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
