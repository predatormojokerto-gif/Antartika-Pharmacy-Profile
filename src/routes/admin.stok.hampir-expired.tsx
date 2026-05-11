import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { StokTable } from "@/components/admin/StokTable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/stok/hampir-expired")({
  head: () => ({ meta: [{ title: "Hampir Expired" }] }),
  component: HampirExpired,
});

function HampirExpired() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      const mapped = (data || [])
        .filter((p: any) => {
          if (!p.expired_at) return false;
          const exp = new Date(p.expired_at).getTime();
          const now = new Date().getTime();
          const diffDays = (exp - now) / (1000 * 3600 * 24);
          return diffDays > 0 && diffDays <= 90;
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
    <StokPageShell icon={Timer} title="Hampir Expired" desc="Produk yang akan kadaluarsa dalam 90 hari ke depan.">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
        <Timer className="h-4 w-4 shrink-0" />
        <span><strong>{items.length} produk</strong> akan kadaluarsa dalam 90 hari. Segera tindak lanjuti.</span>
      </div>
      <StokTable data={items} badgeClass="bg-orange-100 text-orange-700 border-orange-200" badgeLabel="Hampir Exp." />
    </StokPageShell>
  );
}
