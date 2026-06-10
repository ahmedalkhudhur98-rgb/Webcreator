"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Crest from "@/components/Crest";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials. Membership is by invitation only.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(600px 400px at 50% 20%, rgba(201,169,97,0.07), transparent 70%)",
        }}
      />
      <div className="animate-fade-up relative w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <Crest size={72} />
          <h1 className="font-display mt-6 text-4xl font-semibold tracking-wide text-champagne">
            The Elite Brotherhood
          </h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-gold/70">
            Members Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card gold-ring space-y-5 p-8">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input-base"
              placeholder="you@elitebrotherhood.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-base"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? "Verifying…" : "Enter the Brotherhood"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Access is granted by invitation only.
        </p>
      </div>
    </main>
  );
}
