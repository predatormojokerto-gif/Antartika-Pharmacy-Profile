-- Menambahkan kolom baru untuk inventori stok produk
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text DEFAULT '',
  ADD COLUMN IF NOT EXISTS batch text DEFAULT '',
  ADD COLUMN IF NOT EXISTS satuan text DEFAULT '',
  ADD COLUMN IF NOT EXISTS supplier text DEFAULT '',
  ADD COLUMN IF NOT EXISTS stok_awal integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stok_min integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expired text;

-- (Opsional) Memaksa Supabase memperbarui cache schema
NOTIFY pgrst, 'reload schema';
