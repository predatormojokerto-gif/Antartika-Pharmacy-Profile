import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Save, Upload, ImageIcon, Loader2, Pencil, X } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

const PAGE_SIZE = 5;

export const Route = createFileRoute("/admin/produk-list")({
  component: ProductsAdmin,
});

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  badge: string;
  description: string;
  usage: string[];
  warnings: string[];
  image_url: string | null;
  sort_order: number;
};

const empty = {
  name: "", category: "", price: "", badge: "", description: "",
  usage_text: "", warnings_text: "", image_url: "", sort_order: 0,
};

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

const toLines = (arr: string[]) => (arr ?? []).join("\n");
const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const [draft, setDraft] = useState(empty);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const draftFileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setItems((data ?? []) as Product[]);
  };
  const loadCategories = async () => {
    const { data } = await supabase.from("product_categories").select("id,name").order("sort_order");
    setCategories((data ?? []) as { id: string; name: string }[]);
  };
  useEffect(() => { load(); loadCategories(); }, []);

  const add = async () => {
    if (!draft.name) return toast.error("Nama wajib diisi");
    const { error } = await supabase.from("products").insert({
      name: draft.name, category: draft.category, price: draft.price, badge: draft.badge,
      description: draft.description, usage: fromLines(draft.usage_text), warnings: fromLines(draft.warnings_text),
      image_url: draft.image_url || null, sort_order: draft.sort_order,
    });
    if (error) return toast.error(error.message);
    setDraft(empty);
    if (draftFileRef.current) draftFileRef.current.value = "";
    setShowAdd(false);
    toast.success("Produk ditambahkan");
    load();
  };

  const save = async (p: Product) => {
    const { error } = await supabase.from("products").update({
      name: p.name, category: p.category, price: p.price, badge: p.badge,
      description: p.description, usage: p.usage, warnings: p.warnings,
      image_url: p.image_url, sort_order: p.sort_order,
    }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Dihapus"); load(); }
  };

  const setItem = <K extends keyof Product>(id: string, k: K, v: Product[K]) => {
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  };

  const handleDraftFile = async (file: File) => {
    setUploadingId("__draft");
    try {
      const url = await uploadImage(file);
      setDraft((d) => ({ ...d, image_url: url }));
      toast.success("Foto diunggah");
    } catch (e: any) { toast.error(e.message ?? "Gagal upload"); }
    finally { setUploadingId(null); }
  };

  const handleItemFile = async (p: Product, file: File) => {
    setUploadingId(p.id);
    try {
      const url = await uploadImage(file);
      const { error } = await supabase.from("products").update({ image_url: url }).eq("id", p.id);
      if (error) throw error;
      setItem(p.id, "image_url", url);
      toast.success("Foto diperbarui");
    } catch (e: any) { toast.error(e.message ?? "Gagal upload"); }
    finally { setUploadingId(null); }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Produk</h1>
          <p className="mt-1 text-muted-foreground">Kelola produk yang ditampilkan di halaman /produk.</p>
        </div>
        <Button onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? <><X className="mr-2 h-4 w-4" /> Batal</> : <><Plus className="mr-2 h-4 w-4" /> Tambah</>}
        </Button>
      </div>

      {showAdd && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Tambah Produk</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div><Label>Nama</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div>
              <Label>Kategori</Label>
              <Input list="kategori-options" placeholder="Cari atau pilih kategori..." value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
              <datalist id="kategori-options">
                {categories.map((c) => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div><Label>Harga</Label><Input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="Rp 15.000" /></div>
            <div><Label>Badge</Label><Input value={draft.badge} onChange={(e) => setDraft({ ...draft, badge: e.target.value })} placeholder="Best Seller / Promo / Baru" /></div>
            <div><Label>Urutan</Label><Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} /></div>
            <div className="md:col-span-2"><Label>Deskripsi</Label><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Cara Pemakaian (satu baris per langkah)</Label><Textarea rows={4} value={draft.usage_text} onChange={(e) => setDraft({ ...draft, usage_text: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Peringatan (satu baris per peringatan)</Label><Textarea rows={4} value={draft.warnings_text} onChange={(e) => setDraft({ ...draft, warnings_text: e.target.value })} /></div>
            <div className="md:col-span-2">
              <Label>Foto Produk</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                  {draft.image_url ? <img src={draft.image_url} alt="preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div>
                  <input ref={draftFileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleDraftFile(e.target.files[0])} />
                  <Button type="button" variant="outline" size="sm" onClick={() => draftFileRef.current?.click()} disabled={uploadingId === "__draft"}>
                    {uploadingId === "__draft" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah...</> : <><Upload className="mr-2 h-4 w-4" /> Pilih Foto</>}
                  </Button>
                  {draft.image_url && <Button type="button" variant="ghost" size="sm" className="ml-2" onClick={() => setDraft({ ...draft, image_url: "" })}>Hapus</Button>}
                </div>
              </div>
            </div>
          </div>
          <Button onClick={add} className="mt-4"><Save className="mr-2 h-4 w-4" /> Simpan Produk</Button>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-card divide-y divide-border">
        {items.length === 0 && <p className="p-6 text-muted-foreground">Belum ada produk.</p>}
        {pageItems.map((p) => (
          <div key={p.id} className="p-4">
            {editingId === p.id ? (
              <div>
                <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                  <div>
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                    </div>
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-primary hover:underline">
                      {uploadingId === p.id ? <><Loader2 className="h-3 w-3 animate-spin" /> Mengunggah...</> : <><Upload className="h-3 w-3" /> Ganti foto</>}
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingId === p.id}
                        onChange={(e) => e.target.files?.[0] && handleItemFile(p, e.target.files[0])} />
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div><Label>Nama</Label><Input value={p.name} onChange={(e) => setItem(p.id, "name", e.target.value)} /></div>
                    <div><Label>Kategori</Label><Input list="kategori-options" placeholder="Cari atau pilih kategori..." value={p.category} onChange={(e) => setItem(p.id, "category", e.target.value)} /></div>
                    <div><Label>Harga</Label><Input value={p.price} onChange={(e) => setItem(p.id, "price", e.target.value)} /></div>
                    <div><Label>Badge</Label><Input value={p.badge} onChange={(e) => setItem(p.id, "badge", e.target.value)} /></div>
                    <div><Label>Urutan</Label><Input type="number" value={p.sort_order} onChange={(e) => setItem(p.id, "sort_order", Number(e.target.value))} /></div>
                    <div className="md:col-span-2"><Label>Deskripsi</Label><Textarea value={p.description} onChange={(e) => setItem(p.id, "description", e.target.value)} /></div>
                    <div className="md:col-span-2"><Label>Cara Pemakaian</Label>
                      <Textarea rows={3} value={toLines(p.usage)} onChange={(e) => setItem(p.id, "usage", fromLines(e.target.value))} />
                    </div>
                    <div className="md:col-span-2"><Label>Peringatan</Label>
                      <Textarea rows={3} value={toLines(p.warnings)} onChange={(e) => setItem(p.id, "warnings", fromLines(e.target.value))} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => save(p)} size="sm"><Save className="mr-2 h-4 w-4" /> Simpan</Button>
                  <Button onClick={() => { setEditingId(null); load(); }} size="sm" variant="outline"><X className="mr-2 h-4 w-4" /> Batal</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium">{p.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{p.category} {p.price && `· ${p.price}`} {p.badge && `· ${p.badge}`}</div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.description}</div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button onClick={() => setEditingId(p.id)} size="sm" variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                  <Button onClick={() => remove(p.id)} size="sm" variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Hapus</Button>
                </div>
              </div>
            )}
          </div>
        ))}
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={items.length} onPageChange={setPage} />
      </section>
    </div>
  );
}
