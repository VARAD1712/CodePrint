export type UserRole = 'student' | 'company';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  company_name?: string;
  github_username?: string;
  linkedin_url?: string;
  linkedin_headline?: string;
  talent_score?: number | null;
  ai_profile_score?: number | null;
  ai_profile_summary?: AiProfileSummary | null;
  github_stats?: GitHubStats | null;
  github_breakdown?: ScoreBreakdown | null;
  avatar_url?: string | null;
  pitch_score?: number | null;
  pitch_feedback?: PitchFeedback | null;
  company_culture?: string | null;
  company_values?: string[] | null;
  testimonials?: { name: string; role: string; text: string }[] | null;
  alumni_stories?: { name: string; role: string; story: string }[] | null;
  college?: string | null;
  skills?: string[] | null;
  hackathon_achievements?: HackathonAchievement[] | null;
  portfolio_config?: PortfolioConfig | null;
  fraud_shield_score?: number | null;
  fraud_analysis?: FraudAnalysisReport | null;
  created_at?: string;
}

export interface HackathonAchievement {
  id: string;
  title: string;
  event_name: string;
  date: string;
  role: string;
  placement: string;
  certificate_url?: string;
  description: string;
  skills: string[];
  ai_verified: boolean;
  ai_credibility_score: number;
  ai_feedback: string;
  bonus_points: number;
}

export interface PortfolioConfig {
  theme?: 'dark' | 'light' | 'emerald' | 'sapphire';
  custom_bio?: string;
  featured_repos?: string[];
  show_ai_score?: boolean;
  show_hackathons?: boolean;
  public_url?: string;
  tagline?: string;
  hero_title?: string;
}

export interface MockQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  category?: string;
}

export interface MockTestConfig {
  enabled: boolean;
  title: string;
  duration_minutes: number;
  passing_percentage: number;
  questions: MockQuestion[];
}

export interface FraudAnalysisReport {
  trust_score: number;
  risk_level: 'low' | 'medium' | 'high';
  vectors: {
    github_authenticity: { score: number; status: string; detail: string };
    resume_code_correlation: { score: number; status: string; detail: string };
    hackathon_credibility: { score: number; status: string; detail: string };
    assessment_integrity: { score: number; status: string; detail: string };
  };
  last_checked: string;
}

export interface ScoreBreakdown {
  productivity: number;
  impact: number;
  diversity: number;
  recency: number;
  community: number;
}

export interface GitHubStats {
  repos: number;
  stars: number;
  forks: number;
  languages: string[];
  followers: number;
  accountAgeDays: number;
  recentCommits: number;
}

export interface GitHubResult {
  username: string;
  talentScore: number;
  breakdown: ScoreBreakdown;
  stats: GitHubStats;
  avatarUrl: string | null;
}

export interface AiProfileSummary {
  overallScore: number;
  githubScore: number;
  linkedinScore: number;
  summary: string;
  strengths: string[];
  recommendations: string[];
}

export interface PitchFeedback {
  communication: string;
  technicalDepth: string;
  clarity: string;
}

export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  homepage?: string;
  topics: string[];
  updated_at: string;
  created_at?: string;
  fork?: boolean;
}

export interface Recruitment {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  role_type: string;
  status: 'open' | 'closed';
  skills?: string[];
  academic_criteria?: string | null;
  cgpa_cutoff?: number | null;
  eligible_branches?: string[];
  deadline?: string | null;
  criteria_weightage?: Record<string, number> | null;
  posting_type?: string;
  mock_test?: MockTestConfig | null;
  applicant_count?: number;
  created_at: string;
  profiles?: { full_name: string; company_name?: string; id?: string };
}

export interface Application {
  id: string;
  recruitment_id: string;
  student_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  ai_match_score: number | null;
  applied_at: string;
  recruiter_notes?: string | null;
  interview_date?: string | null;
  assessment_score?: number | null;
  assessment_passed?: boolean | null;
  fraud_risk_level?: 'low' | 'medium' | 'high' | null;
  fraud_analysis?: FraudAnalysisReport | null;
  recruitments?: Recruitment;
  profiles?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  application_id: string | null;
  created_at: string;
}

export interface CareerGuidance {
  id: string;
  student_id: string;
  skill_gap_analysis: Record<string, string> | null;
  recommended_certifications: string[] | null;
  career_roadmap: { year: number; milestone: string }[] | null;
  salary_prediction: { min: number; max: number; role: string } | null;
  learning_recommendation: { course: string; platform: string; link: string }[] | null;
  created_at: string;
}

export interface Interview {
  id: string;
  student_id: string;
  company_id: string | null;
  application_id: string | null;
  transcript: { speaker: 'AI' | 'Student'; text: string; timestamp: string }[] | null;
  technical_rating: number | null;
  communication_rating: number | null;
  confidence_score: number | null;
  hiring_recommendation: string | null;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface PitchAnalysis {
  id: string;
  student_id: string;
  file_url: string | null;
  innovation_score: number | null;
  technical_flexibility_score: number | null;
  presentation_quality_score: number | null;
  business_potential_score: number | null;
  overall_pitch_score: number | null;
  recommendations: string[] | null;
  created_at: string;
}
