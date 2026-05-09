ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_replied boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS replied_at timestamptz;