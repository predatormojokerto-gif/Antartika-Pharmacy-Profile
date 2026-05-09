
ALTER TABLE public.product_categories ADD COLUMN IF NOT EXISTS image_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anyone reads category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "admins upload category images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update category images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete category images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));
