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

export const Route = createFileRoute("/admin/produk")({
  component: CategoriesAdmin,
});

type Category = { id: string; name: string; description: string; sort_order: number; image_url: string | null };

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("category-images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return supabase.storage.from("category-images").getPublicUrl(path).data.publicUrl;
}

function CategoriesAdmin() {
  const [items, setItems] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState({ name: "", description: "", sort_order: 0, image_url: "" });
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const draftFileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("product_categories").select("*").order("sort_order");
    setItems((data ?? []) as Category[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!draft.name) return toast.error("Nama wajib diisi");
    const { error } = await supabase.from("product_categories").insert(draft);
    if (error) return toast.error(error.message);
    setDraft({ name: "", description: "", sort_order: 0, image_url: "" });
    if (draftFileRef.current) draftFileRef.current.value = "";
    setShowAdd(false);
    toast.success("Ditambahkan");
    load();
  };

  const save = async (c: Category) => {
    const { error } = await supabase.from("product_categories").update({
      name: c.name, description: c.description, sort_order: c.sort_order, image_url: c.image_url,
    }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    const { error } = await supabase.from("product_categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Dihapus"); load(); }
  };

  const setItem = (id: string, k: keyof Category, v: string | number | null) => {
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  };

  const handleDraftFile = async (file: File) => {
    setUploadingId("__draft");
    try {
      const url = await uploadImage(file);
      setDraft((d) => ({ ...d, image_url: url }));
      toast.success("Foto diunggah");
    } catch (err: any) { toast.error(err.message ?? "Gagal upload"); }
    finally { setUploadingId(null); }
  };

  const handleItemFile = async (c: Category, file: File) => {
    setUploadingId(c.id);
    try {
      const url = await uploadImage(file);
      const { error } = await supabase.from("product_categories").update({ image_url: url }).eq("id", c.id);
      if (error) throw error;
      setItem(c.id, "image_url", url);
      toast.success("Foto diperbarui");
    } catch (err: any) { toast.error(err.message ?? "Gagal upload"); }
    finally { setUploadingId(null); }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kategori Produk</h1>
          <p className="mt-1 text-muted-foreground">Kelola kategori yang ditampilkan di halaman /produk.</p>
        </div>
        <Button onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? <><X className="mr-2 h-4 w-4" /> Batal</> : <><Plus className="mr-2 h-4 w-4" /> Tambah</>}
        </Button>
      </div>

      {showAdd && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Tambah Kategori</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div><Label>Nama</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label>Urutan</Label><Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} /></div>
            <div className="md:col-span-2"><Label>Deskripsi</Label><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="md:col-span-2">
              <Label>Foto Kategori</Label>
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
          <Button onClick={add} className="mt-4"><Save className="mr-2 h-4 w-4" /> Simpan</Button>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-card divide-y divide-border">
        {items.length === 0 && <p className="p-6 text-muted-foreground">Belum ada kategori.</p>}
        {pageItems.map((c) => (
          <div key={c.id} className="p-4">
            {editingId === c.id ? (
              <div>
                <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                  <div>
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                      {c.image_url ? <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                    </div>
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-primary hover:underline">
                      {uploadingId === c.id ? <><Loader2 className="h-3 w-3 animate-spin" /> Mengunggah...</> : <><Upload className="h-3 w-3" /> Ganti foto</>}
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingId === c.id}
                        onChange={(e) => e.target.files?.[0] && handleItemFile(c, e.target.files[0])} />
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div><Label>Nama</Label><Input value={c.name} onChange={(e) => setItem(c.id, "name", e.target.value)} /></div>
                    <div><Label>Urutan</Label><Input type="number" value={c.sort_order} onChange={(e) => setItem(c.id, "sort_order", Number(e.target.value))} /></div>
                    <div className="md:col-span-2"><Label>Deskripsi</Label><Textarea value={c.description} onChange={(e) => setItem(c.id, "description", e.target.value)} /></div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => save(c)} size="sm"><Save className="mr-2 h-4 w-4" /> Simpan</Button>
                  <Button onClick={() => { setEditingId(null); load(); }} size="sm" variant="outline"><X className="mr-2 h-4 w-4" /> Batal</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                    {c.image_url ? <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium">{c.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{c.description}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Urutan: {c.sort_order}</div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button onClick={() => setEditingId(c.id)} size="sm" variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                  <Button onClick={() => remove(c.id)} size="sm" variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Hapus</Button>
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
