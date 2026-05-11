import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TruckIcon, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/stok/masuk")({
  head: () => ({ meta: [{ title: "Barang Masuk" }] }),
  component: BarangMasuk,
});

function BarangMasuk() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(10);
      const mapped = (data || []).map((p: any, i: number) => ({
        id: `BM-${String(i+1).padStart(3, '0')}`,
        tanggal: p.created_at ? p.created_at.split('T')[0] : "2024-05-01",
        produk: p.name,
        qty: p.stock || 0,
        satuan: p.unit || "pcs",
        supplier: p.supplier_id || "Supplier Umum",
        harga: Number(p.price || 0) * (p.stock || 1),
        batch: p.sku || "—"
      }));
      setItems(mapped);
    };
    fetch();
  }, []);

  const filtered = items.filter((d: any) => 
    (d.produk && d.produk.toLowerCase().includes(q.toLowerCase())) || 
    (d.id && d.id.includes(q))
  );

  return (
    <StokPageShell icon={TruckIcon} title="Barang Masuk" desc="Catatan penerimaan barang dari supplier."
      badge={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Catat Barang Masuk</Button>}
    >
      <div className="relative mb-4 w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Cari produk / ID…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>{["ID Penerimaan","Tanggal","Produk","Qty","Supplier","Total Harga","Batch"].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{d.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.tanggal}</td>
                <td className="px-4 py-3 font-medium">{d.produk}</td>
                <td className="px-4 py-3">{d.qty} <span className="text-xs text-muted-foreground">{d.satuan}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{d.supplier}</td>
                <td className="px-4 py-3 font-semibold">Rp {d.harga.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.batch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StokPageShell>
  );
}
