import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { RotateCw, Smartphone, Eye, Layers, Box, ZoomIn, ZoomOut, Sun, Wind, Image as ImageIcon } from 'lucide-react';
import { ThreadClusterIcon } from './ThreadClusterIcon';
import { SwatchPatternView } from './SwatchPatternView';
import { Product } from '../types';
import { resolveHandloomImage } from '../utils/handloomImages';

// Custom web component tag for Google model-viewer
const ModelViewerElement = 'model-viewer' as any;

interface ModelViewer3DProps {
  glbUrl?: string | null;
  sketchfabId?: string | null;
  productName: string;
  material: string;
  modelType?: string;
  swatchPattern?: string | null;
  posterImage?: string;
  product?: Product;
  activeTab?: '3d' | 'swatch' | 'photo';
  onTabChange?: (tab: '3d' | 'swatch' | 'photo') => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onOpenTryOn?: () => void;
}

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  glbUrl,
  sketchfabId,
  productName,
  material,
  modelType = 'saree',
  swatchPattern,
  posterImage,
  product,
  activeTab: controlledTab,
  onTabChange,
  onAddToCart,
  onOpenTryOn,
}) => {
  const [internalTab, setInternalTab] = useState<'3d' | 'swatch' | 'photo'>('photo');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = (tab: '3d' | 'swatch' | 'photo') => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isWaving, setIsWaving] = useState(true);
  const [lightIntensity, setLightIntensity] = useState<'normal' | 'bright' | 'warm'>('warm');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewEngine, setViewEngine] = useState<'model-3d' | 'three' | 'model-viewer'>(
    sketchfabId ? 'model-3d' : 'three'
  );

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const threeStateRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    mesh: THREE.Mesh | null;
    frameId: number | null;
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
    rotation: { x: number; y: number };
    lights: {
      ambient: THREE.AmbientLight | null;
      directional: THREE.DirectionalLight | null;
      goldPoint: THREE.PointLight | null;
    };
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    frameId: null,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
    rotation: { x: 0.2, y: -0.3 },
    lights: { ambient: null, directional: null, goldPoint: null },
  });

  // Generate procedural woven silk texture for 3D drape
  const createTextileTexture = (type: string, name: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Base silk color gradient
    let baseColor = '#7A2734'; // Maroon
    let goldColor = '#D89B2C'; // Gold zari
    let accentColor = '#9A3A49';

    if (name.toLowerCase().includes('ikat') || type === 'stole') {
      baseColor = '#1B2A4A'; // Indigo
      goldColor = '#D89B2C';
      accentColor = '#B83240';
    } else if (name.toLowerCase().includes('chanderi')) {
      baseColor = '#D4AF37'; // Gold tissue
      goldColor = '#FFFFFF';
      accentColor = '#9A7B2C';
    } else if (name.toLowerCase().includes('pashmina') || type === 'shawl') {
      baseColor = '#4A1E29'; // Deep cashmere
      goldColor = '#E6C280';
      accentColor = '#2A1018';
    } else if (name.toLowerCase().includes('jamdani')) {
      baseColor = '#2C3E50'; // Night cotton
      goldColor = '#D89B2C';
      accentColor = '#E6DFD5';
    } else if (name.toLowerCase().includes('kanchipuram')) {
      baseColor = '#5C1D24'; // Crimson temple silk
      goldColor = '#F3C04D';
      accentColor = '#253966';
    }

    // Fill background
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Microscopic warp & weft cross-hatch
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 512; i += 4) {
      ctx.fillRect(i, 0, 1.5, 512);
      ctx.fillRect(0, i, 512, 1.5);
    }

    // Ornate Zari / Handloom Brocade Motifs
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = goldColor;

    if (name.toLowerCase().includes('ikat')) {
      // Geometric double ikat diamonds
      for (let x = 32; x < 512; x += 64) {
        for (let y = 32; y < 512; y += 64) {
          ctx.beginPath();
          ctx.moveTo(x, y - 20);
          ctx.lineTo(x + 20, y);
          ctx.lineTo(x, y + 20);
          ctx.lineTo(x - 20, y);
          ctx.closePath();
          ctx.stroke();

          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (name.toLowerCase().includes('chanderi')) {
      // Ashrafi coin buttis
      for (let x = 40; x < 512; x += 80) {
        for (let y = 40; y < 512; y += 80) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fillStyle = goldColor;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();
        }
      }
    } else {
      // Royal Kadwa / Floral Paisley Jaal
      for (let x = 48; x < 512; x += 96) {
        for (let y = 48; y < 512; y += 96) {
          // Paisley curve
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 1.5);
          ctx.bezierCurveTo(x + 10, y - 20, x + 24, y - 10, x + 14, y + 14);
          ctx.stroke();

          // Gold center
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Temple border pallu stripes
      ctx.fillStyle = goldColor;
      ctx.fillRect(0, 440, 512, 72);
      ctx.fillStyle = baseColor;
      for (let bx = 0; bx < 512; bx += 24) {
        ctx.beginPath();
        ctx.moveTo(bx, 440);
        ctx.lineTo(bx + 12, 470);
        ctx.lineTo(bx + 24, 440);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };

  // Initialize Three.js 3D Drape Scene
  useEffect(() => {
    if (activeTab !== '3d' || viewEngine !== 'three') return;
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x142038);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    // Renderer with antialiasing and high pixel ratio
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clean container before appending
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights for rich silk sheen
    const ambientLight = new THREE.AmbientLight(0xfdfbf7, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    dirLight.position.set(4, 6, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const goldPointLight = new THREE.PointLight(0xd89b2c, 1.8, 10);
    goldPointLight.position.set(-2, -1, 3);
    scene.add(goldPointLight);

    // 3D Draped Textile Parametric Geometry (Silk Saree / Stole Pleats)
    const clothWidth = 2.4;
    const clothHeight = 3.2;
    const segmentsX = 40;
    const segmentsY = 50;

    const geometry = new THREE.PlaneGeometry(clothWidth, clothHeight, segmentsX, segmentsY);

    // Deform flat plane into authentic hanging Saree / Stole S-curves
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const origX = pos.getX(i);
      const origY = pos.getY(i);
      const u = Math.max(0, Math.min(1, (origX + clothWidth / 2) / clothWidth));
      const v = Math.max(0, Math.min(1, (origY + clothHeight / 2) / clothHeight));

      // Realistic draping folds & cascading pleats with clamped math
      const foldWave = Math.sin(u * Math.PI * 6) * 0.18 * (1.1 - v);
      const shoulderDrape = Math.cos(v * Math.PI * 1.5) * 0.22;
      const verticalSag = -Math.pow(Math.max(0, 1 - v), 1.8) * 0.15;

      const newZ = foldWave + shoulderDrape;
      const newY = origY + verticalSag;

      pos.setZ(i, Number.isFinite(newZ) ? newZ : 0);
      pos.setY(i, Number.isFinite(newY) ? newY : origY);
    }
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    // Store base positions for non-destructive wave animation
    const basePositions = geometry.attributes.position.clone();

    // Material with real-time sheen and bump map
    const texture = createTextileTexture(modelType, productName);
    const clothMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.35,
      metalness: 0.25,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, clothMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.y = 0.1;
    scene.add(mesh);

    // Subtle mannequin torso silhouette reference
    const mannequinGeom = new THREE.CylinderGeometry(0.35, 0.45, 1.8, 24);
    const mannequinMat = new THREE.MeshStandardMaterial({
      color: 0x0f1828,
      roughness: 0.8,
      metalness: 0.1,
    });
    const mannequin = new THREE.Mesh(mannequinGeom, mannequinMat);
    mannequin.position.set(0, 0, -0.25);
    scene.add(mannequin);

    threeStateRef.current = {
      scene,
      camera,
      renderer,
      mesh,
      frameId: null,
      isDragging: false,
      prevMousePos: { x: 0, y: 0 },
      rotation: { x: 0.15, y: -0.2 },
      lights: {
        ambient: ambientLight,
        directional: dirLight,
        goldPoint: goldPointLight,
      },
    };

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const state = threeStateRef.current;
      const elapsedTime = clock.getElapsedTime();

      if (state.mesh) {
        // Auto-rotation when not user dragging
        if (isAutoRotate && !state.isDragging) {
          state.rotation.y += 0.006;
        }

        state.mesh.rotation.y = state.rotation.y;
        state.mesh.rotation.x = state.rotation.x;

        if (mannequin) {
          mannequin.rotation.y = state.rotation.y;
          mannequin.rotation.x = state.rotation.x;
        }

        // Gentle silk cloth breeze animation without accumulative drift
        if (isWaving && state.mesh.geometry) {
          const positions = state.mesh.geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) {
            const baseX = basePositions.getX(i);
            const baseY = basePositions.getY(i);
            const baseZ = basePositions.getZ(i);
            const u = Math.max(0, Math.min(1, (baseX + clothWidth / 2) / clothWidth));
            const v = Math.max(0, Math.min(1, (baseY + clothHeight / 2) / clothHeight));
            const wave = Math.sin(elapsedTime * 2.2 + u * 4 + v * 3) * 0.03 * (1 - v);
            positions.setZ(i, baseZ + wave);
          }
          positions.needsUpdate = true;
          state.mesh.geometry.computeVertexNormals();
        }
      }

      renderer.render(scene, camera);
      state.frameId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse & Touch Orbit Controls
    const handleMouseDown = (e: MouseEvent) => {
      threeStateRef.current.isDragging = true;
      threeStateRef.current.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = threeStateRef.current;
      if (!state.isDragging) return;

      const deltaX = e.clientX - state.prevMousePos.x;
      const deltaY = e.clientY - state.prevMousePos.y;

      state.rotation.y += deltaX * 0.01;
      state.rotation.x = Math.max(-0.6, Math.min(0.6, state.rotation.x + deltaY * 0.01));

      state.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      threeStateRef.current.isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        threeStateRef.current.isDragging = true;
        threeStateRef.current.prevMousePos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const state = threeStateRef.current;
      if (!state.isDragging || e.touches.length !== 1) return;

      const deltaX = e.touches[0].clientX - state.prevMousePos.x;
      const deltaY = e.touches[0].clientY - state.prevMousePos.y;

      state.rotation.y += deltaX * 0.012;
      state.rotation.x = Math.max(-0.6, Math.min(0.6, state.rotation.x + deltaY * 0.012));

      state.prevMousePos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      threeStateRef.current.isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Handle Window Resizing
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (threeStateRef.current.frameId) {
        cancelAnimationFrame(threeStateRef.current.frameId);
      }
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      geometry.dispose();
      clothMaterial.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [activeTab, viewEngine, modelType, productName, isAutoRotate, isWaving]);

  // Adjust Lighting Scheme
  const handleToggleLight = () => {
    const lights = threeStateRef.current.lights;
    if (!lights.ambient || !lights.directional || !lights.goldPoint) return;

    if (lightIntensity === 'warm') {
      setLightIntensity('bright');
      lights.ambient.intensity = 1.3;
      lights.directional.intensity = 1.8;
      lights.goldPoint.intensity = 1.0;
    } else if (lightIntensity === 'bright') {
      setLightIntensity('normal');
      lights.ambient.intensity = 0.7;
      lights.directional.intensity = 1.0;
      lights.goldPoint.intensity = 0.8;
    } else {
      setLightIntensity('warm');
      lights.ambient.intensity = 0.9;
      lights.directional.intensity = 1.4;
      lights.goldPoint.intensity = 1.8;
    }
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    const camera = threeStateRef.current.camera;
    if (!camera) return;
    const newZ = Math.max(2.2, Math.min(6.0, camera.position.z + delta));
    camera.position.z = newZ;
    setZoomLevel(Math.round((4.2 / newZ) * 10) / 10);
  };

  // Tab View: 2D Weave Swatch & Thread Lens
  if (activeTab === 'swatch') {
    return (
      <div className="w-full h-full flex flex-col space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#D89B2C]/25">
          <span className="text-xs font-serif font-bold text-[#1B2A4A] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#D89B2C]" />
            <span>Thread Architecture & Microscopic Swatch</span>
          </span>
          <div className="flex items-center gap-1 bg-[#1B2A4A]/5 p-0.5 rounded-xl">
            <button
              onClick={() => setActiveTab('3d')}
              className="px-3 py-1 text-xs font-medium rounded-lg text-[#1B2A4A] hover:bg-white transition-colors flex items-center gap-1"
            >
              <Box className="w-3.5 h-3.5 text-[#D89B2C]" /> 3D Model
            </button>
            <button
              onClick={() => setActiveTab('swatch')}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-[#1B2A4A] text-[#D89B2C] shadow-sm flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-[#D89B2C]" /> Weave Swatch
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className="px-3 py-1 text-xs font-medium rounded-lg text-[#1B2A4A] hover:bg-white transition-colors flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#D89B2C]" /> Main Photo
            </button>
          </div>
        </div>

        <SwatchPatternView
          material={material}
          productName={productName}
          patternKey={swatchPattern || 'antique-zari-kadwa'}
          posterImage={posterImage}
        />
      </div>
    );
  }

  // Tab View: Main High-Resolution Photo View
  if (activeTab === 'photo') {
    const photoUrl = resolveHandloomImage(productName, posterImage);

    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#D89B2C]/25">
          <span className="text-xs font-serif font-bold text-[#1B2A4A] flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#D89B2C]" />
            <span>Artisan Studio Photograph</span>
          </span>
          <div className="flex items-center gap-1 bg-[#1B2A4A]/5 p-0.5 rounded-xl">
            <button
              onClick={() => setActiveTab('photo')}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-[#1B2A4A] text-[#D89B2C] shadow-sm flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#D89B2C]" /> Main Photo
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className="px-3 py-1 text-xs font-medium rounded-lg text-[#1B2A4A] hover:bg-white transition-colors flex items-center gap-1"
            >
              <Box className="w-3.5 h-3.5 text-[#D89B2C]" /> 3D Model
            </button>
            <button
              onClick={() => setActiveTab('swatch')}
              className="px-3 py-1 text-xs font-medium rounded-lg text-[#1B2A4A] hover:bg-white transition-colors flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-[#D89B2C]" /> Weave Swatch
            </button>
          </div>
        </div>

        <div className="relative w-full h-[420px] sm:h-[500px] rounded-2xl overflow-hidden border-2 border-[#D89B2C]/30 shadow-xl bg-black/5 flex items-center justify-center">
          <img
            src={photoUrl}
            alt={productName}
            className="w-full h-full object-cover object-center"
            loading="eager"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = resolveHandloomImage(productName);
            }}
          />
          <div className="absolute bottom-3 left-3 bg-[#1B2A4A]/90 backdrop-blur-md text-[#F6F1E7] text-xs px-3.5 py-1.5 rounded-lg border border-[#D89B2C]/40">
            <span>{productName}</span>
          </div>
        </div>
      </div>
    );
  }

  // Primary 3D Interactive Model Viewer (Three.js WebGL & Google model-viewer)
  return (
    <div className="space-y-3">
      {/* 3D Header Bar with Tab Switching */}
      <div className="flex items-center justify-between pb-2 border-b border-[#D89B2C]/25">
        <div className="flex items-center gap-2">
          <span className="bg-[#1B2A4A] text-[#D89B2C] text-xs font-serif font-bold px-3 py-1 rounded-full border border-[#D89B2C]/40 flex items-center gap-1.5 shadow-sm">
            <ThreadClusterIcon className="w-3.5 h-3.5" />
            <span>Interactive 3D Drape Visualizer</span>
          </span>
          <span className="text-[11px] text-[#1B2A4A]/60 hidden sm:inline">
            360° Cloth Motion • Real-Time Silk Sheen
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#1B2A4A]/5 p-0.5 rounded-xl">
          <button
            onClick={() => setActiveTab('3d')}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-[#1B2A4A] text-[#D89B2C] shadow-sm flex items-center gap-1"
          >
            <Box className="w-3.5 h-3.5 text-[#D89B2C]" /> 3D View
          </button>
          <button
            onClick={() => setActiveTab('swatch')}
            className="px-3 py-1 text-xs font-medium rounded-lg text-[#1B2A4A] hover:bg-white transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-[#D89B2C]" /> Swatch
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className="px-3 py-1 text-xs font-medium rounded-lg text-[#1B2A4A] hover:bg-white transition-colors flex items-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#D89B2C]" /> Main Photo
          </button>
        </div>
      </div>

      {/* 3D Stage Canvas */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl bg-gradient-to-b from-[#142038] via-[#1B2A4A] to-[#0F1828] border-2 border-[#D89B2C]/40 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Floating Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-md ${
                isAutoRotate
                  ? 'bg-[#D89B2C] text-[#1B2A4A] border-[#B87B16]'
                  : 'bg-[#1B2A4A]/90 text-[#F6F1E7] border-[#D89B2C]/40 hover:bg-[#1B2A4A]'
              }`}
              title="Toggle 360° Rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
              <span>{isAutoRotate ? 'Auto-Rotating' : 'Paused'}</span>
            </button>

            <button
              onClick={() => setIsWaving(!isWaving)}
              className={`p-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all shadow-md ${
                isWaving
                  ? 'bg-[#1B2A4A] text-[#D89B2C] border-[#D89B2C]'
                  : 'bg-[#1B2A4A]/80 text-[#F6F1E7]/60 border-white/20'
              }`}
              title="Toggle Silk Breeze Motion"
            >
              <Wind className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleLight}
              className="p-1.5 rounded-full bg-[#1B2A4A]/90 text-[#D89B2C] border border-[#D89B2C]/40 hover:bg-[#1B2A4A] shadow-md"
              title={`Lighting: ${lightIntensity} (Click to toggle)`}
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-[#1B2A4A]/90 backdrop-blur-md p-1 rounded-full border border-[#D89B2C]/40 shadow-md">
            <button
              onClick={() => handleZoom(-0.6)}
              className="p-1 text-[#D89B2C] hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-[#F6F1E7] px-1 font-bold">
              {zoomLevel}x
            </span>
            <button
              onClick={() => handleZoom(0.6)}
              className="p-1 text-[#D89B2C] hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Renderer Canvas Body */}
        <div className="w-full h-full flex-1 relative flex items-center justify-center">
          {viewEngine === 'model-3d' && (sketchfabId || product?.sketchfab_id) ? (
            <div className="w-full h-full relative bg-[#0B1220]">
              <iframe
                title={`3D Model of ${productName}`}
                src={`https://sketchfab.com/models/${sketchfabId || product?.sketchfab_id}/embed?autostart=1&camera=0&preload=1&ui_controls=1&ui_infos=0&ui_watermark=0&transparent=1`}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
              />
            </div>
          ) : viewEngine === 'three' ? (
            <div
              ref={canvasContainerRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              title="Click & Drag to rotate in 360°"
            />
          ) : glbUrl ? (
            <ModelViewerElement
              src={glbUrl}
              alt={`3D Model of ${productName}`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate={isAutoRotate ? true : undefined}
              poster={posterImage}
              style={{ width: '100%', height: '100%' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-4 right-4 bg-[#D89B2C] text-[#1B2A4A] font-bold text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border border-[#B87B16]"
              >
                <Smartphone className="w-4 h-4" />
                <span>View AR in Room</span>
              </button>
            </ModelViewerElement>
          ) : (
            <div
              ref={canvasContainerRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              title="Click & Drag to rotate in 360°"
            />
          )}
        </div>

        {/* Bottom Interactive Bar */}
        <div className="bg-[#0F1828]/95 px-4 py-2.5 border-t border-[#D89B2C]/25 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#F6F1E7]/80">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#D89B2C]" />
            <span>Drag to rotate 360° • Inspect authentic silk zari drape</span>
          </div>

          <div className="flex items-center gap-2">
            {(sketchfabId || product?.sketchfab_id) && (
              <button
                onClick={() => setViewEngine(viewEngine === 'model-3d' ? 'three' : 'model-3d')}
                className="text-[11px] text-[#D89B2C] font-semibold underline hover:text-[#F5CE7B]"
              >
                {viewEngine === 'model-3d' ? 'Switch to Cloth Drape' : 'Switch to 3D Saree Model'}
              </button>
            )}

            {glbUrl && !sketchfabId && (
              <button
                onClick={() => setViewEngine(viewEngine === 'three' ? 'model-viewer' : 'three')}
                className="text-[11px] text-[#D89B2C] font-semibold underline hover:text-[#F5CE7B]"
              >
                {viewEngine === 'three' ? 'View GLB Model' : 'View Three.js Drape'}
              </button>
            )}

            {onOpenTryOn && (
              <button
                onClick={onOpenTryOn}
                className="px-3 py-1 bg-[#D89B2C] hover:bg-[#F5CE7B] text-[#1B2A4A] font-serif font-bold text-[11px] rounded-lg shadow flex items-center gap-1 transition-colors"
                id="model-viewer-tryon-btn"
              >
                <span>Virtual Try-On Studio</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
