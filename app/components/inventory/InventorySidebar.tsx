"use client";

import React from "react";
import {
  Layers,
  Disc,
  CircleDot,
  Car,
  Wind,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { INVENTORY_CATEGORIES, InventoryCategory } from "../../inventory/data";

interface InventorySidebarProps {
  selectedCategory: InventoryCategory;
  onSelectCategory: (category: InventoryCategory) => void;
  categoryCounts: Record<InventoryCategory, number>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-4 h-4" />,
  Disc: <Disc className="w-4 h-4" />,
  CircleDot: <CircleDot className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  Wind: <Wind className="w-4 h-4" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4" />,
};

export const InventorySidebar: React.FC<InventorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[#070b12] border border-slate-800/60 rounded-xl p-4 lg:p-5 flex flex-col gap-6 shadow-xl max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></span>
          <span className="text-[11px] font-black tracking-widest text-[#00e5ff] uppercase">
            PARTS CATALOG
          </span>
        </div>
        <h2 className="text-lg font-black tracking-wider text-white uppercase">
          Inventory Menu
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Komponen racing & serat karbon pre-preg bersertifikasi.
        </p>
      </div>

      {/* Categories Nav */}
      <nav className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pb-1">
          Kategori Komponen
        </span>
        {INVENTORY_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? cat.count;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${isActive
                  ? "bg-[#00e5ff]/10 text-white border border-[#00e5ff]/40 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`transition-colors duration-200 ${isActive ? "text-[#00e5ff]" : "text-slate-400 group-hover:text-slate-300"
                    }`}
                >
                  {CATEGORY_ICONS[cat.icon]}
                </span>
                <span>{cat.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors ${isActive
                      ? "bg-[#00e5ff] text-slate-950 font-black"
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                    }`}
                >
                  {count}
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive
                      ? "text-[#00e5ff] translate-x-0.5"
                      : "text-slate-400 opacity-0 group-hover:opacity-100"
                    }`}
                />
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
