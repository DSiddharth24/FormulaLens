import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import * as math from 'mathjs';
import { ParameterConfig } from '../types';
import { evaluatePoint } from '../utils/mathParser';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface Surface3DProps {
  compiledFormula: math.EvalFunction | null;
  parameters: Record<string, ParameterConfig>;
  expression: string;
}

export const Surface3D: React.FC<Surface3DProps> = ({
  compiledFormula,
  parameters,
  expression,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframeOnly, setWireframeOnly] = useState(false);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 14, theta: Math.PI / 4, phi: Math.PI / 3 });

  // Update camera position from spherical coordinates
  const updateCamera = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  // Recalculate heights on plane vertices
  const updateSurfaceHeights = useCallback(() => {
    if (!geometryRef.current || !compiledFormula) return;
    const geom = geometryRef.current;
    const posAttr = geom.attributes.position;
    if (!posAttr) return;

    // Scope for parameters
    const scope: Record<string, number> = {};
    for (const [k, v] of Object.entries(parameters)) {
      scope[k] = (v as ParameterConfig).value;
    }

    for (let i = 0; i < posAttr.count; i++) {
      // PlaneGeometry is centered at origin in X and Y
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);

      // Evaluate z = f(x, y)
      const zVal = evaluatePoint(compiledFormula, { ...scope, x, y });
      const safeZ = zVal !== null && Number.isFinite(zVal) ? Math.max(-10, Math.min(10, zVal)) : 0;
      posAttr.setZ(i, safeZ);
    }

    posAttr.needsUpdate = true;
    geom.computeVertexNormals();

    // If wireframe has separate geometry
    if (wireframeMeshRef.current) {
      const wireGeom = new THREE.WireframeGeometry(geom);
      wireframeMeshRef.current.geometry.dispose();
      wireframeMeshRef.current.geometry = wireGeom;
    }
  }, [compiledFormula, parameters]);

  // Initial Three.js setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f6f2); // --paper
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc9d6d9, 0.6);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Base coordinate grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x1c1d21, 0xc9d6d9);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // Surface Mesh
    const segments = 60;
    const geom = new THREE.PlaneGeometry(8, 8, segments, segments);
    geom.rotateX(-Math.PI / 2); // Lay horizontal
    geometryRef.current = geom;

    // Technical chalkboard green surface material
    const material = new THREE.MeshStandardMaterial({
      color: 0x2e5f4e,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    const mesh = new THREE.Mesh(geom, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Wireframe overlay
    const wireframeGeom = new THREE.WireframeGeometry(geom);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x1c1d21,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeom, wireframeMat);
    wireframeMeshRef.current = wireframeMesh;
    scene.add(wireframeMesh);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate) {
        sphericalRef.current.theta += 0.008;
        updateCamera();
      }

      renderer.render(scene, camera);
    };
    animate();

    // ResizeObserver
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 50 && h > 50) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geom.dispose();
      material.dispose();
      wireframeGeom.dispose();
      wireframeMat.dispose();
    };
  }, [updateCamera]);

  // Update heights whenever formula or parameters change
  useEffect(() => {
    updateSurfaceHeights();
  }, [updateSurfaceHeights, expression]);

  // Toggle wireframe mode
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.visible = !wireframeOnly;
    }
  }, [wireframeOnly]);

  // Mouse interaction for rotation and zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= dx * 0.008;
    sphericalRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI / 2 + 0.3, sphericalRef.current.phi - dy * 0.008)
    );
    updateCamera();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.08 : 0.92;
    sphericalRef.current.radius = Math.max(5, Math.min(30, sphericalRef.current.radius * factor));
    updateCamera();
  };

  const handleResetCamera = () => {
    sphericalRef.current = { radius: 14, theta: Math.PI / 4, phi: Math.PI / 3 };
    updateCamera();
  };

  return (
    <div className="relative w-full h-full min-h-[460px] sm:min-h-[580px] bg-[#F7F6F2] border border-[#D8DFE2] rounded select-none overflow-hidden flex flex-col shadow-xs">
      {/* 3D Viewport Controls Bar */}
      <div className="flex items-center justify-between border-b border-[#D8DFE2] bg-[#FAF9F5] px-4 py-2 text-xs text-[#575E66] z-10">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#1C1D21]">3D Surface Plot: z = f(x, y)</span>
          <span className="text-[11px] text-[#87929D] hidden sm:inline">
            Drag to rotate · Scroll to zoom
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2 py-1 rounded border text-xs flex items-center gap-1 transition-colors ${
              autoRotate
                ? 'bg-[#2E5F4E] text-white border-[#2E5F4E]'
                : 'bg-white border-[#D8DFE2] text-[#575E66] hover:text-[#1C1D21]'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>Spin</span>
          </button>

          <button
            type="button"
            onClick={() => setWireframeOnly(!wireframeOnly)}
            className={`px-2 py-1 rounded border text-xs flex items-center gap-1 transition-colors ${
              wireframeOnly
                ? 'bg-[#1C1D21] text-white border-[#1C1D21]'
                : 'bg-white border-[#D8DFE2] text-[#575E66] hover:text-[#1C1D21]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{wireframeOnly ? 'Mesh' : 'Wireframe'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sphericalRef.current.radius = Math.max(5, sphericalRef.current.radius * 0.9);
              updateCamera();
            }}
            className="p-1 rounded border border-[#D8DFE2] bg-white text-[#575E66] hover:text-[#1C1D21]"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              sphericalRef.current.radius = Math.min(30, sphericalRef.current.radius * 1.1);
              updateCamera();
            }}
            className="p-1 rounded border border-[#D8DFE2] bg-white text-[#575E66] hover:text-[#1C1D21]"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            className="p-1 rounded border border-[#D8DFE2] bg-white text-[#575E66] hover:text-[#1C1D21]"
            title="Reset Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative"
      />
    </div>
  );
};
