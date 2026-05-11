import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart2, TrendingUp, TrendingDown, Package, AlertTriangle, Loader2 } from "lucide-react";
import { StokPageShell } from "@/components/admin/StokPageShell";

export const Route = createFileRoute("/admin/stok/laporan")({
  head: () => ({ meta: [{ title: "Laporan Stok" }] }),
  component: LaporanStok,
});

function LaporanStok() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [topStok, setTopStok] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*");
      
      if (!error && data) {
        const total = data.length;
        const aman = data.filter((p: any) => (p.stock || 0) > (p.min_stock || 0)).length;
        const menipis = data.filter((p: any) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.min_stock || 0)).length;
        const habis = data.filter((p: any) => (p.stock || 0) <= 0).length;

        setStats([
          { label: "Total Produk",   value: total.toString(),  sub: "produk aktif",     icon: Package,       color: "from-blue-500 to-blue-600" },
          { label: "Stok Aman",      value: aman.toString(),   sub: "di atas minimum",  icon: TrendingUp,    color: "from-emerald-500 to-emerald-600" },
          { label: "Stok Menipis",   value: menipis.toString(),sub: "perlu restock",    icon: AlertTriangle, color: "from-amber-500 to-amber-600" },
          { label: "Stok Habis",     value: habis.toString(),  sub: "produk kosong",    icon: TrendingDown,  color: "from-red-500 to-red-600" },
        ]);

        const top = [...data]
          .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
          .slice(0, 5)
          .map((p: any) => ({ name: p.name, stok: p.stock || 0 }));
        setTopStok(top);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const TOP_KELUAR = [
    { name: "Paracetamol 500mg", qty: 1240, satuan: "tab" },
    { name: "Amoxicillin 500mg", qty: 640,  satuan: "kap" },
    { name: "Vitamin C 1000mg",  qty: 520,  satuan: "tab" },
    { name: "OBH Combi Batuk",   qty: 310,  satuan: "btl" },
    { name: "Betadine 30ml",     qty: 210,  satuan: "btl" },
  ];

  return (
    <StokPageShell icon={BarChart2} title="Laporan Stok" desc="Ringkasan performa dan kondisi inventori apotek.">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow`}>
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tables */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Top keluar */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 font-semibold">Top 5 Produk Terlaris (Bulan Ini)</h3>
              <p className="mb-4 text-xs text-muted-foreground italic">*Data penjualan masih simulasi</p>
              <div className="space-y-3">
                {TOP_KELUAR.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(p.qty / TOP_KELUAR[0].qty) * 100}%` }} />
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">{p.qty} <span className="text-xs text-muted-foreground">{p.satuan}</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top stok */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 font-semibold">Produk dengan Stok Tertinggi</h3>
              <div className="space-y-3">
                {topStok.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: (topStok.length > 0 && topStok[0].stok > 0) ? `${(p.stok / topStok[0].stok) * 100}%` : "0%" }} />
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">{p.stok}</span>
                  </div>
                ))}
                {topStok.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Tidak ada data stok.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </StokPageShell>
  );
}
