"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Menu,
  Sparkles,
  Info,
  AlertTriangle,
  ShieldCheck,
  Car,
  Clock,
  X,
  ExternalLink,
  Wallet,
  Zap,
  Crown
} from "lucide-react";
import { DashboardTab } from "./DashboardSidebar";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface DashboardHeaderProps {
  activeTab: DashboardTab;
  onOpenMobileMenu: () => void;
  user: {
    name: string | null;
    email: string;
    role: "USER" | "SUPERUSER";
    image: string | null;
    balance?: number;
    isSubscribed?: boolean;
    subscriptionTier?: "FREE" | "PRO" | "ENTERPRISE";
  } | null;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onOpenTopUp: () => void;
  onOpenSubscription: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  user,
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onMarkAsRead,
  onOpenTopUp,
  onOpenSubscription
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    }
    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  const getTabTitle = () => {
    switch (activeTab) {
      case "overview":
        return { title: "DASHBOARD OVERVIEW", subtitle: "Ringkasan performa dan aktivitas 3D studio" };
      case "models":
        return { title: "MY 3D MODELS SHOWCASE", subtitle: "Koleksi dan manajemen konfigurasi supercar Anda" };
      case "users":
        return { title: "USER ACCESS MANAGEMENT", subtitle: "Manajemen pengguna dan kontrol role SUPERUSER" };
    }
  };

  const { title, subtitle } = getTabTitle();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case "system":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case "success":
        return <Check className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#070b12]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-black tracking-wider text-white uppercase font-sans">
            {title}
          </h1>
          <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Notifications Bell Popover & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* Notification Bell with Dropdown Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="relative p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm group"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform" />

            {/* Unread Count Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00e5ff] text-slate-950 font-mono font-black text-[10px] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.8)] animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown Container */}
          {isPopoverOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#090d16] border border-cyan-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Popover Header */}
              <div className="px-4 py-3 border-b border-slate-800 bg-[#070a10] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest text-white uppercase">
                    NOTIFIKASI
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-[#00e5ff] border border-cyan-800/80 font-bold">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Tandai Semua Dibaca</span>
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-mono">
                    Belum ada notifikasi baru
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !item.isRead && onMarkAsRead(item.id)}
                      className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                        item.isRead
                          ? "bg-transparent hover:bg-slate-900/40 text-slate-400"
                          : "bg-cyan-950/20 hover:bg-cyan-950/30 text-slate-200"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getNotificationIcon(item.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs font-semibold truncate ${
                              item.isRead ? "text-slate-300" : "text-white"
                            }`}
                          >
                            {item.title}
                          </h4>
                          {!item.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {item.message}
                        </p>
                        <span className="text-[9px] font-mono text-slate-500 mt-1 block flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Popover Footer */}
              <div className="p-2.5 border-t border-slate-800 bg-[#06090f] text-center">
                <Link
                  href="/configurator"
                  onClick={() => setIsPopoverOpen(false)}
                  className="text-[10px] font-mono text-cyan-400 hover:text-white uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-[#00e5ff]" />
                  <span>Coba Fitur Baru di 3D Configurator</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Balance Pill (Clickable -> Top Up) */}
        <button
          type="button"
          onClick={onOpenTopUp}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/70 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white font-mono text-xs shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer group"
          title="Klik untuk Top Up Saldo Akun"
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-wide">
            ${(user?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 font-black transition-colors ml-0.5">
            +
          </span>
        </button>

        {/* User Subscription Tier Badge (Clickable -> Upgrade/Manage) */}
        <button
          type="button"
          onClick={onOpenSubscription}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shadow-sm transition-all cursor-pointer hover:scale-105 ${
            user?.subscriptionTier === "ENTERPRISE"
              ? "bg-amber-950/70 hover:bg-amber-900 text-amber-300 hover:text-white border-amber-500/50 hover:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              : user?.subscriptionTier === "PRO"
              ? "bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 hover:text-white border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:border-slate-500"
          }`}
          title="Klik untuk Kelola / Upgrade Paket Studio"
        >
          {user?.subscriptionTier === "ENTERPRISE" ? (
            <Crown className="w-3 h-3 text-amber-400" />
          ) : (
            <Zap className="w-3 h-3 text-cyan-400" />
          )}
          <span>{user?.subscriptionTier || "FREE"} PLAN</span>
          <span className="text-[8px] text-cyan-400 opacity-70 group-hover:opacity-100">
            ▲
          </span>
        </button>

        {/* User Mini Profile Button */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-all group"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-xs font-mono text-[#00e5ff] font-bold shrink-0">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.name || user?.email || "U").substring(0, 2).toUpperCase()
            )}
          </div>
          <span className="text-xs font-mono text-slate-300 group-hover:text-white max-w-[120px] truncate hidden md:inline">
            {user?.name || user?.email?.split("@")?.[0] || "User"}
          </span>
        </Link>
      </div>
    </header>
  );
};
