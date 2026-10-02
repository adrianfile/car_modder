"use client";

import { memo } from "react";

export const EngineeringServices = memo(function EngineeringServices() {
  return (
    <section id="services" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/40">
      {/* Centered Heading */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
          Engineering Services
        </h2>
      </div>

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-[#0e1522]/90 border border-slate-800/80 rounded-lg p-10 text-center flex flex-col items-center hover:border-[#00e5ff]/50 transition-all duration-200 group shadow-md hover:-translate-y-0.5">
          <div className="w-14 h-14 bg-[#090e17] border border-slate-800 rounded-lg flex items-center justify-center text-[#00e5ff] mb-6 group-hover:border-[#00e5ff] transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-3 tracking-wide">
            Digital Visualization
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Precision 3D rendering and VR walkthroughs of your proposed modifications before a single panel is cut.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0e1522]/90 border border-slate-800/80 rounded-lg p-10 text-center flex flex-col items-center hover:border-[#00e5ff]/50 transition-all duration-200 group shadow-md hover:-translate-y-0.5">
          <div className="w-14 h-14 bg-[#090e17] border border-slate-800 rounded-lg flex items-center justify-center text-[#00e5ff] mb-6 group-hover:border-[#00e5ff] transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2V4zm-6 8a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4zM5 16h14m-7 4v-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-3 tracking-wide">
            Bodykit Engineering
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Aerodynamically tested, bespoke carbon fiber body kits designed for perfect fitment and aggressive stance.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0e1522]/90 border border-slate-800/80 rounded-lg p-10 text-center flex flex-col items-center hover:border-[#00e5ff]/50 transition-all duration-200 group shadow-md hover:-translate-y-0.5">
          <div className="w-14 h-14 bg-[#090e17] border border-slate-800 rounded-lg flex items-center justify-center text-[#00e5ff] mb-6 group-hover:border-[#00e5ff] transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-3 tracking-wide">
            Performance Tuning
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            ECU calibration, exhaust fabrication, and suspension geometry optimization for track-focused handling.
          </p>
        </div>
      </div>
    </section>
  );
});
