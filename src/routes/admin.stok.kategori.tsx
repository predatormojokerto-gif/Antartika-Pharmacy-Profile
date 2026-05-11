import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/stok/kategori")({
  head: () => ({ meta: [{ title: "Kategori Produk — Stok" }] }),
  component: KategoriStok,
});

type CategorySummary = {
  id: string;
  name: string;
  count: number;
  color: string;
};

const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function KategoriStok() {
  const [items, setItems] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: categories }, { data: products }] = await Promise.all([
        supabase.from("product_categories").select("id, name").order("sort_order"),
        supabase.from("products").select("category"),
      ]);

      const counts = new Map<string, number>();
      (products ?? []).forEach((product: any) => {
        const name = (product.category || "").trim();
        if (name) counts.set(name.toLowerCase(), (counts.get(name.toLowerCase()) ?? 0) + 1);
      });

      setItems((categories ?? []).map((category: any, index) => ({
        id: category.id,
        name: category.name,
        count: counts.get(category.name.toLowerCase()) ?? 0,
        color: COLORS[index % COLORS.length],
      })));
      setLoading(false);
    };

    load();
  }, []);

  return (
    <StokPageShell icon={Tag} title="Kategori Produk" desc="Kelola pengelompokan kategori produk apotek."
      badge={<Link to="/admin/produk"><Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Kelola Kategori</Button></Link>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Memuat kategori...
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Belum ada kategori produk.
          </div>
        )}
        {items.map((k) => (
          <div key={k.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${k.color}`}>
                {k.name.charAt(0)}
              </span>
              <div>
                <p className="font-medium">{k.name}</p>
                <p className="text-xs text-muted-foreground">{k.count} produk</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Link to="/admin/produk">
                <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
              </Link>
              <Link to="/admin/produk">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </StokPageShell>
  );
}
