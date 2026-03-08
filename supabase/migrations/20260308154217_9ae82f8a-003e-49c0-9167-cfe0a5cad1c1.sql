-- Mission attempts table to track cognitive metrics
CREATE TABLE public.mission_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  mission_type TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 1,
  hints_used INTEGER NOT NULL DEFAULT 0,
  solve_time_seconds INTEGER,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mission_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children attempts" ON public.mission_attempts
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert attempts" ON public.mission_attempts
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Index for fast lookups
CREATE INDEX idx_mission_attempts_child ON public.mission_attempts(child_id);
CREATE INDEX idx_mission_attempts_parent ON public.mission_attempts(parent_id);
CREATE INDEX idx_mission_attempts_created ON public.mission_attempts(created_at DESC);