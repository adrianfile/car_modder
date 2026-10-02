"use client";

import React, { useState } from "react";
import { X, CheckCircle, ShieldCheck, Download, Share2, Sparkles } from "lucide-react";
import { CarConfigState } from "../types";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CarConfigState;
  totalPrice: number;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  config,
  totalPrice
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#090d14] border border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b10]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00e5ff]" />
            <h3 className="text-base font-black tracking-wider text-white uppercase">
              MOD_CARBON • CUSTOM BUILD SPEC SHEET
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff] mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">
                BUILD RESERVATION SUBMITTED
              </h4>
              <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
                Terima kasih! Spesifikasi kustomisasi mobil Anda telah tercatat dengan ID Build{" "}
                <span className="font-mono text-[#00e5ff]">#MC-APEX-{(Math.random() * 10000).toFixed(0)}</span>.
                Tim engineer ModCarbon akan menghubungi Anda untuk konfirmasi proses fabrikasi.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-bold text-xs uppercase tracking-widest rounded-sm transition-all"
              >
                KEMBALI KE CONFIGURATOR
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Build Specification Summary Card */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/60">
                  <span className="font-mono text-slate-400">VEHICLE BASE</span>
                  <span className="font-bold text-white">APEX GT-R CARBON SERIES</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Exterior Paint</span>
                    <span className="font-semibold text-slate-200">
                      {config.selectedColor.name} ({config.selectedFinish.toUpperCase()})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Wheels / Velg</span>
                    <span className="font-semibold text-slate-200">{config.selectedWheel.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Brake Caliper</span>
                    <span className="font-semibold text-slate-200">{config.selectedCaliper.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Aero Carbon Pack</span>
                    <span className="font-semibold text-slate-200">
                      {config.carbonPackage ? "Full Pre-Preg Autoclaved" : "Standard Aero"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-sm">
                  <span className="font-black text-slate-300">ESTIMATED TOTAL BUILD</span>
                  <span className="font-mono text-lg font-black text-[#00e5ff]">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Client Info Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono tracking-widest text-[#00e5ff] uppercase">
                  Kontak Pemesan / Reservation Info
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      NAMA LENGKAP
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Adrian Wicaksono"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      EMAIL
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="adrian@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    NOMOR WHATSAPP / TELEPON
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+62 812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    CATATAN KHUSUS / FITMENT REQUEST (OPSIONAL)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Request offset velg flush fender, custom ceramic coating..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer"
                >
                  SUBMIT BUILD RESERVATION
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
