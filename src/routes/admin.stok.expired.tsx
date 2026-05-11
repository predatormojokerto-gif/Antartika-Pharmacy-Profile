import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skull } from "lucide-react";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { StokTable } from "@/components/admin/StokTable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/stok/expired")({
  head: () => ({ meta: [{ title: "Produk Expired" }] }),
  component: ProdukExpired,
});

function ProdukExpired() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      const mapped = (data || [])
        .filter((p: any) => {
          if (!p.expired_at) return false;
          const exp = new Date(p.expired_at).getTime();
          const now = new Date().getTime();
          return exp <= now;
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
    <StokPageShell icon={Skull} title="Produk Expired" desc="Produk yang telah melewati tanggal kadaluarsa dan wajib dimusnahkan.">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <Skull className="h-4 w-4 shrink-0" />
        <span><strong>{items.length} produk</strong> sudah expired. Segera lakukan pemusnahan sesuai prosedur.</span>
      </div>
      <StokTable data={items} badgeClass="bg-rose-100 text-rose-700 border-rose-200" badgeLabel="Expired" />
    </StokPageShell>
  );
}
