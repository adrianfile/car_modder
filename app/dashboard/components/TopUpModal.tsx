"use client";

import React, { useState } from "react";
import { X, Wallet, Loader2, CheckCircle2, ArrowRight, DollarSign } from "lucide-react";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onSuccess
}) => {
  if (!isOpen) return null;

  const [selectedPreset, setSelectedPreset] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeAmount = customAmount ? Number(customAmount) : (selectedPreset || 0);

  const handleTopUp = async () => {
    if (activeAmount <= 0) {
      setError("Masukkan nominal top up yang valid (minimal $1).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: activeAmount })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan top up");
      }

      setSuccessMsg(`Top up $${activeAmount.toLocaleString()} berhasil ditambahkan!`);
      onSuccess(data.balance);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Terjadi gangguan saat memproses top up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#090d16] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,229,255,0.2)] overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#070a12] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                TOP UP SALDO AKUN
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                MOD_CARBON SECURE VAULT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current balance card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Saldo Saat Ini</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Pilih Nominal Deposit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(amt);
                    setCustomAmount("");
                  }}
                  className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all border ${
                    selectedPreset === amt && !customAmount
                      ? "bg-[#00e5ff] text-slate-950 border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Atau Masukkan Nominal Kustom ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                min="1"
                placeholder="Contoh: 1500"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedPreset(null);
                }}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-[#00e5ff] rounded-xl text-white font-mono text-sm outline-none transition-colors"
              />
            </div>
          </div>

          {/* Success or Error Alert */}
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

          {/* Submit Action */}
          <button
            type="button"
            disabled={loading || activeAmount <= 0}
            onClick={handleTopUp}
            className="w-full py-3 bg-[#00e5ff] hover:bg-[#33ebff] disabled:opacity-50 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.35)] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>MEMPROSES DEPOSIT...</span>
              </>
            ) : (
              <>
                <span>DEPOSIT SEKARANG (${activeAmount.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
