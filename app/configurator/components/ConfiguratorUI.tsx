"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CarConfigState,
  PAINT_COLORS,
  WHEEL_OPTIONS,
  CALIPER_OPTIONS,
  PaintFinish,
  CameraPreset,
  StudioEnvironment,
  CustomModelData
} from "../types";
import { ColorWheelPicker } from "./ColorWheelPicker";
import {
  Palette,
  CircleDot,
  Layers,
  Sun,
  Camera,
  RotateCw,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Zap,
  Sparkles,
  UploadCloud,
  RotateCcw,
  Wrench,
  Disc,
  Sliders,
  Eye,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

interface ConfiguratorUIProps {
  config: CarConfigState;
  onChange: (updater: (prev: CarConfigState) => CarConfigState) => void;
  onOpenOrderModal: () => void;
  onOpenImportModal: () => void;
  customModel?: CustomModelData | null;
  onResetDefaultModel: () => void;
  totalPrice: number;
}

type LeftPartTab = "wheels" | "brakes" | "aero" | "views";
type RightStudioTab = "paint" | "studio";

export const ConfiguratorUI: React.FC<ConfiguratorUIProps> = ({
  config,
  onChange,
  onOpenOrderModal,
  onOpenImportModal,
  customModel,
  onResetDefaultModel,
  totalPrice
}) => {
  // Navigation State for Left & Right Panels
  const [leftTab, setLeftTab] = useState<LeftPartTab>("wheels");
  const [rightTab, setRightTab] = useState<RightStudioTab>("paint");
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // Helper updates
  const setWheel = (wheel: typeof WHEEL_OPTIONS[0]) => {
    onChange((prev) => ({ ...prev, selectedWheel: wheel }));
  };

  const setCaliper = (caliper: typeof CALIPER_OPTIONS[0]) => {
    onChange((prev) => ({ ...prev, selectedCaliper: caliper }));
  };

  const toggleCarbonPackage = () => {
    onChange((prev) => ({ ...prev, carbonPackage: !prev.carbonPackage }));
  };

  const toggleHeadlights = () => {
    onChange((prev) => ({ ...prev, headlightsOn: !prev.headlightsOn }));
  };

  const toggleAutoRotate = () => {
    onChange((prev) => ({ ...prev, autoRotate: !prev.autoRotate }));
  };

  const setCameraPreset = (preset: CameraPreset) => {
    onChange((prev) => ({ ...prev, cameraPreset: preset }));
  };

  const setStudioEnv = (env: StudioEnvironment) => {
    onChange((prev) => ({ ...prev, studioEnv: env }));
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. TOP HEADER BAR                                         */}
      {/* ========================================================= */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-[#070b12]/95 via-[#070b12]/70 to-transparent backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono tracking-widest text-slate-400 hover:text-white transition-colors bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-sm shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXIT SHOWROOM</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-white uppercase">
                MOD<span className="text-[#00e5ff]">_</span>CARBON
              </span>
              <span className="text-[10px] font-mono bg-cyan-950/80 text-[#00e5ff] border border-cyan-800/60 px-1.5 py-0.5 rounded-sm uppercase">
                CONFIGURATOR 3D
              </span>
              {customModel && (
                <div className="hidden sm:flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/50 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-sm">
                  <span>CUSTOM: {customModel.name}</span>
                  <button
                    type="button"
                    onClick={onResetDefaultModel}
                    title="Reset to Default Apex Supercar"
                    className="hover:text-white cursor-pointer ml-1 text-amber-400 hover:text-amber-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <h1 className="text-xs font-mono text-slate-400 hidden sm:block">
              {customModel
                ? `CUSTOM IMPORTED ASSET • ${customModel.name.toUpperCase()}`
                : "APEX GT-R • BESPOKE MOTORSPORT SPEC"}
            </h1>
          </div>
        </div>

        {/* Pricing, Import & CTA */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              ESTIMATED BUILD PRICE
            </span>
            <span className="text-lg font-black font-mono text-[#00e5ff] tracking-tight">
              ${totalPrice.toLocaleString()}
            </span>
          </div>

          {/* Import 3D Model CTA */}
          <button
            type="button"
            onClick={onOpenImportModal}
            className="bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-[#00e5ff] font-mono text-xs px-3.5 py-2.5 rounded-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-[#00e5ff]" />
            <span className="hidden sm:inline">IMPORT 3D</span>
          </button>

          <button
            type="button"
            onClick={onOpenOrderModal}
            className="bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs px-5 py-2.5 rounded-sm uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>RESERVE BUILD</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. PANEL KIRI: MENU PART-PART (PARTS & EQUIPMENT)         */}
      {/* ========================================================= */}
      <div className="absolute top-20 left-4 sm:left-6 z-20 pointer-events-auto transition-all duration-300">
        {isLeftCollapsed ? (
          /* Collapsed Pill Button */
          <button
            type="button"
            onClick={() => setIsLeftCollapsed(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#090d14]/90 hover:bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 hover:border-[#00e5ff] text-white rounded-lg shadow-xl text-xs font-mono tracking-wider transition-all cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-[#00e5ff]">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-sans uppercase">MENU PART</span>
              <span className="font-bold text-[#00e5ff] group-hover:text-white transition-colors">
                {leftTab.toUpperCase()}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          /* Full Left Panel */
          <div className="w-80 sm:w-96 bg-[#090d14]/90 backdrop-blur-xl border border-slate-800/90 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 flex flex-col">
            
            {/* Header Panel Kiri */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#070b10]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00e5ff]">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest text-white uppercase">
                    PARTS & EQUIPMENT
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400">KOMPONEN & AKSESORIS</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLeftCollapsed(true)}
                title="Tutup Panel Part"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-Tabs Nav: Wheels, Brakes, Aero, Views */}
            <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-950/60">
              {(
                [
                  { id: "wheels", label: "VELG", icon: CircleDot },
                  { id: "brakes", label: "REM", icon: Disc },
                  { id: "aero", label: "AERO", icon: Layers },
                  { id: "views", label: "SUDUT", icon: Camera }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = leftTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLeftTab(tab.id)}
                    className={`flex flex-col items-center justify-center py-2.5 text-[10px] font-mono tracking-wider transition-all cursor-pointer border-b-2 ${
                      isActive
                        ? "border-[#00e5ff] text-[#00e5ff] bg-cyan-950/20 font-bold"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Konten Tab Panel Kiri */}
            <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto space-y-4">
              
              {/* --- SUB-TAB 1: VELG / WHEELS --- */}
              {leftTab === "wheels" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                      MONOBLOCK FORGED VELG
                    </label>
                    <button
                      type="button"
                      onClick={() => setCameraPreset("wheel")}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Fokus Roda</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {WHEEL_OPTIONS.map((wheel) => {
                      const isSelected = config.selectedWheel.id === wheel.id;
                      return (
                        <button
                          key={wheel.id}
                          type="button"
                          onClick={() => setWheel(wheel)}
                          className={`w-full text-left p-3 rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-cyan-950/20 border-[#00e5ff] text-white shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                              : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-5 h-5 rounded-full border border-slate-700 shadow-sm shrink-0"
                              style={{ backgroundColor: wheel.finishHex }}
                            />
                            <div>
                              <p className="text-xs font-bold leading-none mb-1">
                                {wheel.name}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400">
                                {wheel.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-[#00e5ff] shrink-0 ml-2">
                            {wheel.priceDelta === 0
                              ? "STD"
                              : `+$${wheel.priceDelta.toLocaleString()}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Info Spesifikasi Velg */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ukuran Depan:</span>
                      <span className="text-slate-200">20" x 9.5J Center-Lock</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ukuran Belakang:</span>
                      <span className="text-slate-200">21" x 12.0J Center-Lock</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Konstruksi:</span>
                      <span className="text-cyan-400">Aerospace 6061-T6 Forged</span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 2: REM & KALIPER --- */}
              {leftTab === "brakes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                      BREMBO CALIPER FINISH
                    </label>
                    <button
                      type="button"
                      onClick={() => setCameraPreset("wheel")}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Fokus Kaliper</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {CALIPER_OPTIONS.map((caliper) => {
                      const isSelected = config.selectedCaliper.id === caliper.id;
                      return (
                        <button
                          key={caliper.id}
                          type="button"
                          onClick={() => setCaliper(caliper)}
                          title={`${caliper.name} (+$${caliper.priceDelta})`}
                          className={`relative h-11 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "border-[#00e5ff] scale-105 shadow-[0_0_12px_rgba(0,229,255,0.35)]"
                              : "border-slate-800 hover:border-slate-600"
                          }`}
                          style={{ backgroundColor: caliper.hex }}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-md">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">Warna Terpilih:</span>
                      <span className="text-white font-bold">{config.selectedCaliper.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Biaya Tambahan:</span>
                      <span className="text-[#00e5ff]">
                        {config.selectedCaliper.priceDelta === 0
                          ? "FREE / INCLUDED"
                          : `+$${config.selectedCaliper.priceDelta.toLocaleString()} USD`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md text-[11px] font-mono text-slate-400 space-y-1">
                    <span className="text-slate-300 font-bold block mb-1">
                      Sistem Pengereman Keramik:
                    </span>
                    <p>• Rotor Carbon-Ceramic 420mm (Depan) & 390mm (Belakang)</p>
                    <p>• 6-Piston Monobloc Front / 4-Piston Rear Calipers</p>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 3: AERO & CARBON FIBER --- */}
              {leftTab === "aero" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase">
                        PRE-PREG CARBON FIBER PACK
                      </span>
                      <button
                        type="button"
                        onClick={toggleCarbonPackage}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          config.carbonPackage ? "bg-[#00e5ff]" : "bg-slate-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                            config.carbonPackage ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                      Termasuk front carbon splitter, penutup spion, side skirt aero blade, dan rear diffuser 4-fin.
                    </p>
                    <span className="text-xs font-mono text-[#00e5ff]">+$4,800 USD</span>
                  </div>

                  <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase">
                        CARBON REAR GT WING
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded-sm">
                        EQUIPPED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                      Sayap belakang downforce aktif menghasilkan +240kg pada kecepatan 250 km/jam.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCameraPreset("rear")}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Fokus ke Sayap Belakang</span>
                    </button>
                  </div>
                </div>
              )}

              {/* --- SUB-TAB 4: SUDUT PANDANG KAMERA (VIEWS) --- */}
              {leftTab === "views" && (
                <div className="space-y-3">
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                    PRESET SUDUT KAMERA 3D
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(
                      [
                        { key: "exterior", label: "3/4 Depan (Tampilan Utama)", desc: "Sudut dinamis 3/4 tampilan depan supercar" },
                        { key: "side", label: "Profil Samping (Side Profile)", desc: "Siluet bodi samping horizontal penuh" },
                        { key: "wheel", label: "Detail Roda & Velg", desc: "Zoom close-up velg dan kaliper rem" },
                        { key: "rear", label: "Sayap Belakang & Diffuser", desc: "Tampilan buritan, knalpot & GT wing" },
                        { key: "top", label: "Atas Supercar (Top-Down)", desc: "Tampilan atap aerodinamis bird's eye" }
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setCameraPreset(item.key)}
                        className={`p-2.5 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                          config.cameraPreset === item.key
                            ? "bg-cyan-950/30 border-[#00e5ff] text-white"
                            : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white mb-0.5">{item.label}</p>
                          <p className="text-[10px] font-mono text-slate-400">{item.desc}</p>
                        </div>
                        {config.cameraPreset === item.key && (
                          <Check className="w-4 h-4 text-[#00e5ff] shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Ringkasan Part */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Roda Aktif:</span>
              <span className="text-[#00e5ff] font-bold">
                {config.selectedWheel.name}
              </span>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. PANEL KANAN: STUDIO & WARNA                            */}
      {/* ========================================================= */}
      <div className="absolute top-20 right-4 sm:right-6 z-20 pointer-events-auto transition-all duration-300">
        {isRightCollapsed ? (
          /* Collapsed Pill Button */
          <button
            type="button"
            onClick={() => setIsRightCollapsed(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#090d14]/90 hover:bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 hover:border-[#00e5ff] text-white rounded-lg shadow-xl text-xs font-mono tracking-wider transition-all cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-sans uppercase">STUDIO & WARNA</span>
              <span className="font-bold text-[#00e5ff] group-hover:text-white transition-colors">
                {rightTab === "paint" ? "WARNA & FINISH" : "LIGHTING STUDIO"}
              </span>
            </div>
            <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-[#00e5ff]">
              <Palette className="w-3.5 h-3.5" />
            </div>
          </button>
        ) : (
          /* Full Right Panel */
          <div className="w-80 sm:w-96 bg-[#090d14]/90 backdrop-blur-xl border border-slate-800/90 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 flex flex-col">
            
            {/* Header Panel Kanan */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#070b10]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00e5ff]">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest text-white uppercase">
                    STUDIO & WARNA
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400">PAINT & ENVIRONMENT</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRightCollapsed(true)}
                title="Tutup Panel Studio & Warna"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-Tabs Nav: Paint vs Studio */}
            <div className="grid grid-cols-2 border-b border-slate-800/80 bg-slate-950/60">
              {(
                [
                  { id: "paint", label: "WARNA BODI", icon: Palette },
                  { id: "studio", label: "STUDIO & CAHAYA", icon: Sun }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = rightTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRightTab(tab.id)}
                    className={`flex items-center justify-center gap-2 py-3 text-xs font-mono tracking-wider transition-all cursor-pointer border-b-2 ${
                      isActive
                        ? "border-[#00e5ff] text-[#00e5ff] bg-cyan-950/20 font-bold"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Konten Tab Panel Kanan */}
            <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto space-y-4">
              
              {/* --- TAB 1: WARNA & FINISH (COLOR WHEEL PICKER) --- */}
              {rightTab === "paint" && (
                <ColorWheelPicker
                  selectedColor={config.selectedColor}
                  selectedFinish={config.selectedFinish}
                  onColorChange={(newColor) => {
                    onChange((prev) => ({
                      ...prev,
                      selectedColor: newColor
                    }));
                  }}
                  onFinishChange={(newFinish) => {
                    onChange((prev) => ({
                      ...prev,
                      selectedFinish: newFinish,
                      selectedColor: {
                        ...prev.selectedColor,
                        finish: newFinish
                      }
                    }));
                  }}
                />
              )}

              {/* --- TAB 2: STUDIO & LIGHTING --- */}
              {rightTab === "studio" && (
                <div className="space-y-4">
                  {/* Headlights Toggle */}
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
                      LAMPU & EMISI SUPERCAR
                    </label>
                    <button
                      type="button"
                      onClick={toggleHeadlights}
                      className={`w-full p-3 rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                        config.headlightsOn
                          ? "bg-cyan-950/20 border-[#00e5ff] text-white shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Zap
                          className={`w-4 h-4 ${
                            config.headlightsOn ? "text-[#00e5ff]" : "text-slate-500"
                          }`}
                        />
                        <span className="text-xs font-bold">PROJECTOR XENON LED</span>
                      </div>
                      <span className="text-xs font-mono text-[#00e5ff]">
                        {config.headlightsOn ? "ON (MENYALA)" : "OFF (MATI)"}
                      </span>
                    </button>
                  </div>

                  {/* Studio HDRI Environment Theme */}
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
                      TEMA PENCAHAYAAN STUDIO SHOWROOM
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {(
                        [
                          { id: "dark-showroom", name: "Monochrome Studio (Automotive PBR)", desc: "Pencahayaan presisi pameran dengan lantai reflektif" },
                          { id: "warm-studio", name: "Commercial Studio (Warm Softbox)", desc: "Studio foto komersial lampu sorot hangat" },
                          { id: "sunset-outdoor", name: "Venice Golden Sunset (Reflective)", desc: "Refleksi sunset emas mewah outdoor" },
                          { id: "pure-white", name: "Clean Gallery (Daylight High-Key)", desc: "Galeri modern terang siang hari" }
                        ] as const
                      ).map((env) => (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => setStudioEnv(env.id)}
                          className={`p-2.5 text-left text-xs font-mono rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                            config.studioEnv === env.id
                              ? "border-[#00e5ff] bg-cyan-950/30 text-white font-bold shadow-sm"
                              : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800/40"
                          }`}
                        >
                          <div>
                            <span className="block text-white font-sans font-bold text-xs">{env.name}</span>
                            <span className="text-[10px] text-slate-500">{env.desc}</span>
                          </div>
                          {config.studioEnv === env.id && (
                            <Check className="w-4 h-4 text-[#00e5ff] shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 360 Auto-Rotation */}
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
                      ANIMASI PUTARAN 360°
                    </label>
                    <button
                      type="button"
                      onClick={toggleAutoRotate}
                      className={`w-full p-2.5 rounded-md border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                        config.autoRotate
                          ? "border-[#00e5ff] bg-cyan-950/20 text-white shadow-sm"
                          : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <RotateCw className={`w-3.5 h-3.5 ${config.autoRotate ? "animate-spin text-[#00e5ff]" : ""}`} />
                        AUTO-ROTATION 360° TURNTABLE
                      </span>
                      <span className="text-[#00e5ff]">
                        {config.autoRotate ? "AKTIF" : "NONAKTIF"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Ringkasan Warna */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Cat Bodi:</span>
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                  style={{ backgroundColor: config.selectedColor.hex }}
                />
                <span className="text-[#00e5ff] font-bold uppercase">
                  {config.selectedFinish} • {config.selectedColor.name}
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. DOCK KAMERA CEPAT (BOTTOM FLOATING DOCK)               */}
      {/* ========================================================= */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-[#070b12]/80 backdrop-blur-md border border-slate-800/80 rounded-full shadow-2xl">
          {(
            [
              { key: "exterior", label: "3/4 Depan" },
              { key: "side", label: "Profil" },
              { key: "wheel", label: "Roda" },
              { key: "rear", label: "Belakang" },
              { key: "top", label: "Atas" }
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCameraPreset(item.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                config.cameraPreset === item.key
                  ? "bg-[#00e5ff] text-slate-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Quick Auto-Rotate Toggle */}
          <button
            type="button"
            onClick={toggleAutoRotate}
            title={config.autoRotate ? "Hentikan Putaran 360" : "Mulai Putaran 360"}
            className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              config.autoRotate
                ? "bg-cyan-500/20 text-[#00e5ff] border border-cyan-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <RotateCw className={`w-4 h-4 ${config.autoRotate ? "animate-spin" : ""}`} />
          </button>

          {/* Quick Headlight Toggle */}
          <button
            type="button"
            onClick={toggleHeadlights}
            title={config.headlightsOn ? "Matikan Lampu Depan" : "Nyalakan Lampu Depan"}
            className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              config.headlightsOn
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
