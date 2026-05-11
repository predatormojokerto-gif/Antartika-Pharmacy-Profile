import { createFileRoute } from "@tanstack/react-router";
import { PackageX } from "lucide-react";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { StokTable } from "@/components/admin/StokTable";

export const Route = createFileRoute("/admin/stok/habis")({
  head: () => ({ meta: [{ title: "Stok Habis" }] }),
  component: StokHabis,
});

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function StokHabis() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      const mapped = (data || [])
        .filter((p: any) => (p.stock || 0) <= 0)
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
    <StokPageShell icon={PackageX} title="Stok Habis" desc="Produk yang stoknya sudah nol, segera lakukan pemesanan.">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <PackageX className="h-4 w-4 shrink-0" />
        <span><strong>{items.length} produk</strong> stoknya habis dan tidak tersedia.</span>
      </div>
      <StokTable data={items} badgeClass="bg-red-100 text-red-700 border-red-200" badgeLabel="Habis" />
    </StokPageShell>
  );
}
