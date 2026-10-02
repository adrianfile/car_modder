"use client";

import { memo } from "react";
import { FeaturedProject } from "./types";

interface FeaturedWorkProps {
  projects: FeaturedProject[];
  onSelectProject: (project: FeaturedProject) => void;
}

export const FeaturedWork = memo(function FeaturedWork({ projects, onSelectProject }: FeaturedWorkProps) {
  if (projects.length < 3) return null;

  return (
    <section id="featured" className="max-w-7xl mx-auto px-6 py-24">
      {/* Section Heading */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-7 bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
          Featured Work
        </h2>
      </div>

      {/* Portfolio Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Large Card (Left) */}
        <div
          onClick={() => onSelectProject(projects[0])}
          className="lg:col-span-7 relative group rounded-md overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer h-[420px] sm:h-[460px] will-change-transform"
        >
          <img
            src={projects[0].image}
            alt={projects[0].title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 filter brightness-90 group-hover:brightness-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/30 to-transparent pointer-events-none" />

          <div className="absolute bottom-8 left-8 right-8 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              {projects[0].category}
            </span>
            <h3 className="text-2xl font-bold text-white group-hover:text-[#00e5ff] transition-colors">
              {projects[0].title}
            </h3>
          </div>
        </div>

        {/* Right Column (2 Stacked Cards) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Top Right Card */}
          <div
            onClick={() => onSelectProject(projects[1])}
            className="relative group rounded-md overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer h-[200px] sm:h-[218px] will-change-transform"
          >
            <img
              src={projects[1].image}
              alt={projects[1].title}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 filter brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/30 to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                {projects[1].category}
              </span>
              <h3 className="text-lg font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                {projects[1].title}
              </h3>
            </div>
          </div>

          {/* Bottom Right Card */}
          <div
            onClick={() => onSelectProject(projects[2])}
            className="relative group rounded-md overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer h-[200px] sm:h-[218px] will-change-transform"
          >
            <img
              src={projects[2].image}
              alt={projects[2].title}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 filter brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/30 to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                {projects[2].category}
              </span>
              <h3 className="text-lg font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                {projects[2].title}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
