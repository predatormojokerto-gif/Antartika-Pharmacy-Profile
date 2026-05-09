import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ShieldCheck, Truck, Clock, HeartHandshake, Stethoscope, Pill, FlaskConical, Users } from "lucide-react";
import hero from "@/assets/hero-pharmacy.jpg";
import shelves from "@/assets/shelves.jpg";
import { useSiteSettings } from "@/hooks/useSiteData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apotek Antartika — Sahabat Sehat Keluarga Indonesia" },
      { name: "description", content: "Apotek Antartika menyediakan obat resep, obat bebas, vitamin, alat kesehatan, dan konsultasi apoteker terpercaya." },
    ],
  }),
  component: Home,
});

function Home() {
  const s = useSiteSettings();
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-95" />
        <div className="container relative mx-auto grid gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="text-primary-foreground">
            <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              Terpercaya sejak 2005
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {s?.hero_title ?? "Apotek Antartika"}
            </h1>
            <p className="mt-5 max-w-lg text-lg opacity-90">
              {s?.hero_subtitle ?? ""}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/layanan" className="rounded-lg bg-white px-6 py-3 font-medium text-primary shadow-lg transition hover:bg-white/90">
                Lihat Layanan
              </Link>
              <a
                href="https://wa.me/6287842224813"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://wa.me/6287842224813", "_blank", "noopener,noreferrer");
                }}
                className="rounded-lg border border-white/40 px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="Interior Apotek Antartika"
              width={1600}
              height={900}
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
          {[
            { n: s?.stat_years ?? "20+", l: "Tahun Pengalaman" },
            { n: s?.stat_branches ?? "150+", l: "Cabang di Indonesia" },
            { n: s?.stat_products ?? "5.000+", l: "Produk Tersedia" },
            { n: s?.stat_customers ?? "1jt+", l: "Pelanggan Setia" },
          ].map((x) => (
            <div key={x.l} className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">{x.n}</div>
              <div className="mt-1 text-sm text-muted-foreground">{x.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mengapa kami */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Mengapa Memilih Apotek Antartika?</h2>
          <p className="mt-4 text-muted-foreground">
            Komitmen kami adalah menghadirkan pelayanan kefarmasian yang aman, cepat, dan terjangkau.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "Obat Asli & Terjamin", d: "100% produk legal dari distributor resmi." },
            { icon: HeartHandshake, t: "Apoteker Profesional", d: "Konsultasi gratis dengan apoteker bersertifikat." },
            { icon: Truck, t: "Layanan Antar", d: "Pesan obat dan terima di rumah dengan cepat." },
            { icon: Clock, t: "Buka Setiap Hari", d: "Siap melayani hingga malam, termasuk akhir pekan." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About snippet */}
      <section className="bg-[image:var(--gradient-soft)]">
        <div className="container mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:items-center">
          <img src={shelves} alt="Rak obat Apotek Antartika" width={1200} height={800} loading="lazy" className="rounded-2xl shadow-[var(--shadow-elegant)]" />
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Tentang Kami</span>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Melayani Indonesia dengan Hati</h2>
            <p className="mt-4 text-muted-foreground">
              Berdiri sejak tahun 2005, Apotek Antartika telah berkembang menjadi salah satu jaringan
              apotek terpercaya di Indonesia. Kami berkomitmen menyediakan obat-obatan berkualitas,
              produk kesehatan, dan layanan kefarmasian profesional untuk seluruh keluarga.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Visi: Menjadi jaringan apotek terdepan di Indonesia",
                "Misi: Memberikan pelayanan kefarmasian terbaik",
                "Sertifikasi resmi dan apoteker bersertifikat"].map(t => (
                <li key={t} className="flex gap-2"><Pill className="h-5 w-5 text-primary shrink-0" /> {t}</li>
              ))}
            </ul>
            <Link to="/tentang" className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow hover:opacity-90">
              Pelajari Selengkapnya
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Layanan Unggulan</h2>
          <p className="mt-4 text-muted-foreground">Solusi kesehatan menyeluruh untuk Anda dan keluarga.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Pill, t: "Penjualan Obat", d: "Obat resep, obat bebas, dan generik." },
            { icon: Stethoscope, t: "Konsultasi Apoteker", d: "Konsultasi medis dan informasi obat." },
            { icon: FlaskConical, t: "Cek Kesehatan", d: "Tensi, gula darah, kolesterol, asam urat." },
            { icon: Users, t: "Member & Loyalitas", d: "Diskon spesial untuk pelanggan setia." },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6">
              <s.icon className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="overflow-hidden rounded-3xl bg-[image:var(--gradient-hero)] p-10 text-center text-primary-foreground shadow-[var(--shadow-elegant)] md:p-16">
          <h2 className="text-3xl font-bold md:text-4xl">Butuh konsultasi atau pesan obat?</h2>
          <p className="mx-auto mt-4 max-w-xl opacity-90">
            Tim apoteker Antartika siap membantu Anda 7 hari seminggu.
          </p>
          <Link to="/kontak" className="mt-8 inline-flex rounded-lg bg-white px-8 py-3 font-medium text-primary shadow hover:bg-white/90">
            Hubungi Sekarang
          </Link>
        </div>
      </section>
    </Layout>
  );
}
