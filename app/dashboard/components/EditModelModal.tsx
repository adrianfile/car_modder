"use client";

import React, { useState } from "react";
import {
  X,
  Edit3,
  Globe,
  Lock,
  Loader2,
  CheckCircle2,
  Sparkles,
  Car
} from "lucide-react";

interface SavedModelItem {
  id: string;
  title: string;
  description?: string | null;
  colorName: string;
  colorHex: string;
  finish: string;
  wheelName: string;
  caliperName: string;
  carbonPackage: boolean;
  totalPrice: number;
  isPublic: boolean;
  status: string;
}

interface EditModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: SavedModelItem | null;
  onSaveSuccess: (updatedModel: SavedModelItem) => void;
}

export const EditModelModal: React.FC<EditModelModalProps> = ({
  isOpen,
  onClose,
  model,
  onSaveSuccess
}) => {
  if (!isOpen || !model) return null;

  const [title, setTitle] = useState(model.title);
  const [description, setDescription] = useState(model.description || "");
  const [isPublic, setIsPublic] = useState(model.isPublic);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/dashboard/models/${model.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          isPublic
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memperbarui model");
        setSaving(false);
        return;
      }

      onSaveSuccess({
        ...model,
        title,
        description,
        isPublic,
        status: isPublic ? "public" : "saved"
      });
      onClose();
    } catch {
      setError("Terjadi gangguan koneksi ke server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#090d16] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(0,229,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#070a10] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-[#00e5ff]">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-widest text-white uppercase">
                EDIT DETAIL 3D MODEL
              </h3>
              <p className="text-[10px] font-mono text-cyan-400">
                MOD_CARBON SHOWCASE SETTINGS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Model Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              NAMA / JUDUL MODEL
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Apex GT-R Track Edition"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-[#00e5ff] rounded-lg text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              CATATAN / DESKRIPSI SPESIFIKASI (OPSIONAL)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Fitment velg satin black, upgrade ceramic brake package..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-[#00e5ff] rounded-lg text-sm text-white focus:outline-none transition-colors font-sans"
            />
          </div>

          {/* Visibility Status Toggle: Public vs Saved */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              STATUS VISIBILITAS SHOWCASE
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  !isPublic
                    ? "bg-slate-900 border-[#00e5ff] text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>SAVED (PRIVATE)</span>
                  </div>
                  {!isPublic && <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5ff]" />}
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Hanya Anda yang dapat melihat dan membuka build ini.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isPublic
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-emerald-400">
                    <Globe className="w-3.5 h-3.5" />
                    <span>PUBLIC SHOWCASE</span>
                  </div>
                  {isPublic && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Ditampilkan di galeri publik MOD_CARBON.
                </span>
              </button>
            </div>
          </div>

          {/* Quick Specs Overview */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950 rounded-lg text-xs font-mono text-slate-400 border border-slate-850">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20"
                style={{ backgroundColor: model.colorHex }}
              />
              <span className="text-white font-medium">{model.colorName}</span>
            </div>
            <span className="text-[#00e5ff] font-bold">
              ${model.totalPrice.toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              BATAL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <span>SIMPAN PERUBAHAN</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
