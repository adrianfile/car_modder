"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardSidebar,
  DashboardTab
} from "./components/DashboardSidebar";
import { DashboardHeader, NotificationItem } from "./components/DashboardHeader";
import { FloatingLogoutButton } from "./components/FloatingLogoutButton";
import { OverviewView } from "./components/OverviewView";
import { ModelsShowcaseView, ModelItem } from "./components/ModelsShowcaseView";
import { UserManagementView } from "./components/UserManagementView";
import { TopUpModal } from "./components/TopUpModal";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { Loader2, Car, ShieldAlert } from "lucide-react";
import { SessionUser } from "@/types/user";
import { DashboardStatsData } from "@/types/dashboard";

export type DashboardUser = SessionUser;

export default function DashboardPage() {
  const router = useRouter();

  // State
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Top Up & Subscription Modal States (Accessible across all tabs & headers)
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleUserUpdate = (updatedFields: Partial<DashboardUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
    // Also sync balance in stats if available
    setStats((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        user: { ...prev.user, ...updatedFields }
      };
    });
  };

  // 1. Initial Mount Initialization (Auth + Parallel Initial Data Fetch)
  useEffect(() => {
    let isCancelled = false;

    async function initDashboard() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/login?redirect=/dashboard");
          return;
        }
        const authData = await authRes.json();

        if (!authData.user) {
          router.push("/login?redirect=/dashboard");
          return;
        }

        if (!isCancelled) {
          setUser(authData.user);
          setAuthLoading(false);
        }

        // Fetch dashboard data in parallel
        const [statsRes, modelsRes, notifRes] = await Promise.allSettled([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/models?scope=all"),
          fetch("/api/notifications")
        ]);

        if (isCancelled) return;

        if (statsRes.status === "fulfilled" && statsRes.value.ok) {
          try {
            const statsData = await statsRes.value.json();
            if (!isCancelled) setStats(statsData.stats);
          } catch (e) {
            console.error("Stats parse error:", e);
          }
        }

        if (modelsRes.status === "fulfilled" && modelsRes.value.ok) {
          try {
            const modelsData = await modelsRes.value.json();
            if (!isCancelled) setModels(modelsData.models || []);
          } catch (e) {
            console.error("Models parse error:", e);
          }
        }

        if (notifRes.status === "fulfilled" && notifRes.value.ok) {
          try {
            const notifData = await notifRes.value.json();
            if (!isCancelled) {
              setNotifications(notifData.notifications || []);
              setUnreadCount(notifData.unreadCount || 0);
            }
          } catch (e) {
            console.error("Notif parse error:", e);
          }
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        if (!isCancelled) {
          setAuthLoading(false);
        }
      }
    }

    initDashboard();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  // On-demand refresh (triggered only after editing or deleting a model)
  const refreshModels = useCallback(async () => {
    try {
      const [modelsRes, statsRes] = await Promise.all([
        fetch("/api/dashboard/models?scope=all"),
        fetch("/api/dashboard/stats")
      ]);
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setModels(modelsData.models || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (e) {
      console.error("Refresh models error:", e);
    }
  }, []);

  // Notification handlers
  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Mark all as read error:", e);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Mark as read error:", e);
    }
  };

  // Guard tab: If regular user tries to open 'users', fallback to 'overview'
  const handleSelectTab = (tab: DashboardTab) => {
    if (tab === "users" && user?.role !== "SUPERUSER") {
      setActiveTab("overview");
    } else {
      setActiveTab(tab);
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <main className="w-full h-screen bg-[#07090e] flex flex-col items-center justify-center text-center p-6 select-none font-sans">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-cyan-950/40 border border-[#00e5ff]/40 flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.25)]">
            <Loader2 className="w-9 h-9 text-[#00e5ff] animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-black font-mono tracking-widest text-white uppercase">
            AUTHENTICATING DASHBOARD ACCESS...
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            MOD_CARBON SECURE PROTOCOL
          </p>
          <p className="text-[11px] text-slate-500 font-mono pt-2">
            Mengalihkan ke halaman login jika sesi tidak aktif...
          </p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-[#00e5ff] selection:text-slate-950">
      {/* 1. Left Sidebar Navigation */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        user={user}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        modelsCount={models.length}
        usersCount={stats?.admin?.totalUsers}
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
      />

      {/* Main Content Area (offset by left sidebar on desktop) */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* 2. Top Header with Notifications Popover */}
        <DashboardHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
          onMarkAsRead={handleMarkAsRead}
          onOpenTopUp={() => setIsTopUpOpen(true)}
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
        />

        {/* 3. Main Views Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-28">
          {activeTab === "overview" && (
            <OverviewView
              stats={stats}
              user={user}
              onNavigateTab={handleSelectTab}
              onUserUpdate={handleUserUpdate}
              onOpenTopUp={() => setIsTopUpOpen(true)}
              onOpenSubscription={() => setIsSubscriptionOpen(true)}
            />
          )}

          {activeTab === "models" && (
            <ModelsShowcaseView
              models={models}
              onRefreshModels={refreshModels}
              isSuperuser={user.role === "SUPERUSER"}
              currentUserId={user.id}
            />
          )}

          {activeTab === "users" && user.role === "SUPERUSER" && (
            <UserManagementView currentUserId={user.id} />
          )}

          {/* Access denied fallback if non-superuser somehow opens tab */}
          {activeTab === "users" && user.role !== "SUPERUSER" && (
            <div className="p-8 bg-red-950/30 border border-red-500/40 rounded-2xl text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                AKSES TERBATAS • SUPERUSER ONLY
              </h3>
              <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
                Anda login dengan role USER biasa. Halaman manajemen pengguna hanya dapat diakses oleh akun dengan role SUPERUSER.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs uppercase tracking-wider rounded-lg border border-slate-700"
              >
                KEMBALI KE OVERVIEW
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Global Top Up Saldo Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentBalance={user.balance ?? 0}
        onSuccess={(newBalance) => {
          handleUserUpdate({ balance: newBalance });
        }}
      />

      {/* Global Subscription Tier Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currentTier={user.subscriptionTier || "FREE"}
        balance={user.balance ?? 0}
        onSuccess={(newTier, newBalance) => {
          handleUserUpdate({
            subscriptionTier: newTier,
            isSubscribed: newTier !== "FREE",
            balance: newBalance
          });
        }}
      />

      {/* 3. Fixed / Floating Logout Button di Pojok Kanan Bawah */}
      <FloatingLogoutButton />
    </div>
  );
}
