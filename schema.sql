-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  company_name TEXT,
  industry TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  industry TEXT NOT NULL,
  job_function TEXT NOT NULL,
  deadline DATE,
  status TEXT DEFAULT 'active', -- active/paused/completed/archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Descriptions
CREATE TABLE job_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  jd_source TEXT, -- text/url/file
  jd_content TEXT NOT NULL,
  jd_url TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JD Analysis
CREATE TABLE jd_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jd_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
  position_title TEXT,
  location TEXT,
  salary_range TEXT,
  education_requirement TEXT,
  experience_years TEXT,
  required_skills JSONB, -- ["Java", "Spring Boot"]
  preferred_skills JSONB,
  soft_skills JSONB,
  language_requirements TEXT,
  ai_insights JSONB, -- {difficulty: "medium", marketHeat: "high"}
  search_keywords JSONB, -- Recommended search keywords
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Tasks
CREATE TABLE search_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  platforms JSONB NOT NULL, -- ["boss", "liepin", "zhilian"]
  keywords JSONB NOT NULL, -- {primary: [], secondary: [], exclude: []}
  filters JSONB, -- {experience: [3,5], education: [], location: []}
  collection_limit INTEGER DEFAULT 50,
  match_threshold INTEGER DEFAULT 70,
  use_proxy BOOLEAN DEFAULT false,
  crawl_interval INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending', -- pending/running/completed/failed/paused
  progress INTEGER DEFAULT 0, -- 0-100
  total_found INTEGER DEFAULT 0,
  total_collected INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_task_id UUID REFERENCES search_tasks(id),
  project_id UUID REFERENCES projects(id),
  platform TEXT NOT NULL, -- boss/liepin/zhilian
  platform_id TEXT, -- Candidate ID on the platform
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  education TEXT,
  current_company TEXT,
  current_position TEXT,
  work_years INTEGER,
  expected_salary TEXT,
  location TEXT,
  tags JSONB, -- Skill tags
  resume_markdown TEXT, -- Full resume (Markdown)
  resume_html TEXT, -- Resume HTML (Backup)
  profile_url TEXT, -- Original platform link
  avatar_url TEXT,
  status TEXT DEFAULT 'pending', -- pending/analyzing/analyzed/recommended/rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, platform_id) -- Prevent duplicate collection
);

-- Work Experiences
CREATE TABLE work_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  achievements JSONB,
  sort_order INTEGER
);

-- Education Backgrounds
CREATE TABLE education_backgrounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  degree TEXT,
  major TEXT,
  start_date DATE,
  end_date DATE,
  sort_order INTEGER
);

-- Match Analysis
CREATE TABLE match_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  jd_analysis_id UUID REFERENCES jd_analysis(id),
  overall_score INTEGER NOT NULL, -- 0-100
  dimension_scores JSONB, -- {skills: 90, experience: 85...}
  matched_points JSONB, -- Matched points array
  gaps JSONB, -- Gaps
  highlights JSONB, -- Highlights
  recommendation TEXT, -- Recommendation level
  summary TEXT, -- Analysis summary
  ai_model TEXT, -- AI model used
  analysis_duration INTEGER, -- Analysis duration (seconds)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_score ON match_analysis(overall_score DESC);
CREATE INDEX idx_match_candidate ON match_analysis(candidate_id);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own projects" ON projects FOR ALL USING (user_id = auth.uid());

ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own JDs" ON job_descriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = job_descriptions.project_id AND projects.user_id = auth.uid())
);

ALTER TABLE jd_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own JD analysis" ON jd_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM projects JOIN job_descriptions ON projects.id = job_descriptions.project_id WHERE job_descriptions.id = jd_analysis.jd_id AND projects.user_id = auth.uid())
);

ALTER TABLE search_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own search tasks" ON search_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = search_tasks.project_id AND projects.user_id = auth.uid())
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own candidates" ON candidates FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = candidates.project_id AND projects.user_id = auth.uid())
);

ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own candidate work experiences" ON work_experiences FOR ALL USING (
  EXISTS (SELECT 1 FROM candidates JOIN projects ON candidates.project_id = projects.id WHERE candidates.id = work_experiences.candidate_id AND projects.user_id = auth.uid())
);

ALTER TABLE education_backgrounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own candidate education" ON education_backgrounds FOR ALL USING (
  EXISTS (SELECT 1 FROM candidates JOIN projects ON candidates.project_id = projects.id WHERE candidates.id = education_backgrounds.candidate_id AND projects.user_id = auth.uid())
);

ALTER TABLE match_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own match analysis" ON match_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM candidates JOIN projects ON candidates.project_id = projects.id WHERE candidates.id = match_analysis.candidate_id AND projects.user_id = auth.uid())
);
