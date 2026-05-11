import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Plus, Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/stok/semua")({
  head: () => ({ meta: [{ title: "Semua Produk — Stok" }] }),
  component: SemuaProduk,
});



const statusStyle: Record<string, string> = {
  aman:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  menipis:  "bg-amber-100 text-amber-700 border-amber-200",
  habis:    "bg-red-100 text-red-700 border-red-200",
  expired:  "bg-rose-100 text-rose-700 border-rose-200",
};

function SemuaProduk() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      setItems(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = items.filter(
    (p) => p.name?.toLowerCase().includes(q.toLowerCase()) || p.sku?.toLowerCase().includes(q.toLowerCase())
  );

  const getStatus = (p: any): { key: string; label: string } => {
    const stok = p.stock || 0;
    const min = p.min_stock || 0;
    if (stok <= 0) return { key: "habis", label: "Habis" };
    if (stok <= min) return { key: "menipis", label: "Menipis" };
    return { key: "aman", label: "Aman" };
  };

  return (
    <StokPageShell icon={Package} title="Semua Produk" desc="Daftar lengkap seluruh produk inventori apotek.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari produk / SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-1.5 h-4 w-4" />Filter</Button>
          <Link to="/admin/stok/tambah">
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Tambah Produk</Button>
          </Link>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["SKU", "Nama Produk", "Kategori", "Stok", "Harga", "Expired", "Status"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada produk ditemukan.</td></tr>
            ) : (
              filtered.map((p) => {
                const status = getStatus(p);
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku || "—"}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
                    <td className="px-4 py-3 font-semibold">{p.stock || 0} <span className="text-xs font-normal text-muted-foreground">{p.unit || ""}</span></td>
                    <td className="px-4 py-3">{p.price || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.expired_at || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle[status.key]}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </StokPageShell>
  );
}
