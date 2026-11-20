import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  afterSoftwareDraw,
  applyRoomEnvironment,
  createRadialContactShadowTexture,
  createSpiralGlyphTexture,
  createStudioRenderer,
  detectSoftwareWebGL,
  disposeThreeScene,
} from './threeUtils';

export interface AntarcticStageOptions {
  windSpeed: number; // 0..1
  reducedMotion: boolean;
  onFpsUpdate?: (fps: number, backend: string) => void;
  onContextLost?: () => void;
}

export interface AntarcticStageController {
  updateOptions: (opts: Partial<AntarcticStageOptions>) => void;
  resetCamera: () => void;
  dispose: () => void;
}

function groundHeightAt(x: number, z: number): number {
  const ridge = Math.sin(x * 0.14 + 0.5) * Math.cos(z * 0.12) * 0.75;
  const sastrugi = Math.sin(x * 0.55 + z * 0.25) * 0.14;
  const basinDist = Math.hypot(x, z);
  const flattenCenter = THREE.MathUtils.smoothstep(basinDist, 1.5, 6.5);
  return (ridge + sastrugi) * flattenCenter;
}

export function mountAntarcticOutpostStage(
  container: HTMLElement,
  initialOpts: AntarcticStageOptions
): AntarcticStageController {
  const isSoftwareGl = detectSoftwareWebGL();
  const renderer = createStudioRenderer(container, isSoftwareGl);
  const scene = new THREE.Scene();

  const horizonColor = new THREE.Color(0x060d18);
  scene.background = horizonColor;
  scene.fog = new THREE.FogExp2(0x060d18, 0.028);

  const envTexture = applyRoomEnvironment(renderer, scene);
  const shadowTexture = createRadialContactShadowTexture(128);
  const spiralTex = createSpiralGlyphTexture(renderer, 'cyan');

  const camera = new THREE.PerspectiveCamera(
    48,
    (container.clientWidth || 640) / (container.clientHeight || 400),
    0.1,
    180
  );
  camera.position.set(5.4, 2.5, 7.6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.06;
  controls.minDistance = 3.2;
  controls.maxDistance = 16;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.target.set(0, 1.2, 0);

  // Warm/Cool Lighting Rig
  const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.85);
  scene.add(hemiLight);

  const moonKeyLight = new THREE.DirectionalLight(0xe0f2fe, 1.45);
  moonKeyLight.position.set(10, 14, 7);
  if (!isSoftwareGl) {
    moonKeyLight.castShadow = true;
    moonKeyLight.shadow.mapSize.set(1024, 1024);
    moonKeyLight.shadow.camera.left = -12;
    moonKeyLight.shadow.camera.right = 12;
    moonKeyLight.shadow.camera.top = 12;
    moonKeyLight.shadow.camera.bottom = -12;
    moonKeyLight.shadow.bias = -0.0005;
    moonKeyLight.shadow.normalBias = 0.02;
  }
  scene.add(moonKeyLight);

  const rimLight = new THREE.DirectionalLight(0x22d3ee, 0.75);
  rimLight.position.set(-9, 5, -10);
  scene.add(rimLight);

  // Sculpted outdoor snowfield extending continuously into fog horizon
  const snowGeo = new THREE.PlaneGeometry(110, 110, 96, 96);
  snowGeo.rotateX(-Math.PI / 2);
  const posAttr = snowGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    posAttr.setY(i, groundHeightAt(x, z));
  }
  snowGeo.computeVertexNormals();

  const snowMat = new THREE.MeshStandardMaterial({
    color: 0xcbe3f5,
    roughness: 0.86,
    metalness: 0.04,
  });
  const snowTerrain = new THREE.Mesh(snowGeo, snowMat);
  snowTerrain.receiveShadow = !isSoftwareGl;
  scene.add(snowTerrain);

  // Composite Hero Subject 1: Δ–T1 Polar Monolith (4 parts)
  const monolithGroup = new THREE.Group();
  const monoY = groundHeightAt(-0.8, -0.5);
  monolithGroup.position.set(-0.8, monoY, -0.5);

  const plinthGeo = new THREE.CylinderGeometry(1.15, 1.35, 0.24, 6);
  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x0b1220,
    roughness: 0.22,
    metalness: 0.78,
  });
  const plinth = new THREE.Mesh(plinthGeo, obsidianMat);
  plinth.position.y = 0.12;
  plinth.castShadow = !isSoftwareGl;
  plinth.receiveShadow = !isSoftwareGl;
  monolithGroup.add(plinth);

  const pillarGeo = new THREE.BoxGeometry(1.05, 3.3, 0.42);
  const pillar = new THREE.Mesh(pillarGeo, obsidianMat);
  pillar.position.y = 1.85;
  pillar.rotation.z = -0.045;
  pillar.castShadow = !isSoftwareGl;
  monolithGroup.add(pillar);

  const glyphPlaneGeo = new THREE.PlaneGeometry(0.86, 0.86);
  const glyphMat = new THREE.MeshStandardMaterial({
    map: spiralTex,
    emissive: 0x06b6d4,
    emissiveMap: spiralTex,
    emissiveIntensity: 1.4,
    transparent: true,
    roughness: 0.2,
    metalness: 0.3,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const glyphFace = new THREE.Mesh(glyphPlaneGeo, glyphMat);
  glyphFace.position.set(0.03, 2.05, 0.215);
  glyphFace.rotation.z = -0.045;
  monolithGroup.add(glyphFace);

  const monolithHalo = new THREE.PointLight(0x22d3ee, 1.8, 7.5);
  monolithHalo.position.set(0, 2.1, 0.75);
  monolithGroup.add(monolithHalo);

  const monoShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 3.8),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.48,
    })
  );
  monoShadow.rotation.x = -Math.PI / 2;
  monoShadow.position.y = 0.02;
  monolithGroup.add(monoShadow);
  scene.add(monolithGroup);

  // Composite Hero Subject 2: Expedition Meteorological Mast & Beacon (6 parts)
  const mastGroup = new THREE.Group();
  const mastX = 2.4;
  const mastZ = 1.3;
  mastGroup.position.set(mastX, groundHeightAt(mastX, mastZ), mastZ);

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.32,
    metalness: 0.88,
  });
  const darkBoxMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.25,
  });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, 2.75, 10), steelMat);
  pole.position.y = 1.375;
  pole.castShadow = !isSoftwareGl;
  mastGroup.add(pole);

  // Tripod legs
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.25, 8), steelMat);
    leg.position.set(Math.cos(angle) * 0.36, 0.48, Math.sin(angle) * 0.36);
    leg.rotation.z = Math.cos(angle) * 0.48;
    leg.rotation.x = -Math.sin(angle) * 0.48;
    mastGroup.add(leg);
  }

  const instrumentCase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.28), darkBoxMat);
  instrumentCase.position.set(0, 1.25, 0.14);
  mastGroup.add(instrumentCase);

  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.9,
    roughness: 0.15,
  });
  const beaconDome = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), beaconMat);
  beaconDome.position.y = 2.8;
  mastGroup.add(beaconDome);

  const beaconLight = new THREE.PointLight(0xf59e0b, 2.1, 8);
  beaconLight.position.y = 2.85;
  mastGroup.add(beaconLight);

  const anemometerHub = new THREE.Group();
  anemometerHub.position.y = 2.52;
  for (let i = 0; i < 3; i++) {
    const armAngle = (i / 3) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.018, 0.018), steelMat);
    arm.position.set(Math.cos(armAngle) * 0.24, 0, Math.sin(armAngle) * 0.24);
    arm.rotation.y = -armAngle;
    anemometerHub.add(arm);
  }
  mastGroup.add(anemometerHub);

  const mastShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 1.9),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.4,
    })
  );
  mastShadow.rotation.x = -Math.PI / 2;
  mastShadow.position.y = 0.02;
  mastGroup.add(mastShadow);
  scene.add(mastGroup);

  // Distant rock/ice outcrops via InstancedMesh (low draw call perimeter depth)
  const outcropGeo = new THREE.DodecahedronGeometry(1, 0);
  const outcropMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a5f,
    roughness: 0.72,
    metalness: 0.15,
  });
  const outcropCount = 24;
  const outcrops = new THREE.InstancedMesh(outcropGeo, outcropMat, outcropCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < outcropCount; i++) {
    const angle = (i / outcropCount) * Math.PI * 2 + (i % 3) * 0.2;
    const dist = 11 + (i % 5) * 3.8;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const scale = 0.65 + (i % 4) * 0.48;
    dummy.position.set(x, groundHeightAt(x, z) + scale * 0.25, z);
    dummy.scale.set(scale * 1.4, scale * 0.85, scale);
    dummy.rotation.set(0.1 * i, angle, 0.05 * i);
    dummy.updateMatrix();
    outcrops.setMatrixAt(i, dummy.matrix);
  }
  outcrops.computeBoundingSphere();
  scene.add(outcrops);

  // Katabatic drifting snow particles
  const snowCount = isSoftwareGl ? 320 : 800;
  const snowPositions = new Float32Array(snowCount * 3);
  for (let i = 0; i < snowCount; i++) {
    snowPositions[i * 3] = (Math.random() - 0.5) * 32;
    snowPositions[i * 3 + 1] = Math.random() * 10;
    snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 32;
  }
  const snowParticleGeo = new THREE.BufferGeometry();
  snowParticleGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
  const snowParticleMat = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: 0.075,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const snowPoints = new THREE.Points(snowParticleGeo, snowParticleMat);
  scene.add(snowPoints);

  let opts: AntarcticStageOptions = { ...initialOpts };
  let disposed = false;
  let frameId = 0;
  const timers: number[] = [];
  const clock = new THREE.Clock();
  let fpsAccum = 0;
  let fpsFrames = 0;
  const backendLabel = isSoftwareGl ? 'Software WebGL' : 'Hardware WebGL';

  const onContextLost = (e: Event) => {
    e.preventDefault();
    opts.onContextLost?.();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);

  const handleResize = () => {
    if (disposed) return;
    const w = container.clientWidth || 640;
    const h = container.clientHeight || 400;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  const registerTimer = (id: number) => timers.push(id);

  const tick = () => {
    if (disposed) return;
    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.elapsedTime;

    fpsAccum += delta;
    fpsFrames += 1;
    if (fpsAccum >= 0.6) {
      opts.onFpsUpdate?.(Math.round(fpsFrames / fpsAccum), backendLabel);
      fpsAccum = 0;
      fpsFrames = 0;
    }

    if (!opts.reducedMotion) {
      anemometerHub.rotation.y += delta * (2.5 + opts.windSpeed * 8.5);
      glyphMat.emissiveIntensity = 1.2 + Math.sin(elapsed * 1.4) * 0.35;
      beaconLight.intensity = 1.6 + Math.sin(elapsed * 2.2) * 0.55;

      const attr = snowParticleGeo.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const windStep = delta * (2.2 + opts.windSpeed * 5.8);
      for (let i = 0; i < snowCount; i++) {
        const idx = i * 3;
        arr[idx] += windStep;
        arr[idx + 1] -= delta * 0.9;
        if (arr[idx] > 16) arr[idx] = -16;
        if (arr[idx + 1] < -0.5) arr[idx + 1] = 9.5;
      }
      attr.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);

    if (isSoftwareGl) {
      afterSoftwareDraw(renderer, tick, registerTimer);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  };

  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }
  tick();

  return {
    updateOptions(next) {
      opts = { ...opts, ...next };
    },
    resetCamera() {
      camera.position.set(5.4, 2.5, 7.6);
      controls.target.set(0, 1.2, 0);
      controls.update();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => window.clearTimeout(id));
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      disposeThreeScene(scene, renderer, controls, [envTexture, shadowTexture, spiralTex]);
    },
  };
}
