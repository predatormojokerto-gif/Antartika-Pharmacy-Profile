import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { StokTable } from "@/components/admin/StokTable";

export const Route = createFileRoute("/admin/stok/aman")({
  head: () => ({ meta: [{ title: "Stok Aman" }] }),
  component: StokAman,
});

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function StokAman() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      const mapped = (data || [])
        .filter((p: any) => (p.stock || 0) > (p.min_stock || 0))
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
    <StokPageShell icon={ShieldCheck} title="Stok Aman" desc="Produk dengan jumlah stok di atas batas minimum.">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span><strong>{items.length} produk</strong> dalam kondisi stok aman.</span>
      </div>
      <StokTable data={items} badgeClass="bg-emerald-100 text-emerald-700 border-emerald-200" badgeLabel="Aman" />
    </StokPageShell>
  );
}
