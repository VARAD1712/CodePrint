-- Run this in your Supabase SQL editor

-- Extend profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'student' CHECK (role IN ('student', 'company'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_headline text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_profile_score integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_profile_summary jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS talent_score integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_stats jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_breakdown jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_freshness jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_explainability jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pitch_score integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pitch_feedback jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_culture text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_values text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS testimonials jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alumni_stories jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills text[];

CREATE TABLE IF NOT EXISTS recruitments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  role_type text DEFAULT 'Full Stack',
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  skills text[],
  academic_criteria text,
  cgpa_cutoff numeric,
  eligible_branches text[],
  deadline timestamptz,
  criteria_weightage jsonb,
  posting_type text DEFAULT 'full-time',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  recruitment_id text NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
  student_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  ai_match_score integer,
  applied_at timestamptz DEFAULT now(),
  recruiter_notes text,
  interview_date timestamptz,
  UNIQUE(recruitment_id, student_id)
);

ALTER TABLE applications ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'applied' CHECK (pipeline_stage IN ('applied', 'screening', 'interview_scheduled', 'offer_extended', 'hired', 'rejected'));
CREATE INDEX IF NOT EXISTS idx_applications_recruitment_stage ON applications(recruitment_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  application_id text REFERENCES applications(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Permissive policies for MVP (tighten in production)
ALTER TABLE recruitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all recruitments" ON recruitments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all applications" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS career_guidance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_gap_analysis jsonb,
  recommended_certifications jsonb,
  career_roadmap jsonb,
  salary_prediction jsonb,
  learning_recommendation jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS interviews (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id text REFERENCES profiles(id) ON DELETE CASCADE,
  application_id text REFERENCES applications(id) ON DELETE CASCADE,
  transcript jsonb,
  technical_rating integer,
  communication_rating integer,
  confidence_score integer,
  hiring_recommendation text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pitch_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text,
  innovation_score integer,
  technical_flexibility_score integer,
  presentation_quality_score integer,
  business_potential_score integer,
  overall_pitch_score integer,
  recommendations jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE career_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all career_guidance" ON career_guidance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all interviews" ON interviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all pitch_analyses" ON pitch_analyses FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- SAFE SCHEMA MIGRATIONS (UUID -> TEXT)
-- ==========================================
-- Ensure existing database tables support string-based or offline synced IDs cleanly
ALTER TABLE IF EXISTS recruitments ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE IF EXISTS applications ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE IF EXISTS applications ALTER COLUMN recruitment_id TYPE text USING recruitment_id::text;
ALTER TABLE IF EXISTS notifications ALTER COLUMN application_id TYPE text USING application_id::text;
ALTER TABLE IF EXISTS interviews ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE IF EXISTS interviews ALTER COLUMN application_id TYPE text USING application_id::text;

-- ==========================================
-- SUPABASE NATIVE AUTOMATION & AI QUEUES
-- ==========================================

-- Enable extensions for cron scheduling and HTTP network requests if available
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- AI Job Queue table for background BullMQ processing & Edge Function workers
CREATE TABLE IF NOT EXISTS ai_job_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payload jsonb NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_job_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all ai_job_queue" ON ai_job_queue FOR ALL USING (true) WITH CHECK (true);

-- Database Trigger Function: Auto-dispatch Fraud Detection on Application submission
CREATE OR REPLACE FUNCTION trigger_ai_fraud_check()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert background job into ai_job_queue for asynchronous BullMQ / Edge processing
  INSERT INTO ai_job_queue (job_type, payload)
  VALUES (
    'fraud-detection',
    json_build_object(
      'application_id', NEW.id,
      'student_id', NEW.student_id,
      'recruitment_id', NEW.recruitment_id,
      'applied_at', NEW.applied_at
    )::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_on_application_submitted ON applications;
CREATE TRIGGER tr_on_application_submitted
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_ai_fraud_check();

-- pg_cron Schedule: Nightly GitHub Re-sync at 2 AM UTC
-- Invokes Supabase Edge Function or internal server endpoint to update skill decay scores
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'nightly-github-sync',
      '0 2 * * *',
      $$
      INSERT INTO ai_job_queue (job_type, payload)
      VALUES ('nightly-github-sync', '{"scheduled": true}'::jsonb);
      $$
    );
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- cron schema may require superuser or supabase platform execution
    NULL;
END $$;

-- =========================================================
-- Codeprint Enterprise: Shared Candidate Object & Recruiter Suite
-- =========================================================

-- 1. Extend profiles for Unified Candidate Object
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_analysis jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hackathon_submissions jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS innovation_score integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_alignment_score integer DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_alignment_report jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_searches jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS applications_received integer DEFAULT 0;

-- 2. Extend recruitments for application counting
ALTER TABLE recruitments ADD COLUMN IF NOT EXISTS applications_received integer DEFAULT 0;

-- 3. Extend applications table for enhanced State Machine & Direct Invites
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS initiated_by text DEFAULT 'student' CHECK (initiated_by IN ('student', 'recruiter'));
ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE applications ADD COLUMN IF NOT EXISTS offer_note text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS salary_band text;

-- 4. Create application_events table for audit logging & ATS-lite timeline view
CREATE TABLE IF NOT EXISTS application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all application_events" ON application_events FOR ALL USING (true) WITH CHECK (true);

-- 5. Create hackathons table for event leaderboards and problem statements
CREATE TABLE IF NOT EXISTS hackathons (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  description text,
  problem_statements text[],
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all hackathons" ON hackathons FOR ALL USING (true) WITH CHECK (true);

-- Insert demo hackathon events if table is empty
INSERT INTO hackathons (title, description, problem_statements, status)
SELECT 'Codeprint Global AI Hackathon 2026', 'Build next-gen autonomous agentic coding systems and live recruiter Copilots.', ARRAY['Multi-Agent Orchestration Engine', 'Realtime AI Mismatch & Fraud Shield', 'Autonomous Tech Debt Eliminator'], 'active'
WHERE NOT EXISTS (SELECT 1 FROM hackathons);

