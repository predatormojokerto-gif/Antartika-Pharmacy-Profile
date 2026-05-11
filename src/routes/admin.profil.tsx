import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/profil")({
  component: ProfilePage,
});

type Settings = {
  id: string;
  company_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_text: string;
  vision: string;
  mission: string;
  stat_years: string;
  stat_branches: string;
  stat_products: string;
  stat_customers: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
};

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {textarea ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function ProfilePage() {
  const [data, setData] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setData(data as Settings);
    });
  }, []);

  const update = (k: keyof Settings) => (v: string) => setData((d) => (d ? { ...d, [k]: v } : d));

  const save = async () => {
    if (savingRef.current) return;
    if (!data) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const { id, ...rest } = data;
      const { error } = await supabase.from("site_settings").update(rest).eq("id", id);
      if (error) toast.error(error.message);
      else toast.success("Tersimpan");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (!data) return <p className="text-muted-foreground">Memuat...</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">Profil & Kontak</h1>
      <p className="mt-1 text-muted-foreground">Edit informasi utama yang tampil di seluruh website.</p>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Identitas</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nama Perusahaan" value={data.company_name} onChange={update("company_name")} />
          <Field label="Tagline" value={data.tagline} onChange={update("tagline")} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Hero (Beranda)</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Judul Hero" value={data.hero_title} onChange={update("hero_title")} />
          <Field label="Subjudul Hero" value={data.hero_subtitle} onChange={update("hero_subtitle")} textarea />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Field label="Statistik: Tahun" value={data.stat_years} onChange={update("stat_years")} />
          <Field label="Statistik: Cabang" value={data.stat_branches} onChange={update("stat_branches")} />
          <Field label="Statistik: Produk" value={data.stat_products} onChange={update("stat_products")} />
          <Field label="Statistik: Pelanggan" value={data.stat_customers} onChange={update("stat_customers")} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Tentang</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Judul Tentang" value={data.about_title} onChange={update("about_title")} />
          <Field label="Deskripsi" value={data.about_text} onChange={update("about_text")} textarea />
          <Field label="Visi" value={data.vision} onChange={update("vision")} textarea />
          <Field label="Misi" value={data.mission} onChange={update("mission")} textarea />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Kontak</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Alamat" value={data.address} onChange={update("address")} />
          <Field label="Telepon" value={data.phone} onChange={update("phone")} />
          <Field label="Email" value={data.email} onChange={update("email")} />
          <Field label="Jam Operasional" value={data.hours} onChange={update("hours")} />
        </div>
      </section>

      <div className="mt-6">
        <Button type="button" onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</Button>
      </div>
    </div>
  );
}
