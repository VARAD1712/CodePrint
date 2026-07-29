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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id uuid NOT NULL REFERENCES recruitments(id) ON DELETE CASCADE,
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
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id text REFERENCES profiles(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
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
