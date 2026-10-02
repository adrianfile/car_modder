"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Package,
  Wrench,
  Download,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { InventoryItem } from "../../inventory/data";
import { Item3DViewer } from "./Item3DViewer";

interface ItemDetailPanelProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export const ItemDetailPanel: React.FC<ItemDetailPanelProps> = ({ item, onClose }) => {
  const [viewMode, setViewMode] = React.useState<"photo" | "3d">("photo");

  if (!item) {
    return (
      <aside className="w-80 xl:w-96 shrink-0 bg-[#070b12] border border-slate-800/60 rounded-xl p-6 hidden lg:flex flex-col items-center justify-center text-center text-slate-400 min-h-[500px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <Package className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-200">
          Pilih Komponen
        </h4>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          Klik salah satu item pada daftar inventory di tengah untuk melihat rincian spesifikasi teknis dan ketersediaan stok di sini.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-80 xl:w-96 shrink-0 bg-[#070b12] border border-slate-800/60 rounded-xl overflow-hidden hidden lg:flex flex-col shadow-2xl sticky top-24 max-h-[calc(100vh-7rem)]">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#090e18]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00e5ff] px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30">
            {item.categoryLabel}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {item.sku}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/60 transition-colors cursor-pointer"
          title="Tutup Panel Detail"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto p-5 space-y-4 text-left custom-scrollbar">
        {/* View Mode Toggle: Foto 2D vs 3D Interactive */}
        <div className="flex items-center p-1 rounded-lg bg-[#04070d] border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("photo")}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === "photo"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Foto Detail</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === "3d"
                ? "bg-[#00e5ff] text-slate-950 font-black shadow-[0_0_15px_rgba(0,229,255,0.35)]"
                : "text-slate-400 hover:text-[#00e5ff]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
            <span>Lihat Model 3D</span>
          </button>
        </div>

        {/* Media Preview: 2D Photo or 3D Interactive Model */}
        {viewMode === "3d" ? (
          <Item3DViewer category={item.category} itemName={item.name} modelUrl={item.modelUrl} />
        ) : (
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-800/80 bg-black">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-black/70 backdrop-blur-sm px-2 py-1 rounded border border-slate-700">
              <Sparkles className="w-3 h-3 text-[#00e5ff]" />
              <span>{item.finish}</span>
            </div>
          </div>
        )}

        {/* Title & Modding Tag */}
        <div>
          <h3 className="text-base font-black text-white leading-tight uppercase tracking-wide">
            {item.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#00e5ff] bg-[#00e5ff]/10 border border-[#00e5ff]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Mod Part Ready
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
              {item.fitment}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-slate-800/60 pt-3.5">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
            Deskripsi Komponen
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Technical Specs Table */}
        <div className="border-t border-slate-800/60 pt-3.5">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#00e5ff]" />
            Spesifikasi Teknis
          </h4>
          <div className="rounded-lg bg-[#04070d] border border-slate-800/80 overflow-hidden text-xs">
            <div className="flex justify-between px-3 py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Material</span>
              <span className="text-slate-200 font-semibold text-right max-w-[55%]">
                {item.material}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Bobot</span>
              <span className="text-[#00e5ff] font-semibold text-right">
                {item.weight}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Fitment</span>
              <span className="text-slate-200 font-semibold text-right max-w-[55%]">
                {item.fitment}
              </span>
            </div>
            {item.specs.map((s, idx) => (
              <div
                key={idx}
                className="flex justify-between px-3 py-2 border-b last:border-b-0 border-slate-800/60"
              >
                <span className="text-slate-400">{s.label}</span>
                <span className="text-slate-200 font-semibold text-right max-w-[55%]">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Checklist */}
        <div className="border-t border-slate-800/60 pt-3.5">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00e5ff]" />
            Keunggulan Utama
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {item.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5ff] shrink-0 mt-0.5" />
                <span className="text-slate-300">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090e18] flex flex-col gap-2 mt-auto">
        <button
          type="button"
          className="w-full bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs py-3 rounded uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer text-center"
        >
          PASANG KE PROYEK MODIFIKASI
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-[10px] py-2 rounded uppercase tracking-wider transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3 h-3 text-[#00e5ff]" />
            Cek Fitment
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-[10px] py-2 rounded uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3 text-[#00e5ff]" />
            Spec Sheet
          </button>
        </div>
      </div>
    </aside>
  );
};
