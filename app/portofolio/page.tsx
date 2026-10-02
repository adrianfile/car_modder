"use client"
import { useCallback, useRef, useState } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/image-gallery.css";
import type { GalleryItem, ImageGalleryRef } from "react-image-gallery";
import { FeaturedProject } from "../components/types";
import { FeaturedWork } from "../components/FeaturedWork";
import { ProjectModal } from "../components/ProjectModal";

const gambar: GalleryItem[] = [
  { original: "/maserati.jpg", thumbnail: "/maserati.jpg" },
  { original: "/maserati.jpg", thumbnail: "/maserati.jpg" },
  { original: "/maserati.jpg", thumbnail: "/maserati.jpg" },
  { original: "/maserati.jpg", thumbnail: "/maserati.jpg" },
  { original: "/maserati.jpg", thumbnail: "/maserati.jpg" },
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
    <div className="min-h-screen">
      <div className="mx-auto w-full  " >
        <h1>Our project samples</h1>
      </div>
      <FeaturedWork projects={FEATURED_PROJECTS} onSelectProject={handleSelectProject} />
      <div className="rounded p-4 shadow-lg outline outline-black/5 w-full mx-auto">
        <ImageGallery ref={galleryRef} items={gambar} />
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={handleCloseProjectModal}
        onInquire={handleOpenBuildModal}
      />
    </div>
  );
}