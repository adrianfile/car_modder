"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Box,
  Users,
  ShieldAlert,
  Sparkles,
  Car,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Wallet,
  Zap,
  Crown
} from "lucide-react";

export type DashboardTab = "overview" | "models" | "users";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "SUPERUSER";
    image: string | null;
    balance?: number;
    isSubscribed?: boolean;
    subscriptionTier?: "FREE" | "PRO" | "ENTERPRISE";
  } | null;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  modelsCount?: number;
  usersCount?: number;
  onOpenTopUp: () => void;
  onOpenSubscription: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  user,
  isMobileOpen,
  onCloseMobile,
  modelsCount = 0,
  usersCount = 0,
  onOpenTopUp,
  onOpenSubscription
}) => {
  const isSuperuser = user?.role === "SUPERUSER";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#080c14]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80 bg-[#060910]">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.25)] group-hover:scale-105 transition-transform">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-black tracking-widest text-white uppercase block leading-none">
                  MOD<span className="text-[#00e5ff]">_</span>CARBON
                </span>
                <span className="text-[9px] font-mono tracking-widest text-cyan-400 block mt-1 uppercase">
                  PILOT DASHBOARD
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Bar Card */}
          <div className="p-4 m-4 bg-slate-950/70 border border-slate-850 rounded-xl relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-sm font-mono text-[#00e5ff] font-bold shrink-0">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user?.name || user?.email || "U").substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">
                  {user?.name || user?.email?.split("@")?.[0] || "Pilot"}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isSuperuser
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60"
                    }`}
                  >
                    {isSuperuser ? (
                      <>
                        <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                        SUPERUSER
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-2.5 h-2.5 text-cyan-400" />
                        USER
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Balance & Subscription Widget in Sidebar */}
          <div className="mx-4 mb-3 p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2.5 shadow-sm">
            {/* Balance Item */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-3 h-3" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block leading-none">
                    SALDO ANDA
                  </span>
                  <span className="text-xs font-mono font-black text-white">
                    ${(user?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenTopUp();
                  onCloseMobile();
                }}
                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-[10px] uppercase rounded transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span>+ TOP UP</span>
              </button>
            </div>

            {/* Subscription Item */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00e5ff]">
                  {user?.subscriptionTier === "ENTERPRISE" ? (
                    <Crown className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Zap className="w-3 h-3 text-cyan-400" />
                  )}
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block leading-none">
                    PAKET STUDIO
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase ${
                    user?.subscriptionTier === "ENTERPRISE"
                      ? "text-amber-400"
                      : user?.subscriptionTier === "PRO"
                      ? "text-cyan-400"
                      : "text-slate-300"
                  }`}>
                    {user?.subscriptionTier || "FREE"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenSubscription();
                  onCloseMobile();
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-500/50 font-mono text-[10px] uppercase rounded transition-colors cursor-pointer"
              >
                KELOLA
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">
              MENU UTAMA
            </span>

            {/* 1. Overview */}
            <button
              type="button"
              onClick={() => {
                onSelectTab("overview");
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-cyan-950/70 to-slate-900 text-[#00e5ff] border border-cyan-500/40 font-bold shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>OVERVIEW</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  activeTab === "overview" ? "rotate-90 text-[#00e5ff]" : "text-slate-600"
                }`}
              />
            </button>

            {/* 2. My 3D Models */}
            <button
              type="button"
              onClick={() => {
                onSelectTab("models");
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === "models"
                  ? "bg-gradient-to-r from-cyan-950/70 to-slate-900 text-[#00e5ff] border border-cyan-500/40 font-bold shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4" />
                <span>MY 3D MODELS</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {modelsCount}
              </span>
            </button>

            {/* 3. User Management (SUPERUSER ONLY) */}
            {isSuperuser && (
              <div className="pt-2">
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-amber-400/80 block mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  ADMINISTRATION
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab("users");
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    activeTab === "users"
                      ? "bg-gradient-to-r from-amber-950/60 to-slate-900 text-amber-300 border border-amber-500/50 font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "text-slate-400 hover:text-amber-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <span>USER MANAGEMENT</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
                    SUPERUSER
                  </span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Section: Quick Links & Configurator Launcher */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060910] space-y-3">
          <Link
            href="/configurator"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#00e5ff] to-[#00b4d8] hover:from-[#33ebff] hover:to-[#00c8f0] text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>BUKA 3D CONFIGURATOR</span>
          </Link>

          <Link
            href="/profile"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors"
          >
            <span>Pengaturan Akun</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>
    </>
  );
};
