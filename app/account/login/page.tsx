"use client";

import React, { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ShieldCheck, Lock, User, ArrowRight } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone }),
        });
        const regData = await regRes.json();
        if (!regRes.ok) {
          setError(regData.message || "Registration failed");
          setLoading(false);
          return;
        }
        toast("Account created. Authenticating...", "success");
      }

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Invalid email or password credentials");
        setLoading(false);
        return;
      }

      toast("Authenticated successfully", "success");
      router.push("/account");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="w-full max-w-md">
          {/* Brand Emblem */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[#141414] border border-[#292929] mb-4">
              <Image
                src="/logo.png"
                alt="The North Tactical"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#F5F5F5]">
              {mode === "login" ? "OPERATOR LOGIN" : "CREATE OPERATOR ACCOUNT"}
            </h1>
            <p className="mt-2 text-xs font-mono text-[#737373] uppercase">
              {mode === "login"
                ? "Access your tactical loadout, order history and loyalty points."
                : "Register for field dispatch tracking and exclusive member benefits."}
            </p>
          </div>

          {/* Form Box */}
          <div className="rounded-3xl border border-[#292929] bg-[#141414] p-8 shadow-2xl relative tactical-card-corners">
            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-[#0E0E0E] p-1 border border-[#262626] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  mode === "login"
                    ? "bg-[#D6FF3F] text-[#0A0A0A] shadow-md"
                    : "text-[#A3A3A3] hover:text-[#F5F5F5]"
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  mode === "register"
                    ? "bg-[#D6FF3F] text-[#0A0A0A] shadow-md"
                    : "text-[#A3A3A3] hover:text-[#F5F5F5]"
                }`}
              >
                REGISTER
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <Input
                    label="Full Name *"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Operator Name"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                  />
                </>
              )}

              <Input
                label="Email Address *"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@email.com"
              />

              <Input
                label="Password *"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                hint={mode === "register" ? "Minimum 6 characters" : undefined}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
              >
                <span>{mode === "login" ? "AUTHENTICATE" : "COMPLETE REGISTRATION"}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#222222] text-center text-xs font-mono text-[#737373]">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6FF3F]" />
                <span>SECURE ENCRYPTED OPERATOR PROTOCOL</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
