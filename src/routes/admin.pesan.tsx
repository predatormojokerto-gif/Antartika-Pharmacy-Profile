import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen, Trash2, RefreshCw, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/admin/Pagination";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  replied_at: string | null;
  created_at: string;
};

type Filter = "all" | "new" | "unreplied" | "replied";
const PAGE_SIZE = 5;

export const Route = createFileRoute("/admin/pesan")({
  component: AdminMessages,
});

function AdminMessages() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Message[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const toggleRead = async (m: Message) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: !m.is_read })
      .eq("id", m.id);
    if (error) return toast.error(error.message);
    setItems((arr) => arr.map((i) => (i.id === m.id ? { ...i, is_read: !m.is_read } : i)));
    if (selected?.id === m.id) setSelected({ ...m, is_read: !m.is_read });
  };

  const toggleReplied = async (m: Message) => {
    const next = !m.is_replied;
    const replied_at = next ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("messages")
      .update({ is_replied: next, replied_at })
      .eq("id", m.id);
    if (error) return toast.error(error.message);
    setItems((arr) =>
      arr.map((i) => (i.id === m.id ? { ...i, is_replied: next, replied_at } : i)),
    );
    if (selected?.id === m.id) setSelected({ ...m, is_replied: next, replied_at });
    toast.success(next ? "Ditandai sudah dibalas" : "Ditandai belum dibalas");
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus pesan ini?")) return;
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((arr) => arr.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success("Pesan dihapus");
  };

  const counts = useMemo(
    () => ({
      all: items.length,
      new: items.filter((i) => !i.is_read).length,
      unreplied: items.filter((i) => !i.is_replied).length,
      replied: items.filter((i) => i.is_replied).length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "new":
        return items.filter((i) => !i.is_read);
      case "unreplied":
        return items.filter((i) => !i.is_replied);
      case "replied":
        return items.filter((i) => i.is_replied);
      default:
        return items;
    }
  }, [items, filter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: counts.all },
    { key: "new", label: "Baru", count: counts.new },
    { key: "unreplied", label: "Belum Dibalas", count: counts.unreplied },
    { key: "replied", label: "Sudah Dibalas", count: counts.replied },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesan dari Pasien</h1>
          <p className="text-sm text-muted-foreground">
            {counts.all} total · {counts.new} baru · {counts.unreplied} belum dibalas
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Muat Ulang
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="ml-2 rounded-full bg-background/30 px-2 py-0.5 text-xs">
              {f.count}
            </span>
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-2">
          {loading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Belum ada pesan.
            </p>
          ) : (
            <>
              {paginated.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelected(m);
                    if (!m.is_read) toggleRead(m);
                  }}
                  className={`block w-full rounded-lg border p-3 text-left transition hover:bg-accent ${
                    selected?.id === m.id ? "border-primary bg-accent" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!m.is_read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                        <p className={`truncate text-sm ${m.is_read ? "font-medium" : "font-bold"}`}>
                          {m.name}
                        </p>
                        {m.is_replied && (
                          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Dibalas
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{m.email}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {m.subject || m.message}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </button>
              ))}
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold">
                    {selected.subject || "(tanpa subjek)"}
                  </h2>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">{selected.name}</span>{" "}
                    <span className="text-muted-foreground">&lt;{selected.email}&gt;</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleString("id-ID")}
                  </p>
                  {selected.is_replied && selected.replied_at && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Dibalas pada {new Date(selected.replied_at).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => toggleRead(selected)}>
                    {selected.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(selected.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 whitespace-pre-wrap rounded-md bg-muted/40 p-4 text-sm leading-relaxed">
                {selected.message}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Pesan Anda")}`}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  <Mail className="h-4 w-4" /> Balas via Email
                </a>
                <Button
                  variant={selected.is_replied ? "outline" : "default"}
                  onClick={() => toggleReplied(selected)}
                >
                  {selected.is_replied ? (
                    <>
                      <Circle className="mr-2 h-4 w-4" /> Tandai Belum Dibalas
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Tandai Sudah Dibalas
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Pilih pesan untuk melihat detail.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
