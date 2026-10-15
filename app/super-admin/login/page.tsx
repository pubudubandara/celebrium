"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn } from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to sign in.");
        return;
      }
      router.replace("/super-admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-primary)" }}>
      <section className="card w-full max-w-md p-8">
        <div className="mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            <LockKeyhole size={21} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>Celebrium</p>
          <h1 className="text-2xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>Super Admin Login</h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>Sign in to manage owners, events, categories, and templates.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Username</label>
            <input id="identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="form-input" autoComplete="username" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>Password</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" autoComplete="current-password" required />
          </div>
          {error && <p role="alert" className="text-sm" style={{ color: "var(--destructive)" }}>{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
            <LogIn size={15} /> {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
