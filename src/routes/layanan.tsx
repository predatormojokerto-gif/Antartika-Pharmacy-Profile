import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useServices } from "@/hooks/useSiteData";
import { DynamicIcon } from "@/components/DynamicIcon";

export const Route = createFileRoute("/layanan")({
  head: () => ({
    meta: [
      { title: "Layanan — Apotek Antartika" },
      { name: "description", content: "Layanan kefarmasian Apotek Antartika." },
    ],
  }),
  component: Services,
});

function Services() {
  const services = useServices();
  return (
    <Layout>
      <section className="bg-[image:var(--gradient-hero)] py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold md:text-5xl">Layanan Kami</h1>
          <p className="mt-4 max-w-2xl text-lg opacity-90">
            Solusi kesehatan menyeluruh untuk setiap kebutuhan keluarga Indonesia.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.id} className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground transition group-hover:scale-110">
                <DynamicIcon name={s.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
