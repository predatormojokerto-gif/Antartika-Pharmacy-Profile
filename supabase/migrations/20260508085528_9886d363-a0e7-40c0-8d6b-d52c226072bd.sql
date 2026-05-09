
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anyone reads site-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "admins upload site-assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update site-assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete site-assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'));
