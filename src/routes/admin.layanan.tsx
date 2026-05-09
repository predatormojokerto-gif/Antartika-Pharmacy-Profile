import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Save, Pencil, X } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

const PAGE_SIZE = 5;

export const Route = createFileRoute("/admin/layanan")({
  component: ServicesAdmin,
});

type Service = { id: string; title: string; description: string; icon: string; sort_order: number };

function ServicesAdmin() {
  const [items, setItems] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState({ title: "", description: "", icon: "Pill", sort_order: 0 });
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const load = async () => {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setItems((data ?? []) as Service[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!draft.title) return toast.error("Judul wajib diisi");
    const { error } = await supabase.from("services").insert(draft);
    if (error) return toast.error(error.message);
    setDraft({ title: "", description: "", icon: "Pill", sort_order: 0 });
    setShowAdd(false);
    toast.success("Ditambahkan");
    load();
  };

  const save = async (s: Service) => {
    const { error } = await supabase.from("services").update({
      title: s.title, description: s.description, icon: s.icon, sort_order: s.sort_order,
    }).eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus layanan ini?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Dihapus"); load(); }
  };

  const setItem = (id: string, k: keyof Service, v: string | number) => {
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Layanan</h1>
          <p className="mt-1 text-muted-foreground">Kelola daftar layanan yang ditampilkan di halaman /layanan.</p>
        </div>
        <Button onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? <><X className="mr-2 h-4 w-4" /> Batal</> : <><Plus className="mr-2 h-4 w-4" /> Tambah</>}
        </Button>
      </div>

      {showAdd && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Tambah Layanan Baru</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div><Label>Judul</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
            <div><Label>Icon (Lucide name, mis: Pill, Truck)</Label><Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Deskripsi</Label><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div><Label>Urutan</Label><Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} /></div>
          </div>
          <Button onClick={add} className="mt-4"><Save className="mr-2 h-4 w-4" /> Simpan</Button>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-card divide-y divide-border">
        {items.length === 0 && <p className="p-6 text-muted-foreground">Belum ada layanan.</p>}
        {pageItems.map((s) => (
          <div key={s.id} className="p-4">
            {editingId === s.id ? (
              <div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><Label>Judul</Label><Input value={s.title} onChange={(e) => setItem(s.id, "title", e.target.value)} /></div>
                  <div><Label>Icon</Label><Input value={s.icon} onChange={(e) => setItem(s.id, "icon", e.target.value)} /></div>
                  <div className="md:col-span-2"><Label>Deskripsi</Label><Textarea value={s.description} onChange={(e) => setItem(s.id, "description", e.target.value)} /></div>
                  <div><Label>Urutan</Label><Input type="number" value={s.sort_order} onChange={(e) => setItem(s.id, "sort_order", Number(e.target.value))} /></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => save(s)} size="sm"><Save className="mr-2 h-4 w-4" /> Simpan</Button>
                  <Button onClick={() => { setEditingId(null); load(); }} size="sm" variant="outline"><X className="mr-2 h-4 w-4" /> Batal</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium">{s.title}</div>
                  <div className="truncate text-sm text-muted-foreground">{s.description}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Icon: {s.icon} · Urutan: {s.sort_order}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button onClick={() => setEditingId(s.id)} size="sm" variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                  <Button onClick={() => remove(s.id)} size="sm" variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Hapus</Button>
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
