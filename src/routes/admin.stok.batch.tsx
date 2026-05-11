import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layers, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/stok/batch")({
  head: () => ({ meta: [{ title: "Batch Obat" }] }),
  component: BatchObat,
});

function BatchObat() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      const mapped = (data || []).map((p: any) => ({
        id: p.id, produk: p.name, batch: p.sku || "—",
        qty: p.stock || 0, masuk: p.created_at ? p.created_at.split('T')[0] : "—",
        expired: p.expired_at || "—", supplier: p.supplier_id || "—"
      }));
      setItems(mapped);
    };
    fetch();
  }, []);

  const filtered = items.filter((d: any) =>
    (d.produk && d.produk.toLowerCase().includes(q.toLowerCase())) ||
    (d.batch && d.batch.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <StokPageShell icon={Layers} title="Batch Obat" desc="Kelola nomor batch / lot setiap produk untuk traceability."
      badge={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Tambah Batch</Button>}
    >
      <div className="relative mb-4 w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Cari produk / batch…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>{["No. Batch","Produk","Qty","Tgl Masuk","Expired","Supplier"].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{d.batch}</td>
                <td className="px-4 py-3 font-medium">{d.produk}</td>
                <td className="px-4 py-3">{d.qty.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.masuk}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.expired}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StokPageShell>
  );
}
