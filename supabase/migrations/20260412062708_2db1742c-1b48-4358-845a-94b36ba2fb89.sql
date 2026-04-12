CREATE TABLE public.decibel_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  db_level REAL NOT NULL CHECK (db_level >= 0 AND db_level <= 200),
  status TEXT NOT NULL CHECK (status IN ('Quiet', 'Normal', 'Loud')),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_decibel_readings_recorded_at ON public.decibel_readings (recorded_at DESC);

ALTER TABLE public.decibel_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read decibel readings"
  ON public.decibel_readings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert readings"
  ON public.decibel_readings FOR INSERT
  WITH CHECK (true);