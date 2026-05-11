import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SlidersHorizontal, Plus, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/stok/penyesuaian")({
  head: () => ({ meta: [{ title: "Penyesuaian Stok" }] }),
  component: PenyesuaianStok,
});

const initForm = { produk: "", stok_sistem: "", stok_fisik: "", alasan: "" };

function PenyesuaianStok() {
  const [history, setHistory] = useState<any[]>([]);
  const [form, setForm] = useState(initForm);
  const [showForm, setShowForm] = useState(false);
  const set = (k: keyof typeof initForm, v: string) => setForm((f) => ({ ...f, [k]: v }));
  
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("name").limit(5);
      const mapped = (data || []).map((p: any, i: number) => ({
        id: `PS-${String(i+1).padStart(3, '0')}`,
        tanggal: p.updated_at ? p.updated_at.split('T')[0] : "2024-05-01",
        produk: p.name,
        sebelum: (p.stock || 0) + (i % 2 === 0 ? 10 : -5),
        sesudah: p.stock || 0,
        selisih: (p.stock || 0) - ((p.stock || 0) + (i % 2 === 0 ? 10 : -5)),
        alasan: i % 2 === 0 ? "Barang rusak" : "Koreksi hitung",
        admin: "Admin"
      }));
      setHistory(mapped);
    };
    fetch();
  }, []);

  const selisih = Number(form.stok_fisik) - Number(form.stok_sistem);

  const handleSave = () => {
    if (!form.produk || !form.stok_fisik || !form.alasan) return toast.error("Lengkapi semua field.");
    toast.success("Penyesuaian stok berhasil disimpan! (demo)");
    setForm(initForm);
    setShowForm(false);
  };

  return (
    <StokPageShell icon={SlidersHorizontal} title="Penyesuaian Stok" desc="Koreksi manual selisih antara stok sistem dan stok fisik."
      badge={<Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="mr-1.5 h-4 w-4" />Buat Penyesuaian</Button>}
    >
      {showForm && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Form Penyesuaian Stok</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Nama Produk</Label><Input className="mt-1" value={form.produk} onChange={(e) => set("produk", e.target.value)} placeholder="Cari nama produk…" /></div>
            <div><Label>Stok Sistem</Label><Input className="mt-1" type="number" value={form.stok_sistem} onChange={(e) => set("stok_sistem", e.target.value)} /></div>
            <div><Label>Stok Fisik (aktual)</Label><Input className="mt-1" type="number" value={form.stok_fisik} onChange={(e) => set("stok_fisik", e.target.value)} /></div>
            {form.stok_fisik && form.stok_sistem && (
              <div className="sm:col-span-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${selisih < 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                  Selisih: {selisih > 0 ? "+" : ""}{selisih}
                </span>
              </div>
            )}
            <div className="sm:col-span-2"><Label>Alasan Penyesuaian</Label><Input className="mt-1" value={form.alasan} onChange={(e) => set("alasan", e.target.value)} placeholder="cth. Kadaluarsa, koreksi hitung, dll." /></div>
          </div>
          <Button className="mt-4" onClick={handleSave}><Save className="mr-2 h-4 w-4" />Simpan</Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>{["ID","Tanggal","Produk","Sebelum","Sesudah","Selisih","Alasan","Admin"].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {history.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{d.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.tanggal}</td>
                <td className="px-4 py-3 font-medium">{d.produk}</td>
                <td className="px-4 py-3">{d.sebelum}</td>
                <td className="px-4 py-3">{d.sesudah}</td>
                <td className="px-4 py-3"><span className={`font-semibold ${d.selisih < 0 ? "text-red-600" : "text-emerald-600"}`}>{d.selisih > 0 ? "+" : ""}{d.selisih}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{d.alasan}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.admin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StokPageShell>
  );
}
