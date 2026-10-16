"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Globe,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Car,
  Clock,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
  Wallet,
  Zap,
  Crown,
  CreditCard,
  PlusCircle,
  ShieldAlert
} from "lucide-react";
import { DashboardTab } from "./DashboardSidebar";
import { TopUpModal } from "./TopUpModal";
import { SubscriptionModal } from "./SubscriptionModal";

interface OverviewViewProps {
  stats: {
    myModelsCount: number;
    myPublicModelsCount: number;
    unreadNotificationsCount: number;
    recentMyBuilds: Array<{
      id: string;
      title: string;
      colorName: string;
      colorHex: string;
      finish: string;
      wheelName: string;
      caliperName: string;
      totalPrice: number;
      isPublic: boolean;
      status: string;
      createdAt: string;
    }>;
    admin: {
      totalUsers: number;
      totalSuperusers: number;
      totalSubscribers?: number;
      totalPlatformBalance?: number;
      totalAllModels: number;
      recentUsers: Array<{
        id: string;
        name: string | null;
        email: string;
        role: string;
        image: string | null;
        balance?: number;
        isSubscribed?: boolean;
        subscriptionTier?: "FREE" | "PRO" | "ENTERPRISE";
        createdAt: string;
        _count: { savedBuilds: number };
      }>;
    } | null;
  } | null;
  user: {
    name: string | null;
    email: string;
    role: "USER" | "SUPERUSER";
    balance?: number;
    isSubscribed?: boolean;
    subscriptionTier?: "FREE" | "PRO" | "ENTERPRISE";
  } | null;
  onNavigateTab: (tab: DashboardTab) => void;
  onUserUpdate?: (updatedFields: any) => void;
  onOpenTopUp?: () => void;
  onOpenSubscription?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  user,
  onNavigateTab,
  onUserUpdate,
  onOpenTopUp,
  onOpenSubscription
}) => {
  const isSuperuser = user?.role === "SUPERUSER";
  const [internalTopUpOpen, setInternalTopUpOpen] = React.useState(false);
  const [internalSubModalOpen, setInternalSubModalOpen] = React.useState(false);

  const handleOpenTopUp = () => {
    if (onOpenTopUp) onOpenTopUp();
    else setInternalTopUpOpen(true);
  };

  const handleOpenSubscription = () => {
    if (onOpenSubscription) onOpenSubscription();
    else setInternalSubModalOpen(true);
  };

  const handleTopUpSuccess = (newBalance: number) => {
    if (onUserUpdate) {
      onUserUpdate({ balance: newBalance });
    }
  };

  const handleSubSuccess = (newTier: "FREE" | "PRO" | "ENTERPRISE", newBalance: number) => {
    if (onUserUpdate) {
      onUserUpdate({
        subscriptionTier: newTier,
        isSubscribed: newTier !== "FREE",
        balance: newBalance
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#091120] via-[#080d18] to-[#0a121c] border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#00e5ff] uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 font-bold">
                MOD_CARBON COMMAND CENTER
              </span>
              {isSuperuser ? (
                <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  SUPERUSER ACTIVE
                </span>
              ) : (
                <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                  user?.subscriptionTier === "ENTERPRISE"
                    ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                    : user?.subscriptionTier === "PRO"
                    ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-700"
                }`}>
                  <Zap className="w-3 h-3" />
                  {user?.subscriptionTier || "FREE"} SUBSCRIBER
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-sans">
              Selamat Datang Kembali,{" "}
              <span className="text-[#00e5ff]">
                {user?.name || user?.email?.split("@")?.[0] || "Pilot"}
              </span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {isSuperuser
                ? "Pantau performa global, daftar langganan aktif, total deposit saldo user, dan kelola hak akses sistem MOD_CARBON."
                : "Pantau model 3D supercar buatan Anda, kelola saldo deposit akun, paket langganan studio, atau racik aerokit baru di 3D Configurator."}
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Link
              href="/configurator"
              className="px-5 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.35)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>RACIK 3D BARU</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenTopUp}
              className="px-4 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/50 font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>TOP UP SALDO</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab("models")}
              className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-500/50 font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Box className="w-4 h-4 text-cyan-400" />
              <span>SHOWCASE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. User Balance & Subscription Center (Tampil untuk semua akun termasuk Superuser) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Account Balance & Quick Top Up */}
          <div className="bg-gradient-to-br from-[#07131a] to-[#090d16] border border-emerald-500/40 p-6 rounded-2xl shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  SALDO AKUN PENGGUNA
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/30">
                  DEPOSIT AKTIF
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                  ${(user?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-mono text-emerald-400">USD</span>
              </div>

              <p className="text-xs text-slate-400 mt-2 font-sans">
                Gunakan saldo untuk render 4K studio, request kustom aerokit carbon, dan pemesanan part fisik.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenTopUp}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>TOP UP SALDO</span>
              </button>
            </div>
          </div>

          {/* Card B: Studio Subscription Plan */}
          <div className="bg-gradient-to-br from-[#0c1424] to-[#090d16] border border-cyan-500/40 p-6 rounded-2xl shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e5ff] font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  PAKET LANGGANAN STUDIO
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                  user?.subscriptionTier === "ENTERPRISE"
                    ? "bg-amber-950 text-amber-300 border-amber-500/40"
                    : user?.subscriptionTier === "PRO"
                    ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-700"
                }`}>
                  {user?.subscriptionTier || "FREE"} PLAN
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00e5ff]">
                  {user?.subscriptionTier === "ENTERPRISE" ? (
                    <Crown className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Zap className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-black text-white uppercase tracking-wider">
                    {user?.subscriptionTier === "ENTERPRISE"
                      ? "ENTERPRISE VIP STUDIO"
                      : user?.subscriptionTier === "PRO"
                      ? "PRO STUDIO SUBSCRIBER"
                      : "FREE TIER ACCESS"}
                  </h4>
                  <p className="text-[11px] font-mono text-cyan-400">
                    {user?.isSubscribed ? "Langganan Aktif • Akses Fitur Unggulan" : "Akses Dasar • Upgrade untuk Fitur Lengkap"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                {user?.subscriptionTier === "PRO"
                  ? "Fitur aktif: Unlimited 3D Cloud Saves, Aerokit Spoiler Carbon, dan Priority WebGL Rendering Engine."
                  : user?.subscriptionTier === "ENTERPRISE"
                  ? "Fitur aktif: Semua fitur PRO, Ekspor file CAD 3D, Custom part request, dan Personal 24/7 Support."
                  : "Upgrade ke PRO Studio untuk simpan model tanpa batas dan akses aerokit spoiler serat karbon eksklusif."}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenSubscription}
                className="flex-1 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.35)] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{user?.isSubscribed ? "UBAH PAKET LANGGANAN" : "UPGRADE KE PRO ($49/BLN)"}</span>
              </button>
            </div>
          </div>
        </div>

      {/* 3. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: My 3D Models */}
        <div className="bg-[#090d16]/90 border border-slate-800 hover:border-cyan-500/40 p-5 rounded-xl transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              MY 3D MODELS
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {stats?.myModelsCount ?? 0}
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Tersimpan</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Model supercar tersimpan di akun Anda
          </p>
        </div>

        {/* Metric 2: Public Showcase Models */}
        <div className="bg-[#090d16]/90 border border-slate-800 hover:border-cyan-500/40 p-5 rounded-xl transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              PUBLIC SHOWCASE
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {stats?.myPublicModelsCount ?? 0}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Publik</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Model yang dapat dilihat publik
          </p>
        </div>

        {/* Metric 3: SUPERUSER Total Subscribers or NORMAL USER Balance */}
        {isSuperuser ? (
          <div className="bg-[#090d16]/90 border border-amber-500/30 hover:border-amber-500/60 p-5 rounded-xl transition-all shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                TOTAL SUBSCRIBERS
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-200">
                {stats?.admin?.totalSubscribers ?? 0}
              </span>
              <span className="text-[10px] font-mono text-amber-400">Aktif</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Dari total {stats?.admin?.totalUsers ?? 0} pengguna platform
            </p>
          </div>
        ) : (
          <div className="bg-[#090d16]/90 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-xl transition-all shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                SALDO TERSEDIA
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                ${(user?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Deposit aktif di akun MOD_CARBON Anda
            </p>
          </div>
        )}

        {/* Metric 4: SUPERUSER Total Platform Balance or NORMAL USER Active Notifications */}
        {isSuperuser ? (
          <div className="bg-[#090d16]/90 border border-amber-500/30 hover:border-amber-500/60 p-5 rounded-xl transition-all shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                TOTAL USER BALANCES
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                ${(stats?.admin?.totalPlatformBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Total dana mengendap di seluruh akun user
            </p>
          </div>
        ) : (
          <div className="bg-[#090d16]/90 border border-slate-800 hover:border-cyan-500/40 p-5 rounded-xl transition-all shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                NOTIFIKASI AKTIF
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {stats?.unreadNotificationsCount ?? 0}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Pesan baru</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Update sistem dan aktivitas build
            </p>
          </div>
        )}
      </div>

      {/* 4. Section: Recent 3D Builds */}
      <div className="bg-[#090d16]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
              <Car className="w-4 h-4 text-[#00e5ff]" />
              <span>AKTIVITAS 3D MODEL TERAKHIR</span>
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Racikan mobil terbaru yang tersimpan di akun Anda
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("models")}
            className="text-xs font-mono text-cyan-400 hover:text-white uppercase flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Lihat Semua Showcase</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {(!stats?.recentMyBuilds || stats.recentMyBuilds.length === 0) ? (
          <div className="py-12 border border-dashed border-slate-800 rounded-xl text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Box className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase mb-1">
              Belum Ada Model 3D Tersimpan
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Mulai racik warna bodi, velg, kaliper, dan aero carbon Anda di studio 3D.
            </p>
            <Link
              href="/configurator"
              className="px-5 py-2 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs uppercase tracking-wider rounded-md transition-all shadow-md"
            >
              BUKA 3D CONFIGURATOR
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recentMyBuilds.map((build) => (
              <div
                key={build.id}
                className="bg-slate-950/80 border border-slate-850 hover:border-cyan-500/50 rounded-xl p-4 transition-all group flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#00e5ff] transition-colors uppercase tracking-wide">
                        {build.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(build.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                        build.isPublic
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {build.isPublic ? "PUBLIC" : "SAVED (PRIVATE)"}
                    </span>
                  </div>

                  {/* Spec pills */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#070b10] p-2.5 rounded-lg border border-slate-850 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: build.colorHex }}
                      />
                      <span className="text-slate-300 truncate">
                        {build.colorName} ({build.finish})
                      </span>
                    </div>
                    <div className="text-slate-300 truncate">
                      <span className="text-slate-500 text-[9px] font-mono mr-1">VELG:</span>
                      {build.wheelName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                  <span className="text-sm font-black font-mono text-[#00e5ff]">
                    ${build.totalPrice.toLocaleString()}
                  </span>

                  <Link
                    href={`/configurator?buildId=${build.id}`}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-[#00e5ff] text-cyan-300 hover:text-slate-950 font-mono text-xs uppercase tracking-wider rounded border border-cyan-500/40 hover:border-[#00e5ff] transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>VIEW 3D</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Section: Recent Users Table (SUPERUSER ONLY) */}
      {isSuperuser && stats?.admin?.recentUsers && (
        <div className="bg-[#090d16]/90 border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black tracking-wider text-amber-200 uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>USER REGISTRATION MONITOR (SUPERUSER ACCESS)</span>
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Pengguna terdaftar terbaru di sistem MOD_CARBON
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab("users")}
              className="text-xs font-mono text-amber-400 hover:text-amber-200 uppercase flex items-center gap-1 transition-colors cursor-pointer font-bold"
            >
              <span>Buka User Management</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">PENGGUNA</th>
                  <th className="py-2.5 px-3">EMAIL</th>
                  <th className="py-2.5 px-3">ROLE</th>
                  <th className="py-2.5 px-3">LANGGANAN</th>
                  <th className="py-2.5 px-3">SALDO DEPOSIT</th>
                  <th className="py-2.5 px-3">TOTAL BUILD</th>
                  <th className="py-2.5 px-3">TANGGAL DAFTAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {stats.admin.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-semibold text-white">
                      {u.name || "Anonymous Pilot"}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          u.role === "SUPERUSER"
                            ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          u.subscriptionTier === "ENTERPRISE"
                            ? "bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                            : u.subscriptionTier === "PRO"
                            ? "bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                            : "bg-slate-900 text-slate-400 border-slate-700"
                        }`}
                      >
                        {u.subscriptionTier || (u.isSubscribed ? "PRO" : "FREE")}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      ${(u.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#00e5ff] font-bold">
                      {u._count?.savedBuilds ?? 0} model
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fallback Modals (if not managed by root dashboard page) */}
      {!onOpenTopUp && (
        <TopUpModal
          isOpen={internalTopUpOpen}
          onClose={() => setInternalTopUpOpen(false)}
          currentBalance={user?.balance ?? 0}
          onSuccess={handleTopUpSuccess}
        />
      )}

      {!onOpenSubscription && (
        <SubscriptionModal
          isOpen={internalSubModalOpen}
          onClose={() => setInternalSubModalOpen(false)}
          currentTier={user?.subscriptionTier || "FREE"}
          balance={user?.balance ?? 0}
          onSuccess={handleSubSuccess}
        />
      )}
    </div>
  );
};
