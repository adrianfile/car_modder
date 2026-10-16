"use client";

import React, { useState } from "react";
import { X, Wallet, Zap, Crown, Shield, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { ManagedUser } from "./UserManagementView";

interface ManageUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: ManagedUser | null;
  onSuccess: (updatedUser: ManagedUser) => void;
}

export const ManageUserModal: React.FC<ManageUserModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSuccess
}) => {
  if (!isOpen || !targetUser) return null;

  const [activeTab, setActiveTab] = useState<"balance" | "subscription">("balance");
  
  // Balance state
  const [balanceMode, setBalanceMode] = useState<"add" | "deduct" | "set">("add");
  const [balanceAmount, setBalanceAmount] = useState<string>("100");

  // Subscription state
  const [selectedTier, setSelectedTier] = useState<"FREE" | "PRO" | "ENTERPRISE">(
    targetUser.subscriptionTier || (targetUser.isSubscribed ? "PRO" : "FREE")
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload: any = { action: activeTab };

      if (activeTab === "balance") {
        const amt = Number(balanceAmount);
        if (isNaN(amt) || amt < 0) {
          throw new Error("Nominal saldo harus angka valid.");
        }
        payload.balanceAmount = amt;
        payload.balanceMode = balanceMode;
      } else {
        payload.subscriptionTier = selectedTier;
      }

      const res = await fetch(`/api/admin/users/${targetUser.id}/manage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui data pengguna");
      }

      setSuccessMsg("Perubahan berhasil disimpan!");
      onSuccess(data.user);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#090d16] border border-amber-500/40 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#070a10] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                SUPERUSER CONTROL PANEL
              </h3>
              <p className="text-[10px] font-mono text-amber-400">
                Kelola Saldo & Paket: {targetUser.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-[#06090e]">
          <button
            type="button"
            onClick={() => setActiveTab("balance")}
            className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "balance"
                ? "border-emerald-400 text-emerald-300 bg-emerald-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>PENYESUAIAN SALDO</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscription")}
            className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "subscription"
                ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>PAKET LANGGANAN</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* User Current Info Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">PENGGUNA</span>
              <span className="font-bold text-white">{targetUser.name || "Anonymous Pilot"}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">SALDO SAAT INI</span>
              <span className="font-bold text-emerald-400">
                ${(targetUser.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* TAB 1: BALANCE ADJUSTMENT */}
          {activeTab === "balance" && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Tipe Operasi Saldo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceMode("add")}
                    className={`py-2 px-3 rounded-lg font-mono text-xs font-bold border transition-all ${
                      balanceMode === "add"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white"
                    }`}
                  >
                    + Tambah (Credit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceMode("deduct")}
                    className={`py-2 px-3 rounded-lg font-mono text-xs font-bold border transition-all ${
                      balanceMode === "deduct"
                        ? "bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white"
                    }`}
                  >
                    - Kurang (Debit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceMode("set")}
                    className={`py-2 px-3 rounded-lg font-mono text-xs font-bold border transition-all ${
                      balanceMode === "set"
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white"
                    }`}
                  >
                    = Set Tetap
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Nominal Saldo ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-white font-mono text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Simulation Result */}
              <div className="p-3 rounded-lg bg-[#060a10] border border-slate-800 text-xs font-mono flex items-center justify-between">
                <span className="text-slate-400">Estimasi Saldo Akhir:</span>
                <span className="font-bold text-white">
                  ${(
                    balanceMode === "add"
                      ? targetUser.balance + Number(balanceAmount || 0)
                      : balanceMode === "deduct"
                      ? Math.max(0, targetUser.balance - Number(balanceAmount || 0))
                      : Math.max(0, Number(balanceAmount || 0))
                  ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION ASSIGNMENT */}
          {activeTab === "subscription" && (
            <div className="space-y-3">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Pilih Paket Langganan Untuk Pengguna Ini
              </label>

              {(["FREE", "PRO", "ENTERPRISE"] as const).map((tier) => {
                const isSelected = selectedTier === tier;
                return (
                  <div
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? tier === "ENTERPRISE"
                          ? "bg-amber-950/30 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          : tier === "PRO"
                          ? "bg-cyan-950/30 border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                          : "bg-slate-900 border-slate-600"
                        : "bg-slate-950 border-slate-850 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                        {tier === "ENTERPRISE" ? (
                          <Crown className="w-4 h-4 text-amber-400" />
                        ) : tier === "PRO" ? (
                          <Zap className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase tracking-wider">
                            {tier} TIER
                          </span>
                          {targetUser.subscriptionTier === tier && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              Saat Ini
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {tier === "ENTERPRISE"
                            ? "Akses penuh VIP, CAD export, Prioritas"
                            : tier === "PRO"
                            ? "Unlimited saves, Spoiler Carbon, 4K snapshot"
                            : "Akses kustomisasi dasar studio 3D"}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-white">
                      {tier === "ENTERPRISE" ? "$199/bln" : tier === "PRO" ? "$49/bln" : "$0"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <>
                  <span>SIMPAN PERUBAHAN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
