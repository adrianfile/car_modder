"use client"
import { useCallback, useRef, useState } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/image-gallery.css";
import type { GalleryItem, ImageGalleryRef } from "react-image-gallery";
import { FeaturedProject } from "../components/types";
import { FeaturedWork } from "../components/FeaturedWork";
import { ProjectModal } from "../components/ProjectModal";
import { BuildModal } from "../components/BuildModal";

const gambar: GalleryItem[] = [
  {
    original: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=250&q=80",
    description: "ModCarbon GT3 Track Spec Carbon Aero"
  },
  {
    original: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=250&q=80",
    description: "Twin-Turbo Supercar Custom Composites"
  },
  {
    original: "https://images.unsplash.com/photo-1611821064430-0d40291d0f0d?auto=format&fit=crop&w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1611821064430-0d40291d0f0d?auto=format&fit=crop&w=250&q=80",
    description: "Monoblock Forged Aero Series Wheels"
  },
  {
    original: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=250&q=80",
    description: "Telemetry Carbon Cockpit Integration"
  },
  {
    original: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=250&q=80",
    description: "Aerodynamic Rear Carbon Diffuser"
  }
];

const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "carbon-aero",
    category: "PROJECT APEX",
    title: "Carbon Aero Kit",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=75",
    description: "Ultra-lightweight pre-preg autoclaved carbon fiber rear wing, front splitter, and rear diffuser optimized in CFD wind-tunnels.",
    specs: ["Weight: -18.5 kg", "Downforce: +240kg @ 250km/h", "Finish: 2x2 Twill Gloss Carbon"]
  },
  {
    id: "wheels",
    category: "WHEELS",
    title: "Forged Series R",
    image: "https://images.unsplash.com/photo-1611821064430-0d40291d0f0d?auto=format&fit=crop&w=1000&q=75",
    description: "Monoblock 6061-T6 aerospace aluminum forged wheels engineered for extreme track loads and brake clearance.",
    specs: ["Size: 20x9.5F / 21x12.5R", "Weight: 8.9 kg per wheel", "Brake Clearance: 420mm Carbon Ceramic"]
  },
  {
    id: "interior",
    category: "INTERIOR",
    title: "Telemetry Wheel",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=75",
    description: "Full carbon fiber motorsport steering wheel with integrated OLED digital shift-light telemetry and Alcantara handgrips.",
    specs: ["Display: 4.3\" Full Color OLED", "Grips: Italian Motorsport Alcantara", "Buttons: Rotary Encoders & APEM Switches"]
  }
];

export default function PortofolioPage() {
  const galleryRef = useRef<ImageGalleryRef>(null);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<FeaturedProject | null>(null);

  const handleOpenBuildModal = useCallback(() => {
    setIsBuildModalOpen(true);
  }, []);

  const handleCloseBuildModal = useCallback(() => {
    setIsBuildModalOpen(false);
  }, []);

  const handleSelectProject = useCallback((project: FeaturedProject) => {
    setSelectedProject(project);
  }, []);

  const handleCloseProjectModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans selection:bg-[#00e5ff] selection:text-slate-950 pb-20">
      {/* Portfolio Header Banner */}
      <section className="relative py-16 px-6 border-b border-slate-800/60 bg-gradient-to-b from-[#0a0f1a] to-[#070b12] text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#00e5ff]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono font-bold text-[#00e5ff] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
            <span>BESPOKE ENGINEERING ARCHIVE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            ENGINEERING & PERFORMANCE GALLERY
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Koleksi karya modifikasi aerodinamika carbon fiber, forged series wheels, dan telemetry cockpit eksklusif MOD_CARBON.
          </p>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <FeaturedWork projects={FEATURED_PROJECTS} onSelectProject={handleSelectProject} />

      {/* High-Resolution Supercar Gallery */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-7 bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
              SUPERCAR TRACK SPEC GALLERY
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Dokumentasi visual hasil instalasi komponen MOD_CARBON</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] p-4 shadow-2xl">
          <ImageGallery ref={galleryRef} items={gambar} showPlayButton={false} autoPlay={false} />
        </div>
      </section>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={handleCloseProjectModal}
        onInquire={handleOpenBuildModal}
      />

      {/* Bespoke Build Consultation Modal */}
      <BuildModal isOpen={isBuildModalOpen} onClose={handleCloseBuildModal} />
    </div>
  );
}