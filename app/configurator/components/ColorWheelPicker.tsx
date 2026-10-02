"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ColorOption, PaintFinish, PAINT_COLORS } from "../types";
import { Check, Copy, Sliders, Palette, Sparkles, SlidersHorizontal } from "lucide-react";

interface ColorWheelPickerProps {
  selectedColor: ColorOption;
  selectedFinish: PaintFinish;
  onColorChange: (color: ColorOption) => void;
  onFinishChange: (finish: PaintFinish) => void;
}

// Convert HSL (h: 0-360, s: 0-100, l: 0-100) to Hex string #rrggbb
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert Hex string #rrggbb to HSL { h, s, l }
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleanHex = hex.replace("#", "");
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const r = parseInt(fullHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) / 255 || 0;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  selectedColor,
  selectedFinish,
  onColorChange,
  onFinishChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingWheelRef = useRef(false);

  // Current HSL state
  const [hsl, setHsl] = useState(() => hexToHsl(selectedColor.hex));
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<"wheel" | "preset">("wheel");

  // Wheel dimensions (perfect 1:1 circular alignment)
  const WHEEL_SIZE = 192;
  const CENTER = WHEEL_SIZE / 2; // 96px
  const RADIUS = 92; // 92px radius fills the 192px box with 2px outer margin for border

  // Sync internal HSL when selectedColor prop changes from outside
  useEffect(() => {
    const newHsl = hexToHsl(selectedColor.hex);
    setHsl(newHsl);
  }, [selectedColor.hex]);

  // Function to draw chromatic wheel onto canvas with exact DPR resolution
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const dprSize = Math.round(WHEEL_SIZE * dpr);
    const center = dprSize / 2;
    const radius = RADIUS * dpr;

    canvas.width = dprSize;
    canvas.height = dprSize;
    canvas.style.width = `${WHEEL_SIZE}px`;
    canvas.style.height = `${WHEEL_SIZE}px`;

    const imgData = ctx.createImageData(dprSize, dprSize);
    const data = imgData.data;

    for (let y = 0; y < dprSize; y++) {
      for (let x = 0; x < dprSize; x++) {
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pixelIndex = (y * dprSize + x) * 4;

        if (dist <= radius) {
          const angle = Math.atan2(dy, dx);
          let h = (angle * 180) / Math.PI;
          if (h < 0) h += 360;

          const s = Math.min(dist / radius, 1);
          const l = 0.5;

          const a = s * Math.min(l, 1 - l);
          const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
          };

          // Smooth 1.5px anti-aliased edge
          const edgeAlpha = dist > radius - 1.5 ? ((radius - dist) / 1.5) * 255 : 255;
          data[pixelIndex] = f(0);
          data[pixelIndex + 1] = f(8);
          data[pixelIndex + 2] = f(4);
          data[pixelIndex + 3] = Math.max(0, Math.min(255, Math.round(edgeAlpha)));
        } else {
          data[pixelIndex + 3] = 0;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Exact outer border ring drawn precisely along the radius
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  }, [WHEEL_SIZE, CENTER, RADIUS]);

  // Ensure canvas is drawn whenever mounted or switched to wheel mode
  useEffect(() => {
    drawWheel();
    const rafId = requestAnimationFrame(() => {
      drawWheel();
    });
    return () => cancelAnimationFrame(rafId);
  }, [drawWheel, activeMode]);

  // Calculate thumb coordinate on wheel from H and S
  const getThumbPos = useCallback(() => {
    const angleRad = (hsl.h * Math.PI) / 180;
    const r = (hsl.s / 100) * RADIUS;
    const x = CENTER + r * Math.cos(angleRad);
    const y = CENTER + r * Math.sin(angleRad);
    return { x, y };
  }, [hsl.h, hsl.s, RADIUS, CENTER]);

  // Emit updated color to parent
  const emitColor = useCallback(
    (newH: number, newS: number, newL: number) => {
      const hex = hslToHex(newH, newS, newL);
      const isPreset = PAINT_COLORS.find(
        (p) => p.hex.toLowerCase() === hex.toLowerCase()
      );

      if (isPreset) {
        onColorChange(isPreset);
      } else {
        onColorChange({
          id: `custom-${hex.replace("#", "")}`,
          name: `Bespoke Spec (${hex.toUpperCase()})`,
          hex,
          finish: selectedFinish,
          roughness: selectedFinish === "gloss" ? 0.12 : selectedFinish === "metallic" ? 0.18 : 0.65,
          metalness: selectedFinish === "metallic" ? 0.95 : selectedFinish === "gloss" ? 0.75 : 0.35,
          clearcoat: selectedFinish === "matte" ? 0.12 : 1.0,
          clearcoatRoughness: selectedFinish === "matte" ? 0.45 : 0.04,
          priceDelta: 2500
        });
      }
    },
    [onColorChange, selectedFinish]
  );

  // Handle pointer drag on wheel
  const handlePointerMoveOnWheel = useCallback(
    (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
      if (!isDraggingWheelRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const angleRad = Math.atan2(dy, dx);
      let deg = (angleRad * 180) / Math.PI;
      if (deg < 0) deg += 360;

      const newH = Math.round(deg);
      const newS = Math.round(Math.min(1, dist / RADIUS) * 100);

      setHsl((prev) => {
        const next = { ...prev, h: newH, s: newS };
        emitColor(next.h, next.s, next.l);
        return next;
      });
    },
    [CENTER, RADIUS, emitColor]
  );

  const handlePointerDownWheel = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingWheelRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointerMoveOnWheel(e);
  };

  const handlePointerUpWheel = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingWheelRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Lightness Slider Change
  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newL = Number(e.target.value);
    setHsl((prev) => {
      const next = { ...prev, l: newL };
      emitColor(next.h, next.s, next.l);
      return next;
    });
  };

  // Preset Selection
  const handleSelectPreset = (c: ColorOption) => {
    const newHsl = hexToHsl(c.hex);
    setHsl(newHsl);
    onColorChange(c);
  };

  // Copy Hex Code
  const handleCopyHex = () => {
    navigator.clipboard.writeText(selectedColor.hex.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const thumb = getThumbPos();
  const pureHueHex = hslToHex(hsl.h, hsl.s, 50);

  return (
    <div className="space-y-4">
      {/* 1. PAINT FINISH SELECTOR TABS */}
      <div>
        <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-2">
          FINISH TEXTURE
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["gloss", "metallic", "matte"] as const).map((finish) => (
            <button
              key={finish}
              type="button"
              onClick={() => onFinishChange(finish)}
              className={`py-2 px-2 text-xs font-mono uppercase tracking-wider rounded-sm border transition-all cursor-pointer ${
                selectedFinish === finish
                  ? "bg-[#00e5ff]/15 border-[#00e5ff] text-[#00e5ff] font-bold shadow-[0_0_12px_rgba(0,229,255,0.25)]"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {finish}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MODE SELECTOR (COLOR WHEEL VS PRESETS) */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          PAINT PALETTE MODE
        </label>
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-sm border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveMode("wheel")}
            className={`px-2.5 py-1 text-[10px] font-mono tracking-wider rounded-xs transition-colors cursor-pointer ${
              activeMode === "wheel"
                ? "bg-[#00e5ff] text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            COLOR WHEEL
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("preset")}
            className={`px-2.5 py-1 text-[10px] font-mono tracking-wider rounded-xs transition-colors cursor-pointer ${
              activeMode === "preset"
                ? "bg-[#00e5ff] text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            OEM PRESETS
          </button>
        </div>
      </div>

      {/* 3. INTERACTIVE ILLUSTRATOR-STYLE COLOR WHEEL CONTAINER (Kept mounted via CSS) */}
      <div
        className={`flex flex-col items-center p-3 bg-slate-950/80 border border-slate-800/90 rounded-lg space-y-4 ${
          activeMode === "wheel" ? "block" : "hidden"
        }`}
      >
        <div className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1.5 self-start">
          <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>DRAG CIRCLE KNOB TO BLEND BESPOKE COLOR</span>
        </div>

        {/* Interactive Wheel Circle Container */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDownWheel}
          onPointerMove={handlePointerMoveOnWheel}
          onPointerUp={handlePointerUpWheel}
          className="relative cursor-crosshair touch-none select-none my-1 flex items-center justify-center"
          style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
        >
          {/* The Chromatic Disc Canvas */}
          <canvas
            ref={canvasRef}
            className="pointer-events-none block drop-shadow-[0_0_15px_rgba(0,0,0,0.7)]"
            style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
          />

          {/* Draggable Illustrator-style Target Reticle Thumb */}
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-75"
            style={{ left: thumb.x, top: thumb.y }}
          >
            {/* Outer white ring with shadow */}
            <div className="w-6 h-6 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.9)] flex items-center justify-center">
              {/* Inner active color dot */}
              <div
                className="w-3 h-3 rounded-full border border-black/40 shadow-inner"
                style={{ backgroundColor: selectedColor.hex }}
              />
            </div>
          </div>
        </div>

        {/* Brightness / Lightness Slider */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#00e5ff]" />
              BRIGHTNESS / SHADE
            </span>
            <span className="text-white font-bold">{hsl.l}%</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min="10"
              max="92"
              value={hsl.l}
              onChange={handleLightnessChange}
              className="w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none"
              style={{
                background: `linear-gradient(to right, #000000 0%, ${pureHueHex} 50%, #ffffff 100%)`
              }}
            />
          </div>
        </div>

        {/* Color Preview & Hex Controls */}
        <div className="w-full pt-1 flex items-center justify-between gap-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md border border-white/20 shadow-md transition-colors"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block leading-none">
                HEX CODE
              </span>
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                {selectedColor.hex.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyHex}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-sm transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. OEM PRESETS PALETTE (Kept mounted via CSS) */}
      <div className={`space-y-3 ${activeMode === "preset" ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            SELECT OEM RACING SPEC
          </span>
          <span className="text-xs font-mono text-[#00e5ff]">
            {selectedColor.name}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {PAINT_COLORS.map((c) => {
            const isSelected = selectedColor.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectPreset(c)}
                title={`${c.name} (+$${c.priceDelta})`}
                className={`relative h-12 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer group ${
                  isSelected
                    ? "border-[#00e5ff] scale-105 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                    : "border-slate-800 hover:border-slate-500"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Jump to Color Wheel to Fine-Tune the Selected Preset */}
        <button
          type="button"
          onClick={() => setActiveMode("wheel")}
          className="w-full mt-3 py-2.5 px-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-[#00e5ff] hover:text-[#33ebff] text-xs font-mono rounded-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>FINE-TUNE SELECTED COLOR IN COLOR WHEEL</span>
        </button>
      </div>

      {/* 5. ACTIVE PAINT SPEC SUMMARY */}
      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md text-[11px] font-mono text-slate-400">
        <div className="flex justify-between pb-1 border-b border-slate-800/50">
          <span>Active Paint:</span>
          <span className="text-white font-bold">{selectedColor.name}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span>Finish & Clearcoat:</span>
          <span className="text-[#00e5ff] uppercase">
            {selectedFinish} (Clearcoat PBR)
          </span>
        </div>
      </div>
    </div>
  );
};
