"use client";

import { memo } from "react";
import Link from "next/link";

export const Hero = memo(function Hero() {
  const scrollToFeatured = () => {
    const el = document.getElementById("featured");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-slate-800/40">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=75"
          alt="Supercar Background"
          loading="eager"
          className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/60 to-[#070b12]/80" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#070b12] to-transparent" />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-[#00e5ff]/10 blur-2xl rounded-full" />
      </div>

      {/* Hero Content */}
      <div className="relative italic z-10 max-w-5xl mx-auto px-6 text-center space-y-6 py-20">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
          PRECISION MODDING.<br />
          <span className="text-[#00e5ff] shadow-cyan-500">
            BOLD DESIGN.
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed tracking-wide">
          Engineering aggressive aesthetics and uncompromised performance for the modern supercar.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/configurator"
            className="bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs px-8 py-3.5 rounded-sm uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] cursor-pointer inline-flex items-center gap-2 not-italic"
          >
            <span>LAUNCH 3D CONFIGURATOR</span>
            <span className="text-slate-950">→</span>
          </Link>
          <button
            onClick={scrollToFeatured}
            className="bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-white font-bold text-xs px-7 py-3.5 rounded-sm uppercase tracking-widest transition-all duration-200 cursor-pointer not-italic"
          >
            EXPLORE BUILDS
          </button>
        </div>
      </div>
    </section>
  );
});
