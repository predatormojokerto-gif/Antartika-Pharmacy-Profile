import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Plus, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StokPageShell } from "@/components/admin/StokPageShell";

export const Route = createFileRoute("/admin/stok/opname")({
  head: () => ({ meta: [{ title: "Stok Opname" }] }),
  component: StokOpname,
});

function StokOpname() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) {
        toast.error("Gagal mengambil data produk");
      } else {
        setItems(
          (data || []).map((p: any) => ({
            id: p.id,
            sku: p.sku || "—",
            name: p.name,
            stok_sistem: p.stock || 0,
            stok_fisik: null as number | null,
          }))
        );
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  const setFisik = (id: string, val: string) =>
    setItems((arr) => arr.map((x) => x.id === id ? { ...x, stok_fisik: val === "" ? null : Number(val) } : x));

  const filled = items.filter((i) => i.stok_fisik !== null).length;
  const total = items.length;

  const handleFinish = () => {
    if (filled < total) return toast.error("Isi stok fisik semua produk terlebih dahulu.");
    toast.success("Stok Opname selesai disimpan! (demo)");
    setStarted(false);
  };

  return (
    <StokPageShell icon={ClipboardList} title="Stok Opname" desc="Penghitungan fisik persediaan untuk mencocokkan stok sistem.">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !started ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="font-semibold">Mulai Stok Opname Baru</p>
            <p className="mt-1 text-sm text-muted-foreground">Sistem akan membuat sesi opname untuk {total} produk aktif.</p>
          </div>
          <Button onClick={() => setStarted(true)}><Plus className="mr-2 h-4 w-4" />Mulai Opname</Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Progress: <strong className="text-foreground">{filled}/{total}</strong> produk dihitung</p>
            <Button onClick={handleFinish}><CheckCircle2 className="mr-2 h-4 w-4" />Selesai & Simpan</Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>{["Status","SKU","Nama Produk","Stok Sistem","Stok Fisik (isi)","Selisih"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const sel = item.stok_fisik !== null ? item.stok_fisik - item.stok_sistem : null;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        {item.stok_fisik !== null
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          : <Circle className="h-5 w-5 text-muted-foreground" />}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3">{item.stok_sistem}</td>
                      <td className="px-4 py-3">
                        <input type="number" min={0}
                          className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          placeholder="0"
                          onChange={(e) => setFisik(item.id, e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {sel !== null && (
                          <span className={`font-semibold ${sel < 0 ? "text-red-600" : sel > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {sel > 0 ? "+" : ""}{sel}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </StokPageShell>
  );
}
