"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { InventoryItem } from "../../inventory/data";
import { Item3DViewer } from "./Item3DViewer";

interface ItemDetailModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [viewMode, setViewMode] = React.useState<"photo" | "3d">("photo");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#070b12] border border-slate-800 rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#090e18]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00e5ff] px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30">
              {item.categoryLabel}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {item.sku}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 text-left">
          {/* View Mode Toggle: Foto vs 3D */}
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
                  ? "bg-[#00e5ff] text-slate-950 font-black shadow-[0_0_12px_rgba(0,229,255,0.35)]"
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
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-800 bg-black">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[9px] font-mono text-slate-300 bg-black/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-700">
                <Sparkles className="w-3 h-3 text-[#00e5ff]" />
                <span>{item.finish}</span>
              </div>
            </div>
          )}

          {/* Title & Modding Tag */}
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
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
          <div className="border-t border-slate-800/60 pt-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Specs Table */}
          <div className="border-t border-slate-800/60 pt-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#00e5ff]" />
              Spesifikasi Teknis
            </h4>
            <div className="rounded-lg bg-[#04070d] border border-slate-800/80 overflow-hidden text-xs divide-y divide-slate-800/60">
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-400">Material</span>
                <span className="text-slate-200 font-medium text-right max-w-[60%]">
                  {item.material}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-400">Bobot</span>
                <span className="text-[#00e5ff] font-semibold text-right">
                  {item.weight}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2">
                <span className="text-slate-400">Fitment</span>
                <span className="text-slate-200 font-medium text-right max-w-[60%]">
                  {item.fitment}
                </span>
              </div>
              {item.specs.map((s, idx) => (
                <div key={idx} className="flex justify-between px-3 py-2">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="text-slate-200 font-medium text-right max-w-[60%]">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-slate-800/60 pt-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00e5ff]" />
              Fitur & Keunggulan
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {item.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5ff] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090e18] flex gap-2">
          <button
            type="button"
            className="flex-1 bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs py-3 rounded uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer text-center"
          >
            PASANG KE PROYEK MODIFIKASI
          </button>
          <button
            type="button"
            className="px-3.5 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs py-3 rounded uppercase tracking-wider cursor-pointer"
            title="Hubungi"
          >
            <PhoneCall className="w-4 h-4 text-[#00e5ff]" />
          </button>
        </div>
      </div>
    </div>
  );
};
