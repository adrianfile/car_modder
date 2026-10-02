"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { InventoryItem } from "../../inventory/data";

interface InventoryCardProps {
  item: InventoryItem;
  isSelected?: boolean;
  onSelect: (item: InventoryItem) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  isSelected = false,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className={`group relative flex flex-col justify-between rounded-xl overflow-hidden cursor-pointer transition-all duration-200 bg-[#070b12] border ${
        isSelected
          ? "border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.25)] ring-1 ring-[#00e5ff]"
          : "border-slate-800/80 hover:border-[#00e5ff]/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      }`}
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-square bg-[#03060b] overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-transparent to-black/30 pointer-events-none" />

        {/* Category & 3D Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-slate-700 text-[#00e5ff]">
            {item.categoryLabel}
          </span>
          <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-[#00e5ff]/40 text-[#00e5ff] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
            3D
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#00e5ff]" />
            <span>{item.sku}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-[#00e5ff] transition-colors line-clamp-2 leading-snug">
            {item.name}
          </h3>

          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 line-clamp-1">
            {item.weight}
          </p>
        </div>
      </div>
    </div>
  );
};
