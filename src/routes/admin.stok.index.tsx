import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package, Plus, Tag, ShieldCheck, AlertTriangle,
  PackageX, Timer, Skull, Layers, TruckIcon,
  ArrowLeftRight, Users2, SlidersHorizontal,
  ClipboardList, BarChart2,
} from "lucide-react";

export const Route = createFileRoute("/admin/stok/")({
  head: () => ({ meta: [{ title: "Stok Produk — Admin Apotek Antartika" }] }),
  component: StokDashboard,
});

const stokMenus = [
  { to: "/admin/stok/semua",         icon: Package,          label: "Semua Produk",          desc: "Lihat dan kelola seluruh produk",             color: "from-blue-500 to-blue-600" },
  { to: "/admin/stok/tambah",        icon: Plus,             label: "Tambah Produk",         desc: "Input produk baru ke inventori",              color: "from-emerald-500 to-emerald-600" },
  { to: "/admin/stok/kategori",      icon: Tag,              label: "Kategori Produk",       desc: "Kelola kategori produk apotek",               color: "from-violet-500 to-violet-600" },
  { to: "/admin/stok/aman",          icon: ShieldCheck,      label: "Stok Aman",             desc: "Produk dengan stok mencukupi",                color: "from-green-500 to-green-600" },
  { to: "/admin/stok/menipis",       icon: AlertTriangle,    label: "Kurang Stok / Menipis", desc: "Produk mendekati batas stok minimum",         color: "from-amber-500 to-amber-600" },
  { to: "/admin/stok/habis",         icon: PackageX,         label: "Stok Habis",            desc: "Produk yang sudah habis / kosong",            color: "from-red-500 to-red-600" },
  { to: "/admin/stok/hampir-expired",icon: Timer,            label: "Hampir Expired",        desc: "Produk mendekati tanggal kadaluarsa",         color: "from-orange-500 to-orange-600" },
  { to: "/admin/stok/expired",       icon: Skull,            label: "Produk Expired",        desc: "Produk yang sudah melewati tanggal expired",  color: "from-rose-600 to-rose-700" },
  { to: "/admin/stok/batch",         icon: Layers,           label: "Batch Obat",            desc: "Kelola nomor batch & lot obat",               color: "from-cyan-500 to-cyan-600" },
  { to: "/admin/stok/masuk",         icon: TruckIcon,        label: "Barang Masuk",          desc: "Catat penerimaan barang dari supplier",       color: "from-teal-500 to-teal-600" },
  { to: "/admin/stok/keluar",        icon: ArrowLeftRight,   label: "Barang Keluar",         desc: "Catat pengeluaran / penjualan barang",        color: "from-indigo-500 to-indigo-600" },
  { to: "/admin/stok/supplier",      icon: Users2,           label: "Supplier",              desc: "Data mitra dan pemasok obat",                 color: "from-pink-500 to-pink-600" },
  { to: "/admin/stok/penyesuaian",   icon: SlidersHorizontal,label: "Penyesuaian Stok",      desc: "Koreksi manual jumlah stok",                  color: "from-fuchsia-500 to-fuchsia-600" },
  { to: "/admin/stok/opname",        icon: ClipboardList,    label: "Stok Opname",           desc: "Penghitungan fisik persediaan barang",        color: "from-sky-500 to-sky-600" },
  { to: "/admin/stok/laporan",       icon: BarChart2,        label: "Laporan Stok",          desc: "Ringkasan dan laporan inventori",             color: "from-lime-600 to-lime-700" },
] as const;

function StokDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Stok Produk</h1>
        <p className="mt-2 text-muted-foreground">
          Kelola seluruh inventori, pergerakan barang, supplier, dan laporan stok apotek.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stokMenus.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
          >
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md`}>
              <m.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold leading-snug">{m.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
            <div className={`absolute right-0 top-0 h-1 w-full rounded-t-2xl bg-gradient-to-r ${m.color} opacity-60`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
