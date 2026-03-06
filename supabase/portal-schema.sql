-- ═══════════════════════════════════════════════════════
-- PetApp Business Portal — Database Schema
-- Run this against the SAME Supabase project as Part A
-- ═══════════════════════════════════════════════════════

-- ═══════════════════════════════════════
-- BUSINESSES
-- ═══════════════════════════════════════
CREATE TABLE businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Business profile
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vet', 'groomer', 'trainer', 'pet_store', 'insurance')),
  description TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'CA',
  postal_code TEXT,
  latitude DECIMAL,
  longitude DECIMAL,

  -- Business details
  license_number TEXT,
  specializations TEXT[],
  hours_of_operation JSONB,
  is_24hr BOOLEAN DEFAULT false,
  is_emergency BOOLEAN DEFAULT false,

  -- Subscription & billing
  portal_tier TEXT DEFAULT 'free' CHECK (portal_tier IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active',

  -- Stats (denormalized for dashboard speed)
  linked_pets_count INTEGER DEFAULT 0,
  total_reminders_sent INTEGER DEFAULT 0,
  total_records_added INTEGER DEFAULT 0,

  -- Status
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_type ON businesses(type);
CREATE INDEX idx_businesses_location ON businesses(country, region, city);
CREATE INDEX idx_businesses_owner ON businesses(owner_user_id);


-- ═══════════════════════════════════════
-- BUSINESS TEAM MEMBERS
-- For multi-staff businesses (Pro/Enterprise)
-- ═══════════════════════════════════════
CREATE TABLE business_team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff', 'viewer')),
  name TEXT,
  email TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  UNIQUE(business_id, user_id)
);


-- ═══════════════════════════════════════
-- SERVICE LINKS (pet ↔ business)
-- The core relationship table
-- ═══════════════════════════════════════
CREATE TABLE service_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  service_category TEXT NOT NULL CHECK (service_category IN ('vet', 'groomer', 'trainer', 'pet_store', 'insurance')),

  -- Link lifecycle
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked', 'expired')),
  initiated_by TEXT NOT NULL CHECK (initiated_by IN ('business_qr_scan', 'owner_request', 'manual')),
  linked_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by TEXT,

  -- On-chain reference
  blockchain_tx_hash TEXT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_links_business ON service_links(business_id, status);
CREATE INDEX idx_service_links_pet ON service_links(pet_id, status);
CREATE INDEX idx_service_links_category ON service_links(pet_id, service_category, status);

-- Trigger to enforce ONE active link per pet per category
CREATE OR REPLACE FUNCTION enforce_single_active_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    IF EXISTS (
      SELECT 1 FROM service_links
      WHERE pet_id = NEW.pet_id
        AND service_category = NEW.service_category
        AND status = 'active'
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Pet already has an active % link. Owner must revoke the existing link first.', NEW.service_category;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_single_active_link
  BEFORE INSERT OR UPDATE ON service_links
  FOR EACH ROW EXECUTE FUNCTION enforce_single_active_link();


-- ═══════════════════════════════════════
-- BUSINESS RECORDS (medical notes, grooming, training)
-- ═══════════════════════════════════════
CREATE TABLE business_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  service_link_id UUID REFERENCES service_links(id) ON DELETE SET NULL,
  author_user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Record content
  type TEXT NOT NULL CHECK (type IN (
    'examination', 'vaccination', 'diagnosis', 'treatment',
    'prescription', 'lab_result', 'surgery', 'grooming_session',
    'training_session', 'weight_check', 'general_note'
  )),
  title TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,

  -- Type-specific fields
  weight DECIMAL,
  weight_unit TEXT,
  vaccination_name TEXT,
  vaccination_batch TEXT,
  vaccination_next_due DATE,
  medications TEXT[],
  diagnosis_text TEXT,
  treatment_text TEXT,
  lab_results JSONB,
  attachments TEXT[],

  -- Visibility
  visible_to_owner BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_records_pet ON business_records(pet_id, date DESC);
CREATE INDEX idx_business_records_business ON business_records(business_id, date DESC);
CREATE INDEX idx_business_records_type ON business_records(pet_id, type, date DESC);


-- ═══════════════════════════════════════
-- BUSINESS REMINDERS
-- Reminders sent from business to pet owners
-- ═══════════════════════════════════════
CREATE TABLE business_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  service_link_id UUID REFERENCES service_links(id) ON DELETE SET NULL,

  -- Reminder content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'vaccination_due', 'checkup_due', 'followup',
    'appointment_reminder', 'grooming_due', 'training_session',
    'prescription_refill', 'general'
  )),

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),

  -- Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_reminders_scheduled ON business_reminders(status, scheduled_for);
CREATE INDEX idx_business_reminders_business ON business_reminders(business_id, status);


-- ═══════════════════════════════════════
-- AD CAMPAIGNS
-- ═══════════════════════════════════════
CREATE TABLE ad_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,

  -- Campaign setup
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exclusive_service', 'open_marketplace')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),

  -- Targeting
  target_species TEXT[],
  target_regions TEXT[],
  target_age_min_months INTEGER,
  target_age_max_months INTEGER,

  -- Content
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_text TEXT,
  cta_url TEXT,
  image_url TEXT,

  -- Budget & bidding (open marketplace only)
  daily_budget DECIMAL,
  cpc_bid DECIMAL,
  total_budget DECIMAL,

  -- Performance
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  total_spend DECIMAL DEFAULT 0,

  -- Schedule
  start_date DATE,
  end_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_business ON ad_campaigns(business_id, status);


-- ═══════════════════════════════════════
-- NOTIFICATIONS (shared between portal + main app)
-- ═══════════════════════════════════════
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);


-- ═══════════════════════════════════════
-- Updated_at trigger (reusable)
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_business_records_updated_at
  BEFORE UPDATE ON business_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_ad_campaigns_updated_at
  BEFORE UPDATE ON ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Businesses
CREATE POLICY "Business owner can manage" ON businesses
  FOR ALL USING (owner_user_id = auth.uid());

CREATE POLICY "Team members can view business" ON businesses
  FOR SELECT USING (
    id IN (SELECT business_id FROM business_team_members WHERE user_id = auth.uid() AND active = true)
  );

-- Team members
CREATE POLICY "Business owner can manage team" ON business_team_members
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Team members can view own membership" ON business_team_members
  FOR SELECT USING (user_id = auth.uid());

-- Service links
CREATE POLICY "Business can view own links" ON service_links
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM business_team_members WHERE user_id = auth.uid() AND active = true)
  );

CREATE POLICY "Pet owner can view links to their pets" ON service_links
  FOR SELECT USING (
    pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

CREATE POLICY "Pet owner can update links to their pets" ON service_links
  FOR UPDATE USING (
    pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

CREATE POLICY "Business can create links" ON service_links
  FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM business_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'staff') AND active = true)
  );

-- Business records
CREATE POLICY "Business can manage own records" ON business_records
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM business_team_members WHERE user_id = auth.uid() AND active = true)
  );

CREATE POLICY "Pet owner can view visible records" ON business_records
  FOR SELECT USING (
    visible_to_owner = true
    AND pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

-- Business reminders
CREATE POLICY "Business can manage own reminders" ON business_reminders
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM business_team_members WHERE user_id = auth.uid() AND active = true)
  );

-- Ad campaigns
CREATE POLICY "Business can manage own campaigns" ON ad_campaigns
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_user_id = auth.uid())
  );

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
