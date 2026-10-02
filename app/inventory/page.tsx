"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    Search,
    Filter,
    SlidersHorizontal,
    Layers,
    Disc,
    CircleDot,
    Car,
    Wind,
    ShieldAlert,
    Sparkles,
} from "lucide-react";
import {
    INVENTORY_ITEMS,
    INVENTORY_CATEGORIES,
    InventoryCategory,
    InventoryItem,
} from "./data";
import { InventorySidebar } from "../components/inventory/InventorySidebar";
import { InventoryCard } from "../components/inventory/InventoryCard";
import { ItemDetailPanel } from "../components/inventory/ItemDetailPanel";
import { ItemDetailModal } from "../components/inventory/ItemDetailModal";

export default function InventoryPage() {
    const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDesktopItem, setSelectedDesktopItem] = useState<InventoryItem | null>(null);
    const [selectedMobileItem, setSelectedMobileItem] = useState<InventoryItem | null>(null);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [isMobileScreen, setIsMobileScreen] = useState(false);

    // Detect screen size for desktop vs mobile behavior
    useEffect(() => {
        const checkScreen = () => {
            setIsMobileScreen(window.innerWidth < 1024);
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    // Filter items by category & search query
    const filteredItems = useMemo(() => {
        return INVENTORY_ITEMS.filter((item) => {
            const matchCategory =
                selectedCategory === "all" || item.category === selectedCategory;
            const matchSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.fitment.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [selectedCategory, searchQuery]);

    // Compute category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<InventoryCategory, number> = {
            all: INVENTORY_ITEMS.length,
            velg: 0,
            ban: 0,
            "kap-mesin": 0,
            spoiler: 0,
            rem: 0,
        };
        INVENTORY_ITEMS.forEach((item) => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return counts;
    }, []);

    // Handle item click based on device
    const handleItemClick = (item: InventoryItem) => {
        if (isMobileScreen) {
            setSelectedMobileItem(item);
            setIsMobileModalOpen(true);
        } else {
            setSelectedDesktopItem(item);
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">

            {/* Mobile Horizontal Category Pills (for quick touch access on phones) */}
            <div className="lg:hidden border-b border-slate-800/60 bg-[#070b12]/90 backdrop-blur-md px-4 py-3 sticky top-20 z-30 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-2 min-w-max">
                    {INVENTORY_CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${isActive
                                    ? "bg-[#00e5ff] text-slate-950 font-black shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                                    : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                                    }`}
                            >
                                <span>{cat.label}</span>
                                <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
                                        }`}
                                >
                                    {categoryCounts[cat.id]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Sidebar Menu (Velg, Ban, Kap Mesin, Spoiler, Rem) */}
                <div className="hidden lg:block lg:sticky lg:top-24 shrink-0 self-start">
                    <InventorySidebar
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        categoryCounts={categoryCounts}
                    />
                </div>

                {/* Center Section: Search Bar & Grid */}
                <section className="flex-1 min-w-0 w-full flex flex-col gap-4">
                    {/* Controls Bar: Search & Active Filter Info */}
                    <div className="bg-[#070b12] border border-slate-800/60 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari nama komponen, SKU, material..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#03060b] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Current Active Category info badge */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400">
                            <span className="uppercase tracking-wider">
                                Menampilkan:{" "}
                                <span className="text-[#00e5ff] font-bold">
                                    {filteredItems.length} Komponen
                                </span>
                            </span>
                            {selectedDesktopItem && (
                                <button
                                    onClick={() => setSelectedDesktopItem(null)}
                                    className="hidden lg:inline-flex text-[11px] text-slate-400 hover:text-[#00e5ff] underline transition-colors"
                                >
                                    Tutup Detail Kanan
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Product Grid: 5 columns on desktop, 2 columns on mobile */}
                    {filteredItems.length === 0 ? (
                        <div className="bg-[#070b12] border border-slate-800/60 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                            <Filter className="w-10 h-10 text-slate-400 mb-3" />
                            <h3 className="text-base font-bold text-slate-200 uppercase tracking-wider">
                                Tidak Ada Komponen Ditemukan
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                Coba ubah kata kunci pencarian atau pilih kategori lain pada menu inventory.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("all");
                                }}
                                className="mt-4 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#00e5ff] uppercase tracking-wider transition-colors"
                            >
                                Reset Filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {filteredItems.map((item) => (
                                <InventoryCard
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedDesktopItem?.id === item.id}
                                    onSelect={handleItemClick}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Right Section: Desktop Detail Panel (appears when clicked) */}
                {selectedDesktopItem && (
                    <ItemDetailPanel
                        item={selectedDesktopItem}
                        onClose={() => setSelectedDesktopItem(null)}
                    />
                )}
            </div>

            {/* Mobile Modal (appears when item clicked on mobile) */}
            <ItemDetailModal
                item={selectedMobileItem}
                isOpen={isMobileModalOpen}
                onClose={() => {
                    setIsMobileModalOpen(false);
                    setSelectedMobileItem(null);
                }}
            />
        </main>
    );
}
