"use client";

import { FeaturedProject } from "./types";

interface ProjectModalProps {
  project: FeaturedProject | null;
  onClose: () => void;
  onInquire: () => void;
}

export function ProjectModal({ project, onClose, onInquire }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0c121e] border border-slate-800 rounded-lg max-w-2xl w-full p-8 shadow-2xl z-10 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg cursor-pointer"
        >
          ✕
        </button>

        <div className="space-y-6">
          <div className="h-64 rounded overflow-hidden border border-slate-800">
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00e5ff] block mb-1">
              {project.category}
            </span>
            <h3 className="text-2xl font-black text-white">{project.title}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-normal">
              {project.description}
            </p>
          </div>

          <div className="bg-[#070b12] border border-slate-800 rounded p-4 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              TECHNICAL SPECIFICATIONS
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {project.specs.map((spec, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              onClose();
              onInquire();
            }}
            className="w-full bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs py-3.5 rounded uppercase tracking-widest transition-all cursor-pointer"
          >
            Inquire For This Build
          </button>
        </div>
      </div>
    </div>
  );
}
