import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useProductCategoryNames } from "@/hooks/useSiteData";
import {
  Plus, Trash2, Save, Upload, ImageIcon, Loader2,
  Pencil, X, Search, ChevronDown, Check, Tag, Filter,
} from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

const PAGE_SIZE = 8;

export const Route = createFileRoute("/admin/produk-list")({
  component: ProductsAdmin,
});

// ── Types ─────────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  name: string;
  sku: string;
  batch: string;
  category: string;
  satuan: string;
  price: string;
  supplier: string;
  description: string;
  stok_awal: number;
  stok_min: number;
  expired: string;
  image_url: string | null;
  sort_order: number;
  badge: string;
  usage: string[];
  warnings: string[];
};

const EMPTY: Omit<Product, "id"> = {
  name: "", sku: "", batch: "", category: "", satuan: "", price: "",
  supplier: "", description: "", stok_awal: 0, stok_min: 0, expired: "",
  image_url: "", sort_order: 0, badge: "", usage: [], warnings: [],
};

const toLines = (arr: string[]) => (arr ?? []).join("\n");
const fromLines = (s: string) => s.split("\n");

// ── Upload helper ─────────────────────────────────────────────────────────────
async function uploadImage(file: File): Promise<string> {
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

// ── Searchable Kategori Combobox ──────────────────────────────────────────────
function KategoriCombobox({ value, options: categories, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hi, setHi] = useState(0);

  const filtered = categories.filter((k) => k.toLowerCase().includes(q.toLowerCase()));
  const showCreate = q.trim().length > 0 && !categories.some((k) => k.toLowerCase() === q.toLowerCase());
  const options = showCreate ? [...filtered, `+ Buat "${q.trim()}"`] : filtered;

  const close = useCallback(() => { setOpen(false); setQ(""); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  useEffect(() => setHi(0), [q]);

  const select = (opt: string) => {
    onChange(opt.startsWith('+ Buat "') ? q.trim() : opt);
    close();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === "Enter" || e.key === "ArrowDown") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (options[hi]) select(options[hi]); }
    else if (e.key === "Escape") close();
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onKeyDown={onKey}
        onClick={() => { setOpen((v) => !v); if (!open) setTimeout(() => inputRef.current?.focus(), 10); }}
        className={`flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 text-sm transition-colors ${open ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/60"}`}
      >
        <span className={`flex items-center gap-2 truncate ${value ? "text-foreground" : "text-muted-foreground"}`}>
          {value ? <><Tag className="h-3 w-3 shrink-0 text-primary" />{value}</> : "Pilih kategori…"}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input ref={inputRef} type="text" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
              placeholder="Cari kategori…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            {q && <button onClick={() => setQ("")}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            {options.length === 0
              ? <li className="px-3 py-4 text-center text-sm text-muted-foreground">Tidak ditemukan.</li>
              : options.map((opt, i) => (
                <li key={opt} onMouseEnter={() => setHi(i)} onClick={() => select(opt)}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors ${i === hi ? "bg-primary/10 text-primary" : "hover:bg-muted/60"} ${opt.startsWith("+ Buat") ? "border-t border-border font-medium text-primary" : ""}`}
                >
                  {opt.startsWith("+ Buat") ? <Plus className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className="flex-1">{opt}</span>
                  {opt === value && <Check className="h-3.5 w-3.5 text-primary" />}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Product Form (shared for add & edit) ─────────────────────────────────────
function ProductForm({
  data, setData, onSave, onCancel, uploading, onFileChange, saving, fileRef, categoryOptions,
}: {
  data: Omit<Product, "id">; setData: React.Dispatch<React.SetStateAction<Omit<Product, "id">>>;
  onSave: () => void; onCancel: () => void;
  uploading: boolean; onFileChange: (f: File) => void; saving: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  categoryOptions: string[];
}) {
  const set = (k: keyof typeof data, v: unknown) => setData((d) => ({ ...d, [k]: v }));

  return (
    <div className="space-y-6">
      {/* Row 1: Foto + Info Dasar */}
      <div className="grid gap-6 md:grid-cols-[160px_1fr]">
        {/* Foto */}
        <div>
          <Label>Foto Produk</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className="mt-1 flex h-36 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition hover:border-primary/60 hover:bg-primary/5"
          >
            {data.image_url
              ? <img src={data.image_url} alt="preview" className="h-full w-full object-cover" />
              : uploading
                ? <Loader2 className="h-7 w-7 animate-spin text-primary" />
                : <><ImageIcon className="h-7 w-7 text-muted-foreground" /><p className="mt-1 text-xs text-muted-foreground">Klik upload</p></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])} />
          {data.image_url && (
            <button type="button" onClick={() => set("image_url", "")}
              className="mt-1 flex items-center gap-1 text-xs text-destructive hover:underline">
              <X className="h-3 w-3" />Hapus foto
            </button>
          )}
        </div>

        {/* Info dasar */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nama Produk <span className="text-destructive">*</span></Label>
            <Input className="mt-1" value={data.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="cth. Paracetamol 500mg" />
          </div>
          <div>
            <Label>SKU / Kode <span className="text-destructive">*</span></Label>
            <Input className="mt-1" value={data.sku || ""} onChange={(e) => set("sku", e.target.value)} placeholder="OBT-001" />
          </div>
          <div>
            <Label>Nomor Batch</Label>
            <Input className="mt-1" value={data.batch || ""} onChange={(e) => set("batch", e.target.value)} placeholder="B240101" />
          </div>
          <div>
            <Label>Kategori</Label>
            <div className="mt-1">
              <KategoriCombobox value={data.category || ""} options={categoryOptions} onChange={(v) => set("category", v)} />
            </div>
          </div>
          <div>
            <Label>Satuan</Label>
            <Input className="mt-1" value={data.satuan || ""} onChange={(e) => set("satuan", e.target.value)} placeholder="tab / btl / kap" />
          </div>
          <div>
            <Label>Harga Jual (Rp)</Label>
            <Input className="mt-1" value={data.price || ""} onChange={(e) => set("price", e.target.value)} placeholder="Rp 15.000" />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input className="mt-1" value={data.supplier || ""} onChange={(e) => set("supplier", e.target.value)} placeholder="PT. Kimia Farma" />
          </div>
        </div>
      </div>

      {/* Row 2: Deskripsi, Pemakaian, Peringatan */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Deskripsi Produk</Label>
          <Textarea className="mt-1" rows={3} value={data.description} onChange={(e) => set("description", e.target.value)} placeholder="Keterangan singkat produk…" />
        </div>
        <div>
          <Label>Cara Pemakaian <span className="text-xs text-muted-foreground">(satu baris per langkah)</span></Label>
          <Textarea className="mt-1" rows={4} value={toLines(data.usage)} onChange={(e) => set("usage", fromLines(e.target.value))} placeholder="1. Minum setelah makan&#10;2. Dewasa 1 tablet..." />
        </div>
        <div>
          <Label>Peringatan Penggunaan <span className="text-xs text-muted-foreground">(satu baris per peringatan)</span></Label>
          <Textarea className="mt-1" rows={4} value={toLines(data.warnings)} onChange={(e) => set("warnings", fromLines(e.target.value))} placeholder="Hanya untuk luar&#10;Jauhkan dari anak-anak..." />
        </div>
      </div>

      {/* Row 3: Stok & Kadaluarsa */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Stok & Kadaluarsa</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Stok Awal</Label>
            <Input className="mt-1" type="number" min={0} value={data.stok_awal ?? 0}
              onChange={(e) => set("stok_awal", Number(e.target.value))} placeholder="0" />
          </div>
          <div>
            <Label>Stok Minimum</Label>
            <Input className="mt-1" type="number" min={0} value={data.stok_min ?? 0}
              onChange={(e) => set("stok_min", Number(e.target.value))} placeholder="20" />
          </div>
          <div>
            <Label>Tanggal Kadaluarsa</Label>
            <Input className="mt-1" type="date" value={data.expired || ""} onChange={(e) => set("expired", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Row 4: Extra */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Badge <span className="text-xs text-muted-foreground">(opsional)</span></Label>
          <Input className="mt-1" value={data.badge || ""} onChange={(e) => set("badge", e.target.value)} placeholder="Best Seller / Promo / Baru" />
        </div>
        <div>
          <Label>Urutan Tampil</Label>
          <Input className="mt-1" type="number" value={data.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border pt-4">
        <Button type="button" onClick={onSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Produk
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="gap-2"><X className="h-4 w-4" />Batal</Button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterKat, setFilterKat] = useState("");
  const [draft, setDraft] = useState<Omit<Product, "id">>(EMPTY);
  const [editDraft, setEditDraft] = useState<Omit<Product, "id">>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const draftFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const productCategoryNames = useProductCategoryNames(items.map((p) => p.category));

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    const mapped = (data || []).map((p: any) => ({
      ...p,
      stok_awal: p.stock || 0,
      stok_min: p.min_stock || 0,
      satuan: p.unit || "",
      expired: p.expired_at || "",
    }));
    setItems(mapped as any as Product[]);
  };

  useEffect(() => { load(); }, []);

  // Filter & pagination
  const filtered = items.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchKat = !filterKat || p.category === filterKat;
    return matchSearch && matchKat;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleUpload = async (file: File, isDraft: boolean) => {
    if (isDraft) setUploading(true); else setEditUploading(true);
    try {
      const url = await uploadImage(file);
      if (isDraft) setDraft((d) => ({ ...d, image_url: url }));
      else setEditDraft((d) => ({ ...d, image_url: url }));
      toast.success("Foto diunggah");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal upload"); }
    finally { if (isDraft) setUploading(false); else setEditUploading(false); }
  };

  const handleAdd = async () => {
    if (savingRef.current) return;
    if (!draft.name || !draft.sku) return toast.error("Nama dan SKU wajib diisi.");
    savingRef.current = true;
    setSaving(true);
    try {
      await ensureCategory(draft.category);
      const { error } = await supabase.from("products").insert({
        name: draft.name, category: draft.category.trim(),
        price: draft.price, description: draft.description,
        image_url: draft.image_url || null, sort_order: draft.sort_order,
        badge: draft.badge, sku: draft.sku.trim(),
        stock: draft.stok_awal, min_stock: draft.stok_min,
        unit: draft.satuan, expired_at: draft.expired || null,
        usage: (draft.usage || []).map(x => x.trim()).filter(Boolean), 
        warnings: (draft.warnings || []).map(x => x.trim()).filter(Boolean),
      } as any);
      if (error) return toast.error(error.code === "23505" ? "SKU produk sudah terdaftar." : error.message);
      toast.success("Produk ditambahkan!");
      setDraft(EMPTY);
      setShowAdd(false);
      load();
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (savingRef.current) return;
    if (!editingId || !editDraft.name || !editDraft.sku) return toast.error("Nama dan SKU wajib diisi.");
    savingRef.current = true;
    setSaving(true);
    try {
      await ensureCategory(editDraft.category);
      const { error } = await supabase.from("products").update({
        name: editDraft.name, category: editDraft.category.trim(),
        price: editDraft.price, description: editDraft.description,
        image_url: editDraft.image_url || null, sort_order: editDraft.sort_order,
        badge: editDraft.badge, sku: editDraft.sku.trim(),
        stock: editDraft.stok_awal, min_stock: editDraft.stok_min,
        unit: editDraft.satuan, expired_at: editDraft.expired || null,
        usage: (editDraft.usage || []).map(x => x.trim()).filter(Boolean), 
        warnings: (editDraft.warnings || []).map(x => x.trim()).filter(Boolean),
      } as any).eq("id", editingId);
      if (error) return toast.error(error.code === "23505" ? "SKU produk sudah terdaftar." : error.message);
      toast.success("Produk diperbarui!");
      setEditingId(null);
      load();
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditDraft({ ...p });
    setShowAdd(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Produk dihapus"); load(); }
  };

  const stokStatus = (p: Product) => {
    if (p.stok_awal <= 0) return { label: "Habis", cls: "bg-red-100 text-red-700" };
    if (p.stok_awal <= p.stok_min) return { label: "Menipis", cls: "bg-amber-100 text-amber-700" };
    return { label: "Aman", cls: "bg-emerald-100 text-emerald-700" };
  };

  const uniqueKategori = [...new Set(items.map((p) => p.category).filter(Boolean))];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} produk · kelola inventori apotek
          </p>
        </div>
        <Button onClick={() => { setShowAdd((v) => !v); setEditingId(null); }} className="gap-2">
          {showAdd ? <><X className="h-4 w-4" />Batal</> : <><Plus className="h-4 w-4" />Tambah Produk</>}
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Tambah Produk Baru</h2>
          <ProductForm
            data={draft} setData={setDraft}
            onSave={handleAdd} onCancel={() => { setShowAdd(false); setDraft(EMPTY); }}
            uploading={uploading} onFileChange={(f) => handleUpload(f, true)}
            saving={saving} fileRef={draftFileRef}
            categoryOptions={productCategoryNames}
          />
        </section>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari nama / SKU…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterKat}
            onChange={(e) => { setFilterKat(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Semua Kategori</option>
            {uniqueKategori.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Produk", "SKU", "Kategori", "Satuan", "Harga", "Stok", "Kadaluarsa", "Status", ""].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageItems.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Belum ada produk.</td></tr>
            )}
            {pageItems.map((p) => {
              const status = stokStatus(p);
              if (editingId === p.id) {
                return (
                  <tr key={p.id}>
                    <td colSpan={9} className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-semibold text-foreground">Edit: {p.name}</p>
                      </div>
                      <ProductForm
                        data={editDraft} setData={setEditDraft}
                        onSave={handleEdit} onCancel={() => setEditingId(null)}
                        uploading={editUploading} onFileChange={(f) => handleUpload(f, false)}
                        saving={saving} fileRef={editFileRef}
                        categoryOptions={productCategoryNames}
                      />
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                          : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium max-w-[180px]">{p.name}</p>
                        {p.badge && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.satuan || "—"}</td>
                  <td className="px-4 py-3 font-medium">{p.price || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{p.stok_awal}</span>
                    {p.stok_min > 0 && <span className="ml-1 text-xs text-muted-foreground">/ min {p.stok_min}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.expired || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => startEdit(p)} className="h-7 px-2"><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(p.id)} className="h-7 px-2"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
