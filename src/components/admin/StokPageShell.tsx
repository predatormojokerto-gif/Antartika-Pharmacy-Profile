import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  desc: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

export function StokPageShell({ icon: Icon, title, desc, children, badge }: Props) {
  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/admin/stok" className="hover:text-primary transition-colors">Stok Produk</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {children}
    </div>
  );
}
