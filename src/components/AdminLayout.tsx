import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin, claimAdminIfNone } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Pill, LayoutDashboard, FileText, Wrench, Package, ShoppingBag, LogOut, ShieldCheck, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/profil", label: "Profil & Kontak", icon: FileText },
  { to: "/admin/layanan", label: "Layanan", icon: Wrench },
  { to: "/admin/produk", label: "Kategori Produk", icon: Package },
  { to: "/admin/produk-list", label: "Produk", icon: ShoppingBag },
  { to: "/admin/pesan", label: "Pesan", icon: MessageSquare },
] as const;

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
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Memuat...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-soft)] px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Akses Admin Diperlukan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Akun Anda belum memiliki hak admin. Jika Anda admin pertama, klik tombol di bawah untuk mengklaim akses admin.
          </p>
          <div className="mt-6 flex gap-2">
            <Button onClick={handleClaim} className="flex-1">Jadikan Admin Pertama</Button>
            <Button onClick={logout} variant="outline">Keluar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
            <Pill className="h-4 w-4" />
          </span>
          <span className="font-bold">Admin Panel</span>
        </div>
        <nav className="space-y-1 p-3">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-border p-3">
          <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Keluar
          </Button>
        </div>
      </aside>
      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 md:hidden">
          <span className="font-bold">Admin</span>
          <Button onClick={logout} variant="outline" size="sm"><LogOut className="h-4 w-4" /></Button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent" activeProps={{ className: "whitespace-nowrap rounded-md px-3 py-1.5 text-sm bg-primary text-primary-foreground" }}>
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
