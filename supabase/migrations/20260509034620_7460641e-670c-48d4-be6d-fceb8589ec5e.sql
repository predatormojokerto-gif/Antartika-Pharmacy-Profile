CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit messages"
ON public.messages FOR INSERT
TO public
WITH CHECK (
  char_length(name) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 255
  AND char_length(message) BETWEEN 1 AND 2000
  AND char_length(subject) <= 200
);

CREATE POLICY "admins read messages"
ON public.messages FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update messages"
ON public.messages FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete messages"
ON public.messages FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);