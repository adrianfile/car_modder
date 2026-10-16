"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Calendar,
  LogOut,
  Camera,
  Check,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Compass,
  Cpu,
  Layers,
  Car,
  BookmarkCheck,
  Trash2,
  ExternalLink,
  Plus,
  Crown,
  Wallet
} from "lucide-react";
import { SessionUser } from "@/types/user";

type UserData = SessionUser;

interface SavedBuildItem {
  id: string;
  title: string;
  colorName: string;
  colorHex: string;
  finish: string;
  wheelName: string;
  wheelId: string;
  caliperName: string;
  caliperHex: string;
  carbonPackage: boolean;
  carbonSpoiler: boolean;
  totalPrice: number;
  studioEnv: string;
  createdAt: string;
}

const PRESET_AVATARS = [
  { name: "Apex Racer", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { name: "Carbon Pilot", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { name: "Stealth Driver", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
  { name: "Cyber Elite", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Saved builds state
  const [savedBuilds, setSavedBuilds] = useState<SavedBuildItem[]>([]);
  const [loadingBuilds, setLoadingBuilds] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit profile state
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"garage" | "info" | "security">("garage");

  // Check query params for tab selection (e.g. ?tab=garage)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "garage" || tab === "info" || tab === "security") {
        setActiveTab(tab as any);
      }
    }
  }, []);

  // Fetch current user session (strictly once on mount)
  const hasCheckedUserRef = React.useRef(false);
  useEffect(() => {
    if (hasCheckedUserRef.current) return;
    hasCheckedUserRef.current = true;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
        } else {
          setUser(data.user);
          setName(data.user.name || "");
          setImage(data.user.image || "");
        }
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch Saved Builds (strictly once on mount)
  const hasLoadedBuildsRef = React.useRef(false);
  const loadSavedBuilds = async () => {
    setLoadingBuilds(true);
    try {
      const res = await fetch("/api/configurator/saved");
      const data = await res.json();
      if (data.builds) {
        setSavedBuilds(data.builds);
      }
    } catch (err) {
      console.error("Error loading builds:", err);
    } finally {
      setLoadingBuilds(false);
    }
  };

  useEffect(() => {
    if (hasLoadedBuildsRef.current) return;
    hasLoadedBuildsRef.current = true;
    loadSavedBuilds();
  }, []);

  // Handle Delete Build
  const handleDeleteBuild = async (id: string) => {
    if (!confirm("Hapus konfigurasi mobil ini dari Garage Anda?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/configurator/saved/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSavedBuilds((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete build:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image })
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: "error", text: data.error || "Gagal memperbarui profil" });
      } else {
        setUser(data.user);
        setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Semua kolom password wajib diisi" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password baru minimal 6 karakter" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Konfirmasi password baru tidak cocok" });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error || "Gagal mengganti password" });
      } else {
        setPasswordMsg({ type: "success", text: "Password berhasil diganti!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Terjadi kesalahan koneksi" });
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-[#00e5ff] animate-spin mb-3" />
        <span className="text-xs font-mono tracking-widest uppercase">MEMUAT DATA AKUN...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#070b12]/90 backdrop-blur-md border-b border-slate-800/80 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>BERANDA</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest text-white uppercase">
              MOD<span className="text-[#00e5ff]">_</span>CARBON
            </span>
            <span className="text-[10px] font-mono bg-cyan-950/80 text-[#00e5ff] border border-cyan-800/60 px-1.5 py-0.5 rounded-sm uppercase">
              USER PROFILE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/configurator"
            className="hidden sm:flex items-center gap-2 text-xs font-mono bg-cyan-950/70 hover:bg-cyan-900/80 text-[#00e5ff] border border-cyan-500/40 px-3.5 py-1.5 rounded transition-all"
          >
            <Car className="w-3.5 h-3.5" />
            <span>3D CONFIGURATOR</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/50 px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* User Hero Banner Card */}
        <div className="bg-[#0a0d14]/90 border border-slate-800/90 rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-slate-900 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.2)]">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-black font-mono text-[#00e5ff]">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* User Meta */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  {user.name || "Pengguna ModCarbon"}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-[#00e5ff] uppercase font-bold tracking-wider">
                  ROLE: {user.role}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 font-bold tracking-wider uppercase ${
                  user.isSubscribed
                    ? "bg-amber-950/80 border border-amber-500/50 text-amber-400"
                    : "bg-slate-900 border border-slate-700 text-slate-400"
                }`}>
                  <Crown className="w-3 h-3 text-amber-400" />
                  {user.subscriptionTier || "FREE"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 font-bold">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  ${(user.balance ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {savedBuilds.length} RACIKAN TERSIMPAN
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Bergabung: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : "-"}
                </span>
              </div>
            </div>

            {/* Quick Action to 3D Configurator */}
            <Link
              href="/configurator"
              className="bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs px-5 py-2.5 rounded-sm uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer flex items-center gap-1.5 self-center sm:self-start shrink-0"
            >
              <Car className="w-4 h-4" />
              <span>BUKA CONFIGURATOR</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation for Settings */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("garage")}
            className={`flex-1 py-2.5 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "garage"
                ? "bg-slate-900 text-[#00e5ff] font-bold border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>MY GARAGE ({savedBuilds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-2.5 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "info"
                ? "bg-slate-900 text-[#00e5ff] font-bold border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>INFORMASI PROFIL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-2.5 text-xs font-mono tracking-wider uppercase rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "security"
                ? "bg-slate-900 text-[#00e5ff] font-bold border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>KEAMANAN</span>
          </button>
        </div>

        {/* TAB 1: MY GARAGE (SAVED BUILDS) */}
        {activeTab === "garage" && (
          <div className="bg-[#0a0d14]/90 border border-slate-800/90 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-[#00e5ff]" />
                  <span>MOD_CARBON PERSONAL GARAGE</span>
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Koleksi racikan spesifikasi supercar yang Anda simpan dari 3D Configurator
                </p>
              </div>

              <Link
                href="/configurator"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-[#00e5ff] rounded text-xs font-mono uppercase tracking-wider transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>RACIK BUILD BARU</span>
              </Link>
            </div>

            {loadingBuilds ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 text-[#00e5ff] animate-spin mb-2" />
                <span className="text-xs font-mono">Memuat koleksi garage...</span>
              </div>
            ) : savedBuilds.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-800 rounded-lg text-center flex flex-col items-center px-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
                  <Car className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide mb-1">
                  GARAGE ANDA MASIH KOSONG
                </h3>
                <p className="text-xs text-slate-400 max-w-md mb-6 font-sans">
                  Anda belum menyimpan konfigurasi supercar apa pun. Buka 3D Configurator sekarang, atur warna cat, velg, kaliper, dan simpan hasilnya di sini!
                </p>
                <Link
                  href="/configurator"
                  className="px-6 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                >
                  MULAI RACIK MOBIL 3D
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedBuilds.map((build) => (
                  <div
                    key={build.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 rounded-lg p-5 transition-all group flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#00e5ff] transition-colors uppercase tracking-wide">
                            {build.title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500">
                            Tersimpan: {new Date(build.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBuild(build.id)}
                          disabled={deletingId === build.id}
                          title="Hapus build ini"
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                        >
                          {deletingId === build.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Spec Specs Grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#070b10] p-3 rounded border border-slate-850 mb-4">
                        <div>
                          <span className="text-slate-500 text-[10px] font-mono block">WARNA CAT</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: build.colorHex }}
                            />
                            <span className="text-slate-200 font-medium truncate">
                              {build.colorName} ({build.finish})
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px] font-mono block">VELG</span>
                          <span className="text-slate-200 font-medium truncate block mt-0.5">
                            {build.wheelName}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px] font-mono block">KALIPER</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: build.caliperHex }}
                            />
                            <span className="text-slate-200 font-medium truncate">
                              {build.caliperName}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px] font-mono block">AERO PACKAGE</span>
                          <span className="text-slate-200 font-medium truncate block mt-0.5">
                            {build.carbonPackage ? "Full Pre-Preg Carbon" : "Standard Aero"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Price & Open CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">ESTIMASI BIAYA</span>
                        <span className="text-base font-black font-mono text-[#00e5ff]">
                          ${build.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/configurator?buildId=${build.id}`}
                        className="px-4 py-2 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>BUKA DI 3D</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EDIT PROFILE */}
        {activeTab === "info" && (
          <div className="bg-[#0a0d14]/90 border border-slate-800/90 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                INFORMASI AKUN
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Perbarui nama tampilan dan gambar profil avatar Anda
              </p>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-md text-xs font-mono flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-950/50 border border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/50 border border-red-500/40 text-red-300"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
                  NAMA LENGKAP
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
                  EMAIL (TERVERIFIKASI)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800/60 rounded-md text-sm text-slate-400 cursor-not-allowed font-sans"
                />
              </div>

              {/* Avatar Image URL & Presets */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                  AVATAR FOTO PROFIL
                </label>

                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/foto-avatar.jpg"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                />

                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">
                    Atau pilih preset pilot motorsport:
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {PRESET_AVATARS.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setImage(item.url)}
                        className={`group relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          image === item.url
                            ? "border-[#00e5ff] scale-105 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                            : "border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest rounded-md transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer flex items-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SIMPAN PERUBAHAN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD */}
        {activeTab === "security" && (
          <div className="bg-[#0a0d14]/90 border border-slate-800/90 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                GANTI PASSWORD
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Gunakan password yang kuat untuk melindungi akun dan konfigurasi Anda
              </p>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-md text-xs font-mono flex items-center gap-2 ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-950/50 border border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/50 border border-red-500/40 text-red-300"
                }`}
              >
                {passwordMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
                  PASSWORD SAAT INI
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
                  PASSWORD BARU
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5">
                  KONFIRMASI PASSWORD BARU
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] rounded-md text-sm text-white placeholder-slate-600 outline-none transition-all font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-widest rounded-md transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer flex items-center gap-2"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>MENYIMPAN PASSWORD...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>GANTI PASSWORD</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
