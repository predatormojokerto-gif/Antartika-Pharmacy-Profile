import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin, claimAdminIfNone } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import {
  Pill, LayoutDashboard, FileText, Wrench, Package, ShoppingBag,
  LogOut, ShieldCheck, MessageSquare, Boxes, ChevronDown,
  List, Plus, Tag, AlertTriangle, PackageX, Timer, Skull,
  Layers, TruckIcon, ArrowLeftRight, Users2, SlidersHorizontal,
  ClipboardList, BarChart2,
} from "lucide-react";
import { toast } from "sonner";

// ── Top-level nav items ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: "/admin",           label: "Dashboard",       icon: LayoutDashboard },
  { to: "/admin/profil",    label: "Profil & Kontak", icon: FileText },
  { to: "/admin/layanan",   label: "Layanan",         icon: Wrench },
  { to: "/admin/produk",    label: "Kategori Produk", icon: Package },
  { to: "/admin/produk-list", label: "Produk",        icon: ShoppingBag },
  { to: "/admin/pesan",     label: "Pesan",           icon: MessageSquare },
] as const;

// ── Stok sub-menu items ───────────────────────────────────────────────────────
const STOK_SUB = [
  { to: "/admin/stok/semua",          label: "Semua Produk",          icon: List },
  { to: "/admin/stok/tambah",         label: "Tambah Produk",         icon: Plus },
  { to: "/admin/stok/kategori",       label: "Kategori Produk",       icon: Tag },
  { to: "/admin/stok/aman",           label: "Stok Aman",             icon: ShieldCheck },
  { to: "/admin/stok/menipis",        label: "Kurang Stok / Menipis", icon: AlertTriangle },
  { to: "/admin/stok/habis",          label: "Stok Habis",            icon: PackageX },
  { to: "/admin/stok/hampir-expired", label: "Hampir Expired",        icon: Timer },
  { to: "/admin/stok/expired",        label: "Produk Expired",        icon: Skull },
  { to: "/admin/stok/batch",          label: "Batch Obat",            icon: Layers },
  { to: "/admin/stok/masuk",          label: "Barang Masuk",          icon: TruckIcon },
  { to: "/admin/stok/keluar",         label: "Barang Keluar",         icon: ArrowLeftRight },
  { to: "/admin/stok/supplier",       label: "Supplier",              icon: Users2 },
  { to: "/admin/stok/penyesuaian",    label: "Penyesuaian Stok",      icon: SlidersHorizontal },
  { to: "/admin/stok/opname",         label: "Stok Opname",           icon: ClipboardList },
  { to: "/admin/stok/laporan",        label: "Laporan Stok",          icon: BarChart2 },
] as const;

// ── Collapsible Stok Menu ─────────────────────────────────────────────────────
function StokMenu({ pathname }: { pathname: string }) {
  const isInStok = pathname.startsWith("/admin/stok");
  const [open, setOpen] = useState(isInStok);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
          isInStok
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <Boxes className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Stok Produk</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="ml-3 mt-1 space-y-px border-l-2 border-border pl-3">
          {STOK_SUB.map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition ${
                  active
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <it.icon className="h-3.5 w-3.5 shrink-0" />
                {it.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);
      const admin = await checkIsAdmin(uid);
      setIsAdmin(admin);
      setReady(true);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/auth" });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleClaim = async () => {
    if (!userId) return;
    const ok = await claimAdminIfNone(userId);
    if (ok) {
      toast.success("Anda sekarang admin!");
      setIsAdmin(true);
    } else {
      toast.error("Sudah ada admin terdaftar. Hubungi admin yang ada.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-soft)] px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Akses Admin Diperlukan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Akun Anda belum memiliki hak admin. Jika Anda admin pertama, klik
            tombol di bawah untuk mengklaim akses admin.
          </p>
          <div className="mt-6 flex gap-2">
            <Button onClick={handleClaim} className="flex-1">
              Jadikan Admin Pertama
            </Button>
            <Button onClick={logout} variant="outline">
              Keluar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
            <Pill className="h-4 w-4" />
          </span>
          <span className="font-bold">Admin Panel</span>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {/* Main items */}
          {NAV_ITEMS.map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}

          {/* Divider + Inventori group */}
          <div className="my-2 border-t border-border" />
          <p className="px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Inventori
          </p>
          <StokMenu pathname={pathname} />
        </nav>

        {/* Logout pinned at bottom */}
        <div className="shrink-0 border-t border-border p-3">
          <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Keluar
          </Button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top-bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 md:hidden">
          <span className="font-bold">Admin</span>
          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Mobile nav tabs */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
          {NAV_ITEMS.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
              activeProps={{
                className:
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm bg-primary text-primary-foreground",
              }}
            >
              {it.label}
            </Link>
          ))}
          <Link
            to="/admin/stok"
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            activeProps={{
              className:
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm bg-primary text-primary-foreground",
            }}
          >
            Stok Produk
          </Link>
        </nav>

        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
