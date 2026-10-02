"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RotateCw, RefreshCw, Loader2 } from "lucide-react";

interface Item3DViewerProps {
  category: "velg" | "ban" | "kap-mesin" | "spoiler" | "rem";
  itemName: string;
  modelUrl?: string;
}

export const Item3DViewer: React.FC<Item3DViewerProps> = ({ category, itemName, modelUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const autoRotateRef = useRef(true);
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    // Scene setup - Clean White Studio Showroom
    // Scene setup - Pure White Studio Showroom
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera setup - positioned slightly off-center to emphasize the corner perspective
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0.65, 0.7, 3.8);
    camera.lookAt(0, 0, 0);

    // Renderer setup (balanced tone mapping, pure white studio look)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.replaceChildren(renderer.domElement);

    // --- PROCEDURAL CLEAN WHITE CERAMIC TILE TEXTURE ---
    const createWhiteCeramicTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Base grout line color (subtle clean light grey seam)
      ctx.fillStyle = "#f0f2f5";
      ctx.fillRect(0, 0, 256, 256);

      // Draw 2x2 ceramic tile squares
      const tileSize = 122;
      const margin = 3;
      const tileShades = ["#ffffff", "#fdfefe", "#fafbfc", "#ffffff"];

      let idx = 0;
      for (let x = 0; x < 256; x += 128) {
        for (let y = 0; y < 256; y += 128) {
          ctx.fillStyle = tileShades[idx % tileShades.length];
          ctx.fillRect(x + margin, y + margin, tileSize, tileSize);

          // Subtle glossy reflection bevel on tile border
          ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x + margin + 1, y + margin + 1, tileSize - 2, tileSize - 2);

          // Ultra-light tile seam border
          ctx.strokeStyle = "rgba(226, 232, 240, 0.6)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + margin, y + margin, tileSize, tileSize);

          idx++;
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      return tex;
    };

    const whiteCeramicTex = createWhiteCeramicTexture();

    // White Ceramic Floor Material (Glossy pure white porcelain ceramic reflections)
    const ceramicFloorMat = new THREE.MeshStandardMaterial({
      map: whiteCeramicTex || undefined,
      color: 0xffffff,
      roughness: 0.16, // Glossy ceramic reflection
      metalness: 0.05,
    });

    // White Studio Wall Material (Bright clean white studio corner)
    const wallTex = createWhiteCeramicTexture();
    if (wallTex) wallTex.repeat.set(4, 3);
    const whiteWallMat = new THREE.MeshStandardMaterial({
      map: wallTex || undefined,
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.02,
    });

    // Baseboard Skirting Trim Material (Clean modern architectural trim)
    const skirtingMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      metalness: 0.15,
    });

    // 1. Ceramic Floor Plane
    const floorGeo = new THREE.PlaneGeometry(14, 14);
    const floorMesh = new THREE.Mesh(floorGeo, ceramicFloorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -1.1, 0);
    scene.add(floorMesh);

    // 2. Back Wall (at z = -2.6)
    const backWallGeo = new THREE.PlaneGeometry(14, 8);
    const backWall = new THREE.Mesh(backWallGeo, whiteWallMat);
    backWall.position.set(0, 2.9, -2.6);
    scene.add(backWall);

    // 3. Left Corner Wall (at x = -3.2, meeting back wall to form authentic room corner)
    const leftWallGeo = new THREE.PlaneGeometry(14, 8);
    const leftWall = new THREE.Mesh(leftWallGeo, whiteWallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-3.2, 2.9, 4.4);
    scene.add(leftWall);

    // 4. Baseboard Trim (Accentuates the corner seam where walls meet floor)
    const backBaseboard = new THREE.Mesh(new THREE.BoxGeometry(14, 0.09, 0.04), skirtingMat);
    backBaseboard.position.set(0, -1.055, -2.58);
    scene.add(backBaseboard);

    const leftBaseboard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 14), skirtingMat);
    leftBaseboard.position.set(-3.18, -1.055, 4.4);
    scene.add(leftBaseboard);

    // --- STUDIO LIGHTING SYSTEM (BRIGHT WHITE STUDIO + DIRECT PRODUCT FOCUS) ---
    // Target anchor at product center (0, 0, 0)
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(0, 0, 0);
    scene.add(lightTarget);

    // Studio Hemisphere Light (Ensures white walls and floors never look muddy grey)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf8fafc, 1.35);
    scene.add(hemiLight);

    // Ambient Fill Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Studio Wall & Floor Fill Light (Gently washes walls and corner with bright white light)
    const studioFillLight = new THREE.DirectionalLight(0xffffff, 1.15);
    studioFillLight.position.set(-1.0, 4.0, 3.8);
    scene.add(studioFillLight);

    // 1. Primary Focused Spotlight (Directly on Product)
    const primarySpotlight = new THREE.SpotLight(0xffffff, 3.5, 22, Math.PI / 4.2, 0.4, 1.1);
    primarySpotlight.position.set(1.8, 4.8, 3.2);
    primarySpotlight.target = lightTarget;
    scene.add(primarySpotlight);

    // 2. Overhead Spotlight (creates top specular highlight on the product)
    const topSpotlight = new THREE.SpotLight(0xffffff, 2.5, 15, Math.PI / 4.8, 0.45, 1.0);
    topSpotlight.position.set(0, 4.6, 0.4);
    topSpotlight.target = lightTarget;
    scene.add(topSpotlight);

    // 3. Cyan Accent Rim Spotlight
    const cyanRimSpot = new THREE.SpotLight(0x00d4ec, 1.8, 16, Math.PI / 3.8, 0.55, 1.0);
    cyanRimSpot.position.set(-2.8, 2.6, 2.2);
    cyanRimSpot.target = lightTarget;
    scene.add(cyanRimSpot);

    // 4. Soft Contact Shadow on White Ceramic Floor beneath Product
    const createFloorContactShadow = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
      grad.addColorStop(0, "rgba(15, 23, 42, 0.35)");
      grad.addColorStop(0.35, "rgba(51, 65, 85, 0.12)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);

      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    };

    const shadowTex = createFloorContactShadow();
    if (shadowTex) {
      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 2.6),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.75 })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(0, -1.09, 0);
      scene.add(shadowMesh);
    }

    // Build Category 3D Model
    const rawModelGroup = new THREE.Group();

    // Standard Materials
    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x141a26,
      metalness: 0.85,
      roughness: 0.28,
    });

    const cyanAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x002233,
    });

    const darkAlloyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e2638,
      metalness: 0.92,
      roughness: 0.25,
    });

    const rubberMaterial = new THREE.MeshStandardMaterial({
      color: 0x12151b,
      roughness: 0.9,
      metalness: 0.05,
    });

    const steelRotorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a99ad,
      metalness: 0.95,
      roughness: 0.35,
    });

    // 1. VELG (WHEEL / RIM)
    if (category === "velg") {
      const barrelGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.55, 36, 1, true);
      const barrel = new THREE.Mesh(barrelGeo, darkAlloyMaterial);
      barrel.rotation.x = Math.PI / 2;
      rawModelGroup.add(barrel);

      const lipGeo = new THREE.TorusGeometry(0.96, 0.035, 16, 36);
      const lip = new THREE.Mesh(lipGeo, cyanAccentMaterial);
      lip.position.z = 0.27;
      rawModelGroup.add(lip);

      const hubGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.18, 24);
      const hub = new THREE.Mesh(hubGeo, darkAlloyMaterial);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = 0.12;
      rawModelGroup.add(hub);

      const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 24);
      const cap = new THREE.Mesh(capGeo, cyanAccentMaterial);
      cap.rotation.x = Math.PI / 2;
      cap.position.z = 0.14;
      rawModelGroup.add(cap);

      const spokeCount = 10;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i * Math.PI * 2) / spokeCount;
        const spokeGeo = new THREE.BoxGeometry(0.09, 0.72, 0.05);
        const spoke = new THREE.Mesh(spokeGeo, i % 2 === 0 ? darkAlloyMaterial : carbonMaterial);
        spoke.position.x = Math.cos(angle) * 0.48;
        spoke.position.y = Math.sin(angle) * 0.48;
        spoke.position.z = 0.18;
        spoke.rotation.z = angle + Math.PI / 2;
        rawModelGroup.add(spoke);

        if (i < 5) {
          const boltAngle = (i * Math.PI * 2) / 5;
          const boltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 10);
          const bolt = new THREE.Mesh(boltGeo, cyanAccentMaterial);
          bolt.rotation.x = Math.PI / 2;
          bolt.position.x = Math.cos(boltAngle) * 0.18;
          bolt.position.y = Math.sin(boltAngle) * 0.18;
          bolt.position.z = 0.21;
          rawModelGroup.add(bolt);
        }
      }
    }

    // 2. BAN (TIRE)
    else if (category === "ban") {
      const tireGeo = new THREE.TorusGeometry(0.85, 0.32, 24, 40);
      const tire = new THREE.Mesh(tireGeo, rubberMaterial);
      rawModelGroup.add(tire);

      const innerRingGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.44, 32, 1, true);
      const innerRing = new THREE.Mesh(innerRingGeo, darkAlloyMaterial);
      innerRing.rotation.x = Math.PI / 2;
      rawModelGroup.add(innerRing);

      [-0.12, -0.04, 0.04, 0.12].forEach((offset) => {
        const grooveGeo = new THREE.TorusGeometry(1.15, 0.018, 12, 40);
        const groove = new THREE.Mesh(grooveGeo, darkAlloyMaterial);
        groove.position.z = offset;
        rawModelGroup.add(groove);
      });

      for (let i = 0; i < 24; i++) {
        const angle = (i * Math.PI * 2) / 24;
        const blockGeo = new THREE.BoxGeometry(0.035, 0.1, 0.38);
        const block = new THREE.Mesh(blockGeo, rubberMaterial);
        block.position.x = Math.cos(angle) * 1.15;
        block.position.y = Math.sin(angle) * 1.15;
        block.rotation.z = angle;
        rawModelGroup.add(block);
      }

      const brandingGeo = new THREE.TorusGeometry(0.98, 0.015, 12, 36);
      const branding = new THREE.Mesh(brandingGeo, cyanAccentMaterial);
      branding.position.z = 0.21;
      rawModelGroup.add(branding);
    }

    // 3. KAP MESIN (CARBON HOOD)
    else if (category === "kap-mesin") {
      const hoodShape = new THREE.Shape();
      hoodShape.moveTo(-0.75, -0.65);
      hoodShape.lineTo(0.75, -0.65);
      hoodShape.lineTo(0.62, 0.7);
      hoodShape.lineTo(-0.62, 0.7);
      hoodShape.closePath();

      const extrudeSettings = { depth: 0.035, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.025, bevelThickness: 0.02 };
      const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, extrudeSettings);
      const hood = new THREE.Mesh(hoodGeo, carbonMaterial);
      hood.rotation.x = -Math.PI / 4;
      rawModelGroup.add(hood);

      const cowlGeo = new THREE.BoxGeometry(0.34, 0.75, 0.05);
      const cowl = new THREE.Mesh(cowlGeo, darkAlloyMaterial);
      cowl.position.set(0, 0.04, 0.04);
      cowl.rotation.x = -Math.PI / 4;
      rawModelGroup.add(cowl);

      [-0.34, 0.34].forEach((xPos) => {
        for (let l = 0; l < 3; l++) {
          const louverGeo = new THREE.BoxGeometry(0.14, 0.03, 0.025);
          const louver = new THREE.Mesh(louverGeo, cyanAccentMaterial);
          louver.position.set(xPos, 0.16 - l * 0.1, 0.06);
          louver.rotation.x = -Math.PI / 4 - 0.2;
          rawModelGroup.add(louver);
        }
      });
    }

    // 4. SPOILER (CARBON GT WING)
    else if (category === "spoiler") {
      const wingGeo = new THREE.BoxGeometry(1.7, 0.045, 0.32);
      const wing = new THREE.Mesh(wingGeo, carbonMaterial);
      wing.position.set(0, 0.22, 0);
      wing.rotation.x = 0.12;
      rawModelGroup.add(wing);

      const flapGeo = new THREE.BoxGeometry(1.68, 0.03, 0.015);
      const flap = new THREE.Mesh(flapGeo, cyanAccentMaterial);
      flap.position.set(0, 0.25, 0.15);
      rawModelGroup.add(flap);

      [-0.85, 0.85].forEach((xPos) => {
        const endplateGeo = new THREE.BoxGeometry(0.025, 0.28, 0.38);
        const endplate = new THREE.Mesh(endplateGeo, darkAlloyMaterial);
        endplate.position.set(xPos, 0.22, 0);
        rawModelGroup.add(endplate);

        const stripeGeo = new THREE.BoxGeometry(0.03, 0.02, 0.36);
        const stripe = new THREE.Mesh(stripeGeo, cyanAccentMaterial);
        stripe.position.set(xPos, 0.34, 0);
        rawModelGroup.add(stripe);
      });

      [-0.42, 0.42].forEach((xPos) => {
        const uprightGeo = new THREE.BoxGeometry(0.035, 0.48, 0.06);
        const upright = new THREE.Mesh(uprightGeo, darkAlloyMaterial);
        upright.position.set(xPos, 0.02, -0.05);
        upright.rotation.x = -0.22;
        rawModelGroup.add(upright);

        const baseGeo = new THREE.BoxGeometry(0.1, 0.025, 0.16);
        const base = new THREE.Mesh(baseGeo, darkAlloyMaterial);
        base.position.set(xPos, -0.22, -0.12);
        rawModelGroup.add(base);
      });
    }

    // 5. REM (BRAKE ROTOR & RACING CALIPER)
    else if (category === "rem") {
      const rotorGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.06, 36);
      const rotor = new THREE.Mesh(rotorGeo, steelRotorMaterial);
      rotor.rotation.x = Math.PI / 2;
      rawModelGroup.add(rotor);

      for (let s = 0; s < 12; s++) {
        const sAngle = (s * Math.PI * 2) / 12;
        const slotGeo = new THREE.BoxGeometry(0.018, 0.3, 0.07);
        const slot = new THREE.Mesh(slotGeo, darkAlloyMaterial);
        slot.position.x = Math.cos(sAngle) * 0.6;
        slot.position.y = Math.sin(sAngle) * 0.6;
        slot.rotation.z = sAngle + 0.4;
        rawModelGroup.add(slot);
      }

      const hatGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.14, 24);
      const hat = new THREE.Mesh(hatGeo, darkAlloyMaterial);
      hat.rotation.x = Math.PI / 2;
      hat.position.z = 0.04;
      rawModelGroup.add(hat);

      for (let b = 0; b < 8; b++) {
        const bAngle = (b * Math.PI * 2) / 8;
        const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 12);
        const pin = new THREE.Mesh(pinGeo, cyanAccentMaterial);
        pin.rotation.x = Math.PI / 2;
        pin.position.x = Math.cos(bAngle) * 0.44;
        pin.position.y = Math.sin(bAngle) * 0.44;
        pin.position.z = 0.06;
        rawModelGroup.add(pin);
      }

      const caliperGeo = new THREE.BoxGeometry(0.32, 0.72, 0.24);
      const caliper = new THREE.Mesh(caliperGeo, cyanAccentMaterial);
      caliper.position.set(0.68, 0.16, 0.025);
      caliper.rotation.z = -0.3;
      rawModelGroup.add(caliper);

      const badgeGeo = new THREE.BoxGeometry(0.035, 0.34, 0.2);
      const badge = new THREE.Mesh(badgeGeo, carbonMaterial);
      badge.position.set(0.85, 0.16, 0.025);
      badge.rotation.z = -0.3;
      rawModelGroup.add(badge);
    }

    // AUTOMATIC BOUNDING BOX CENTERING & NORMALIZATION
    const pivotGroup = new THREE.Group();
    pivotGroup.rotation.x = 0.25;
    pivotGroup.rotation.y = 0.45;
    scene.add(pivotGroup);

    const attachProceduralModel = () => {
      const bbox = new THREE.Box3().setFromObject(rawModelGroup);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z) || 1;

      rawModelGroup.position.set(-center.x, -center.y, -center.z);
      pivotGroup.add(rawModelGroup);

      const targetSize = 1.65;
      pivotGroup.scale.setScalar(targetSize / maxDimension);
    };

    if (modelUrl) {
      setIsLoading(true);

      const processImportedObject = (obj: THREE.Object3D) => {
        const bbox = new THREE.Box3();
        let meshCount = 0;

        obj.traverse((child) => {
          // Ignore/hide imported cameras and lights (Blender often exports cameras at position 8000+ which breaks bounding box!)
          if ((child as any).isCamera || (child as any).isLight) {
            child.visible = false;
            return;
          }

          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;

            // Expand bounding box ONLY by actual visual meshes
            bbox.expandByObject(m);
            meshCount++;

            // Recompute normals in case Blender normals were inverted or missing
            if (m.geometry) {
              m.geometry.computeVertexNormals();
            }

            // Upgrade and fix materials
            const upgradeMaterial = (oldMat: any) => {
              if (!oldMat) {
                return new THREE.MeshStandardMaterial({
                  color: 0xb5c0cc,
                  metalness: 0.85,
                  roughness: 0.25,
                  side: THREE.DoubleSide,
                });
              }

              // Always ensure both sides are rendered so inverted faces from Blender are never invisible
              oldMat.side = THREE.DoubleSide;

              // Only adjust if material is pitch black without any texture map
              const hasMap = !!oldMat.map;
              const isBlack = oldMat.color && (oldMat.color.r < 0.03 && oldMat.color.g < 0.03 && oldMat.color.b < 0.03);

              if (isBlack && !hasMap) {
                if (oldMat.color) {
                  oldMat.color.setHex(0xb5c0cc);
                }
                if ("metalness" in oldMat) oldMat.metalness = 0.8;
                if ("roughness" in oldMat) oldMat.roughness = 0.25;
              }

              oldMat.needsUpdate = true;
              return oldMat;
            };

            if (Array.isArray(m.material)) {
              m.material = m.material.map(upgradeMaterial);
            } else {
              m.material = upgradeMaterial(m.material);
            }
          }
        });

        // Fallback if no meshes found in hierarchy
        if (meshCount === 0) {
          bbox.setFromObject(obj);
        }

        // Center and scale model into the studio frame
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;

        obj.position.set(-center.x, -center.y, -center.z);
        pivotGroup.add(obj);

        const targetSize = 1.65;
        pivotGroup.scale.setScalar(targetSize / maxDimension);
        setIsLoading(false);
      };

      const isGlb = modelUrl.toLowerCase().endsWith(".glb") || modelUrl.toLowerCase().endsWith(".gltf");

      if (isGlb) {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
          modelUrl,
          (gltf) => {
            processImportedObject(gltf.scene);
          },
          undefined,
          (err) => {
            console.error("GLTF load failed, using procedural fallback:", err);
            attachProceduralModel();
            setIsLoading(false);
          }
        );
      } else {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
          modelUrl,
          (fbx) => {
            processImportedObject(fbx);
          },
          undefined,
          (err) => {
            console.error("FBX load failed, using procedural fallback:", err);
            attachProceduralModel();
            setIsLoading(false);
          }
        );
      }
    } else {
      attachProceduralModel();
    }

    // Interaction handling (Mouse & Touch Orbit)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      pivotGroup.rotation.y += deltaX * 0.01;
      pivotGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handlePointerDown);
    domElement.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    domElement.addEventListener("touchstart", handlePointerDown, { passive: true });
    domElement.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // Zoom clamped safely to never clip
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.002, 2.2, 5.5);
    };
    domElement.addEventListener("wheel", handleWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotateRef.current && !isDragging) {
        pivotGroup.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", handlePointerDown);
      domElement.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      domElement.removeEventListener("touchstart", handlePointerDown);
      domElement.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      domElement.removeEventListener("wheel", handleWheel);

      renderer.dispose();
      scene.clear();
      if (container && container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [category, modelUrl]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-700/70 bg-white group select-none shadow-2xl">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading 3D Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
          <Loader2 className="w-6 h-6 text-[#00e5ff] animate-spin" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 font-bold">
            Memuat Asset 3D...
          </span>
        </div>
      )}

      {/* Floating 3D Badge */}
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#00e5ff] bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#00e5ff]/30 shadow-md pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
        <span>3D MOD STUDIO</span>
      </div>

      <div className="absolute bottom-2.5 left-3 text-[10px] text-slate-300 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-800 shadow-md pointer-events-none flex items-center gap-1.5">
        <RotateCw className="w-3 h-3 text-[#00e5ff]" />
        <span>Klik & geser untuk putar 360°</span>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer border shadow-md ${
            autoRotate
              ? "bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/40"
              : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
          }`}
          title="Putar Otomatis"
        >
          <RefreshCw className={`w-3 h-3 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
          <span>{autoRotate ? "Auto" : "Paused"}</span>
        </button>
      </div>
    </div>
  );
};
