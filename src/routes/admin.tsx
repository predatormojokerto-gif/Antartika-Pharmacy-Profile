import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Apotek Antartika" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
});
