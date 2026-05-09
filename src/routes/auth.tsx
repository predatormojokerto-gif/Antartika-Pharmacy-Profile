import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Pill } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login Admin — Apotek Antartika" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Silakan login.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-soft)] px-4">
      <Card className="w-full max-w-md p-8">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
            <Pill className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">Apotek <span className="text-primary">Antartika</span></span>
        </Link>
        <h1 className="text-2xl font-bold">{mode === "login" ? "Login Admin" : "Daftar Admin"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Masuk untuk mengelola konten website." : "Buat akun admin pertama."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : mode === "login" ? "Login" : "Daftar"}
          </Button>
        </form>
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Login"}
        </button>
      </Card>
    </div>
  );
}
