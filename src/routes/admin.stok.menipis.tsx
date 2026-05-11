import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { StokTable } from "@/components/admin/StokTable";

export const Route = createFileRoute("/admin/stok/menipis")({
  head: () => ({ meta: [{ title: "Stok Menipis" }] }),
  component: StokMenipis,
});

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function StokMenipis() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      const mapped = (data || [])
        .filter((p: any) => {
          const s = p.stock || 0;
          const m = p.min_stock || 0;
          return s > 0 && s <= m;
        })
        .map((p: any) => ({
          id: p.id, name: p.name, sku: p.sku || "—",
          stok: p.stock || 0, min: p.min_stock || 0,
          satuan: p.unit || "", expired: p.expired_at || "—"
        }));
      setItems(mapped);
    };
    fetch();
  }, []);

  return (
    <StokPageShell icon={AlertTriangle} title="Kurang Stok / Menipis" desc="Produk yang stoknya mendekati atau di bawah batas minimum.">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span><strong>{items.length} produk</strong> perlu segera di-restock.</span>
      </div>
      <StokTable data={items} badgeClass="bg-amber-100 text-amber-700 border-amber-200" badgeLabel="Menipis" />
    </StokPageShell>
  );
}
