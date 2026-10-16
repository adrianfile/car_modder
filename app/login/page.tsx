"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>("/profile");
  const [fromConfigurator, setFromConfigurator] = useState(false);

  const sanitizeRedirect = (url: string | null): string => {
    if (!url) return "/profile";
    const trimmed = url.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")) {
      return trimmed;
    }
    return "/profile";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = sanitizeRedirect(params.get("redirect"));
      setRedirectTo(redirect);
      if (redirect.includes("configurator")) {
        setFromConfigurator(true);
      }
    }
  }, []);

  // Check if already logged in (strictly once on mount)
  const hasCheckedAuthRef = React.useRef(false);
  useEffect(() => {
    if (hasCheckedAuthRef.current) return;
    hasCheckedAuthRef.current = true;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          const target = sanitizeRedirect(params?.get("redirect") || null);
          router.push(target);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setErrorMsg("Password minimal 6 karakter");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Konfirmasi password tidak cocok");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memproses autentikasi");
        setLoading(false);
        return;
      }

      setSuccessMsg(
        mode === "login"
          ? "Login berhasil! Mengalihkan..."
          : "Akun berhasil dibuat! Mengalihkan..."
      );

      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 1000);
    } catch {
      setErrorMsg("Terjadi gangguan koneksi ke server");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Back to Home Button */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-[#00e5ff] transition-colors bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-sm"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>KEMBALI KE HOME</span>
        </Link>

        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          MOD_CARBON AUTH
        </span>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-[#0a0d14]/90 backdrop-blur-xl border border-slate-800/90 rounded-xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[#00e5ff] mb-3 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black tracking-widest text-white uppercase">
            MOD<span className="text-[#00e5ff]">_</span>CARBON
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            {mode === "login"
              ? "Masuk untuk mengakses akun & konfigurasi Anda"
              : "Daftar akun baru untuk menyimpan build supercar"}
          </p>
        </div>

        {fromConfigurator && (
          <div className="mb-6 p-3 bg-cyan-950/70 border border-[#00e5ff]/50 rounded-lg text-cyan-200 text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,229,255,0.15)] animate-in fade-in">
            <Sparkles className="w-4 h-4 text-[#00e5ff] shrink-0" />
            <div className="font-sans leading-tight">
              <span className="font-bold text-[#00e5ff] block uppercase font-mono text-[10px]">Akses Khusus Member</span>
              Silakan login atau buat akun untuk membuka 3D Configurator Studio.
            </div>
          </div>
        )}

        {/* Tab Switcher: Login / Register */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/80 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer ${
              mode === "login"
                ? "bg-[#00e5ff] text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            MASUK
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer ${
              mode === "register"
                ? "bg-[#00e5ff] text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            DAFTAR
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-md bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-md bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
                NAMA LENGKAP
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Adrian Motorsport"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
              ALAMAT EMAIL
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
                KONFIRMASI PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#00e5ff] hover:bg-[#33ebff] disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest rounded-md transition-all duration-200 shadow-md hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>MEMPROSES...</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "MASUK KE AKUN" : "BUAT AKUN SEKARANG"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-[11px] font-mono text-slate-500">
            {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-[#00e5ff] hover:underline font-bold cursor-pointer ml-1"
            >
              {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
