"use client";

import React, { useState } from "react";
import { X, Zap, Crown, Check, Loader2, Sparkles, Shield, ArrowRight } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: "FREE" | "PRO" | "ENTERPRISE";
  balance: number;
  onSuccess: (newTier: "FREE" | "PRO" | "ENTERPRISE", newBalance: number) => void;
}

const TIERS = [
  {
    id: "FREE",
    name: "FREE TIER",
    price: 0,
    period: "Selamanya",
    desc: "Akses dasar studio 3D kustomisasi modifikasi",
    features: [
      "Simpan hingga 3 konfigurasi 3D",
      "Kustomisasi cat bodi standar",
      "Akses galeri publik komunitas",
      "Resolusi render standard HD"
    ],
    highlight: false,
    color: "slate"
  },
  {
    id: "PRO",
    name: "PRO STUDIO",
    price: 49,
    period: "/bulan",
    desc: "Untuk desainer dan car enthusiast supercar",
    features: [
      "Simpan konfigurasi 3D UNLIMITED",
      "Akses aerokit carbon & spoiler premium",
      "Ekspor snapshot 4K studio ultra HD",
      "Badge PRO terverifikasi di showroom",
      "Priority rendering engine"
    ],
    highlight: true,
    color: "cyan"
  },
  {
    id: "ENTERPRISE",
    name: "ENTERPRISE VIP",
    price: 199,
    period: "/bulan",
    desc: "Solusi lengkap bengkel modifikasi & tuner profesional",
    features: [
      "Semua fitur PRO tanpa batas",
      "Ekspor data CAD & wireframe 3D",
      "Custom bodykit request ke insinyur",
      "Dukungan teknis VIP 24/7 personal",
      "Akses eksklusif prototype parts baru"
    ],
    highlight: false,
    color: "amber"
  }
] as const;

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  balance,
  onSuccess
}) => {
  if (!isOpen) return null;

  const [selectedTier, setSelectedTier] = useState<"FREE" | "PRO" | "ENTERPRISE">(currentTier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activePlan = TIERS.find((t) => t.id === selectedTier) || TIERS[0];
  const isCurrent = currentTier === selectedTier;

  const handleSubscribe = async () => {
    if (isCurrent) return;

    if (activePlan.price > balance && currentTier === "FREE") {
      setError(`Saldo tidak mencukupi untuk paket ini ($${activePlan.price}). Saldo Anda: $${balance.toLocaleString()}. Silakan top up saldo terlebih dahulu.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui langganan");
      }

      setSuccessMsg(`Selamat! Akun Anda kini aktif pada paket ${selectedTier}!`);
      onSuccess(selectedTier, data.user?.balance ?? balance);

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses langganan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#080d16] border border-cyan-500/40 rounded-2xl shadow-[0_0_80px_rgba(0,229,255,0.25)] overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#060910] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00e5ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                PAKET LANGGANAN MOD_CARBON STUDIO
              </h3>
              <p className="text-[10px] font-mono text-cyan-400">
                Pilih paket kustomisasi 3D yang sesuai kebutuhan Anda
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

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* User Balance Reminder */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">
              Paket Saat Ini: <strong className="text-[#00e5ff]">{currentTier}</strong>
            </span>
            <span className="text-slate-400">
              Saldo Tersedia: <strong className="text-emerald-400 font-bold">${balance.toLocaleString()}</strong>
            </span>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((tier) => {
              const isSelected = selectedTier === tier.id;
              const isMyTier = currentTier === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id as any)}
                  className={`relative p-5 rounded-xl transition-all cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? tier.id === "ENTERPRISE"
                        ? "bg-amber-950/20 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                        : "bg-cyan-950/20 border-[#00e5ff] shadow-[0_0_30px_rgba(0,229,255,0.25)]"
                      : "bg-[#090d16]/90 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Active/Popular Tag */}
                  {isMyTier && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 uppercase tracking-wider shadow-sm">
                      PAKET AKTIF
                    </span>
                  )}
                  {tier.highlight && !isMyTier && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#00e5ff] text-slate-950 uppercase tracking-wider shadow-sm">
                      PALING POPULER
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {tier.id === "ENTERPRISE" ? (
                        <Crown className="w-4 h-4 text-amber-400" />
                      ) : tier.id === "PRO" ? (
                        <Zap className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Shield className="w-4 h-4 text-slate-400" />
                      )}
                      <h4 className="text-xs font-black tracking-wider text-white uppercase">
                        {tier.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-black font-mono text-white">
                        ${tier.price}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {tier.period}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 mb-4 leading-relaxed">
                      {tier.desc}
                    </p>

                    <div className="space-y-2 border-t border-slate-800/80 pt-4">
                      {tier.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <button
                      type="button"
                      className={`w-full py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                        isMyTier
                          ? "bg-slate-800 text-slate-400 cursor-default"
                          : isSelected
                          ? "bg-[#00e5ff] text-slate-950 shadow-md font-black"
                          : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                      }`}
                    >
                      {isMyTier ? "Paket Saat Ini" : isSelected ? "Pilih Paket Ini" : "Pilih"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              disabled={loading || isCurrent}
              onClick={handleSubscribe}
              className="px-6 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] disabled:opacity-40 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MEMPROSES LANGGANAN...</span>
                </>
              ) : isCurrent ? (
                <span>PAKET SUDAH AKTIF</span>
              ) : (
                <>
                  <span>AKTIFKAN PAKET {selectedTier} (${activePlan.price})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
