import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ShieldCheck, Truck, Clock, HeartHandshake, Stethoscope, Pill, FlaskConical, Users, ArrowLeft, ArrowRight } from "lucide-react";
import shelves from "@/assets/shelves.jpg";
import { useSiteSettings } from "@/hooks/useSiteData";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";

// CSS keyframes injected once for Ken Burns effect + text entrance
const heroStyles = `
  @keyframes kenBurnsTL {
    0%   { transform: scale(1.08) translate(0px, 0px); }
    100% { transform: scale(1.18) translate(-20px, -12px); }
  }
  @keyframes kenBurnsTR {
    0%   { transform: scale(1.08) translate(0px, 0px); }
    100% { transform: scale(1.18) translate(20px, -12px); }
  }
  @keyframes kenBurnsBL {
    0%   { transform: scale(1.08) translate(0px, 0px); }
    100% { transform: scale(1.18) translate(-18px, 10px); }
  }
  @keyframes heroTextIn {
    0%   { opacity: 0; transform: translateY(28px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .hero-img-active {
    animation-duration: 6500ms;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
    animation-iteration-count: 1;
  }
  .hero-img-active.pan-tl { animation-name: kenBurnsTL; }
  .hero-img-active.pan-tr { animation-name: kenBurnsTR; }
  .hero-img-active.pan-bl { animation-name: kenBurnsBL; }
  .hero-text-active {
    animation: heroTextIn 700ms cubic-bezier(0.22,1,0.36,1) both;
  }
  .hero-text-active.delay-1 { animation-delay: 120ms; }
  .hero-text-active.delay-2 { animation-delay: 260ms; }
  .hero-text-active.delay-3 { animation-delay: 420ms; }
`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apotek Antartika — Sahabat Sehat Keluarga Indonesia" },
      { name: "description", content: "Apotek Antartika menyediakan obat resep, obat bebas, vitamin, alat kesehatan, dan konsultasi apoteker terpercaya." },
    ],
  }),
  component: Home,
});

const heroSlides = [
  {
    title: "Apotek Terpercaya untuk Kesehatan Keluarga",
    subtitle: "Obat lengkap, pelayanan cepat, dan konsultasi profesional.",
    cta: "Belanja Sekarang",
    link: "/produk",
    image: "/images/hero1.png",
    pan: "pan-tl"  // Ken Burns direction
  },
  {
    title: "Konsultasi dengan Apoteker Profesional",
    subtitle: "Dapatkan rekomendasi kesehatan terpercaya setiap hari.",
    cta: "Konsultasi",
    link: "/layanan",
    image: "/images/hero2.png",
    pan: "pan-tr"
  },
  {
    title: "Produk Kesehatan Lengkap & Original",
    subtitle: "Vitamin, obat, alat kesehatan, dan kebutuhan harian.",
    cta: "Lihat Produk",
    link: "/produk",
    image: "/images/hero3.png",
    pan: "pan-bl"
  }
];

function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 6500, stopOnInteraction: false, stopOnMouseEnter: true }),
    Fade()
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  // animKey changes on every slide transition so CSS animation resets
  const [animKey, setAnimKey] = useState(0);
  const styleInjected = useRef(false);

  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const el = document.createElement("style");
    el.textContent = heroStyles;
    document.head.appendChild(el);
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setAnimKey(k => k + 1);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  return (
    <section className="relative w-full overflow-hidden bg-zinc-900 group" ref={emblaRef}>
      <div className="flex h-[80vh] min-h-[500px] max-h-[800px] touch-pan-y">
        {heroSlides.map((slide, index) => {
          const isActive = index === selectedIndex;
          return (
            <div key={index} className="relative flex-[0_0_100%] min-w-0">
              {/* Background Image with Ken Burns */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  key={isActive ? `active-${animKey}` : `idle-${index}`}
                  src={slide.image}
                  alt={slide.title}
                  className={`h-full w-full object-cover object-center will-change-transform${
                    isActive ? ` hero-img-active ${slide.pan}` : ""
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              </div>

              {/* Content with entrance animation */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl text-white">
                    <h1
                      key={isActive ? `h1-${animKey}` : `h1i-${index}`}
                      className={`text-4xl font-bold leading-tight md:text-5xl lg:text-6xl tracking-tight text-white drop-shadow-md${
                        isActive ? " hero-text-active delay-1" : ""
                      }`}
                    >
                      {slide.title}
                    </h1>
                    <p
                      key={isActive ? `p-${animKey}` : `pi-${index}`}
                      className={`mt-6 max-w-lg text-lg text-white/90 drop-shadow${
                        isActive ? " hero-text-active delay-2" : ""
                      }`}
                    >
                      {slide.subtitle}
                    </p>
                    <div
                      key={isActive ? `cta-${animKey}` : `ctai-${index}`}
                      className={`mt-8 flex flex-wrap gap-4${
                        isActive ? " hero-text-active delay-3" : ""
                      }`}
                    >
                      <Link
                        to={slide.link}
                        className="inline-flex h-14 items-center justify-center rounded-full bg-[#10b981] px-8 text-base font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:bg-[#059669] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:translate-y-0"
                      >
                        {slide.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:scale-110 md:left-8 opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:scale-110 md:right-8 opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ArrowRight className="h-6 w-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${
              index === selectedIndex
                ? "w-8 bg-[#10b981]"
                : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function Home() {
  const s = useSiteSettings();
  return (
    <Layout>
      <HeroCarousel />

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

