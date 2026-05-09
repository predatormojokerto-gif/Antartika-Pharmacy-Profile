import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Target, Eye, Award, Users } from "lucide-react";
import pharmacist from "@/assets/pharmacist.jpg";
import { useSiteSettings } from "@/hooks/useSiteData";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Kami — Apotek Antartika" },
      { name: "description", content: "Sejarah, visi, dan misi Apotek Antartika." },
    ],
  }),
  component: About,
});

function About() {
  const s = useSiteSettings();
  return (
    <Layout>
      <section className="bg-[image:var(--gradient-hero)] py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold md:text-5xl">{s?.about_title ?? "Tentang Apotek Antartika"}</h1>
          <p className="mt-4 max-w-2xl text-lg opacity-90">
            {s?.tagline ?? "Lebih dari sekadar apotek."}
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:items-center">
        <img src={pharmacist} alt="Apoteker Antartika" width={1024} height={1024} loading="lazy" className="rounded-2xl shadow-[var(--shadow-elegant)]" />
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Tentang Kami</span>
          <h2 className="mt-2 text-3xl font-bold">Perjalanan Kami</h2>
          <p className="mt-4 text-muted-foreground">{s?.about_text}</p>
        </div>
      </section>

      <section className="bg-[image:var(--gradient-soft)] py-20">
        <div className="container mx-auto grid gap-6 px-4 md:grid-cols-2">
          {[
            { icon: Target, t: "Visi", d: s?.vision ?? "" },
            { icon: Eye, t: "Misi", d: s?.mission ?? "" },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <v.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-2xl font-bold">{v.t}</h3>
              <p className="mt-3 text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Nilai-Nilai Kami</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { icon: Award, t: "Integritas", d: "Jujur dan profesional dalam setiap layanan." },
            { icon: Users, t: "Empati", d: "Memahami kebutuhan setiap pelanggan." },
            { icon: Target, t: "Kualitas", d: "Standar tinggi pada produk dan layanan." },
            { icon: Eye, t: "Inovasi", d: "Selalu berkembang demi pelayanan terbaik." },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-6 text-center">
              <v.icon className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-3 font-semibold">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
