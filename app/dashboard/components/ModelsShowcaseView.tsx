"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Box,
  Globe,
  Lock,
  ExternalLink,
  Edit3,
  Trash2,
  Sparkles,
  Plus,
  Car,
  Layers,
  CircleDot,
  Disc,
  User,
  Loader2,
  X
} from "lucide-react";
import { EditModelModal } from "./EditModelModal";

export interface ModelItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  colorName: string;
  colorHex: string;
  finish: string;
  wheelName: string;
  wheelId: string;
  caliperName: string;
  caliperHex: string;
  carbonPackage: boolean;
  carbonSpoiler: boolean;
  totalPrice: number;
  studioEnv: string;
  status: string;
  isPublic: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
}

interface ModelsShowcaseViewProps {
  models: ModelItem[];
  onRefreshModels: () => void;
  isSuperuser: boolean;
  currentUserId: string;
}

export const ModelsShowcaseView: React.FC<ModelsShowcaseViewProps> = ({
  models,
  onRefreshModels,
  isSuperuser,
  currentUserId
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "saved" | "public">("all");
  const [scopeFilter, setScopeFilter] = useState<"my" | "all">("my");
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered models
  const filteredModels = useMemo(() => {
    return models.filter((item) => {
      // Scope filter (if superuser)
      if (isSuperuser && scopeFilter === "my" && item.userId !== currentUserId) {
        return false;
      }

      // Status filter
      if (statusFilter === "public" && !item.isPublic) return false;
      if (statusFilter === "saved" && item.isPublic) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchColor = item.colorName.toLowerCase().includes(query);
        const matchWheel = item.wheelName.toLowerCase().includes(query);
        const matchAuthor = (item.user?.name?.toLowerCase().includes(query) || item.user?.email?.toLowerCase().includes(query)) ?? false;
        if (!matchTitle && !matchColor && !matchWheel && !matchAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [models, searchTerm, statusFilter, scopeFilter, isSuperuser, currentUserId]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus model 3D "${title}" secara permanen?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/dashboard/models/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        onRefreshModels();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus model");
      }
    } catch {
      alert("Terjadi gangguan koneksi");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSuccess = () => {
    onRefreshModels();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-black tracking-wider text-white uppercase flex items-center gap-2">
            <Box className="w-5 h-5 text-[#00e5ff]" />
            <span>3D MODEL SHOWCASE</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
              {filteredModels.length} Model
            </span>
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Katalog rancangan kustom 3D, siap di-render, diedit status publik, atau dibuka di studio.
          </p>
        </div>

        <Link
          href="/configurator"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>BUAT MODEL 3D BARU</span>
        </Link>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-[#090d16]/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center shadow-lg">
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama model, warna bodi, velg, atau pemilik..."
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

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Toggle for Superuser */}
          {isSuperuser && (
            <div className="flex bg-slate-950 border border-amber-500/30 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setScopeFilter("my")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  scopeFilter === "my"
                    ? "bg-amber-950/80 text-amber-300 font-bold border border-amber-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Model Saya
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter("all")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  scopeFilter === "all"
                    ? "bg-amber-950/80 text-amber-300 font-bold border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Semua User
              </button>
            </div>
          )}

          {/* Status Filter Pills: All, Saved, Public */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-900 text-[#00e5ff] font-bold border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("saved")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === "saved"
                  ? "bg-slate-900 text-[#00e5ff] font-bold border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Saved</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("public")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === "public"
                  ? "bg-slate-900 text-emerald-400 font-bold border border-emerald-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Grid Kartu 3D Model */}
      {filteredModels.length === 0 ? (
        <div className="py-16 bg-[#090d16]/60 border border-dashed border-slate-800 rounded-2xl text-center flex flex-col items-center px-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
            <Box className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wide mb-1">
            Tidak Ada Model yang Cocok
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 font-sans">
            {searchTerm
              ? `Tidak ditemukan model dengan kata kunci "${searchTerm}". Silakan ubah filter pencarian.`
              : "Belum ada model tersimpan dengan filter ini. Mulai buat konfigurasi di studio 3D!"}
          </p>

          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-xs uppercase tracking-wider rounded-lg border border-cyan-500/40"
            >
              Reset Filter Pencarian
            </button>
          ) : (
            <Link
              href="/configurator"
              className="px-6 py-2.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              BUKA 3D CONFIGURATOR
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((item) => (
            <div
              key={item.id}
              className="bg-[#090d16]/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Visual Thumbnail Preview Card */}
                <div className="relative h-44 bg-gradient-to-b from-[#0b101c] to-[#060910] border-b border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
                  {/* Subtle grid pattern background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                  {/* Ambient vehicle color glow */}
                  <div
                    className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-[60px] opacity-40 transition-opacity group-hover:opacity-60"
                    style={{ backgroundColor: item.colorHex }}
                  />

                  {/* Top Badges: Status & Model Format */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-1 ${
                        item.isPublic
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          : "bg-slate-900/90 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.isPublic ? (
                        <>
                          <Globe className="w-2.5 h-2.5 text-emerald-400" />
                          PUBLIC
                        </>
                      ) : (
                        <>
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          SAVED (PRIVATE)
                        </>
                      )}
                    </span>

                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      3D WEBGL READY
                    </span>
                  </div>

                  {/* Center Visual: Motorsport Swatch Graphic */}
                  <div className="relative z-10 flex items-center justify-center my-auto">
                    <div className="relative flex items-center justify-center">
                      {/* Outer Pulse Ring */}
                      <div
                        className="w-20 h-20 rounded-full border-2 border-dashed opacity-50 group-hover:rotate-45 transition-transform duration-700"
                        style={{ borderColor: item.colorHex }}
                      />
                      {/* Inner Swatch */}
                      <div
                        className="absolute w-14 h-14 rounded-full border-2 border-white/30 shadow-[0_0_25px_rgba(0,0,0,0.8)] flex items-center justify-center"
                        style={{ backgroundColor: item.colorHex }}
                      >
                        <Car className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip: Color & Finish Tag */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      {item.colorName}
                    </span>
                    <span className="text-cyan-400 uppercase tracking-widest font-bold">
                      {item.finish}
                    </span>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-4 space-y-3">
                  {/* Title & Author if Superuser */}
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-[#00e5ff] transition-colors uppercase tracking-wide truncate">
                      {item.title}
                    </h3>

                    {/* Author Tag (if viewing all models as superuser) */}
                    {isSuperuser && item.user && item.userId !== currentUserId && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-300 font-mono">
                        <User className="w-3 h-3 text-amber-400" />
                        <span className="truncate">By: {item.user?.name || item.user?.email || "Pilot"}</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Spec Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                    <div className="truncate">
                      <span className="text-slate-500 block text-[9px]">VELG</span>
                      <span className="text-slate-300 truncate font-semibold">
                        {item.wheelName}
                      </span>
                    </div>

                    <div className="truncate">
                      <span className="text-slate-500 block text-[9px]">KALIPER REM</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: item.caliperHex }}
                        />
                        <span className="text-slate-300 truncate font-semibold">
                          {item.caliperName}
                        </span>
                      </div>
                    </div>

                    <div className="truncate col-span-2 pt-1 border-t border-slate-850/80 flex items-center justify-between">
                      <span className="text-slate-500 text-[9px]">AEROKIT CARBON:</span>
                      <span className="text-cyan-400 font-semibold">
                        {item.carbonPackage ? "Full Autoclaved Carbon" : "Standard Aero"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Price & Action Buttons */}
              <div className="p-4 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">
                      BUILD PRICE
                    </span>
                    <span className="text-base font-black font-mono text-[#00e5ff]">
                      ${item.totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons: View 3D, Edit, Delete */}
                  <div className="flex items-center gap-1.5">
                    {/* View in 3D Configurator */}
                    <Link
                      href={`/configurator?buildId=${item.id}`}
                      className="px-3 py-1.5 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center gap-1 shadow-sm"
                      title="Buka di 3D Configurator"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>VIEW 3D</span>
                    </Link>

                    {/* Edit Model */}
                    <button
                      type="button"
                      onClick={() => setEditingModel(item)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors cursor-pointer"
                      title="Edit Nama / Status Publik"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Model */}
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/40 rounded transition-colors cursor-pointer"
                      title="Hapus Model"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Model Modal */}
      <EditModelModal
        isOpen={!!editingModel}
        onClose={() => setEditingModel(null)}
        model={editingModel}
        onSaveSuccess={handleEditSuccess}
      />
    </div>
  );
};
