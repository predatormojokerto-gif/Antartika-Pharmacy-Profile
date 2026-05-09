
-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "users view own roles" on public.user_roles for select to authenticated using (auth.uid()=user_id);
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Site settings (singleton row)
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Apotek Antartika',
  tagline text not null default 'Sahabat Sehat Keluarga Indonesia',
  hero_title text not null default 'Apotek Terpercaya untuk Kesehatan Keluarga',
  hero_subtitle text not null default 'Menyediakan obat berkualitas, layanan farmasi profesional, dan konsultasi kesehatan terpercaya selama lebih dari 20 tahun.',
  about_title text not null default 'Tentang Apotek Antartika',
  about_text text not null default 'Apotek Antartika adalah jaringan apotek modern yang berdedikasi memberikan layanan kesehatan terbaik.',
  vision text not null default 'Menjadi jaringan apotek terdepan di Indonesia.',
  mission text not null default 'Memberikan pelayanan farmasi profesional dan terpercaya.',
  stat_years text not null default '20+',
  stat_branches text not null default '150+',
  stat_products text not null default '5,000+',
  stat_customers text not null default '1jt+',
  address text not null default 'Jl. Antartika No. 1, Jakarta',
  phone text not null default '(021) 1234-5678',
  email text not null default 'info@apotekantartika.co.id',
  hours text not null default 'Senin - Minggu: 07:00 - 22:00',
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "anyone reads settings" on public.site_settings for select using (true);
create policy "admins update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins insert settings" on public.site_settings for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings default values;

-- Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null default 'Pill',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;
create policy "anyone reads services" on public.services for select using (true);
create policy "admins manage services" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.services (title, description, icon, sort_order) values
('Penjualan Obat', 'Obat resep, bebas, dan herbal lengkap dan terjamin keasliannya.', 'Pill', 1),
('Konsultasi Apoteker', 'Konsultasi gratis dengan apoteker berpengalaman.', 'Stethoscope', 2),
('Cek Kesehatan', 'Pemeriksaan tekanan darah, gula darah, dan kolesterol.', 'HeartPulse', 3),
('Antar Obat', 'Layanan pengantaran obat ke rumah Anda.', 'Truck', 4),
('Vaksinasi', 'Layanan vaksinasi untuk dewasa dan anak.', 'Syringe', 5),
('Alat Kesehatan', 'Berbagai alat kesehatan berkualitas.', 'Activity', 6);

-- Product categories
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.product_categories enable row level security;
create policy "anyone reads categories" on public.product_categories for select using (true);
create policy "admins manage categories" on public.product_categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.product_categories (name, description, sort_order) values
('Obat Resep', 'Obat dengan resep dokter', 1),
('Obat Bebas', 'Obat tanpa resep', 2),
('Vitamin & Suplemen', 'Multivitamin dan suplemen kesehatan', 3),
('Herbal', 'Produk obat herbal tradisional', 4),
('Perawatan Bayi', 'Produk khusus bayi dan anak', 5),
('Personal Care', 'Produk perawatan tubuh', 6),
('Alat Kesehatan', 'Termometer, tensimeter, dll', 7),
('Kosmetik', 'Produk kecantikan dan kosmetik', 8);
