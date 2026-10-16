"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  CarConfigState,
  PAINT_COLORS,
  WHEEL_OPTIONS,
  CALIPER_OPTIONS,
  CameraPreset
} from "./types";
import { ConfiguratorUI } from "./components/ConfiguratorUI";
import { OrderModal } from "./components/OrderModal";
import { SaveBuildModal } from "./components/SaveBuildModal";
import { TopUpModal } from "@/app/dashboard/components/TopUpModal";
import { SubscriptionModal } from "@/app/dashboard/components/SubscriptionModal";
import { Loader2, ShieldAlert } from "lucide-react";
import { SessionUser } from "@/types/user";

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

type UserProfile = SessionUser;

export default function ConfiguratorPage() {
  const router = useRouter();

  // Authentication Lock State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Car Configuration State
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

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  // Enforce Total Authentication Lock & Handle Build Load
  useEffect(() => {
    let isCancelled = false;

    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (isCancelled) return;
        if (!data.user) {
          router.push("/login?redirect=/configurator");
        } else {
          setUser(data.user);
          setAuthLoading(false);

          // Check if loading a saved build from query parameter (?buildId=...)
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const buildId = params.get("buildId");
            if (buildId) {
              fetch(`/api/configurator/saved/${encodeURIComponent(buildId)}`)
                .then((r) => r.json())
                .then((resData) => {
                  if (isCancelled) return;
                  const targetBuild = resData.build;
                  if (targetBuild) {
                    const matchedColor =
                      PAINT_COLORS.find((c) => c.hex.toLowerCase() === targetBuild.colorHex.toLowerCase()) || {
                        id: "custom-loaded",
                        name: targetBuild.colorName,
                        hex: targetBuild.colorHex,
                        finish: targetBuild.finish as any,
                        roughness: 0.15,
                        metalness: 0.8,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.05,
                        priceDelta: 0
                      };

                    const matchedWheel =
                      WHEEL_OPTIONS.find((w) => w.id === targetBuild.wheelId || w.name === targetBuild.wheelName) ||
                      WHEEL_OPTIONS[0];

                    const matchedCaliper =
                      CALIPER_OPTIONS.find((c) => c.name === targetBuild.caliperName || c.hex === targetBuild.caliperHex) ||
                      CALIPER_OPTIONS[0];

                    setConfig((prev) => ({
                      ...prev,
                      selectedColor: matchedColor,
                      selectedFinish: targetBuild.finish as any,
                      selectedWheel: matchedWheel,
                      selectedCaliper: matchedCaliper,
                      carbonPackage: targetBuild.carbonPackage,
                      carbonSpoiler: targetBuild.carbonSpoiler,
                      studioEnv: targetBuild.studioEnv || "dark-showroom"
                    }));
                  }
                })
                .catch(() => {});
            }
          }
        }
      })
      .catch(() => {
        if (!isCancelled) {
          router.push("/login?redirect=/configurator");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [router]);

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

  // Total Security Gate Screen while verifying credentials
  if (authLoading) {
    return (
      <main className="w-full h-screen bg-[#07090e] flex flex-col items-center justify-center text-center p-6 select-none">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-cyan-950/40 border border-[#00e5ff]/40 flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.2)]">
            <Loader2 className="w-9 h-9 text-[#00e5ff] animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-black font-mono tracking-widest text-white uppercase">
            VERIFYING PILOT CREDENTIALS...
          </h2>
          <p className="text-xs font-mono text-cyan-400/80">
            MOD_CARBON • SECURED CONFIGURATOR PROTOCOL
          </p>
          <p className="text-[11px] text-slate-500 font-mono pt-2">
            Halaman ini dikunci khusus member terdaftar. Mengalihkan jika belum login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0c10]">
      {/* 3D WebGL Canvas */}
      <div className="absolute inset-0 z-0">
        <CarViewer3D config={config} />
      </div>

      {/* Floating UI HUD & Controls */}
      <ConfiguratorUI
        config={config}
        onChange={setConfig}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        user={user}
        totalPrice={totalPrice}
      />

      {/* Save Configuration to User Garage Modal */}
      <SaveBuildModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        config={config}
        totalPrice={totalPrice}
      />

      {/* Build Reservation Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        config={config}
        totalPrice={totalPrice}
        user={user}
      />

      {/* Top Up Saldo Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentBalance={user?.balance ?? 0}
        onSuccess={(newBalance) => {
          setUser((prev) => (prev ? { ...prev, balance: newBalance } : null));
        }}
      />

      {/* Studio Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currentTier={user?.subscriptionTier || "FREE"}
        balance={user?.balance ?? 0}
        onSuccess={(newTier, newBalance) => {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  subscriptionTier: newTier,
                  isSubscribed: newTier !== "FREE",
                  balance: newBalance
                }
              : null
          );
        }}
      />
    </main>
  );
}
