// Auto-generated TypeScript types for ChatHive database
// These types match the Supabase schema defined in migrations

// =============================================================
// CORE TYPES
// =============================================================

export type UUID = string;
export type Timestamp = string; // ISO 8601 format

// =============================================================
// ENUMS
// =============================================================

export type OrganizationRole = 'owner' | 'admin' | 'manager' | 'agent' | 'viewer';
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';
export type WhatsAppQualityRating = 'GREEN' | 'YELLOW' | 'RED';

export type ConversationStatus = 'open' | 'closed' | 'snoozed' | 'waiting';
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageDirection = 'inbound' | 'outbound';
export type SenderType = 'customer' | 'user' | 'system' | 'bot';
export type MessageType = 
  | 'text' 
  | 'image' 
  | 'document' 
  | 'audio' 
  | 'video' 
  | 'location' 
  | 'contacts' 
  | 'interactive' 
  | 'template' 
  | 'sticker';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'pix' | 'other';
export type PaymentTerms = 'due_on_receipt' | 'net_7' | 'net_14' | 'net_30' | 'net_60';

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';
export type JobSource = 'whatsapp' | 'website' | 'phone' | 'walk_in' | 'referral';

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateStatus = 'pending' | 'approved' | 'rejected' | 'paused' | 'disabled';
export type TemplateHeaderType = 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'phone' | 'url' | 'currency';
export type EntityType = 'customer' | 'booking' | 'job';

// =============================================================
// ORGANIZATION & USERS
// =============================================================

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  logo_url?: string;
  timezone: string;
  currency: string;
  tax_id?: string;
  
  // WhatsApp Integration
  whatsapp_phone_number_id?: string;
  whatsapp_waba_id?: string;
  whatsapp_access_token_encrypted?: string;
  whatsapp_webhook_verify_token?: string;
  whatsapp_display_name?: string;
  whatsapp_quality_rating?: WhatsAppQualityRating;
  whatsapp_messaging_tier: number;
  whatsapp_connected_at?: Timestamp;
  
  // Subscription
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  subscription_started_at?: Timestamp;
  subscription_ends_at?: Timestamp;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  
  settings: Record<string, unknown>;
  onboarding_completed_at?: Timestamp;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface User {
  id: UUID;
  auth_user_id: UUID;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  last_login_at?: Timestamp;
  email_verified_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface OrganizationMember {
  id: UUID;
  organization_id: UUID;
  user_id: UUID;
  role: OrganizationRole;
  is_available: boolean;
  max_concurrent_chats: number;
  notification_preferences: Record<string, unknown>;
  invited_by?: UUID;
  invited_at?: Timestamp;
  joined_at: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  
  // Joined relations
  user?: User;
  organization?: Organization;
}

// =============================================================
// CRM (CUSTOMERS & CONTACTS)
// =============================================================

export interface Customer {
  id: UUID;
  organization_id: UUID;
  whatsapp_id?: string;
  phone: string;
  phone_country_code?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  company_name?: string;
  job_title?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  notes?: string;
  total_conversations: number;
  total_bookings: number;
  total_invoices: number;
  lifetime_value: number;
  first_contact_at?: Timestamp;
  last_contact_at?: Timestamp;
  last_message_at?: Timestamp;
  is_opted_in: boolean;
  opted_in_at?: Timestamp;
  opted_out_at?: Timestamp;
  opt_out_reason?: string;
  custom_fields: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
  
  // Joined relations
  tags?: Tag[];
}

export interface Tag {
  id: UUID;
  organization_id: UUID;
  name: string;
  color: string;
  description?: string;
  created_at: Timestamp;
}

export interface CustomerTag {
  customer_id: UUID;
  tag_id: UUID;
  created_at: Timestamp;
}

export interface CustomFieldDefinition {
  id: UUID;
  organization_id: UUID;
  entity_type: EntityType;
  field_name: string;
  field_type: CustomFieldType;
  field_label: string;
  is_required: boolean;
  options?: string[];
  display_order: number;
  created_at: Timestamp;
}

// =============================================================
// CONVERSATIONS & MESSAGES
// =============================================================

export interface Conversation {
  id: UUID;
  organization_id: UUID;
  customer_id: UUID;
  whatsapp_conversation_id?: string;
  conversation_origin?: 'user_initiated' | 'business_initiated' | 'referral_conversion';
  status: ConversationStatus;
  snoozed_until?: Timestamp;
  closed_at?: Timestamp;
  closed_by?: UUID;
  assigned_to?: UUID;
  assigned_at?: Timestamp;
  assigned_by?: UUID;
  message_count: number;
  unread_count: number;
  last_message_at?: Timestamp;
  last_message_preview?: string;
  last_message_direction?: MessageDirection;
  customer_service_window_expires_at?: Timestamp;
  priority: ConversationPriority;
  created_at: Timestamp;
  updated_at: Timestamp;
  
  // Joined relations
  customer?: Customer;
  assigned_user?: User;
  messages?: Message[];
}

export interface Message {
  id: UUID;
  organization_id: UUID;
  conversation_id: UUID;
  customer_id: UUID;
  whatsapp_message_id?: string;
  direction: MessageDirection;
  sender_type: SenderType;
  sender_user_id?: UUID;
  message_type: MessageType;
  content?: string;
  media_url?: string;
  media_mime_type?: string;
  media_filename?: string;
  media_size_bytes?: number;
  media_sha256?: string;
  template_name?: string;
  template_language?: string;
  reply_to_message_id?: UUID;
  status: MessageStatus;
  status_updated_at?: Timestamp;
  error_code?: string;
  error_message?: string;
  whatsapp_timestamp?: Timestamp;
  created_at: Timestamp;
  
  // Joined relations
  sender_user?: User;
  reply_to_message?: Message;
}

// =============================================================
// BOOKINGS & CALENDAR
// =============================================================

export interface Service {
  id: UUID;
  organization_id: UUID;
  name: string;
  description?: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price?: number;
  currency?: string;
  color: string;
  is_active: boolean;
  max_bookings_per_slot: number;
  requires_confirmation: boolean;
  display_order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AvailabilitySchedule {
  id: UUID;
  organization_id: UUID;
  user_id?: UUID;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM:SS
  end_time: string;
  is_available: boolean;
  created_at: Timestamp;
}

export interface AvailabilityOverride {
  id: UUID;
  organization_id: UUID;
  user_id?: UUID;
  date: string; // YYYY-MM-DD
  is_available: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
  created_at: Timestamp;
}

export interface Booking {
  id: UUID;
  organization_id: UUID;
  customer_id: UUID;
  service_id?: UUID;
  assigned_to?: UUID;
  starts_at: Timestamp;
  ends_at: Timestamp;
  timezone: string;
  status: BookingStatus;
  cancelled_at?: Timestamp;
  cancelled_by?: UUID;
  cancellation_reason?: string;
  title?: string;
  notes?: string;
  internal_notes?: string;
  price?: number;
  currency?: string;
  reminder_sent_at?: Timestamp;
  confirmation_sent_at?: Timestamp;
  invoice_id?: UUID;
  conversation_id?: UUID;
  custom_fields: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
  
  // Joined relations
  customer?: Customer;
  service?: Service;
  assigned_user?: User;
}

// =============================================================
// INVOICES & PAYMENTS
// =============================================================

export interface TaxRate {
  id: UUID;
  organization_id: UUID;
  name: string;
  rate: number;
  is_compound: boolean;
  is_default: boolean;
  is_active: boolean;
  created_at: Timestamp;
}

export interface Product {
  id: UUID;
  organization_id: UUID;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  currency?: string;
  tax_rate_id?: UUID;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Invoice {
  id: UUID;
  organization_id: UUID;
  customer_id: UUID;
  invoice_number: string;
  issue_date: string; // YYYY-MM-DD
  due_date: string;
  status: InvoiceStatus;
  sent_at?: Timestamp;
  viewed_at?: Timestamp;
  paid_at?: Timestamp;
  currency: string;
  subtotal: number;
  discount_amount: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  payment_terms?: PaymentTerms;
  payment_instructions?: string;
  notes?: string;
  internal_notes?: string;
  footer_text?: string;
  booking_id?: UUID;
  conversation_id?: UUID;
  pdf_url?: string;
  pdf_generated_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  
  // Joined relations
  customer?: Customer;
  line_items?: InvoiceLineItem[];
  payments?: Payment[];
}

export interface InvoiceLineItem {
  id: UUID;
  invoice_id: UUID;
  product_id?: UUID;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_rate_id?: UUID;
  tax_amount: number;
  total: number;
  display_order: number;
  created_at: Timestamp;
  
  // Joined relations
  product?: Product;
  tax_rate?: TaxRate;
}

export interface Payment {
  id: UUID;
  organization_id: UUID;
  invoice_id: UUID;
  amount: number;
  currency: string;
  payment_method?: PaymentMethod;
  reference_number?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  notes?: string;
  paid_at: Timestamp;
  created_at: Timestamp;
}

// =============================================================
// JOBS & ENQUIRIES
// =============================================================

export interface JobStage {
  id: UUID;
  organization_id: UUID;
  name: string;
  color: string;
  display_order: number;
  is_default: boolean;
  is_closed: boolean;
  created_at: Timestamp;
}

export interface Job {
  id: UUID;
  organization_id: UUID;
  customer_id: UUID;
  job_number: string;
  title: string;
  description?: string;
  stage_id?: UUID;
  status: JobStatus;
  priority: JobPriority;
  assigned_to?: UUID;
  due_date?: string;
  completed_at?: Timestamp;
  source?: JobSource;
  conversation_id?: UUID;
  estimated_value?: number;
  actual_value?: number;
  currency?: string;
  booking_id?: UUID;
  invoice_id?: UUID;
  custom_fields: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
  
  // Joined relations
  customer?: Customer;
  stage?: JobStage;
  assigned_user?: User;
}

// =============================================================
// TEMPLATES & CANNED RESPONSES
// =============================================================

export interface MessageTemplate {
  id: UUID;
  organization_id: UUID;
  whatsapp_template_id?: string;
  name: string;
  language: string;
  category: TemplateCategory;
  status: TemplateStatus;
  rejection_reason?: string;
  header_type?: TemplateHeaderType;
  header_text?: string;
  body_text: string;
  footer_text?: string;
  components: unknown[];
  times_used: number;
  last_used_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CannedResponse {
  id: UUID;
  organization_id: UUID;
  title: string;
  content: string;
  shortcut?: string;
  category?: string;
  created_by?: UUID;
  is_shared: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// =============================================================
// NOTIFICATIONS & AUDIT
// =============================================================

export interface Notification {
  id: UUID;
  organization_id: UUID;
  user_id: UUID;
  type: string;
  title: string;
  body?: string;
  entity_type?: string;
  entity_id?: UUID;
  read_at?: Timestamp;
  clicked_at?: Timestamp;
  push_sent_at?: Timestamp;
  email_sent_at?: Timestamp;
  created_at: Timestamp;
}

export interface AuditLog {
  id: UUID;
  organization_id: UUID;
  actor_id?: UUID;
  actor_type: 'user' | 'api_key' | 'system' | 'webhook';
  actor_ip?: string;
  actor_user_agent?: string;
  event_type: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'export';
  resource_type?: string;
  resource_id?: UUID;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  request_id?: UUID;
  success: boolean;
  error_message?: string;
  created_at: Timestamp;
}

// =============================================================
// API RESPONSE TYPES
// =============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
