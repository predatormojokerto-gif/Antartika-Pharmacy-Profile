import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak — Apotek Antartika" },
      { name: "description", content: "Hubungi Apotek Antartika." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const s = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);

  const cards = [
    { icon: MapPin, t: "Alamat", d: s?.address ?? "" },
    { icon: Phone, t: "Telepon", d: s?.phone ?? "" },
    { icon: Mail, t: "Email", d: s?.email ?? "" },
    { icon: Clock, t: "Jam Operasional", d: s?.hours ?? "" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRef.current) return;
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (!name || name.length > 100) return toast.error("Nama wajib diisi (maks 100 karakter).");
    if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("Email tidak valid.");
    if (subject.length > 200) return toast.error("Subjek terlalu panjang.");
    if (!message || message.length > 2000) return toast.error("Pesan wajib diisi (maks 2000 karakter).");

    sendingRef.current = true;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({ name, email, subject, message });
      if (error) return toast.error("Gagal mengirim pesan: " + error.message);
      toast.success("Terima kasih! Pesan Anda telah dikirim.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  return (
    <Layout>
      <section className="bg-[image:var(--gradient-hero)] py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold md:text-5xl">Hubungi Kami</h1>
          <p className="mt-4 max-w-2xl text-lg opacity-90">
            Tim {s?.company_name ?? "Apotek Antartika"} siap membantu Anda.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-2">
        <div className="space-y-6">
          {cards.map((c) => (
            <div key={c.t} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                <c.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold">{c.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
        >
          <h2 className="text-2xl font-bold">Kirim Pesan</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              maxLength={100}
              placeholder="Nama"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              required
              type="email"
              maxLength={255}
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <input
            maxLength={200}
            placeholder="Subjek"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            required
            rows={5}
            maxLength={2000}
            placeholder="Pesan Anda"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </form>
      </section>
    </Layout>
  );
}
