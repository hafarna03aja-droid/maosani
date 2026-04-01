-- ============================================================
-- MAOSANI Database Schema — Supabase (PostgreSQL)
-- Run ini di Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'santri' CHECK (role IN ('santri', 'guru', 'guru_pending', 'admin')),
  avatar_url TEXT,
  placement_test_completed BOOLEAN DEFAULT FALSE,
  placement_start_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'guru' THEN 'guru_pending'
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'santri' -- Prevent hack admin signup
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'santri')
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PROGRESS (Buku Kendali Digital)
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' 
    CHECK (status IN ('in_progress', 'pending_review', 'approved', 'needs_retry')),
  score_makhroj NUMERIC(4,1),
  score_tajwid NUMERIC(4,1),
  score_kelancaran NUMERIC(4,1),
  score_total NUMERIC(4,1),
  approved_by UUID REFERENCES public.profiles(id),
  guru_notes TEXT,
  exercises_completed INTEGER DEFAULT 0,
  exercises_total INTEGER DEFAULT 10,
  attempts INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(santri_id, step_number)
);

-- 3. QUIZ RESULTS
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 10,
  correct_answers INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB, -- detail jawaban
  time_taken_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. GAMIFICATION
CREATE TABLE IF NOT EXISTS public.gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER DEFAULT 0,
  streak_current INTEGER DEFAULT 0,
  streak_best INTEGER DEFAULT 0,
  last_login_date DATE,
  total_quizzes INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  canvas_strokes INTEGER DEFAULT 0,
  letters_found INTEGER DEFAULT 0,
  recordings_saved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BADGES (earned by santri)
CREATE TABLE IF NOT EXISTS public.earned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  santri_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(santri_id, badge_id)
);

-- 6. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('step_approved', 'step_rejected', 'review_requested', 'badge_earned', 'level_up')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can read all, update own or if admin
CREATE POLICY "Profiles: read all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles: update own" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- PROGRESS: santri sees own, guru sees all
CREATE POLICY "Progress: santri reads own" ON public.progress FOR SELECT
  USING (santri_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('guru', 'admin')
  ));
CREATE POLICY "Progress: santri creates own" ON public.progress FOR INSERT
  WITH CHECK (santri_id = auth.uid());
CREATE POLICY "Progress: santri updates own" ON public.progress FOR UPDATE
  USING (santri_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('guru', 'admin')
  ));

-- QUIZ RESULTS: santri sees own, guru sees all
CREATE POLICY "Quiz: santri reads own" ON public.quiz_results FOR SELECT
  USING (santri_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('guru', 'admin')
  ));
CREATE POLICY "Quiz: santri creates own" ON public.quiz_results FOR INSERT
  WITH CHECK (santri_id = auth.uid());

-- GAMIFICATION: santri reads/updates own
CREATE POLICY "Gami: read own" ON public.gamification FOR SELECT USING (santri_id = auth.uid());
CREATE POLICY "Gami: create own" ON public.gamification FOR INSERT WITH CHECK (santri_id = auth.uid());
CREATE POLICY "Gami: update own" ON public.gamification FOR UPDATE USING (santri_id = auth.uid());

-- BADGES: santri reads own
CREATE POLICY "Badges: read own" ON public.earned_badges FOR SELECT USING (santri_id = auth.uid());
CREATE POLICY "Badges: create own" ON public.earned_badges FOR INSERT WITH CHECK (santri_id = auth.uid());

-- NOTIFICATIONS: read own
CREATE POLICY "Notif: read own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notif: update own" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_progress_santri ON public.progress(santri_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON public.progress(status);
CREATE INDEX IF NOT EXISTS idx_quiz_santri ON public.quiz_results(santri_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_earned_badges_santri ON public.earned_badges(santri_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_progress BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_gamification BEFORE UPDATE ON public.gamification
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
