import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Save, X, Upload, ImageIcon, Loader2, Trash2, ZoomIn, Search, ChevronDown, Check, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StokPageShell } from "@/components/admin/StokPageShell";
import { useProductCategoryNames } from "@/hooks/useSiteData";

export const Route = createFileRoute("/admin/stok/tambah")({
  head: () => ({ meta: [{ title: "Tambah Produk — Stok" }] }),
  component: TambahProduk,
});

const initForm = {
  name: "", sku: "", kategori: "", satuan: "", harga: "",
  stok_awal: "", stok_min: "", expired: "", batch: "", supplier: "", deskripsi: "",
};

// ── Searchable Kategori Combobox ──────────────────────────────────────────────
interface KategoriComboboxProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function KategoriCombobox({ value, options: categories, onChange }: KategoriComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlighted, setHighlighted] = useState(0);

  // Filter kategori berdasarkan query
  const filtered = categories.filter((k) =>
    k.toLowerCase().includes(query.toLowerCase())
  );

  // Opsi "Buat baru" jika query tidak cocok dengan list manapun
  const showCreate =
    query.trim().length > 0 &&
    !categories.some((k) => k.toLowerCase() === query.toLowerCase());

  const options = showCreate ? [...filtered, `+ Buat "${query.trim()}"`] : filtered;

  // Tutup dropdown saat klik di luar
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
      setOpen(false);
      setQuery("");
    }
  }, []);

  useEffect(() => {
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  // Reset highlight saat query berubah
  useEffect(() => setHighlighted(0), [query]);

  const select = (opt: string) => {
    const isCreate = opt.startsWith('+ Buat "');
    const finalVal = isCreate ? query.trim() : opt;
    onChange(finalVal);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === "Enter" || e.key === "ArrowDown") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (options[highlighted]) select(options[highlighted]); }
    else if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  return (
    <div ref={wrapRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) setTimeout(() => inputRef.current?.focus(), 10); }}
        className={`mt-1 flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm transition-colors ${
          open ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/60"
        }`}
      >
        <span className={`flex items-center gap-2 truncate ${
          value ? "text-foreground" : "text-muted-foreground"
        }`}>
          {value ? (
            <><Tag className="h-3.5 w-3.5 shrink-0 text-primary" />{value}</>
          ) : (
            "Pilih atau cari kategori…"
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Selected badge */}
      {value && !open && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <Tag className="h-3 w-3" />{value}
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Hapus pilihan"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-elegant)]">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik untuk mencari…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {options.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada kategori ditemukan.</li>
            ) : (
              options.map((opt, i) => {
                const isCreate = opt.startsWith('+ Buat "');
                const isSelected = opt === value;
                const isHighlighted = i === highlighted;
                return (
                  <li
                    key={opt}
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => select(opt)}
                    className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      isHighlighted ? "bg-primary/8 text-primary" : "text-foreground hover:bg-muted/60"
                    } ${isCreate ? "border-t border-border font-medium text-primary" : ""}`}
                  >
                    {isCreate ? (
                      <><Plus className="h-3.5 w-3.5 shrink-0" />{opt}</>
                    ) : (
                      <>
                        <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{opt}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer hint */}
          <div className="border-t border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">↑↓ Navigasi &nbsp;·&nbsp; Enter Pilih &nbsp;·&nbsp; Esc Tutup</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Upload image to Supabase "product-images" bucket
async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

async function ensureCategory(name: string) {
  const cleanName = name.trim();
  if (!cleanName) return;

  const { data } = await supabase
    .from("product_categories")
    .select("id")
    .ilike("name", cleanName)
    .maybeSingle();

  if (!data) {
    await supabase.from("product_categories").insert({
      name: cleanName,
      description: "",
      sort_order: 0,
    });
  }
}

// ── Upload Photo Card ─────────────────────────────────────────────────────────
interface PhotoUploadProps {
  imageUrl: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}

function PhotoUploadCard({ imageUrl, onUploaded, onRemove }: PhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const handleFile = async (file: File) => {
    // Validate type and size
    if (!file.type.startsWith("image/")) return toast.error("File harus berupa gambar.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Ukuran file maks 5 MB.");

    setUploading(true);
    setProgress(0);

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 15 : p));
    }, 200);

    try {
      const url = await uploadProductImage(file);
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => { setProgress(0); setUploading(false); }, 400);
      onUploaded(url);
      toast.success("Foto produk berhasil diunggah.");
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setUploading(false);
      setProgress(0);
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      toast.error(msg);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Foto Produk</h2>

        {/* Drop Zone / Preview */}
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img
              src={imageUrl}
              alt="Preview foto produk"
              className="h-56 w-full object-cover"
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/40 hover:opacity-100">
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow hover:bg-white"
                title="Lihat full"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90"
                title="Ganti foto"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-white shadow hover:opacity-90"
                title="Hapus foto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {/* Upload progress bar */}
            {uploading && (
              <div className="absolute bottom-0 left-0 h-1.5 w-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            disabled={uploading}
            className={`flex h-56 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200 ${
              dragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="w-40">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-center text-xs text-muted-foreground">
                    Mengunggah… {Math.round(progress)}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${dragging ? "border-primary bg-primary/10" : "border-border bg-background"}`}>
                  <ImageIcon className={`h-7 w-7 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {dragging ? "Lepas untuk mengunggah" : "Klik atau seret foto ke sini"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP — maks. 5 MB</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Upload className="h-3 w-3" /> Upload Foto
                </span>
              </>
            )}
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        {/* Action buttons below preview */}
        {imageUrl && (
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Mengunggah…</>
              ) : (
                <><Upload className="mr-1.5 h-3.5 w-3.5" />Ganti Foto</>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Foto akan tampil di halaman produk dan katalog apotek. Gunakan foto produk asli dengan latar putih.
        </p>
      </div>

      {/* Lightbox */}
      {lightbox && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl">
            <img src={imageUrl} alt="Preview" className="max-h-[90vh] w-auto object-contain" />
            <button
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
              onClick={() => setLightbox(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function TambahProduk() {
  const [form, setForm] = useState(initForm);
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const categoryOptions = useProductCategoryNames([form.kategori]);
  const set = (k: keyof typeof initForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (savingRef.current) return;
    if (!form.name || !form.sku) return toast.error("Nama dan SKU wajib diisi.");
    if (!imageUrl) {
      toast.warning("Produk disimpan tanpa foto. Tambahkan foto untuk tampilan lebih baik.", { duration: 4000 });
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await ensureCategory(form.kategori);
      const { error } = await supabase.from("products").insert({
        name: form.name,
        category: form.kategori.trim(),
        price: form.harga ? `Rp ${Number(form.harga).toLocaleString("id-ID")}` : "",
        description: form.deskripsi,
        image_url: imageUrl || null,
        badge: "",
        sku: form.sku.trim(),
        stock: Number(form.stok_awal || 0),
        min_stock: Number(form.stok_min || 0),
        unit: form.satuan,
        expired_at: form.expired || null,
      } as any);
      if (error) return toast.error(error.code === "23505" ? "SKU produk sudah terdaftar." : error.message);
      toast.success("Produk berhasil ditambahkan!");
      setForm(initForm);
      setImageUrl("");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <StokPageShell icon={Plus} title="Tambah Produk" desc="Input produk baru ke dalam inventori apotek.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* ── Kolom kiri: Form ── */}
        <div className="space-y-5">
          {/* Informasi Dasar */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-foreground">Informasi Dasar</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Nama Produk <span className="text-destructive">*</span></Label>
                <Input className="mt-1" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="cth. Paracetamol 500mg" />
              </div>
              <div>
                <Label>SKU / Kode Produk <span className="text-destructive">*</span></Label>
                <Input className="mt-1" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="OBT-001" />
              </div>
              <div>
                <Label>Nomor Batch</Label>
                <Input className="mt-1" value={form.batch} onChange={(e) => set("batch", e.target.value)} placeholder="B240101" />
              </div>
              <div>
                <Label>Kategori</Label>
                <KategoriCombobox value={form.kategori} options={categoryOptions} onChange={(v) => set("kategori", v)} />
              </div>
              <div>
                <Label>Satuan</Label>
                <Input className="mt-1" value={form.satuan} onChange={(e) => set("satuan", e.target.value)} placeholder="tab / btl / kap" />
              </div>
              <div>
                <Label>Harga Jual (Rp)</Label>
                <Input className="mt-1" type="number" value={form.harga} onChange={(e) => set("harga", e.target.value)} placeholder="1500" />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input className="mt-1" value={form.supplier} onChange={(e) => set("supplier", e.target.value)} placeholder="PT. Kimia Farma" />
              </div>
              <div className="sm:col-span-2">
                <Label>Deskripsi</Label>
                <Textarea className="mt-1" value={form.deskripsi} onChange={(e) => set("deskripsi", e.target.value)} placeholder="Keterangan singkat produk…" rows={3} />
              </div>
            </div>
          </div>

          {/* Stok & Kadaluarsa */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-foreground">Stok & Kadaluarsa</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Stok Awal</Label>
                <Input className="mt-1" type="number" value={form.stok_awal} onChange={(e) => set("stok_awal", e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Stok Minimum</Label>
                <Input className="mt-1" type="number" value={form.stok_min} onChange={(e) => set("stok_min", e.target.value)} placeholder="20" />
              </div>
              <div>
                <Label>Tanggal Kadaluarsa</Label>
                <Input className="mt-1" type="date" value={form.expired} onChange={(e) => set("expired", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Kolom kanan: Foto + Pratinjau ── */}
        <div className="space-y-5">
          {/* Upload foto */}
          <PhotoUploadCard
            imageUrl={imageUrl}
            onUploaded={setImageUrl}
            onRemove={() => setImageUrl("")}
          />

          {/* Pratinjau card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-semibold text-foreground">Pratinjau Produk</h2>
            <div className="overflow-hidden rounded-xl border border-border">
              {/* Mini product card preview */}
              <div className="flex h-24 items-center justify-center overflow-hidden bg-muted">
                {imageUrl
                  ? <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  : <ImageIcon className="h-8 w-8 text-muted-foreground" />
                }
              </div>
              <div className="p-3">
                <p className="truncate font-semibold">{form.name || <span className="text-muted-foreground italic">Nama Produk</span>}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{form.sku || "SKU"}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {form.harga ? `Rp ${Number(form.harga).toLocaleString("id-ID")}` : "Rp —"}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    {form.stok_awal || "0"} {form.satuan || "pcs"}
                  </span>
                </div>
                {form.expired && (
                  <p className="mt-1.5 text-xs text-muted-foreground">Exp: {form.expired}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <Button type="button" onClick={handleSave} className="gap-2" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Produk
        </Button>
        <Button type="button" variant="outline" onClick={() => { setForm(initForm); setImageUrl(""); }} className="gap-2">
          <X className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </StokPageShell>
  );
}
