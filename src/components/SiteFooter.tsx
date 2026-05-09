import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteData";

export function SiteFooter() {
  const s = useSiteSettings();
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-bold">{s?.company_name ?? "Apotek Antartika"}</h3>
          <p className="mt-3 text-sm opacity-80">
            {s?.tagline ?? "Sahabat sehat keluarga Indonesia."}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-80">Tautan</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tentang" className="opacity-90 hover:opacity-100">Tentang Kami</Link></li>
            <li><Link to="/layanan" className="opacity-90 hover:opacity-100">Layanan</Link></li>
            <li><Link to="/produk" className="opacity-90 hover:opacity-100">Produk</Link></li>
            <li><Link to="/kontak" className="opacity-90 hover:opacity-100">Kontak</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-80">Kontak</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /><span>{s?.address ?? "Jl. Antartika No. 17, Jakarta"}</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /><span>{s?.phone ?? "(021) 1234-5678"}</span></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /><span>{s?.email ?? "info@apotekantartika.co.id"}</span></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-80">Jam Operasional</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><Clock className="h-4 w-4 mt-0.5 shrink-0" /><span>{s?.hours ?? "Senin – Sabtu: 07.00 – 22.00"}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-5 text-xs opacity-80 md:flex-row md:justify-between">
          <p>© 2026 {s?.company_name ?? "Apotek Antartika"}. Seluruh hak cipta dilindungi.</p>
          <p>SIA: 449/SIA/2024 • APJ: apt. Dr. Sari Wijaya, S.Farm.</p>
        </div>
      </div>
    </footer>
  );
}
