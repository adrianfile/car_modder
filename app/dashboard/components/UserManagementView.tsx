"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Box,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
  X,
  Wallet,
  Zap,
  Crown,
  Sliders,
  DollarSign,
  ArrowUpDown
} from "lucide-react";
import { ManageUserModal } from "./ManageUserModal";
import { ManagedUser } from "@/types/user";

export type { ManagedUser };

interface UserManagementViewProps {
  currentUserId: string;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUserId
}) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "SUPERUSER">("ALL");
  const [subFilter, setSubFilter] = useState<"ALL" | "SUBSCRIBED" | "FREE" | "PRO" | "ENTERPRISE">("ALL");
  const [sortBy, setSortBy] = useState<"latest" | "balance_desc" | "balance_asc" | "models_desc">("latest");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [managingUser, setManagingUser] = useState<ManagedUser | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch users list
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      } else {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Gagal mengambil data user"
        });
      }
    } catch {
      setFeedbackMsg({
        type: "error",
        text: "Terjadi gangguan koneksi ke server"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      // Role filter
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

      // Subscription filter
      if (subFilter === "SUBSCRIBED" && !u.isSubscribed) return false;
      if (subFilter === "FREE" && (u.isSubscribed || u.subscriptionTier !== "FREE")) return false;
      if (subFilter === "PRO" && u.subscriptionTier !== "PRO") return false;
      if (subFilter === "ENTERPRISE" && u.subscriptionTier !== "ENTERPRISE") return false;

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "balance_desc") {
        return (b.balance || 0) - (a.balance || 0);
      }
      if (sortBy === "balance_asc") {
        return (a.balance || 0) - (b.balance || 0);
      }
      if (sortBy === "models_desc") {
        return (b._count?.savedBuilds ?? 0) - (a._count?.savedBuilds ?? 0);
      }
      // default: latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [users, searchTerm, roleFilter, subFilter, sortBy]);

  // Handle role toggle
  const handleToggleRole = async (targetUser: ManagedUser) => {
    const newRole: "USER" | "SUPERUSER" =
      targetUser.role === "SUPERUSER" ? "USER" : "SUPERUSER";

    if (
      targetUser.id === currentUserId &&
      newRole === "USER" &&
      !confirm("PERINGATAN: Anda sedang menurunkan hak akses SUPERUSER akun Anda sendiri. Lanjutkan?")
    ) {
      return;
    }

    setUpdatingId(targetUser.id);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Gagal mengubah role"
        });
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, role: newRole } : u
          )
        );
        setFeedbackMsg({
          type: "success",
          text: `Role ${targetUser.email} berhasil diubah ke ${newRole}`
        });
      }
    } catch {
      setFeedbackMsg({
        type: "error",
        text: "Terjadi kesalahan saat menghubungi server"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUserManagedSuccess = (updatedUser: ManagedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    setFeedbackMsg({
      type: "success",
      text: `Data saldo & langganan ${updatedUser.email} berhasil diperbarui.`
    });
  };

  // Metrics
  const totalSuperusers = users.filter((u) => u.role === "SUPERUSER").length;
  const totalRegularUsers = users.filter((u) => u.role === "USER").length;
  const totalSubscribers = users.filter((u) => u.isSubscribed).length;
  const totalPlatformBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. View Header with Counts */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black tracking-wider text-white uppercase flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>USER MANAGEMENT, SUBSCRIPTION & BALANCE CONTROL</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold uppercase">
              SUPERUSER ONLY
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Pantau seluruh pengguna, status langganan PRO/ENTERPRISE, dan jumlah saldo deposit akun setiap pengguna.
          </p>
        </div>

        {/* Global Platform Metrics Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <span className="text-slate-400 text-[10px] block">TOTAL USERS</span>
            <span className="text-white font-bold">{users.length}</span>
          </div>

          <div className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-500/40 rounded-lg text-xs font-mono">
            <span className="text-cyan-400 text-[10px] block flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> SUBSCRIBERS
            </span>
            <span className="text-cyan-300 font-bold">{totalSubscribers} Aktif</span>
          </div>

          <div className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs font-mono">
            <span className="text-emerald-400 text-[10px] block flex items-center gap-1">
              <Wallet className="w-2.5 h-2.5" /> TOTAL SALDO USER
            </span>
            <span className="text-emerald-300 font-bold font-mono">
              ${totalPlatformBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="px-3 py-1.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs font-mono">
            <span className="text-amber-400 text-[10px] block">SUPERUSER</span>
            <span className="text-amber-300 font-bold">{totalSuperusers}</span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono flex items-center justify-between gap-2 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-200"
              : "bg-red-950/60 border border-red-500/50 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Filter, Search & Sort Toolbar */}
      <div className="bg-[#090d16]/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari user berdasarkan nama atau email..."
              className="w-full pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 focus:border-[#00e5ff] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 text-[10px] uppercase">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-mono text-xs outline-none cursor-pointer"
              >
                <option value="latest" className="bg-[#090d16]">Terbaru Bergabung</option>
                <option value="balance_desc" className="bg-[#090d16]">Saldo Tertinggi</option>
                <option value="balance_asc" className="bg-[#090d16]">Saldo Terendah</option>
                <option value="models_desc" className="bg-[#090d16]">Model 3D Terbanyak</option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              title="Muat Ulang Daftar"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Badges Row (Role + Subscription) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-850">
          {/* Role Filter */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase mr-1">Role:</span>
            <button
              type="button"
              onClick={() => setRoleFilter("ALL")}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                roleFilter === "ALL"
                  ? "bg-slate-800 text-[#00e5ff] font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("SUPERUSER")}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                roleFilter === "SUPERUSER"
                  ? "bg-amber-950/80 text-amber-300 font-bold border border-amber-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Superuser ({totalSuperusers})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("USER")}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                roleFilter === "USER"
                  ? "bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              User Biasa ({totalRegularUsers})
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Subscription Filter */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase mr-1">Langganan:</span>
            <button
              type="button"
              onClick={() => setSubFilter("ALL")}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                subFilter === "ALL"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSubFilter("SUBSCRIBED")}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1 ${
                subFilter === "SUBSCRIBED"
                  ? "bg-cyan-950 text-[#00e5ff] font-bold border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-2.5 h-2.5" />
              <span>Berlangganan ({totalSubscribers})</span>
            </button>
            <button
              type="button"
              onClick={() => setSubFilter("FREE")}
              className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                subFilter === "FREE"
                  ? "bg-slate-850 text-slate-200 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Free Tier
            </button>
            <button
              type="button"
              onClick={() => setSubFilter("PRO")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                subFilter === "PRO"
                  ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              PRO
            </button>
            <button
              type="button"
              onClick={() => setSubFilter("ENTERPRISE")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all ${
                subFilter === "ENTERPRISE"
                  ? "bg-amber-950 text-amber-300 font-bold border border-amber-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ENTERPRISE
            </button>
          </div>
        </div>
      </div>

      {/* 3. User Table Container */}
      <div className="bg-[#090d16]/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
            <span className="text-xs font-mono uppercase tracking-wider">
              Memuat data pengguna dari database...
            </span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            Tidak ada pengguna yang cocok dengan filter atau pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono text-slate-400 uppercase bg-[#060910] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">PENGGUNA</th>
                  <th className="py-3.5 px-4">EMAIL</th>
                  <th className="py-3.5 px-4">ROLE</th>
                  <th className="py-3.5 px-4">PAKET LANGGANAN</th>
                  <th className="py-3.5 px-4">SALDO DEPOSIT ($)</th>
                  <th className="py-3.5 px-4 text-center">TOTAL 3D MODEL</th>
                  <th className="py-3.5 px-4">AKSI KONTROL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUserId;
                  const isUpdating = updatingId === u.id;
                  const isSuper = u.role === "SUPERUSER";

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isCurrent ? "bg-cyan-950/15" : ""
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-850 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                            {u.image ? (
                              <img
                                src={u.image}
                                alt={u.name || "User"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[#00e5ff]">
                                {(u.name || u.email || "U").substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">
                              {u.name || "Anonymous Pilot"}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono text-[#00e5ff] uppercase font-bold block">
                                (AKUN ANDA)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleRole(u)}
                          className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                            isSuper
                              ? "bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:bg-amber-900/80"
                              : "bg-slate-900 text-cyan-300 border border-cyan-800/60 hover:bg-slate-800"
                          }`}
                          title="Klik untuk toggle Role (USER / SUPERUSER)"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isSuper ? (
                            <ShieldAlert className="w-3 h-3 text-amber-400" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-cyan-400" />
                          )}
                          <span>{u.role}</span>
                        </button>
                      </td>

                      {/* Subscription Status & Tier */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${
                              u.subscriptionTier === "ENTERPRISE"
                                ? "bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                                : u.subscriptionTier === "PRO"
                                ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                                : "bg-slate-900 text-slate-400 border-slate-700"
                            }`}
                          >
                            {u.subscriptionTier === "ENTERPRISE" ? (
                              <Crown className="w-3 h-3 text-amber-400" />
                            ) : u.subscriptionTier === "PRO" ? (
                              <Zap className="w-3 h-3 text-cyan-400" />
                            ) : null}
                            <span>{u.subscriptionTier || (u.isSubscribed ? "PRO" : "FREE")}</span>
                          </span>

                          <span className={`w-2 h-2 rounded-full ${u.isSubscribed ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} title={u.isSubscribed ? "Langganan Aktif" : "Free"} />
                        </div>
                      </td>

                      {/* Account Balance */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-emerald-300">
                            ${(u.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      {/* Total Saved 3D Models */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-850 font-mono text-xs font-black text-[#00e5ff]">
                          <Box className="w-3 h-3 text-cyan-400" />
                          <span>{u._count?.savedBuilds ?? 0}</span>
                        </span>
                      </td>

                      {/* Action: Open Management Modal */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setManagingUser(u)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/80 text-amber-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                          <span>KELOLA</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Superuser Manage Modal (Balance & Subscription) */}
      <ManageUserModal
        isOpen={Boolean(managingUser)}
        onClose={() => setManagingUser(null)}
        targetUser={managingUser}
        onSuccess={handleUserManagedSuccess}
      />
    </div>
  );
};
