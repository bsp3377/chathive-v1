-- Tax Rates
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL, -- Percentage
    is_compound BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tax_rates_org ON tax_rates(organization_id);

-- Products/Items Catalog
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

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Invoice Number
    invoice_number VARCHAR(50) NOT NULL,
    
    -- Dates
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled', 'refunded'
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Amounts
    currency VARCHAR(3) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_type VARCHAR(20), -- 'percentage', 'fixed'
    discount_value DECIMAL(10,2),
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_due DECIMAL(12,2) GENERATED ALWAYS AS (total - amount_paid) STORED,
    
    -- Payment
    payment_terms VARCHAR(50), -- 'due_on_receipt', 'net_7', 'net_14', 'net_30', 'net_60'
    payment_instructions TEXT,
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    footer_text TEXT,
    
    -- Linking
    booking_id UUID REFERENCES bookings(id),
    conversation_id UUID REFERENCES conversations(id),
    
    -- PDF
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

-- Invoice Line Items
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

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    
    payment_method VARCHAR(50), -- 'cash', 'card', 'bank_transfer', 'pix', 'other'
    reference_number VARCHAR(255),
    
    -- External payment provider
    stripe_payment_intent_id VARCHAR(100),
    stripe_charge_id VARCHAR(100),
    
    notes TEXT,
    
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_invoice ON payments(invoice_id);
CREATE INDEX idx_payment_org ON payments(organization_id);

-- Function to update invoice amounts when payment is recorded
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
    
    -- Update customer lifetime value
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

-- Add FK from bookings to invoices (after invoices table exists)
ALTER TABLE bookings 
ADD CONSTRAINT fk_booking_invoice 
FOREIGN KEY (invoice_id) REFERENCES invoices(id);
