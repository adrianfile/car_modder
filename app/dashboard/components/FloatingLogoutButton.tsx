"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, AlertCircle, X } from "lucide-react";

export const FloatingLogoutButton: React.FC = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* Confirmation Modal if triggered */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#090d16] border border-red-500/40 rounded-xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-red-400 font-black text-sm uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>KONFIRMASI SIGN OUT</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed font-sans">
              Apakah Anda yakin ingin keluar dari sesi dashboard MOD_CARBON? Anda perlu login kembali untuk mengakses studio dan konfigurasi Anda.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-3.5 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>LOGGING OUT...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>YA, KELUAR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Fixed Container di Pojok Kanan Bawah */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-950/40 hover:bg-red-600/90 text-red-400 hover:text-white border border-red-500/40 hover:border-red-400 backdrop-blur-md shadow-[0_4px_25px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_35px_rgba(239,68,68,0.6)] transition-all duration-300 cursor-pointer"
          title="Keluar dari Akun"
        >
          {/* Subtle Ambient Red Glow Ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-red-600/20 to-red-500/10 blur opacity-60 group-hover:opacity-100 transition duration-300" />

          <div className="relative flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              LOGOUT
            </span>
          </div>
        </button>
      </div>
    </>
  );
};
