"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  CarConfigState,
  PAINT_COLORS,
  WHEEL_OPTIONS,
  CALIPER_OPTIONS,
  CameraPreset,
  CustomModelData
} from "./types";
import { ConfiguratorUI } from "./components/ConfiguratorUI";
import { OrderModal } from "./components/OrderModal";
import { ImportModal } from "./components/ImportModal";
import { Loader2 } from "lucide-react";

// Dynamically import Three.js viewer with SSR disabled for optimal client-side WebGL
const CarViewer3D = dynamic(
  () => import("./components/CarViewer3D").then((mod) => mod.CarViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[600px] bg-[#0a0c10] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00e5ff] animate-spin mb-3" />
        <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">
          INITIALIZING WEBGL 3D CONTEXT...
        </span>
      </div>
    )
  }
);

export default function ConfiguratorPage() {
  const [config, setConfig] = useState<CarConfigState>({
    selectedColor: PAINT_COLORS[0], // Apex Crimson Red
    selectedFinish: "gloss",
    selectedWheel: WHEEL_OPTIONS[0], // Satin Black
    selectedCaliper: CALIPER_OPTIONS[0], // Brembo Red
    carbonPackage: true,
    carbonSpoiler: true,
    headlightsOn: true,
    hazardLightsOn: false,
    cameraPreset: "exterior",
    autoRotate: false,
    studioEnv: "dark-showroom",
    basePrice: 185000
  });

  const [customModel, setCustomModel] = useState<CustomModelData | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Calculate live total price based on options
  const totalPrice = useMemo(() => {
    let total = config.basePrice;
    total += config.selectedColor.priceDelta;
    total += config.selectedWheel.priceDelta;
    total += config.selectedCaliper.priceDelta;
    if (config.carbonPackage) total += 4800;
    return total;
  }, [
    config.basePrice,
    config.selectedColor,
    config.selectedWheel,
    config.selectedCaliper,
    config.carbonPackage
  ]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0c10]">
      {/* 3D WebGL Canvas */}
      <div className="absolute inset-0 z-0">
        <CarViewer3D config={config} customModel={customModel} />
      </div>

      {/* Floating UI HUD & Controls */}
      <ConfiguratorUI
        config={config}
        onChange={setConfig}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        customModel={customModel}
        onResetDefaultModel={() => setCustomModel(null)}
        totalPrice={totalPrice}
      />

      {/* 3D Model Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(data) => setCustomModel(data)}
        onResetDefault={() => setCustomModel(null)}
        currentModelName={customModel ? customModel.name : "Apex GT-R (ferrari.glb)"}
        isCustomModel={!!customModel}
      />

      {/* Build Reservation Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        config={config}
        totalPrice={totalPrice}
      />
    </main>
  );
}
