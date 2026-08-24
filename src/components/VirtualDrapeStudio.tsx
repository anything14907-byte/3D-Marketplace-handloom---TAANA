import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { 
  Camera, 
  Upload, 
  RotateCw, 
  Download, 
  Sliders, 
  RefreshCw, 
  Check, 
  ShoppingBag, 
  Move, 
  Box,
  Wind,
  ExternalLink,
  Copy,
  Layers,
  X
} from 'lucide-react';
import { ThreadClusterIcon } from './ThreadClusterIcon';
import { Product } from '../types';
import { SKETCHFAB_MODELS, SketchfabModelInfo } from '../data/initialHandlooms';
import { resolveHandloomImage } from '../utils/handloomImages';

interface VirtualDrapeStudioProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const DRAPE_STYLES = [
  { id: 'pallu', label: 'Pleated Saree Pallu', icon: '🥻', angle: -16, scale: 1.15, posY: 46, posX: 50 },
  { id: 'stole', label: 'Over-Shoulder Stole', icon: '🧣', angle: 14, scale: 1.05, posY: 48, posX: 48 },
  { id: 'shawl', label: 'Cashmere Shawl Wrap', icon: '🧶', angle: 0, scale: 1.1, posY: 45, posX: 50 },
  { id: 'cascade', label: 'Flowing Saree Pleats', icon: '✨', angle: 8, scale: 1.2, posY: 52, posX: 52 },
];

// Clean standardized silhouette outline for student hackathon prototype testing
const NEUTRAL_MANNEQUIN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="none"><rect width="600" height="800" fill="%23142038"/><path d="M300 130 C325 130 345 155 345 190 C345 225 325 250 300 250 C275 250 255 225 255 190 C255 155 275 130 300 130 Z" fill="%23253966" stroke="%23D89B2C" stroke-width="2"/><path d="M285 250 L270 300 L200 330 L170 470 L210 470 L235 370 L250 510 L220 740 L280 740 L295 560 L305 560 L320 740 L380 740 L350 510 L365 370 L390 470 L430 470 L400 330 L330 300 L315 250 Z" fill="%231B2A4A" stroke="%23D89B2C" stroke-width="2" stroke-linejoin="round"/><circle cx="300" cy="190" r="40" fill="none" stroke="%23D89B2C" stroke-width="1.5" stroke-dasharray="4 4"/><text x="300" y="770" fill="%23D89B2C" font-family="sans-serif" font-size="14" text-anchor="middle" font-weight="bold">STANDARDIZED SILHOUETTE MANNEQUIN</text></svg>`;

export const VirtualDrapeStudio: React.FC<VirtualDrapeStudioProps> = ({
  product,
  allProducts = [],
  onSelectProduct,
  onAddToCart,
  onClose,
  isModal = false,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(product);
  const [selected3DModel, setSelected3DModel] = useState<SketchfabModelInfo>(() => {
    const found = SKETCHFAB_MODELS.find(
      (m) => m.productId === product.id || m.sketchfabId === product.sketchfab_id
    );
    return found || SKETCHFAB_MODELS[0];
  });

  const [activeViewMode, setActiveViewMode] = useState<'3d-model' | 'photo-fit' | 'three-cloth'>('3d-model');
  const [userPhoto, setUserPhoto] = useState<string>(NEUTRAL_MANNEQUIN_SVG);
  const [isCustomPhoto, setIsCustomPhoto] = useState<boolean>(false);
  const [drapeStyle, setDrapeStyle] = useState<string>(
    product.model_type === 'stole' || product.model_type === 'shawl' ? 'stole' : 'pallu'
  );
  
  // Placement & Styling Controls for Photo Fitting
  const [scale, setScale] = useState<number>(1.15);
  const [rotation, setRotation] = useState<number>(-16);
  const [opacity, setOpacity] = useState<number>(0.92);
  const [posX, setPosX] = useState<number>(50);
  const [posY, setPosY] = useState<number>(46);
  const [blendMode, setBlendMode] = useState<'multiply' | 'normal' | 'overlay'>('multiply');
  const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // In-app Three.js 3D Drape state
  const [is3DWaving, setIs3DWaving] = useState<boolean>(true);
  const [is3DAutoRotate, setIs3DAutoRotate] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const threeContainerRef = useRef<HTMLDivElement | null>(null);

  const threeState = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    mesh: THREE.Mesh | null;
    frameId: number | null;
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
    rotation: { x: number; y: number };
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    frameId: null,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
    rotation: { x: 0.2, y: -0.3 },
  });

  // Sync selected product & matching 3D model
  useEffect(() => {
    setSelectedProduct(product);
    const foundModel = SKETCHFAB_MODELS.find(
      (m) => m.productId === product.id || m.sketchfabId === product.sketchfab_id
    );
    if (foundModel) {
      setSelected3DModel(foundModel);
    }
    if (product.model_type === 'stole' || product.model_type === 'shawl') {
      setDrapeStyle('stole');
      setRotation(14);
      setScale(1.05);
    } else {
      setDrapeStyle('pallu');
      setRotation(-16);
      setScale(1.15);
    }
  }, [product]);

  // Procedural Textile Texture for Three.js Simulation
  const createTexture = (p: Product) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    let baseColor = '#7A2734'; // Maroon Banarasi
    let goldColor = '#D89B2C'; // Gold Zari
    let accentColor = '#9A3A49';

    const name = p.name.toLowerCase();
    if (name.includes('ikat') || p.model_type === 'stole') {
      baseColor = '#1B2A4A'; // Indigo
      goldColor = '#D89B2C';
      accentColor = '#B83240';
    } else if (name.includes('chanderi')) {
      baseColor = '#CDB87D'; // Gold tissue
      goldColor = '#FFFFFF';
      accentColor = '#9A7B2C';
    } else if (name.includes('pashmina') || p.model_type === 'shawl') {
      baseColor = '#4A1E29'; // Deep cashmere
      goldColor = '#E6C280';
      accentColor = '#2A1018';
    } else if (name.includes('tangail') || name.includes('jamdani')) {
      baseColor = '#2C3E50'; // Night cotton
      goldColor = '#D89B2C';
      accentColor = '#E6DFD5';
    } else if (name.includes('kanjeevaram') || name.includes('kanchipuram')) {
      baseColor = '#5C1D24'; // Crimson temple
      goldColor = '#F3C04D';
      accentColor = '#253966';
    }

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Micro warp & weft threads
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 512; i += 4) {
      ctx.fillRect(i, 0, 1.5, 512);
      ctx.fillRect(0, i, 512, 1.5);
    }

    // Handloom Zari Border
    ctx.fillStyle = goldColor;
    ctx.fillRect(0, 420, 512, 92);
    ctx.fillStyle = baseColor;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 430);
      ctx.lineTo(x + 16, 460);
      ctx.lineTo(x + 32, 430);
      ctx.fill();
    }

    // Motifs across fabric
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 2;
    for (let x = 40; x < 512; x += 80) {
      for (let y = 40; y < 400; y += 80) {
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.5, 1.5);
    return texture;
  };

  // Three.js Simulation
  useEffect(() => {
    if (activeViewMode !== 'three-cloth' || !threeContainerRef.current) return;

    const container = threeContainerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B1220);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff6e8, 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff0d0, 2.2);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const goldPoint = new THREE.PointLight(0xD89B2C, 1.8, 10);
    goldPoint.position.set(-2, 1, 2);
    scene.add(goldPoint);

    const geometry = new THREE.PlaneGeometry(2.4, 3.2, 36, 48);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    const texture = createTexture(selectedProduct);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.35,
      metalness: 0.45,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = threeState.current.rotation.x;
    mesh.rotation.y = threeState.current.rotation.y;
    scene.add(mesh);

    threeState.current = {
      ...threeState.current,
      scene,
      camera,
      renderer,
      mesh,
    };

    let clock = new THREE.Clock();
    const originalPos = geometry.attributes.position.clone();

    const animate = () => {
      const state = threeState.current;
      const elapsedTime = clock.getElapsedTime();

      if (state.mesh && state.mesh.geometry) {
        if (is3DWaving) {
          const posAttr = state.mesh.geometry.attributes.position;
          for (let i = 0; i < posAttr.count; i++) {
            const u = originalPos.getX(i);
            const v = originalPos.getY(i);
            const rawWave = Math.sin(v * 3 + elapsedTime * 2.5) * 0.12 * (1 - v / 2) +
                            Math.cos(u * 4 + elapsedTime * 2) * 0.08;
            const wave = Number.isFinite(rawWave) ? rawWave : 0;
            posAttr.setZ(i, wave);
          }
          posAttr.needsUpdate = true;
          state.mesh.geometry.computeVertexNormals();
        }

        if (is3DAutoRotate && !state.isDragging) {
          state.mesh.rotation.y += 0.006;
          state.rotation.y = state.mesh.rotation.y;
        }
      }

      if (state.renderer && state.scene && state.camera) {
        state.renderer.render(state.scene, state.camera);
      }
      state.frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseDown = (e: MouseEvent) => {
      threeState.current.isDragging = true;
      threeState.current.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!threeState.current.isDragging || !threeState.current.mesh) return;
      const deltaX = e.clientX - threeState.current.prevMousePos.x;
      const deltaY = e.clientY - threeState.current.prevMousePos.y;

      threeState.current.rotation.y += deltaX * 0.01;
      threeState.current.rotation.x += deltaY * 0.01;
      threeState.current.mesh.rotation.y = threeState.current.rotation.y;
      threeState.current.mesh.rotation.x = threeState.current.rotation.x;
      threeState.current.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      threeState.current.isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (threeState.current.frameId) cancelAnimationFrame(threeState.current.frameId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [activeViewMode, selectedProduct, is3DWaving, is3DAutoRotate]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserPhoto(event.target.result as string);
          setIsCustomPhoto(true);
          setIsCameraActive(false);
          setActiveViewMode('photo-fit');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Live Camera Handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setActiveViewMode('photo-fit');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam permission not granted:', err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setUserPhoto(canvas.toDataURL('image/jpeg', 0.92));
        setIsCustomPhoto(true);
      }
      const stream = video.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    }
    setIsCameraActive(false);
  };

  // Dragging on visualizer canvas (Mouse + Touch Support)
  const handleStageStart = (clientX: number, clientY: number) => {
    setIsDraggingCanvas(true);
    setDragStartPos({ x: clientX, y: clientY });
  };

  const handleStageMove = (clientX: number, clientY: number) => {
    if (!isDraggingCanvas || !stageContainerRef.current) return;
    const rect = stageContainerRef.current.getBoundingClientRect();
    const deltaX = ((clientX - dragStartPos.x) / rect.width) * 100;
    const deltaY = ((clientY - dragStartPos.y) / rect.height) * 100;

    setPosX((prev) => Math.max(10, Math.min(90, prev + deltaX)));
    setPosY((prev) => Math.max(10, Math.min(90, prev + deltaY)));
    setDragStartPos({ x: clientX, y: clientY });
  };

  const handleStageEnd = () => {
    setIsDraggingCanvas(false);
  };

  // Download Simulation Look
  const handleDownloadLook = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src = userPhoto;

    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      const drapeImg = new Image();
      drapeImg.crossOrigin = 'anonymous';
      drapeImg.src = selectedProduct.image_url;

      drapeImg.onload = () => {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.globalCompositeOperation = blendMode === 'normal' ? 'source-over' : blendMode;

        const drapeW = canvas.width * 0.85 * scale;
        const drapeH = canvas.height * 0.85 * scale;
        const drawX = (canvas.width * posX) / 100;
        const drawY = (canvas.height * posY) / 100;

        ctx.translate(drawX, drawY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(drapeImg, -drapeW / 2, -drapeH / 2, drapeW, drapeH);
        ctx.restore();

        // Footer signature badge
        ctx.fillStyle = 'rgba(20, 32, 56, 0.9)';
        ctx.fillRect(40, canvas.height - 150, canvas.width - 80, 110);
        ctx.strokeStyle = '#D89B2C';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, canvas.height - 150, canvas.width - 80, 110);

        ctx.fillStyle = '#D89B2C';
        ctx.font = 'bold 24px serif';
        ctx.fillText('TAANA • 3D Handloom Virtual Try-On Studio', 70, canvas.height - 105);

        ctx.fillStyle = '#F6F1E7';
        ctx.font = '20px sans-serif';
        ctx.fillText(`${selectedProduct.name} — Direct Artisan Price ₹${selectedProduct.price.toLocaleString('en-IN')}`, 70, canvas.height - 65);

        const link = document.createElement('a');
        link.download = `Taana-TryOn-${selectedProduct.name.replace(/\s+/g, '-')}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      };
    };
  };

  const handleApplyDrapeStyle = (s: typeof DRAPE_STYLES[0]) => {
    setDrapeStyle(s.id);
    setRotation(s.angle);
    setScale(s.scale);
    setPosY(s.posY);
    setPosX(s.posX);
  };

  const handleCopyModelLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`bg-[#142038] text-[#F6F1E7] rounded-2xl border-2 border-[#D89B2C]/40 shadow-2xl overflow-hidden ${isModal ? 'max-w-6xl w-full mx-auto my-6' : 'w-full max-w-7xl mx-auto my-6'}`}>
      
      {/* Studio Header Bar */}
      <div className="p-4 sm:p-5 bg-[#1B2A4A] border-b border-[#D89B2C]/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D89B2C]/20 border border-[#D89B2C] flex items-center justify-center text-[#D89B2C]">
            <ThreadClusterIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F6F1E7]">
              3D Virtual Handloom Try-On Studio
            </h2>
            <p className="text-xs text-[#D89B2C] font-sans">
              Interact with genuine 3D Saree models & test authentic handloom drapes
            </p>
          </div>
        </div>

        {/* View Mode Switcher: 3D Saree Model vs Photo Drape vs Three.js Cloth */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0B1220] p-1 rounded-xl border border-white/15">
            <button
              onClick={() => setActiveViewMode('3d-model')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeViewMode === '3d-model'
                  ? 'bg-[#D89B2C] text-[#1B2A4A] shadow'
                  : 'text-white/70 hover:text-white'
              }`}
              id="tryon-mode-3d-model"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Saree Model</span>
            </button>

            <button
              onClick={() => setActiveViewMode('photo-fit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeViewMode === 'photo-fit'
                  ? 'bg-[#D89B2C] text-[#1B2A4A] shadow'
                  : 'text-white/70 hover:text-white'
              }`}
              id="tryon-mode-photo-fit"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo Try-On</span>
            </button>

            <button
              onClick={() => setActiveViewMode('three-cloth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeViewMode === 'three-cloth'
                  ? 'bg-[#D89B2C] text-[#1B2A4A] shadow'
                  : 'text-white/70 hover:text-white'
              }`}
              id="tryon-mode-three-cloth"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Silk Drape</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#F6F1E7] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[540px]">
        
        {/* Left Column: Canvas Viewport */}
        <div className="lg:col-span-7 bg-[#0B1220] p-4 sm:p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#D89B2C]/20">
          
          {/* MODE 1: 3D Saree Model View */}
          {activeViewMode === '3d-model' && (
            <div className="w-full max-w-[480px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D89B2C]/60 bg-black flex flex-col relative">
              <iframe
                title={selected3DModel.name}
                src={`https://sketchfab.com/models/${selected3DModel.sketchfabId}/embed?autostart=1&camera=0&preload=1&ui_controls=1&ui_infos=0&ui_watermark=0&transparent=1`}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
              />

              {/* Top Info Bar */}
              <div className="absolute top-3 inset-x-3 bg-black/75 backdrop-blur px-3 py-1.5 rounded-xl border border-white/15 flex items-center justify-between text-[11px] text-white">
                <span className="font-semibold text-[#D89B2C] truncate">
                  {selected3DModel.name}
                </span>
                <span className="font-mono text-[10px] bg-[#D89B2C]/20 text-[#D89B2C] px-1.5 py-0.5 rounded border border-[#D89B2C]/40">
                  {selected3DModel.craftStyle}
                </span>
              </div>

              {/* Bottom Direct Model Link Bar */}
              <div className="absolute bottom-3 inset-x-3 bg-[#1B2A4A]/95 backdrop-blur px-3 py-2 rounded-xl border border-[#D89B2C]/40 flex items-center justify-between text-xs text-[#F6F1E7]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[11px] text-[#D89B2C] font-mono font-bold">Model Link:</span>
                  <a
                    href={selected3DModel.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-white underline hover:text-[#D89B2C] truncate"
                  >
                    {selected3DModel.shortUrl}
                  </a>
                </div>

                <button
                  onClick={() => handleCopyModelLink(selected3DModel.shortUrl)}
                  className="px-2 py-1 rounded bg-[#D89B2C] text-[#1B2A4A] font-bold text-[10px] flex items-center gap-1 shrink-0 hover:bg-[#F5CE7B]"
                  title="Copy 3D Model Link"
                >
                  {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: Photo Fit Try-On Stage */}
          {activeViewMode === 'photo-fit' && (
            <div 
              ref={stageContainerRef}
              onMouseDown={(e) => handleStageStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleStageMove(e.clientX, e.clientY)}
              onMouseUp={handleStageEnd}
              onTouchStart={(e) => handleStageStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => handleStageMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handleStageEnd}
              className={`relative w-full max-w-[440px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D89B2C]/60 bg-black flex items-center justify-center select-none group touch-none ${
                isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title="Click & Drag to reposition the handloom drape"
            >
              {isCameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-20">
                    <button
                      onClick={capturePhoto}
                      className="px-5 py-2 rounded-full bg-[#D89B2C] text-[#1B2A4A] font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-[#F5CE7B]"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Snap Fit Photo</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-full bg-red-600/90 text-white font-semibold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Base Photo / Mannequin */}
                  <img
                    src={userPhoto}
                    alt="User fitting silhouette"
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* Handloom Drape Overlay */}
                  <div
                    className="absolute pointer-events-none transition-transform duration-75"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                      opacity: opacity,
                      mixBlendMode: blendMode as any,
                      width: '90%',
                      height: '90%',
                    }}
                  >
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain filter drop-shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Interactive Drag Hint */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] text-[#F6F1E7] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Move className="w-3 h-3 text-[#D89B2C]" />
                    <span>Drag with mouse / finger to align drape</span>
                  </div>

                  {/* Product overlay watermark badge */}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#1B2A4A]/90 backdrop-blur px-3 py-2 rounded-xl border border-[#D89B2C]/40 flex items-center justify-between text-xs text-[#F6F1E7]">
                    <div className="truncate">
                      <span className="font-serif font-bold text-[#D89B2C] block truncate">
                        {selectedProduct.name}
                      </span>
                      <span className="text-[10px] text-[#F6F1E7]/70 truncate block">
                        ₹{selectedProduct.price.toLocaleString('en-IN')} • {selectedProduct.weavers?.region || 'India'}
                      </span>
                    </div>
                    <span className="bg-[#D89B2C] text-[#1B2A4A] font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                      {drapeStyle.toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MODE 3: Native Three.js WebGL Cloth */}
          {activeViewMode === 'three-cloth' && (
            <div className="w-full max-w-[440px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D89B2C]/60 bg-[#0B1220] flex flex-col justify-between relative">
              <div ref={threeContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* 3D WebGL Controls Bar */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setIs3DWaving(!is3DWaving)}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    is3DWaving ? 'bg-[#D89B2C] text-[#1B2A4A]' : 'text-white/60 hover:text-white'
                  }`}
                  title="Toggle Cloth Wave Simulation"
                >
                  <Wind className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIs3DAutoRotate(!is3DAutoRotate)}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    is3DAutoRotate ? 'bg-[#D89B2C] text-[#1B2A4A]' : 'text-white/60 hover:text-white'
                  }`}
                  title="Toggle 360 Auto-Rotation"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="absolute bottom-3 inset-x-3 bg-[#1B2A4A]/90 backdrop-blur px-3 py-2 rounded-xl border border-[#D89B2C]/30 text-center text-[10px] text-[#F6F1E7]/80">
                <p>Native Three.js WebGL Simulation • Drag with mouse to inspect 360° silk folds & gold sheen</p>
              </div>
            </div>
          )}

          {/* Quick Action Tools Bar */}
          <div className="w-full max-w-[440px] mt-3 flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => {
                setPosX(50);
                setPosY(46);
                setScale(1.15);
                setRotation(-16);
                setOpacity(0.92);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#F6F1E7] text-[11px] flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-[#D89B2C]" />
              <span>Reset Alignment</span>
            </button>

            {isCustomPhoto && (
              <button
                onClick={() => {
                  setUserPhoto(NEUTRAL_MANNEQUIN_SVG);
                  setIsCustomPhoto(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 text-[11px]"
              >
                Use Mannequin
              </button>
            )}

            <button
              onClick={handleDownloadLook}
              className="px-3 py-1.5 rounded-lg bg-[#D89B2C] hover:bg-[#F5CE7B] text-[#1B2A4A] font-bold text-[11px] flex items-center gap-1 shadow transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Save Fit</span>
            </button>
          </div>

        </div>

        {/* Right Column: 3D Models Selector & Fitting Controls */}
        <div className="lg:col-span-5 bg-[#1B2A4A] p-5 space-y-4 overflow-y-auto max-h-[600px] no-scrollbar">
          
          {/* Section 1: 3D Saree Models Gallery (4 Models with short links) */}
          <div className="space-y-2">
            <label className="text-xs font-serif font-bold uppercase tracking-wider text-[#D89B2C] flex items-center justify-between">
              <span>1. 3D Saree Models ({SKETCHFAB_MODELS.length})</span>
              <span className="text-[10px] text-white/60 font-sans font-normal">Direct 3D Weaves</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {SKETCHFAB_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelected3DModel(model);
                    const matchingProd = allProducts.find((p) => p.id === model.productId);
                    if (matchingProd) {
                      setSelectedProduct(matchingProd);
                      if (onSelectProduct) onSelectProduct(matchingProd);
                    }
                    setActiveViewMode('3d-model');
                  }}
                  className={`p-2 rounded-xl border text-left text-xs transition-all flex flex-col justify-between gap-1.5 ${
                    selected3DModel.id === model.id && activeViewMode === '3d-model'
                      ? 'bg-[#D89B2C] text-[#1B2A4A] border-[#D89B2C] font-bold shadow-md'
                      : 'bg-white/5 text-[#F6F1E7] border-white/10 hover:border-[#D89B2C]/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold truncate">{model.name}</span>
                    <span className="text-[9px] font-mono opacity-80">{model.shortUrl.replace('https://', '')}</span>
                  </div>
                  <span className="text-[9px] opacity-75 truncate">{model.craftStyle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Photo Fitting & Live Camera */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs font-serif font-bold uppercase tracking-wider text-[#D89B2C] block">
              2. Fit on Your Photo / Camera
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-[#D89B2C]/40 text-xs font-medium text-[#F6F1E7] flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-[#D89B2C]" />
                <span>Upload Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                  isCameraActive
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-white/10 hover:bg-white/15 border-[#D89B2C]/40 text-[#F6F1E7]'
                }`}
              >
                <Camera className="w-4 h-4 text-[#D89B2C]" />
                <span>{isCameraActive ? 'Stop Camera' : 'Live Camera Snap'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Choose Drape Style */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs font-serif font-bold uppercase tracking-wider text-[#D89B2C] block">
              3. Drape Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DRAPE_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    handleApplyDrapeStyle(s);
                    if (activeViewMode === '3d-model') setActiveViewMode('photo-fit');
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    drapeStyle === s.id
                      ? 'bg-[#D89B2C] text-[#1B2A4A] font-bold border-[#D89B2C]'
                      : 'bg-white/5 text-[#F6F1E7]/85 border-white/10 hover:border-[#D89B2C]/40'
                  }`}
                >
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-[11px]">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Fine Tune Placement Controls */}
          <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-serif font-bold uppercase tracking-wider text-[#D89B2C] flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>4. Adjust Drape Alignment</span>
              </label>
              <span className="text-[10px] text-[#F6F1E7]/50">Interactive sliders</span>
            </div>

            {/* Scale */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#F6F1E7]/80">
                <span>Drape Size</span>
                <span className="font-mono">{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.6"
                step="0.05"
                value={scale}
                onChange={(e) => {
                  setScale(parseFloat(e.target.value));
                  if (activeViewMode === '3d-model') setActiveViewMode('photo-fit');
                }}
                className="w-full accent-[#D89B2C] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vertical Position */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#F6F1E7]/80">
                <span>Vertical Shoulder Height</span>
                <span className="font-mono">{posY}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="1"
                value={posY}
                onChange={(e) => {
                  setPosY(parseInt(e.target.value));
                  if (activeViewMode === '3d-model') setActiveViewMode('photo-fit');
                }}
                className="w-full accent-[#D89B2C] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rotation Angle */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#F6F1E7]/80">
                <span>Drape Angle</span>
                <span className="font-mono">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="2"
                value={rotation}
                onChange={(e) => {
                  setRotation(parseInt(e.target.value));
                  if (activeViewMode === '3d-model') setActiveViewMode('photo-fit');
                }}
                className="w-full accent-[#D89B2C] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blend Mode */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-[#F6F1E7]/80">Fabric Sheen Blend:</span>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                {(['multiply', 'normal', 'overlay'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setBlendMode(mode);
                      if (activeViewMode === '3d-model') setActiveViewMode('photo-fit');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] capitalize transition-colors ${
                      blendMode === mode
                        ? 'bg-[#D89B2C] text-[#1B2A4A] font-bold'
                        : 'text-[#F6F1E7]/70 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: All 6 Handloom Weaves Switcher */}
          {allProducts.length > 1 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-serif font-bold uppercase tracking-wider text-[#D89B2C] block">
                5. Select Handloom Item
              </label>
              <div className="grid grid-cols-3 gap-2">
                {allProducts.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      if (onSelectProduct) onSelectProduct(p);
                      const m = SKETCHFAB_MODELS.find(
                        (mod) => mod.productId === p.id || mod.sketchfabId === p.sketchfab_id
                      );
                      if (m) setSelected3DModel(m);
                    }}
                    className={`p-1.5 rounded-xl border text-left transition-all flex flex-col items-center text-center gap-1 ${
                      selectedProduct.id === p.id
                        ? 'bg-[#D89B2C] text-[#1B2A4A] border-[#D89B2C] font-bold shadow'
                        : 'bg-white/5 text-[#F6F1E7] border-white/10 hover:border-[#D89B2C]/40'
                    }`}
                  >
                    <img
                      src={resolveHandloomImage(p.name, p.image_url)}
                      alt={p.name}
                      className="w-full aspect-square rounded-lg object-cover"
                      loading="eager"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = resolveHandloomImage(p.name);
                      }}
                    />
                    <span className="text-[10px] leading-tight line-clamp-1">{p.name.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-80 font-mono">₹{p.price.toLocaleString('en-IN')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Direct CTA */}
          <div className="pt-3 border-t border-[#D89B2C]/30 space-y-2">
            <button
              onClick={() => {
                if (onAddToCart) {
                  onAddToCart(selectedProduct, 1);
                  setIsAddedToCart(true);
                  setTimeout(() => setIsAddedToCart(false), 2000);
                }
              }}
              disabled={isAddedToCart}
              className="w-full py-3 rounded-xl bg-[#D89B2C] hover:bg-[#F5CE7B] text-[#1B2A4A] font-serif font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isAddedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Handloom to Cart (₹{selectedProduct.price.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
