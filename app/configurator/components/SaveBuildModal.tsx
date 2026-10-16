"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  BookmarkCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  Car,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { CarConfigState } from "../types";

interface SaveBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CarConfigState;
  totalPrice: number;
  onSaveSuccess?: () => void;
}

export const SaveBuildModal: React.FC<SaveBuildModalProps> = ({
  isOpen,
  onClose,
  config,
  totalPrice,
  onSaveSuccess
}) => {
  const [title, setTitle] = useState(
    `Apex GT-R ${config.selectedColor.name} Edition`
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/configurator/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || `Apex GT-R ${config.selectedColor.name}`,
          colorName: config.selectedColor.name,
          colorHex: config.selectedColor.hex,
          finish: config.selectedFinish,
          wheelName: config.selectedWheel.name,
          wheelId: config.selectedWheel.id,
          caliperName: config.selectedCaliper.name,
          caliperHex: config.selectedCaliper.hex,
          carbonPackage: config.carbonPackage,
          carbonSpoiler: config.carbonSpoiler,
          totalPrice: totalPrice,
          studioEnv: config.studioEnv
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan konfigurasi");
        setSaving(false);
        return;
      }

      setSavedSuccess(true);
      if (onSaveSuccess) onSaveSuccess();
    } catch {
      setError("Terjadi kesalahan koneksi saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSavedSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#090d14] border border-cyan-500/40 rounded-xl shadow-[0_0_60px_rgba(0,229,255,0.2)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b10]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-[#00e5ff]">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wider text-white uppercase">
                SIMPAN KONFIGURASI KE GARAGE
              </h3>
              <p className="text-[10px] font-mono text-cyan-400">
                SAVED BUILDS • MOD_CARBON USER VAULT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {savedSuccess ? (
            <div className="py-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-[#00e5ff] flex items-center justify-center text-[#00e5ff] mb-4 shadow-[0_0_30px_rgba(0,229,255,0.3)] animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider mb-1">
                BERHASIL DISIMPAN KE GARAGE!
              </h4>
              <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed font-sans">
                Racikan modifikasi mobil <span className="text-[#00e5ff] font-semibold">"{title}"</span> telah tersimpan di akun Anda. Anda bisa membukanya kembali kapan saja dari profil.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <Link
                  href="/profile?tab=garage"
                  className="flex-1 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs uppercase tracking-wider rounded-md text-center transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>LIHAT DI GARAGE</span>
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider rounded-md border border-slate-700 transition-colors cursor-pointer"
                >
                  LANJUT RACIK
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-md text-red-300 text-xs">
                  {error}
                </div>
              )}

              {/* Input Build Title */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 tracking-wider uppercase">
                  NAMA / JUDUL RACIKAN
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Apex GT-R Track Spec v1"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-[#00e5ff] rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              {/* Spec Overview Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="text-[11px] font-mono text-cyan-400 tracking-wider uppercase border-b border-slate-800/80 pb-2 flex items-center justify-between">
                  <span>RANGKUMAN SPESIFIKASI</span>
                  <span className="text-white font-bold">APEX GT-R</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono">WARNA CAT</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: config.selectedColor.hex }}
                      />
                      <span className="text-slate-200 font-medium">
                        {config.selectedColor.name} ({config.selectedFinish.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono">VELG</span>
                    <span className="text-slate-200 font-medium mt-0.5 block">
                      {config.selectedWheel.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono">KALIPER REM</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ backgroundColor: config.selectedCaliper.hex }}
                      />
                      <span className="text-slate-200 font-medium">
                        {config.selectedCaliper.name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono">AERO PACKAGE</span>
                    <span className="text-slate-200 font-medium mt-0.5 block">
                      {config.carbonPackage ? "Full Carbon Aero" : "Standard Aero"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">TOTAL HARGA ESTIMASI</span>
                  <span className="text-base font-black font-mono text-[#00e5ff]">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-md transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>SIMPAN KE GARAGE</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
