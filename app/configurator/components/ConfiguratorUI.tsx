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
  ArrowLeft,
  Flame,
  Zap,
  Sparkles,
  Sliders,
  Maximize2,
  UploadCloud,
  RotateCcw
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

type TabKey = "paint" | "wheels" | "aero" | "studio";

export const ConfiguratorUI: React.FC<ConfiguratorUIProps> = ({
  config,
  onChange,
  onOpenOrderModal,
  onOpenImportModal,
  customModel,
  onResetDefaultModel,
  totalPrice
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("paint");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Helper updates
  const setFinish = (finish: PaintFinish) => {
    onChange((prev) => ({ ...prev, selectedFinish: finish }));
  };

  const setColor = (color: typeof PAINT_COLORS[0]) => {
    onChange((prev) => ({
      ...prev,
      selectedColor: color,
      selectedFinish: color.finish
    }));
  };

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
      {/* 1. TOP HEADER BAR */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-[#070b12]/90 via-[#070b12]/60 to-transparent backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono tracking-widest text-slate-400 hover:text-white transition-colors bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT SHOWROOM</span>
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
            <h1 className="text-xs font-mono text-slate-400">
              {customModel ? `CUSTOM IMPORTED ASSET • ${customModel.name.toUpperCase()}` : "APEX GT-R • BESPOKE MOTORSPORT SPEC"}
            </h1>
          </div>
        </div>

        {/* Pricing, Import & CTA */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
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

      {/* 2. CAMERA PRESETS BAR (BOTTOM DOCK) */}
      <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-[#070b12]/80 backdrop-blur-md border border-slate-800/80 rounded-full shadow-2xl">
          {(
            [
              { key: "exterior", label: "3/4 Front" },
              { key: "side", label: "Profile" },
              { key: "wheel", label: "Wheels" },
              { key: "rear", label: "Rear Wing" },
              { key: "top", label: "Top-Down" }
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCameraPreset(item.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
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
            title={config.autoRotate ? "Pause 360 Spin" : "Start 360 Spin"}
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
            title={config.headlightsOn ? "Turn Lights Off" : "Turn Lights On"}
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

      {/* 3. RIGHT SIDEBAR CONTROLS PANEL */}
      <div className="absolute top-20 right-6 z-20 pointer-events-auto">
        <div className="w-80 sm:w-96 bg-[#090d14]/90 backdrop-blur-xl border border-slate-800/90 rounded-lg shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Tabs Navigation */}
          <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-950/60">
            {(
              [
                { id: "paint", label: "PAINT", icon: Palette },
                { id: "wheels", label: "WHEELS", icon: CircleDot },
                { id: "aero", label: "AERO", icon: Layers },
                { id: "studio", label: "STUDIO", icon: Sun }
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-3 text-[11px] font-mono tracking-wider transition-all cursor-pointer border-b-2 ${
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

          {/* Tab Content Container */}
          <div className="p-5 max-h-[calc(100vh-220px)] overflow-y-auto space-y-5">
            
            {/* --- TAB 1: PAINT (COLOR WHEEL & PRESETS) --- */}
            {activeTab === "paint" && (
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

            {/* --- TAB 2: WHEELS & BRAKES --- */}
            {activeTab === "wheels" && (
              <div className="space-y-5">
                {/* Wheels Finish */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
                    MONOBLOCK WHEEL FINISH
                  </label>
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
                              ? "bg-cyan-950/20 border-[#00e5ff] text-white"
                              : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
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
                          <span className="text-xs font-mono text-[#00e5ff]">
                            {wheel.priceDelta === 0
                              ? "STD"
                              : `+$${wheel.priceDelta.toLocaleString()}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Caliper Colors */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
                    BRAKE CALIPER FINISH
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {CALIPER_OPTIONS.map((caliper) => {
                      const isSelected = config.selectedCaliper.id === caliper.id;
                      return (
                        <button
                          key={caliper.id}
                          type="button"
                          onClick={() => setCaliper(caliper)}
                          title={`${caliper.name} (+$${caliper.priceDelta})`}
                          className={`relative h-10 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "border-[#00e5ff] scale-105 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                              : "border-slate-800 hover:border-slate-600"
                          }`}
                          style={{ backgroundColor: caliper.hex }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: AERO & CARBON --- */}
            {activeTab === "aero" && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md">
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
                    Includes front carbon splitter, side mirror housings, side skirts, and rear diffuser. Autoclaved 2x2 twill weave.
                  </p>
                  <span className="text-xs font-mono text-[#00e5ff]">+$4,800 USD</span>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase">
                      CARBON FIBER REAR GT WING
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded-sm">
                      EQUIPPED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-1">
                    Chassis-mounted active downforce wing producing +240kg at 250 km/h.
                  </p>
                  <span className="text-xs font-mono text-slate-400">INCLUDED IN APEX SPEC</span>
                </div>
              </div>
            )}

            {/* --- TAB 4: STUDIO & LIGHTING --- */}
            {activeTab === "studio" && (
              <div className="space-y-4">
                {/* Lighting Controls */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
                    LIGHTING & EMISSIVES
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
                      <span className="text-xs font-bold">PROJECTOR LED HEADLIGHTS</span>
                    </div>
                    <span className="text-xs font-mono text-[#00e5ff]">
                      {config.headlightsOn ? "ACTIVE" : "OFF"}
                    </span>
                  </button>
                </div>

                {/* Studio Mode */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
                    STUDIO SHOWROOM THEME
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(
                      [
                        { id: "dark-showroom", name: "Monochrome Studio (Automotive PBR)" },
                        { id: "warm-studio", name: "Commercial Studio (Warm Softbox)" },
                        { id: "sunset-outdoor", name: "Venice Golden Sunset (Reflective)" },
                        { id: "pure-white", name: "Clean Gallery (Daylight High-Key)" }
                      ] as const
                    ).map((env) => (
                      <button
                        key={env.id}
                        type="button"
                        onClick={() => setStudioEnv(env.id)}
                        className={`p-2.5 text-left text-xs font-mono rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                          config.studioEnv === env.id
                            ? "border-[#00e5ff] bg-cyan-950/30 text-white font-bold"
                            : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>{env.name}</span>
                        {config.studioEnv === env.id && (
                          <Check className="w-3.5 h-3.5 text-[#00e5ff]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Rotate Control */}
                <div>
                  <button
                    type="button"
                    onClick={toggleAutoRotate}
                    className={`w-full p-2.5 rounded-md border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                      config.autoRotate
                        ? "border-[#00e5ff] bg-cyan-950/20 text-white"
                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <RotateCw className="w-3.5 h-3.5" />
                      AUTO-ROTATION 360°
                    </span>
                    <span className="text-[#00e5ff]">
                      {config.autoRotate ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Quick Spec Bottom Summary in Drawer */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Total Specs Active:</span>
            <span className="text-slate-200">
              {config.selectedColor.name} • {config.selectedWheel.name.split(" ")[0]}
            </span>
          </div>

        </div>
      </div>
    </>
  );
};
