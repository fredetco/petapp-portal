-- ═══════════════════════════════════════════════════════
-- FIX 1: Recreate the new-user trigger (fixes signup error)
-- ═══════════════════════════════════════════════════════

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════════════════════
-- FIX 2: Break infinite RLS recursion on businesses ↔ team_members
-- Create helper functions that bypass RLS
-- ═══════════════════════════════════════════════════════

-- Helper: get business IDs owned by current user (bypasses RLS)
CREATE OR REPLACE FUNCTION get_owned_business_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM public.businesses WHERE owner_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get business IDs where user is a team member (bypasses RLS)
CREATE OR REPLACE FUNCTION get_team_business_ids()
RETURNS SETOF UUID AS $$
  SELECT business_id FROM public.business_team_members
  WHERE user_id = auth.uid() AND active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Business owner can manage" ON businesses;
DROP POLICY IF EXISTS "Team members can view business" ON businesses;
DROP POLICY IF EXISTS "Business owner can manage team" ON business_team_members;
DROP POLICY IF EXISTS "Team members can view own membership" ON business_team_members;

-- Recreate businesses policies (no recursion)
CREATE POLICY "Business owner can manage" ON businesses
  FOR ALL USING (owner_user_id = auth.uid());

CREATE POLICY "Team members can view business" ON businesses
  FOR SELECT USING (id IN (SELECT get_team_business_ids()));

-- Recreate team members policies (no recursion)
CREATE POLICY "Business owner can manage team" ON business_team_members
  FOR ALL USING (business_id IN (SELECT get_owned_business_ids()));

CREATE POLICY "Team members can view own membership" ON business_team_members
  FOR SELECT USING (user_id = auth.uid());

-- Also fix service_links, business_records, business_reminders, ad_campaigns
-- that reference businesses (replace subqueries with helper functions)

DROP POLICY IF EXISTS "Business can view own links" ON service_links;
CREATE POLICY "Business can view own links" ON service_links
  FOR SELECT USING (
    business_id IN (SELECT get_owned_business_ids())
    OR business_id IN (SELECT get_team_business_ids())
  );

DROP POLICY IF EXISTS "Business can create links" ON service_links;
CREATE POLICY "Business can create links" ON service_links
  FOR INSERT WITH CHECK (
    business_id IN (SELECT get_owned_business_ids())
    OR business_id IN (SELECT get_team_business_ids())
  );

DROP POLICY IF EXISTS "Business can manage own records" ON business_records;
CREATE POLICY "Business can manage own records" ON business_records
  FOR ALL USING (
    business_id IN (SELECT get_owned_business_ids())
    OR business_id IN (SELECT get_team_business_ids())
  );

DROP POLICY IF EXISTS "Business can manage own reminders" ON business_reminders;
CREATE POLICY "Business can manage own reminders" ON business_reminders
  FOR ALL USING (
    business_id IN (SELECT get_owned_business_ids())
    OR business_id IN (SELECT get_team_business_ids())
  );

DROP POLICY IF EXISTS "Business can manage own campaigns" ON ad_campaigns;
CREATE POLICY "Business can manage own campaigns" ON ad_campaigns
  FOR ALL USING (
    business_id IN (SELECT get_owned_business_ids())
  );


-- ═══════════════════════════════════════════════════════
-- FIX 3: Allow business insert (for onboarding)
-- ═══════════════════════════════════════════════════════
-- The "FOR ALL" policy requires the row to already exist for INSERT,
-- so we need a separate INSERT policy
CREATE POLICY "Authenticated users can create a business" ON businesses
  FOR INSERT WITH CHECK (owner_user_id = auth.uid());

-- Also allow notifications to be inserted (by system/triggers)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
