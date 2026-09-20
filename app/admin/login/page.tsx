"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Shield, AlertCircle, Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid credentials. Please check your email and password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6">
      {/* Tactical grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-8">
          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#D6FF3F]/40 rounded-tl-2xl pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#D6FF3F]/40 rounded-br-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-[#D6FF3F]/10 blur-xl scale-150" />
              <Image
                src="/logo-png.png"
                alt="The North Tactical"
                width={64}
                height={64}
                className="relative object-contain drop-shadow-lg"
              />
            </div>
            <p className="text-[10px] font-mono text-[#737373] tracking-[0.3em] uppercase mb-1">
              The North Tactical
            </p>
            <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
              Admin Access
            </h1>
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full border border-[#292929] bg-[#1D1D1D]">
              <Shield size={11} className="text-[#D6FF3F]" />
              <span className="text-[10px] font-mono text-[#737373] tracking-widest uppercase">
                Secure Console
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@thenorthtactical.com"
                className="w-full px-4 py-3 rounded-lg bg-[#1D1D1D] border border-[#292929] text-[#F5F5F5] placeholder-[#4A4A4A] text-sm font-mono focus:outline-none focus:border-[#D6FF3F]/50 focus:ring-1 focus:ring-[#D6FF3F]/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono font-bold uppercase tracking-widest text-[#737373] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#1D1D1D] border border-[#292929] text-[#F5F5F5] placeholder-[#4A4A4A] text-sm font-mono focus:outline-none focus:border-[#D6FF3F]/50 focus:ring-1 focus:ring-[#D6FF3F]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full flex items-center justify-center gap-2 px-6 py-3 mt-2 rounded-lg bg-[#D6FF3F] text-[#0A0A0A] font-bold text-sm uppercase tracking-wider transition-all hover:bg-[#B8E62E] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Authenticate</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] font-mono text-[#404040] uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </main>
  );
}