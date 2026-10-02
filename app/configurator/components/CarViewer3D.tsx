"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Loader2, Sparkles, RefreshCw, ZoomIn, Eye } from "lucide-react";
import {
  CarConfigState,
  CAMERA_CONFIGS,
  CameraPreset,
  StudioEnvironment,
  CustomModelData
} from "../types";

interface CarViewer3DProps {
  config: CarConfigState;
  onCameraChange?: (preset: CameraPreset) => void;
  customModel?: CustomModelData | null;
}

// --- PROCEDURAL TEXTURE GENERATORS ---

function createCarbonFiberTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#111114";
  ctx.fillRect(0, 0, 128, 128);

  const step = 8;
  for (let y = 0; y < 128; y += step) {
    for (let x = 0; x < 128; x += step) {
      const isAlt = ((x / step) + (y / step)) % 2 === 0;
      const grad = ctx.createLinearGradient(x, y, x + step, y + step);
      if (isAlt) {
        grad.addColorStop(0, "#2c2c34");
        grad.addColorStop(0.5, "#18181c");
        grad.addColorStop(1, "#0d0d10");
      } else {
        grad.addColorStop(0, "#19191d");
        grad.addColorStop(0.5, "#26262e");
        grad.addColorStop(1, "#111114");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, step - 0.5, step - 0.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

function createCarbonBumpMap(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 64, 64);

  const step = 8;
  for (let y = 0; y < 64; y += step) {
    for (let x = 0; x < 64; x += step) {
      const isAlt = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = isAlt ? "#9c9c9c" : "#646464";
      ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

function createTireTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#18191c";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#101113";
  ctx.lineWidth = 3;
  for (let y = 0; y < 256; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

function createBrakeRotorTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#8a8f98";
  ctx.fillRect(0, 0, 256, 256);

  for (let r = 25; r < 122; r += 3) {
    ctx.strokeStyle = r % 2 === 0 ? "rgba(65, 70, 80, 0.45)" : "rgba(180, 185, 195, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#1a1c22";
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    for (let dist = 48; dist < 115; dist += 18) {
      const cx = 128 + Math.cos(angle) * dist;
      const cy = 128 + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const CarViewer3D: React.FC<CarViewer3DProps> = ({
  config,
  onCameraChange,
  customModel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [fps, setFps] = useState(60);

  // Three.js State References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carModelRef = useRef<THREE.Object3D | null>(null);
  const dracoLoaderRef = useRef<DRACOLoader | null>(null);
  const activeLoadIdRef = useRef<number>(0);

  // Mesh & Light References
  const bodyMeshesRef = useRef<THREE.Mesh[]>([]);
  const rimMeshesRef = useRef<THREE.Mesh[]>([]);
  const caliperMeshesRef = useRef<THREE.Mesh[]>([]);
  const headlightMeshesRef = useRef<THREE.Mesh[]>([]);
  const headlightMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const spotLightLeftRef = useRef<THREE.SpotLight | null>(null);
  const spotLightRightRef = useRef<THREE.SpotLight | null>(null);

  // Environment HDR cache
  const hdrCacheRef = useRef<Record<string, THREE.DataTexture>>({});

  // Target Camera Lerping
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_CONFIGS.exterior.pos));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_CONFIGS.exterior.target));
  const isTransitioningRef = useRef(false);

  // Materials
  const bodyMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const rimMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const caliperMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const sharedMaterialsRef = useRef<{
    glassMat: THREE.MeshPhysicalMaterial;
    carbonMaterial: THREE.MeshPhysicalMaterial;
    tireMaterial: THREE.MeshStandardMaterial;
    rotorMaterial: THREE.MeshStandardMaterial;
    interiorCarpetMat: THREE.MeshStandardMaterial;
    interiorLeatherMat: THREE.MeshStandardMaterial;
    interiorTrimMat: THREE.MeshStandardMaterial;
    chromeMat: THREE.MeshStandardMaterial;
    blackPlasticMat: THREE.MeshStandardMaterial;
  } | null>(null);

  // --- MODEL HIERARCHY SETUP HELPER ---
  const setupModelHierarchy = useCallback((model: THREE.Object3D, isDefaultCar: boolean) => {
    bodyMeshesRef.current = [];
    rimMeshesRef.current = [];
    caliperMeshesRef.current = [];
    headlightMeshesRef.current = [];
    headlightMaterialsRef.current = [];

    const mats = sharedMaterialsRef.current;

    // 1. Purge stray non-mesh objects (distant cameras, lights, FBX helper nodes)
    const strayObjects: THREE.Object3D[] = [];
    model.traverse((child) => {
      if (child !== model) {
        const isCam = (child as any).isCamera || child.type.includes("Camera");
        const isLit = (child as any).isLight || child.type.includes("Light");
        const isHlp = (child as any).isHelper || (child as any).isBone;
        const lowName = child.name.toLowerCase();
        const isCamName = lowName.includes("camera") && !(child as THREE.Mesh).isMesh;
        const isLightName =
          (lowName.includes("light") || lowName.includes("sun") || lowName.includes("lamp")) &&
          !(child as THREE.Mesh).isMesh;

        if (isCam || isLit || isHlp || isCamName || isLightName) {
          strayObjects.push(child);
        }
      }
    });
    strayObjects.forEach((obj) => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    });

    // Reset initial transforms so calculations are clean
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.updateMatrixWorld(true);

    let meshCount = 0;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshCount++;
    });

    // Helper to process individual materials on custom imported models
    const processCustomMaterial = (
      origMat: THREE.Material,
      meshName: string,
      mesh: THREE.Mesh
    ): THREE.Material => {
      const matName = (origMat.name || "").toLowerCase();
      const mName = (meshName || "").toLowerCase();

      // 1. CLEAR / TINTED AUTOMOTIVE GLASS (windshield, side windows, rear glass)
      if (
        (matName.includes("glass") || matName.includes("windshield") || matName.includes("window")) &&
        !matName.includes("red") &&
        !matName.includes("tail")
      ) {
        return new THREE.MeshPhysicalMaterial({
          name: origMat.name || "AutomotiveGlass",
          color: 0x050a12,
          metalness: 0.1,
          roughness: 0.03,
          transmission: 0.9,
          transparent: true,
          opacity: 0.35,
          ior: 1.52,
          reflectivity: 0.9,
          envMapIntensity: 2.2,
          depthWrite: false
        });
      }

      // 2. RED TAILLIGHT GLASS
      if (
        (matName.includes("glass") || mName.includes("glass")) &&
        (matName.includes("red") || matName.includes("tail") || mName.includes("tail"))
      ) {
        return new THREE.MeshPhysicalMaterial({
          name: origMat.name || "TailGlass",
          color: 0xd90429,
          emissive: 0x550005,
          emissiveIntensity: 0.8,
          metalness: 0.1,
          roughness: 0.08,
          transmission: 0.6,
          transparent: true,
          opacity: 0.7,
          ior: 1.5,
          envMapIntensity: 2.0
        });
      }

      // 3. HEADLIGHT PROJECTOR / BULB / REFLECTOR
      if (
        matName.includes("headlight") ||
        (matName.includes("frontlight") && !matName.includes("glass")) ||
        (mName.includes("headlight") && !matName.includes("glass"))
      ) {
        const headlightMat = new THREE.MeshStandardMaterial({
          name: origMat.name || "Headlight",
          color: 0xffffff,
          emissive: config.headlightsOn ? 0xe0f7ff : 0x000000,
          emissiveIntensity: config.headlightsOn ? 4.8 : 0,
          roughness: 0.1,
          metalness: 0.85,
          envMapIntensity: 2.5
        });
        headlightMaterialsRef.current.push(headlightMat);
        headlightMeshesRef.current.push(mesh);
        return headlightMat;
      }

      // 4. TAILLIGHT / BRAKE LIGHT (RED EMISSIVE)
      if (
        matName.includes("taillight") ||
        matName.includes("brakelight") ||
        matName.includes("rearlight") ||
        (mName.includes("taillight") && !matName.includes("glass"))
      ) {
        return new THREE.MeshStandardMaterial({
          name: origMat.name || "Taillight",
          color: 0xd90429,
          emissive: 0xef233c,
          emissiveIntensity: 2.2,
          roughness: 0.2,
          metalness: 0.2,
          envMapIntensity: 1.5
        });
      }

      // 5. WHEEL RIMS & VELG (Rims, alloys)
      if (
        matName.includes("carpaintmetallicgoldenyellow") || // specifically the rims in gtr+r35.glb
        matName.includes("rim") ||
        matName.includes("velg") ||
        matName.includes("alloy") ||
        mName.includes("rim") ||
        mName.includes("velg") ||
        mName === "fr" ||
        mName === "fl" ||
        mName === "rl" ||
        mName === "rr" ||
        (mName.includes("wheel") &&
          !matName.includes("rubber") &&
          !matName.includes("tire") &&
          !matName.includes("disc") &&
          !matName.includes("brake") &&
          !matName.includes("chrome") &&
          !matName.includes("black"))
      ) {
        if (rimMaterialRef.current) {
          rimMeshesRef.current.push(mesh);
          return rimMaterialRef.current;
        }
      }

      // 6. BRAKE CALIPERS
      if (
        matName.includes("caliper") ||
        (mName.includes("wheelbrake") && !matName.includes("disc")) ||
        (mName.includes("brake") && !matName.includes("disc") && !matName.includes("light"))
      ) {
        if (caliperMaterialRef.current) {
          caliperMeshesRef.current.push(mesh);
          return caliperMaterialRef.current;
        }
      }

      // 7. CAR BODY PAINT (Primary exterior finish)
      if (
        matName.includes("carpaintmetallicblack") || // Main body shell in gtr+r35.glb
        matName.includes("carpaint") ||
        matName.includes("paint") ||
        matName === "body" ||
        matName === "main" ||
        (mName.includes("body") &&
          meshCount === 1 &&
          !matName.includes("interior") &&
          !matName.includes("leather") &&
          !matName.includes("carbon")) ||
        (mName.includes("paint") && !matName.includes("glass"))
      ) {
        if (bodyMaterialRef.current) {
          bodyMeshesRef.current.push(mesh);
          return bodyMaterialRef.current;
        }
      }

      // 8. CHROME
      if (matName.includes("chrome") || mName.includes("chrome")) {
        return (
          mats?.chromeMat ||
          new THREE.MeshStandardMaterial({
            name: origMat.name,
            color: 0xf5f7fa,
            metalness: 0.98,
            roughness: 0.04,
            envMapIntensity: 2.2
          })
        );
      }

      // 9. CARBON FIBER
      if (matName.includes("carbon") || mName.includes("carbon")) {
        const baseMap = (origMat as any).map;
        if (baseMap) {
          return new THREE.MeshStandardMaterial({
            name: origMat.name,
            map: baseMap,
            roughness: 0.35,
            metalness: 0.2,
            envMapIntensity: 1.6
          });
        }
        return mats?.carbonMaterial || origMat;
      }

      // 10. TIRE / RUBBER
      if (
        matName.includes("tire") ||
        matName.includes("tyre") ||
        matName.includes("rubber") ||
        mName.includes("tire")
      ) {
        const baseMap = (origMat as any).map;
        if (baseMap) {
          return new THREE.MeshStandardMaterial({
            name: origMat.name,
            map: baseMap,
            roughness: 0.88,
            metalness: 0.05
          });
        }
        return mats?.tireMaterial || origMat;
      }

      // 11. BRAKE DISC / ROTOR
      if (
        matName.includes("disc") ||
        matName.includes("rotor") ||
        mName.includes("disc") ||
        mName.includes("rotor")
      ) {
        const baseMap = (origMat as any).map;
        if (baseMap) {
          return new THREE.MeshStandardMaterial({
            name: origMat.name,
            map: baseMap,
            roughness: 0.25,
            metalness: 0.95,
            envMapIntensity: 1.8
          });
        }
        return mats?.rotorMaterial || origMat;
      }

      // 12. OTHER EMBEDDED MATERIALS (Leather, badges, grills, interior)
      if ("envMapIntensity" in origMat) {
        (origMat as any).envMapIntensity = 1.6;
      }
      return origMat;
    };

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const meshName = mesh.name || mesh.parent?.name || "";
        const lowName = meshName.toLowerCase();

        // Hide stray floor / ground plane in imported model
        if (
          !isDefaultCar &&
          (lowName === "plane" ||
            lowName.includes("ground") ||
            lowName.includes("floor") ||
            lowName.includes("shadowplane"))
        ) {
          mesh.visible = false;
          return;
        }

        if (isDefaultCar && mats) {
          // Specific mappings for default supercar (ferrari.glb)
          const name = mesh.name.toLowerCase();
          if (name === "body" || name === "main") {
            if (bodyMaterialRef.current) mesh.material = bodyMaterialRef.current;
            bodyMeshesRef.current.push(mesh);
          } else if (name.startsWith("rim_")) {
            if (rimMaterialRef.current) mesh.material = rimMaterialRef.current;
            rimMeshesRef.current.push(mesh);
          } else if (name === "brake") {
            if (caliperMaterialRef.current) mesh.material = caliperMaterialRef.current;
            caliperMeshesRef.current.push(mesh);
          } else if (name === "wheel") {
            mesh.material = mats.rotorMaterial;
          } else if (name === "tire") {
            mesh.material = mats.tireMaterial;
          } else if (name === "centre" || name === "steering_centre") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xf59e0b,
              metalness: 0.7,
              roughness: 0.25
            });
          } else if (name === "nuts") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x27272a,
              metalness: 0.95,
              roughness: 0.2
            });
          } else if (name === "glass") {
            mesh.material = mats.glassMat;
          } else if (name.includes("carbon")) {
            mesh.material = mats.carbonMaterial;
          } else if (name === "lights_red" || name === "brakes" || name === "steering_red_lights") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xd90429,
              emissive: 0xef233c,
              emissiveIntensity: 1.8,
              roughness: 0.1
            });
          } else if (name === "lights" || name === "leds") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: 0x000000,
              emissiveIntensity: 0
            });
            headlightMeshesRef.current.push(mesh);
          } else if (name === "carpet") {
            mesh.material = mats.interiorCarpetMat;
          } else if (name === "leather" || name === "steering_leather" || name === "trim") {
            mesh.material = mats.interiorLeatherMat;
          } else if (name === "interior_dark" || name === "interior_light") {
            mesh.material = mats.interiorTrimMat;
          } else if (name === "chrome") {
            mesh.material = mats.chromeMat;
          } else if (name === "plastic_gray" || name === "grills" || name === "wipers") {
            mesh.material = mats.blackPlasticMat;
          }
        } else {
          // Custom imported model: process each material individually (supporting multi-materials array!)
          if (Array.isArray(mesh.material)) {
            mesh.material = (mesh.material as THREE.Material[]).map((m) =>
              processCustomMaterial(m, meshName, mesh)
            );
          } else if (mesh.material) {
            mesh.material = processCustomMaterial(mesh.material, meshName, mesh);
          }
        }
      }
    });

    // 2. Compute accurate Bounding Box strictly on visible meshes with geometry
    model.updateMatrixWorld(true);
    const box = new THREE.Box3();
    let validMeshes = 0;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        if (m.visible && m.geometry) {
          m.geometry.computeBoundingBox();
          box.expandByObject(m);
          validMeshes++;
        }
      }
    });

    if (box.isEmpty()) {
      box.setFromObject(model);
    }

    const initialSize = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(initialSize.x, initialSize.y, initialSize.z);

    // 3. Normalized Auto-scaling
    if (!isDefaultCar && maxDim > 0) {
      // Determine if it's a single part (e.g. wheel / spoiler) or a full vehicle
      const isSinglePart = validMeshes <= 4 && maxDim < 2.2;
      const targetDim = isSinglePart ? 1.6 : 4.5;

      // Scale model if its dimensions diverge from target (e.g. exported in mm, cm, or unit cube)
      if (maxDim > 6.0 || maxDim < 2.0) {
        const scaleFactor = targetDim / maxDim;
        model.scale.setScalar(scaleFactor);
      }
    }

    // 4. Recompute box after scaling and center on showroom floor
    model.updateMatrixWorld(true);
    const scaledBox = new THREE.Box3();
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        if (m.visible && m.geometry) {
          scaledBox.expandByObject(m);
        }
      }
    });
    if (scaledBox.isEmpty()) {
      scaledBox.setFromObject(model);
    }

    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    const scaledSize = scaledBox.getSize(new THREE.Vector3());

    // Center model precisely: X=0, Z=0, and base rests on Y=0 floor
    model.position.x = -scaledCenter.x;
    model.position.z = -scaledCenter.z;
    model.position.y = -scaledBox.min.y;

    // Contact shadow if default car
    if (isDefaultCar) {
      new THREE.TextureLoader().load("/models/ferrari_ao.png", (aoTex) => {
        const shadowGeo = new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4);
        const shadowMat = new THREE.MeshBasicMaterial({
          map: aoTex,
          blending: THREE.MultiplyBlending,
          premultipliedAlpha: true,
          toneMapped: false,
          transparent: true,
          opacity: 0.92,
          depthWrite: false
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.set(0, 0.005, 0);
        shadowMesh.renderOrder = 2;
        model.add(shadowMesh);
      });
    }

    // Adjust camera target
    if (controlsRef.current) {
      controlsRef.current.target.set(0, Math.max(0.35, scaledSize.y * 0.35), 0);
      controlsRef.current.update();
    }
  }, [config.headlightsOn]);

  // --- LOAD MODEL FUNCTION (GLB, GLTF, FBX, OR DEFAULT) ---
  const loadActiveModel = useCallback(
    (modelData?: CustomModelData | null) => {
      const scene = sceneRef.current;
      const carGroup = carGroupRef.current;
      if (!scene || !carGroup) return;

      const currentLoadId = ++activeLoadIdRef.current;

      // 1. Thoroughly remove and dispose any existing models in carGroup and scene
      while (carGroup.children.length > 0) {
        const child = carGroup.children[0];
        carGroup.remove(child);
        child.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const m = node as THREE.Mesh;
            m.geometry?.dispose();
          }
        });
      }

      // Also ensure no stray car model is lingering in scene directly
      if (carModelRef.current && carModelRef.current.parent === scene) {
        scene.remove(carModelRef.current);
      }
      carModelRef.current = null;
      bodyMeshesRef.current = [];
      rimMeshesRef.current = [];
      caliperMeshesRef.current = [];
      headlightMeshesRef.current = [];

      setLoading(true);
      setLoadProgress(15);

      // Helper to finalize adding model to carGroup
      const onModelLoaded = (model: THREE.Object3D, isDefault: boolean) => {
        if (currentLoadId !== activeLoadIdRef.current) return;
        carModelRef.current = model;
        setupModelHierarchy(model, isDefault);
        carGroup.add(model);
        setLoading(false);
      };

      // 1. Load FBX
      if (modelData && modelData.extension === "fbx") {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
          modelData.url,
          (fbx) => {
            onModelLoaded(fbx, false);
          },
          (xhr) => {
            if (xhr.total > 0) setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
          },
          (err) => {
            console.error("Gagal load FBX:", err);
            setLoading(false);
          }
        );
        return;
      }

      // 2. Load GLB / GLTF
      const manager = new THREE.LoadingManager();
      if (modelData?.filesMap) {
        manager.setURLModifier((url) => {
          const filename = url.split("/").pop() || "";
          if (modelData.filesMap && modelData.filesMap[filename]) {
            return modelData.filesMap[filename];
          }
          return url;
        });
      }

      const gltfLoader = new GLTFLoader(manager);
      if (dracoLoaderRef.current) {
        gltfLoader.setDRACOLoader(dracoLoaderRef.current);
      }

      const modelUrl = modelData ? modelData.url : "/models/ferrari.glb";
      const isDefault = !modelData;

      gltfLoader.load(
        modelUrl,
        (gltf) => {
          onModelLoaded(gltf.scene, isDefault);
        },
        (xhr) => {
          if (xhr.total > 0) {
            setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
          } else {
            setLoadProgress(80);
          }
        },
        (err) => {
          console.error("Gagal load model GLTF/GLB:", err);
          setLoading(false);
        }
      );
    },
    [setupModelHierarchy]
  );

  // Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.04);

    // Dedicated group container for the car model
    const carGroup = new THREE.Group();
    carGroup.name = "carGroupContainer";
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(...CAMERA_CONFIGS.exterior.pos);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 1.5;
    controls.maxDistance = 14.0;
    controls.target.set(...CAMERA_CONFIGS.exterior.target);
    controls.autoRotate = config.autoRotate;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const overheadLight = new THREE.DirectionalLight(0xffffff, 2.5);
    overheadLight.position.set(2, 8, 4);
    overheadLight.castShadow = true;
    overheadLight.shadow.mapSize.width = 2048;
    overheadLight.shadow.mapSize.height = 2048;
    overheadLight.shadow.bias = -0.00008;
    scene.add(overheadLight);

    const rimFill = new THREE.DirectionalLight(0x00e5ff, 1.4);
    rimFill.position.set(-6, 3, -6);
    scene.add(rimFill);

    const rearLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rearLight.position.set(0, 4, -8);
    scene.add(rearLight);

    // Dynamic Headlight Spotlights
    const spotL = new THREE.SpotLight(0xc8f5ff, 0, 16, Math.PI / 4, 0.5, 1.2);
    spotL.position.set(0.65, 0.62, 2.2);
    spotL.target.position.set(0.65, 0.0, 9);
    scene.add(spotL);
    scene.add(spotL.target);
    spotLightLeftRef.current = spotL;

    const spotR = new THREE.SpotLight(0xc8f5ff, 0, 16, Math.PI / 4, 0.5, 1.2);
    spotR.position.set(-0.65, 0.62, 2.2);
    spotR.target.position.set(-0.65, 0.0, 9);
    scene.add(spotR);
    scene.add(spotR.target);
    spotLightRightRef.current = spotR;

    // 6. HDRI Environment Map Loading (HDRLoader)
    const hdrLoader = new HDRLoader();
    const loadHdrEnv = (path: string) => {
      if (hdrCacheRef.current[path]) {
        scene.environment = hdrCacheRef.current[path];
        return;
      }
      hdrLoader.load(path, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        hdrCacheRef.current[path] = texture;
        scene.environment = texture;
      });
    };

    loadHdrEnv("/models/monochrome_studio_02_1k.hdr");

    // 7. Showroom Turntable Floor Platform
    const stageGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.06, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d14,
      roughness: 0.18,
      metalness: 0.85,
      envMapIntensity: 1.5
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.y = -0.03;
    stageMesh.receiveShadow = true;
    scene.add(stageMesh);

    const ringGeo = new THREE.RingGeometry(4.82, 4.9, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.002;
    scene.add(ringMesh);

    const outerFloorGeo = new THREE.PlaneGeometry(80, 80);
    const outerFloorMat = new THREE.MeshStandardMaterial({
      color: 0x05070a,
      roughness: 0.4,
      metalness: 0.6
    });
    const outerFloor = new THREE.Mesh(outerFloorGeo, outerFloorMat);
    outerFloor.rotation.x = -Math.PI / 2;
    outerFloor.position.y = -0.04;
    outerFloor.receiveShadow = true;
    scene.add(outerFloor);

    const grid = new THREE.GridHelper(50, 50, 0x00e5ff, 0x171f2c);
    grid.position.y = -0.035;
    scene.add(grid);

    // 8. Textures & Materials
    const carbonTex = createCarbonFiberTexture();
    const carbonBump = createCarbonBumpMap();
    const tireTex = createTireTexture();
    const rotorTex = createBrakeRotorTexture();

    bodyMaterialRef.current = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.selectedColor.hex),
      metalness: 0.85,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.8
    });

    rimMaterialRef.current = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.selectedWheel.finishHex),
      roughness: config.selectedWheel.roughness,
      metalness: config.selectedWheel.metalness,
      envMapIntensity: 2.0
    });

    caliperMaterialRef.current = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.selectedCaliper.hex),
      roughness: 0.16,
      metalness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.6
    });

    sharedMaterialsRef.current = {
      glassMat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x0d121c),
        transmission: 0.65,
        opacity: 1.0,
        transparent: true,
        roughness: 0.02,
        metalness: 0.15,
        ior: 1.52,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        envMapIntensity: 2.2
      }),
      carbonMaterial: new THREE.MeshPhysicalMaterial({
        color: 0x141416,
        map: carbonTex,
        bumpMap: carbonBump,
        bumpScale: 0.04,
        roughness: 0.22,
        metalness: 0.6,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.8
      }),
      tireMaterial: new THREE.MeshStandardMaterial({
        color: 0x141518,
        map: tireTex,
        bumpMap: tireTex,
        bumpScale: 0.02,
        roughness: 0.88,
        metalness: 0.05
      }),
      rotorMaterial: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: rotorTex,
        roughness: 0.32,
        metalness: 0.95,
        envMapIntensity: 1.5
      }),
      interiorCarpetMat: new THREE.MeshStandardMaterial({
        color: 0x101114,
        roughness: 0.95,
        metalness: 0.05
      }),
      interiorLeatherMat: new THREE.MeshStandardMaterial({
        color: 0x151619,
        roughness: 0.65,
        metalness: 0.12
      }),
      interiorTrimMat: new THREE.MeshStandardMaterial({
        color: 0x1c1e23,
        roughness: 0.55,
        metalness: 0.3
      }),
      chromeMat: new THREE.MeshStandardMaterial({
        color: 0xf5f7fa,
        metalness: 1.0,
        roughness: 0.03,
        envMapIntensity: 2.0
      }),
      blackPlasticMat: new THREE.MeshStandardMaterial({
        color: 0x17181b,
        roughness: 0.75,
        metalness: 0.1
      })
    };

    // 9. Draco Loader setup
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    dracoLoaderRef.current = dracoLoader;

    // 10. Animation Loop
    let animationId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      if (isTransitioningRef.current && cameraRef.current && controlsRef.current) {
        const cam = cameraRef.current;
        const ctrl = controlsRef.current;
        cam.position.lerp(targetCamPosRef.current, 0.05);
        ctrl.target.lerp(targetCamLookRef.current, 0.05);

        if (cam.position.distanceTo(targetCamPosRef.current) < 0.04) {
          isTransitioningRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      dracoLoader.dispose();
      renderer.dispose();
      container.replaceChildren();
      carGroupRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Reload model when customModel prop changes
  useEffect(() => {
    if (sceneRef.current) {
      loadActiveModel(customModel);
    }
  }, [customModel, loadActiveModel]);

  // React to Paint Color and Finish Changes
  useEffect(() => {
    if (!bodyMaterialRef.current) return;
    const { selectedColor, selectedFinish } = config;
    const mat = bodyMaterialRef.current;

    mat.color.set(selectedColor.hex);

    if (selectedFinish === "gloss") {
      mat.roughness = 0.12;
      mat.metalness = 0.75;
      mat.clearcoat = 1.0;
      mat.clearcoatRoughness = 0.03;
      mat.envMapIntensity = 1.8;
    } else if (selectedFinish === "metallic") {
      mat.roughness = 0.18;
      mat.metalness = 0.95;
      mat.clearcoat = 1.0;
      mat.clearcoatRoughness = 0.07;
      mat.envMapIntensity = 2.2;
    } else if (selectedFinish === "matte") {
      mat.roughness = 0.65;
      mat.metalness = 0.35;
      mat.clearcoat = 0.12;
      mat.clearcoatRoughness = 0.45;
      mat.envMapIntensity = 1.1;
    }

    mat.needsUpdate = true;
  }, [config.selectedColor, config.selectedFinish]);

  // React to Wheel Finish Changes
  useEffect(() => {
    if (!rimMaterialRef.current) return;
    const { selectedWheel } = config;
    const mat = rimMaterialRef.current;

    mat.color.set(selectedWheel.finishHex);
    mat.roughness = selectedWheel.roughness;
    mat.metalness = selectedWheel.metalness;
    mat.needsUpdate = true;
  }, [config.selectedWheel]);

  // React to Caliper Color Changes
  useEffect(() => {
    if (!caliperMaterialRef.current) return;
    const { selectedCaliper } = config;
    const mat = caliperMaterialRef.current;

    mat.color.set(selectedCaliper.hex);
    mat.needsUpdate = true;
  }, [config.selectedCaliper]);

  // React to Headlights Toggle
  useEffect(() => {
    const { headlightsOn } = config;

    if (spotLightLeftRef.current) {
      spotLightLeftRef.current.intensity = headlightsOn ? 14 : 0;
    }
    if (spotLightRightRef.current) {
      spotLightRightRef.current.intensity = headlightsOn ? 14 : 0;
    }

    // Update individual headlight materials (from custom multi-material models like GT-R)
    headlightMaterialsRef.current.forEach((mat) => {
      mat.emissive.set(headlightsOn ? 0xe0f7ff : 0x000000);
      mat.emissiveIntensity = headlightsOn ? 4.8 : 0;
      mat.needsUpdate = true;
    });

    // Update headlight meshes
    headlightMeshesRef.current.forEach((mesh) => {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => {
          const mat = m as THREE.MeshStandardMaterial;
          if (mat && mat.emissive) {
            mat.emissive.set(headlightsOn ? 0xe0f7ff : 0x000000);
            mat.emissiveIntensity = headlightsOn ? 4.8 : 0;
            mat.needsUpdate = true;
          }
        });
      } else {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && mat.emissive) {
          mat.emissive.set(headlightsOn ? 0xe0f7ff : 0x000000);
          mat.emissiveIntensity = headlightsOn ? 4.8 : 0;
          mat.needsUpdate = true;
        }
      }
    });
  }, [config.headlightsOn]);

  // React to Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = config.autoRotate;
    }
  }, [config.autoRotate]);

  // React to Studio Environment Changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const hdrLoader = new HDRLoader();

    const switchHdr = (hdrPath: string, bgColor: number) => {
      scene.background = new THREE.Color(bgColor);
      scene.fog = new THREE.FogExp2(bgColor, 0.04);

      if (hdrCacheRef.current[hdrPath]) {
        scene.environment = hdrCacheRef.current[hdrPath];
      } else {
        hdrLoader.load(hdrPath, (tex) => {
          tex.mapping = THREE.EquirectangularReflectionMapping;
          hdrCacheRef.current[hdrPath] = tex;
          scene.environment = tex;
        });
      }
    };

    if (config.studioEnv === "dark-showroom") {
      switchHdr("/models/monochrome_studio_02_1k.hdr", 0x07090e);
    } else if (config.studioEnv === "warm-studio") {
      switchHdr("/models/ferndale_studio_04_1k.hdr", 0x0c0b0f);
    } else if (config.studioEnv === "sunset-outdoor") {
      switchHdr("/models/venice_sunset_1k.hdr", 0x140e11);
    } else if (config.studioEnv === "pure-white") {
      switchHdr("/models/monochrome_studio_02_1k.hdr", 0xf1f3f6);
    }
  }, [config.studioEnv]);

  // React to Camera Preset
  useEffect(() => {
    const preset = CAMERA_CONFIGS[config.cameraPreset];
    if (preset) {
      targetCamPosRef.current.set(...preset.pos);
      targetCamLookRef.current.set(...preset.target);
      isTransitioningRef.current = true;
    }
  }, [config.cameraPreset]);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    targetCamPosRef.current.set(...CAMERA_CONFIGS.exterior.pos);
    targetCamLookRef.current.set(...CAMERA_CONFIGS.exterior.target);
    isTransitioningRef.current = true;
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-[#07090e]">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Screen Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#070b12]/95 backdrop-blur-xl flex flex-col items-center justify-center z-30 transition-opacity duration-500">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 border-t-[#00e5ff] animate-spin" />
            <Sparkles className="w-8 h-8 text-[#00e5ff] absolute animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-white tracking-widest uppercase mb-2">
            Loading Showroom 3D
          </h3>
          <p className="text-xs font-mono text-cyan-400/80 mb-4 tracking-wider">
            {customModel ? `LOADING ${customModel.name.toUpperCase()} • ${loadProgress}%` : `PREPARING APEX CARBON CHASSIS • ${loadProgress}%`}
          </p>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-[#00e5ff] transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* HUD Info Badges */}
      <div className="absolute top-6 left-6 pointer-events-none flex flex-col gap-2 z-10">
        <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase">
            {customModel ? `CUSTOM MODEL: ${customModel.name}` : `3D ENGINE ACTIVE • ${fps} FPS`}
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 bg-slate-950/50 px-2 py-0.5 rounded-sm backdrop-blur-sm self-start">
          DRAG TO ROTATE • SCROLL TO ZOOM • RIGHT CLICK TO PAN
        </div>
      </div>

      {/* Reset Camera Quick Button */}
      <button
        type="button"
        onClick={handleResetCamera}
        title="Reset Camera View"
        className="absolute bottom-6 left-6 z-10 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-sm text-xs font-mono flex items-center gap-2 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>RESET CAM</span>
      </button>
    </div>
  );
};
