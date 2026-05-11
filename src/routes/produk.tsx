import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useCategories } from "@/hooks/useSiteData";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, BookOpen, Info, ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import paracetamol from "@/assets/products/paracetamol.jpg";
import vitaminC from "@/assets/products/vitamin-c.jpg";
import coughSyrup from "@/assets/products/cough-syrup.jpg";
import tensimeter from "@/assets/products/tensimeter.jpg";
import sanitizer from "@/assets/products/sanitizer.jpg";
import babyCare from "@/assets/products/baby-care.jpg";
import antacid from "@/assets/products/antacid.jpg";
import multivitamin from "@/assets/products/multivitamin.jpg";

const palette = [
  "from-blue-500 to-cyan-500",
  "from-cyan-500 to-teal-500",
  "from-emerald-500 to-green-500",
  "from-green-500 to-lime-500",
  "from-sky-500 to-blue-500",
  "from-pink-400 to-rose-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
];

type Product = {
  name: string;
  category: string;
  price: string;
  image: string;
  badge?: string;
  description: string;
  usage: string[];
  warnings: string[];
};

const products: Product[] = [
  {
    name: "Paracetamol 500mg",
    category: "Obat Bebas",
    price: "Rp 8.500",
    image: paracetamol,
    badge: "Best Seller",
    description:
      "Paracetamol 500mg adalah obat pereda nyeri dan penurun demam yang aman untuk dewasa dan anak. Efektif meredakan sakit kepala, sakit gigi, nyeri otot, dan demam.",
    usage: [
      "Dewasa: 1-2 tablet, 3-4 kali sehari setelah makan",
      "Anak 6-12 tahun: ½-1 tablet, 3-4 kali sehari",
      "Jangan melebihi 8 tablet dalam 24 jam",
      "Minum dengan segelas air putih",
    ],
    warnings: [
      "Tidak boleh dikonsumsi bersama alkohol",
      "Hentikan pemakaian jika muncul ruam atau alergi",
      "Konsultasikan ke dokter jika gejala tidak membaik dalam 3 hari",
      "Hindari penggunaan jangka panjang tanpa anjuran dokter",
    ],
  },
  {
    name: "Vitamin C 1000mg",
    category: "Vitamin & Suplemen",
    price: "Rp 75.000",
    image: vitaminC,
    badge: "Populer",
    description:
      "Suplemen Vitamin C dosis tinggi 1000mg untuk meningkatkan daya tahan tubuh, antioksidan alami, dan membantu pembentukan kolagen.",
    usage: [
      "Dewasa: 1 kapsul sehari sesudah makan",
      "Konsumsi rutin pada pagi hari untuk hasil optimal",
      "Simpan di tempat sejuk dan kering",
    ],
    warnings: [
      "Tidak dianjurkan untuk penderita gangguan ginjal tanpa pengawasan dokter",
      "Konsumsi berlebihan dapat menyebabkan diare dan nyeri lambung",
      "Hentikan jika muncul reaksi alergi",
    ],
  },
  {
    name: "Sirup Obat Batuk 100ml",
    category: "Obat Bebas",
    price: "Rp 22.000",
    image: coughSyrup,
    description:
      "Sirup pereda batuk berdahak dan tidak berdahak dengan rasa jeruk yang nyaman dikonsumsi. Membantu mengencerkan dahak dan melegakan tenggorokan.",
    usage: [
      "Dewasa: 3 sendok takar (15ml), 3 kali sehari",
      "Anak 6-12 tahun: 1-2 sendok takar (5-10ml), 3 kali sehari",
      "Kocok botol sebelum digunakan",
      "Gunakan sendok takar yang disertakan",
    ],
    warnings: [
      "Dapat menyebabkan kantuk, hindari mengemudi setelah konsumsi",
      "Tidak untuk anak di bawah 2 tahun",
      "Konsultasikan ke dokter jika batuk berlangsung lebih dari 7 hari",
      "Jangan dikonsumsi bersama obat penenang lain",
    ],
  },
  {
    name: "Tensimeter Digital",
    category: "Alat Kesehatan",
    price: "Rp 285.000",
    image: tensimeter,
    badge: "Promo",
    description:
      "Alat pengukur tekanan darah digital dengan akurasi tinggi. Layar LCD besar, mudah digunakan di rumah, dilengkapi memori untuk 90 hasil pengukuran.",
    usage: [
      "Pasang manset pada lengan atas, 2-3 cm di atas siku",
      "Duduk tegak dan tenang selama 5 menit sebelum mengukur",
      "Tekan tombol START dan biarkan alat bekerja",
      "Catat hasil pengukuran untuk pemantauan rutin",
    ],
    warnings: [
      "Bukan pengganti diagnosis dokter",
      "Hindari mengukur setelah olahraga, makan, atau merokok",
      "Tidak akurat untuk pasien dengan aritmia berat",
      "Kalibrasi alat setiap 2 tahun sekali",
    ],
  },
  {
    name: "Hand Sanitizer & Masker",
    category: "Personal Care",
    price: "Rp 35.000",
    image: sanitizer,
    description:
      "Paket lengkap hand sanitizer 100ml dengan kandungan alkohol 70% dan 5 lembar masker medis 3 lapis untuk perlindungan harian.",
    usage: [
      "Tuangkan secukupnya hand sanitizer ke telapak tangan",
      "Gosok merata seluruh permukaan tangan hingga kering",
      "Gunakan masker dengan sisi berwarna di luar",
      "Ganti masker setiap 4 jam atau saat kotor/lembab",
    ],
    warnings: [
      "Hand sanitizer mudah terbakar, jauhkan dari api",
      "Hanya untuk pemakaian luar, hindari kontak dengan mata",
      "Masker sekali pakai, jangan digunakan ulang",
      "Jauhkan dari jangkauan anak-anak",
    ],
  },
  {
    name: "Perlengkapan Bayi",
    category: "Perawatan Bayi",
    price: "Rp 65.000",
    image: babyCare,
    description:
      "Paket perlengkapan bayi terdiri dari popok berkualitas dan losion bayi hypoallergenic, lembut di kulit sensitif bayi baru lahir.",
    usage: [
      "Gunakan popok sesuai ukuran berat badan bayi",
      "Ganti popok setiap 2-3 jam atau saat penuh",
      "Oleskan losion tipis-tipis setelah mandi",
      "Hindari area mata dan mulut saat memakaikan losion",
    ],
    warnings: [
      "Hentikan pemakaian jika muncul iritasi atau ruam",
      "Konsultasikan ke dokter anak untuk kulit sangat sensitif",
      "Simpan di tempat kering, jauhkan dari sinar matahari langsung",
      "Tidak untuk dikonsumsi",
    ],
  },
  {
    name: "Antasida Tablet",
    category: "Obat Bebas",
    price: "Rp 12.000",
    image: antacid,
    description:
      "Tablet kunyah untuk meredakan gejala maag, nyeri ulu hati, kembung, dan asam lambung berlebih. Bekerja cepat dengan rasa mint segar.",
    usage: [
      "Dewasa: 1-2 tablet dikunyah, 3-4 kali sehari",
      "Konsumsi 1 jam sesudah makan dan sebelum tidur",
      "Kunyah tablet sampai halus, jangan ditelan utuh",
    ],
    warnings: [
      "Tidak untuk penderita gangguan ginjal berat",
      "Jangan dikonsumsi bersamaan dengan antibiotik tetracycline",
      "Konsultasikan ke dokter jika gejala berlanjut lebih dari 2 minggu",
      "Dapat menyebabkan konstipasi pada beberapa orang",
    ],
  },
  {
    name: "Multivitamin Keluarga",
    category: "Vitamin & Suplemen",
    price: "Rp 95.000",
    image: multivitamin,
    badge: "Baru",
    description:
      "Multivitamin lengkap dengan kombinasi vitamin A, B kompleks, C, D, E, dan mineral penting untuk menjaga stamina dan kesehatan keluarga.",
    usage: [
      "Dewasa: 1 kapsul sehari sesudah sarapan",
      "Anak >12 tahun: 1 kapsul sehari",
      "Konsumsi rutin untuk hasil optimal",
    ],
    warnings: [
      "Bukan pengganti makanan bergizi seimbang",
      "Tidak untuk anak di bawah 12 tahun",
      "Konsultasikan ke dokter jika sedang hamil/menyusui",
      "Hentikan jika muncul reaksi alergi",
    ],
  },
];

export const Route = createFileRoute("/produk")({
  head: () => ({
    meta: [
      { title: "Produk — Apotek Antartika" },
      { name: "description", content: "Beragam produk kesehatan, obat-obatan, vitamin, dan alat kesehatan di Apotek Antartika." },
    ],
  }),
  component: Products,
});

function Products() {
  const categories = useCategories();
  const [selected, setSelected] = useState<Product | null>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      if (Array.isArray(stored)) setCart(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("cart-updated"));
    }
  }, [cart]);

  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener("open-cart", open);
    if (typeof window !== "undefined" && window.location.hash === "#cart") setCartOpen(true);
    return () => window.removeEventListener("open-cart", open);
  }, []);

  const addToCart = (p: Product) => {
    setCart((c) => {
      const idx = c.findIndex((i) => i.product.name === p.name);
      if (idx >= 0) {
        const next = [...c];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...c, { product: p, qty: 1 }];
    });
    setSelected(null);
    setCartOpen(true);
  };

  const updateQty = (name: string, delta: number) => {
    setCart((c) => c.flatMap((i) => {
      if (i.product.name !== name) return [i];
      const q = i.qty + delta;
      return q <= 0 ? [] : [{ ...i, qty: q }];
    }));
  };

  const removeFromCart = (name: string) => setCart((c) => c.filter((i) => i.product.name !== name));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const checkoutWA = () => {
    if (cart.length === 0) return;
    const lines = cart.map((i, idx) => `${idx + 1}. ${i.product.name} (${i.qty}x) - ${i.product.price}`).join("\n");
    const msg = `Halo Apotek Antartika, saya ingin memesan:\n\n${lines}\n\nTerima kasih.`;
    const url = `https://wa.me/6287842224813?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    supabase.from("products").select("*").order("sort_order").then(({ data }) => {
      const mapped: Product[] = (data ?? []).map((p: any) => ({
        name: p.name,
        category: p.category || "",
        price: p.price || "",
        image: p.image_url || "",
        badge: p.badge || undefined,
        description: p.description || "",
        usage: p.usage ?? [],
        warnings: p.warnings ?? [],
      }));
      setDbProducts(mapped);
    });
  }, []);

  const allProducts = [...dbProducts, ...products];
  const filteredProducts = activeCategory
    ? allProducts.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase())
    : allProducts;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [activeCategory]);

  return (
    <Layout>
      <section className="bg-[image:var(--gradient-hero)] py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold md:text-5xl">Produk Kami</h1>
          <p className="mt-4 max-w-2xl text-lg opacity-90">
            Beragam produk kesehatan berkualitas, lengkap untuk seluruh keluarga.
          </p>
        </div>
      </section>

      <section id="produk-list" className="container mx-auto px-4 py-20 scroll-mt-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">
            {activeCategory ? `Kategori: ${activeCategory}` : "Produk Pilihan"}
          </h2>
          <p className="mt-2 text-muted-foreground">Klik foto produk untuk melihat detail, cara pakai, dan peringatan.</p>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              ← Tampilkan semua produk
            </button>
          )}
        </div>
        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground">Belum ada produk di kategori ini.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pagedProducts.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelected(p)}
                  className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {p.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">{p.category}</p>
                    <h3 className="mt-1 line-clamp-2 font-semibold">{p.name}</h3>
                    <p className="mt-3 text-lg font-bold text-foreground">{p.price}</p>
                  </div>
                </button>
              ))}
            </div>
            {filteredProducts.length > PAGE_SIZE && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card disabled:opacity-50"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-9 min-w-9 rounded-md border px-3 text-sm font-medium ${p === currentPage ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card disabled:opacity-50"
                  aria-label="Berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {categories.length > 0 && (
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold">Kategori Produk</h2>
              <p className="mt-2 text-muted-foreground">Temukan produk sesuai kebutuhan Anda</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((c, i) => {
                const isActive = activeCategory?.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCategory(c.name);
                      document.getElementById("produk-list")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`overflow-hidden rounded-2xl border bg-card text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isActive ? "border-primary ring-2 ring-primary" : "border-border"}`}
                  >
                    {c.image_url ? (
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className={`h-32 bg-gradient-to-br ${palette[i % palette.length]}`} />
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold">{c.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                      <p className="mt-3 text-sm font-medium text-primary">Lihat produk →</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="overflow-hidden rounded-xl bg-muted">
                  <img src={selected.image} alt={selected.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <DialogHeader>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">{selected.category}</p>
                    <DialogTitle className="text-2xl">{selected.name}</DialogTitle>
                    <DialogDescription className="text-2xl font-bold text-foreground">{selected.price}</DialogDescription>
                  </DialogHeader>
                  <Button onClick={() => addToCart(selected)} className="mt-4 gap-2">
                    <ShoppingCart className="h-4 w-4" /> Beli
                  </Button>
                </div>
              </div>

              <div className="mt-2 space-y-5">
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Info className="h-4 w-4 text-primary" /> Deskripsi Produk
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <BookOpen className="h-4 w-4 text-primary" /> Cara Pemakaian
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {selected.usage.map((u, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Peringatan Penggunaan
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
                    {selected.warnings.map((w, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {mounted && cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg transition hover:scale-105"
          aria-label="Buka keranjang"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">Keranjang</span>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-foreground px-2 text-xs font-bold text-primary">
            {cartCount}
          </span>
        </button>
      )}

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Keranjang Belanja
            </DialogTitle>
            <DialogDescription>
              {cart.length === 0 ? "Keranjang masih kosong." : "Periksa pesanan Anda sebelum checkout via WhatsApp."}
            </DialogDescription>
          </DialogHeader>
          {cart.length > 0 && (
            <>
              <div className="mt-2 space-y-3">
                {cart.map((item) => (
                  <div key={item.product.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <img src={item.product.image} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold">{item.product.name}</p>
                      <p className="text-sm text-primary font-bold">{item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.product.name, -1)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted" aria-label="Kurangi">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.name, 1)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted" aria-label="Tambah">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.name)} className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10" aria-label="Hapus">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={checkoutWA} className="mt-4 w-full gap-2 bg-green-600 text-white hover:bg-green-700">
                <ShoppingCart className="h-4 w-4" /> Checkout via WhatsApp
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
