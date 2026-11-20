import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function createStudioRenderer(
  container: HTMLElement,
  isSoftwareGl: boolean
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(container.clientWidth || 640, container.clientHeight || 400);
  container.appendChild(renderer.domElement);
  return renderer;
}

export function applyRoomEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new RoomEnvironment();
  const target = pmrem.fromScene(env, 0.04);
  scene.environment = target.texture;
  env.dispose();
  pmrem.dispose();
  return target.texture;
}

export function createRadialContactShadowTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.05,
      size / 2,
      size / 2,
      size * 0.48
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSpiralGlyphTexture(
  renderer: THREE.WebGLRenderer,
  variant: 'cyan' | 'uv' | 'etched' = 'cyan'
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (variant === 'etched') {
      ctx.fillStyle = '#0c1624';
      ctx.fillRect(0, 0, size, size);
    } else {
      ctx.clearRect(0, 0, size, size);
    }

    const cx = size / 2;
    const cy = size / 2;

    // Outer technical degree ticks
    ctx.strokeStyle =
      variant === 'uv' ? 'rgba(168, 85, 247, 0.85)' : 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const r1 = i % 3 === 0 ? 215 : 226;
      const r2 = 240;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }

    // Logarithmic spiral core
    ctx.beginPath();
    ctx.strokeStyle = variant === 'uv' ? '#c084fc' : '#22d3ee';
    ctx.lineWidth = variant === 'uv' ? 4 : 3;
    const turns = 4.2;
    const steps = 260;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2;
      const radius = 14 + t * 185;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (variant === 'uv') {
      ctx.fillStyle = '#e879f9';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Δ–82 // JÉG ALATTI REZONANCIA', cx, 48);
      ctx.fillText('SZÁMVETÉS: 1982.11.09', cx, 476);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

export function createCrtTelemetryTexture(
  renderer: THREE.WebGLRenderer,
  phase = 0
): THREE.CanvasTexture {
  const w = 512;
  const h = 384;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#041214';
    ctx.fillRect(0, 0, w, h);

    // Subtle scanlines
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('ARCHÍV-82 // SZEIZMIKUS TERMINÁL', 28, 42);

    ctx.fillStyle = '#22d3ee';
    ctx.font = '15px monospace';
    ctx.fillText('KOORDINÁTA: 82°04\'S  014°22\'E', 28, 76);
    ctx.fillText('MÉLYSÉG: -3 412 M  |  JÉGVASTAGSÁG: KRITIKUS', 28, 102);

    // Waveform
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 28; x <= w - 28; x += 4) {
      const t = (x - 28) / (w - 56);
      const y =
        210 +
        Math.sin(t * Math.PI * 8 + phase) * 32 * Math.exp(-Math.pow((t - 0.5) * 2.4, 2)) +
        Math.cos(t * 24 - phase * 1.4) * 6;
      if (x === 28) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '14px monospace';
    ctx.fillText('ANOMÁLIA ÉSZLELVE: 54.0 HZ REZONANCIA', 28, 326);
    ctx.fillText('> KATTINTS A SZALAG VAGY AKTA VIZSGÁLATÁHOZ', 28, 352);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

export function afterSoftwareDraw(
  renderer: THREE.WebGLRenderer,
  cb: () => void,
  registerTimer: (id: number) => void
): void {
  const gl = renderer.getContext() as WebGL2RenderingContext;
  if (typeof gl.fenceSync !== 'function') {
    registerTimer(window.setTimeout(cb, 80));
    return;
  }
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  const poll = () => {
    const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
    if (state === gl.UNSIGNALED) {
      registerTimer(window.setTimeout(poll, 5));
    } else {
      if (sync) gl.deleteSync(sync);
      registerTimer(window.setTimeout(cb, 80));
    }
  };
  registerTimer(window.setTimeout(poll, 5));
}

export function disposeThreeScene(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  controls?: { dispose: () => void } | null,
  extraTextures: THREE.Texture[] = []
): void {
  controls?.dispose();
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        Object.values(m).forEach((val) => {
          if (val && typeof val === 'object' && 'isTexture' in val) {
            (val as THREE.Texture).dispose();
          }
        });
        m.dispose();
      });
    }
  });
  extraTextures.forEach((t) => t.dispose());
  renderer.dispose();
  renderer.domElement.remove();
}
