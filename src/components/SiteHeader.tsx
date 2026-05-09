import { Link, useNavigate } from "@tanstack/react-router";
import { Pill, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang Kami" },
  { to: "/layanan", label: "Layanan" },
  { to: "/produk", label: "Produk" },
  { to: "/kontak", label: "Kontak" },
] as const;

function readCartCount() {
  if (typeof window === "undefined") return 0;
  try {
    const arr = JSON.parse(localStorage.getItem("cart") || "[]") as { qty: number }[];
    return arr.reduce((s, i) => s + (i.qty || 0), 0);
  } catch {
    return 0;
  }
}

export function SiteHeader() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setCount(readCartCount());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("cart-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart-updated", update);
    };
  }, []);

  const openCart = () => {
    navigate({ to: "/produk", hash: "cart" });
    setTimeout(() => window.dispatchEvent(new CustomEvent("open-cart")), 50);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
            <Pill className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Apotek <span className="text-primary">Antartika</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-medium text-primary bg-accent" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={openCart}
            aria-label="Keranjang belanja"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
          >
            <ShoppingCart className="h-4 w-4" />
            {mounted && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <Link
            to="/auth"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Admin
          </Link>
          <a
            href="https://wa.me/6287842224813"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open("https://wa.me/6287842224813", "_blank", "noopener,noreferrer");
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </header>
  );
}
