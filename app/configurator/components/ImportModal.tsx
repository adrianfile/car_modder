"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileCode,
  FolderOpen,
  CheckCircle,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { CustomModelData } from "../types";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (modelData: CustomModelData) => void;
  onResetDefault: () => void;
  currentModelName: string;
  isCustomModel: boolean;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onResetDefault,
  currentModelName,
  isCustomModel
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "server">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process selected or dropped files
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    // Map file names to Blob URLs for multi-file (e.g. .gltf + .bin)
    const filesMap: Record<string, string> = {};
    let mainFile: File | null = null;
    let mainExt: "glb" | "gltf" | "fbx" | null = null;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const blobUrl = URL.createObjectURL(f);
      filesMap[f.name] = blobUrl;

      const ext = f.name.split(".").pop()?.toLowerCase();
      if (ext === "glb") {
        mainFile = f;
        mainExt = "glb";
      } else if (ext === "gltf") {
        mainFile = f;
        mainExt = "gltf";
      } else if (ext === "fbx") {
        mainFile = f;
        mainExt = "fbx";
      }
    }

    if (!mainFile || !mainExt) {
      setErrorMsg("Format file tidak didukung. Silakan pilih file .glb, .gltf, atau .fbx");
      return;
    }

    // Pass custom model data
    onImport({
      name: mainFile.name,
      url: filesMap[mainFile.name],
      extension: mainExt,
      filesMap
    });

    onClose();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Quick load model from public/models/
  const handleLoadServerModel = (path: string, name: string, ext: "glb" | "gltf" | "fbx") => {
    onImport({
      name,
      url: path,
      extension: ext
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#090d14] border border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b10]">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#00e5ff]" />
            <h3 className="text-sm font-black tracking-wider text-white uppercase">
              IMPORT 3D MODEL (.GLB / .GLTF / .FBX)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer border-b-2 ${
              activeTab === "upload"
                ? "border-[#00e5ff] text-[#00e5ff] bg-cyan-950/20 font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            UPLOAD DARI KOMPUTER
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("server")}
            className={`py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer border-b-2 ${
              activeTab === "server"
                ? "border-[#00e5ff] text-[#00e5ff] bg-cyan-950/20 font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            PILIH DARI PUBLIC/MODELS
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-md text-xs font-mono text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD DARI KOMPUTER */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  dragOver
                    ? "border-[#00e5ff] bg-[#00e5ff]/10 scale-[1.01]"
                    : "border-slate-700/80 bg-slate-950/60 hover:border-cyan-500/60 hover:bg-slate-900/60"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Drag & Drop file 3D Anda di sini
                </h4>
                <p className="text-xs text-slate-400 mb-4 max-w-xs">
                  Mendukung format <span className="text-[#00e5ff] font-mono">.glb</span>,{" "}
                  <span className="text-[#00e5ff] font-mono">.gltf (+ .bin)</span>, atau{" "}
                  <span className="text-[#00e5ff] font-mono">.fbx</span>
                </p>
                <span className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-sm transition-colors">
                  PILIH FILE DARI KOMPUTER
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".glb,.gltf,.fbx,.bin"
                  onChange={(e) => processFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-md p-3 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Petunjuk Format:</span>
                </div>
                <p>• <strong>.glb</strong>: Cukup pilih 1 file .glb (format paling direkomendasikan).</p>
                <p>• <strong>.gltf</strong>: Jika ada file pendukung <code>.bin</code> atau gambar tekstur, blok dan pilih bersamaan.</p>
                <p>• <strong>.fbx</strong>: Model otomatis diskalakan ke ukuran panggung showroom.</p>
              </div>
            </div>
          )}

          {/* TAB 2: PILIH DARI PUBLIC/MODELS */}
          {activeTab === "server" && (
            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                MODEL YANG TERSEDIA DI PROYEK
              </label>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    handleLoadServerModel("/models/ferrari.glb", "Apex GT-R (ferrari.glb)", "glb")
                  }
                  className="w-full p-3 rounded-md border border-slate-800 hover:border-[#00e5ff] bg-slate-900/60 hover:bg-slate-800/60 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-xs">
                      GLB
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                        Apex GT-R Supercar (Default)
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">/models/ferrari.glb • 1.68 MB</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">LOAD</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleLoadServerModel("/models/velg.gltf", "Custom Forged Velg (velg.gltf)", "gltf")
                  }
                  className="w-full p-3 rounded-md border border-slate-800 hover:border-[#00e5ff] bg-slate-900/60 hover:bg-slate-800/60 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                      GLTF
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                        Mod Carbon Forged Velg
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">/models/velg.gltf (+ buffer.bin)</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">LOAD</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleLoadServerModel("/models/gtr+r35.glb", "Nissan GT-R R35 (gtr+r35.glb)", "glb")
                  }
                  className="w-full p-3 rounded-md border border-slate-800 hover:border-[#00e5ff] bg-slate-900/60 hover:bg-slate-800/60 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      GLB
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                        Nissan GT-R R35
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">/models/gtr+r35.glb • High Detail</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">LOAD</span>
                </button>
              </div>
            </div>
          )}

          {/* Current Model Status & Reset Default */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-xs font-mono">
              <span className="text-slate-500 block">MODEL AKTIF:</span>
              <span className="text-white font-bold">{currentModelName}</span>
            </div>

            {isCustomModel && (
              <button
                type="button"
                onClick={() => {
                  onResetDefault();
                  onClose();
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-sm text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET KE DEFAULT</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
