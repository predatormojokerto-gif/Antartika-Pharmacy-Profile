import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users2, Plus, Phone, Mail, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/stok/supplier")({
  head: () => ({ meta: [{ title: "Supplier" }] }),
  component: SupplierPage,
});

function SupplierPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("supplier_id, category");
      const uniqueSuppliers = new Map();
      (data || []).forEach((p: any) => {
         const name = p.supplier_id || "Supplier Umum";
         if (!uniqueSuppliers.has(name) && name.trim() !== "") {
            uniqueSuppliers.set(name, {
               id: `S${String(uniqueSuppliers.size + 1).padStart(2, '0')}`,
               nama: name,
               kota: "Jakarta",
               telp: "021-5551" + Math.floor(Math.random() * 1000),
               email: "info@supplier.com",
               kategori: p.category || "Farmasi"
            });
         }
      });
      setItems(Array.from(uniqueSuppliers.values()));
    };
    fetch();
  }, []);

  const filtered = items.filter((d: any) => 
    (d.nama && d.nama.toLowerCase().includes(q.toLowerCase())) || 
    (d.kota && d.kota.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <StokPageShell icon={Users2} title="Supplier" desc="Data mitra pemasok dan distributor obat."
      badge={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Tambah Supplier</Button>}
    >
      <div className="relative mb-4 w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Cari supplier…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold leading-snug">{s.nama}</p>
                <p className="mt-0.5 text-xs text-primary">{s.kategori}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">{s.id}</span>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{s.kota}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{s.telp}</p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" />{s.email}</p>
            </div>
          </div>
        ))}
      </div>
    </StokPageShell>
  );
}
