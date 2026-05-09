import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Wrench, Package, Upload, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [counts, setCounts] = useState({ services: 0, categories: 0 });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const [s, c, st] = await Promise.all([
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("product_categories").select("*", { count: "exact", head: true }),
        supabase.from("site_settings").select("id, logo_url").limit(1).maybeSingle(),
      ]);
      setCounts({ services: s.count ?? 0, categories: c.count ?? 0 });
      if (st.data) {
        setSettingsId(st.data.id);
        setLogoUrl((st.data as { logo_url: string | null }).logo_url);
      }
    })();
  }, []);

  const onUpload = async (file: File) => {
    if (!settingsId) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
    const url = pub.publicUrl;
    const { error } = await supabase.from("site_settings").update({ logo_url: url }).eq("id", settingsId);
    setUploading(false);
    if (error) toast.error(error.message);
    else {
      setLogoUrl(url);
      toast.success("Foto profil diperbarui");
    }
  };

  const removeLogo = async () => {
    if (!settingsId) return;
    const { error } = await supabase.from("site_settings").update({ logo_url: null }).eq("id", settingsId);
    if (error) toast.error(error.message);
    else {
      setLogoUrl(null);
      toast.success("Foto profil dihapus");
    }
  };

  const cards = [
    { to: "/admin/profil", icon: FileText, label: "Profil & Kontak", desc: "Edit hero, visi misi, info kontak", value: "1 halaman" },
    { to: "/admin/layanan", icon: Wrench, label: "Layanan", desc: "Kelola daftar layanan", value: `${counts.services} item` },
    { to: "/admin/produk", icon: Package, label: "Kategori Produk", desc: "Kelola kategori produk", value: `${counts.categories} item` },
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Kelola seluruh konten company profile Apotek Antartika.</p>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold">Foto Profil / Logo</h2>
        <p className="mt-1 text-sm text-muted-foreground">Upload logo perusahaan yang akan tampil di seluruh website.</p>
        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                e.target.value = "";
              }}
            />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading || !settingsId}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Mengunggah..." : logoUrl ? "Ganti Foto" : "Upload Foto"}
            </Button>
            {logoUrl && (
              <Button variant="outline" onClick={removeLogo} disabled={uploading}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
              <c.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{c.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            <p className="mt-3 text-2xl font-bold text-primary">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
