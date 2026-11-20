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

export interface ArtifactPartInfo {
  id: string;
  name: string;
  note: string;
}

export interface Artifact3DStageOptions {
  explodeAmount: number; // 0..1
  uvActive: boolean;
  reducedMotion: boolean;
  onSelectPart?: (info: ArtifactPartInfo) => void;
  onFpsUpdate?: (fps: number, backend: string) => void;
  onContextLost?: () => void;
}

export interface Artifact3DStageController {
  updateOptions: (opts: Partial<Artifact3DStageOptions>) => void;
  resetCamera: () => void;
  dispose: () => void;
}

const _mouse = new THREE.Vector2();

export function mountArtifact3DInspectorStage(
  container: HTMLElement,
  initialOpts: Artifact3DStageOptions
): Artifact3DStageController {
  const isSoftwareGl = detectSoftwareWebGL();
  const renderer = createStudioRenderer(container, isSoftwareGl);
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x050914);
  scene.fog = new THREE.FogExp2(0x050914, 0.055);

  const envTex = applyRoomEnvironment(renderer, scene);
  const shadowTex = createRadialContactShadowTexture(128);
  const etchedSpiralTex = createSpiralGlyphTexture(renderer, 'etched');
  const uvSpiralTex = createSpiralGlyphTexture(renderer, 'uv');

  const camera = new THREE.PerspectiveCamera(
    42,
    (container.clientWidth || 640) / (container.clientHeight || 400),
    0.1,
    40
  );
  camera.position.set(0, 2.1, 4.1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.0;
  controls.maxDistance = 6.5;
  controls.target.set(0, 0.72, 0);

  // Studio 3-point lighting + UV light
  const hemi = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.65);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
  keyLight.position.set(4, 6, 4);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0004;
  }
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x22d3ee, 1.3);
  rimLight.position.set(-4, 3, -5);
  scene.add(rimLight);

  const uvSpotLight = new THREE.PointLight(0xa855f7, 0, 7);
  uvSpotLight.position.set(0, 2.8, 1.4);
  scene.add(uvSpotLight);

  // Matte examination pedestal / surface
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.25, 0.16, 48),
    new THREE.MeshStandardMaterial({ color: 0x0b1222, roughness: 0.75, metalness: 0.2 })
  );
  pedestal.position.y = -0.08;
  pedestal.receiveShadow = !isSoftwareGl;
  scene.add(pedestal);

  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 2.8),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.52,
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.01;
  scene.add(contactShadow);

  // Composite 6-Part Hero Subject: "Fagyott Spirál-lemez (Δ–82)"
  const artifactRoot = new THREE.Group();
  artifactRoot.position.y = 0.65;
  scene.add(artifactRoot);

  const clickableParts: THREE.Object3D[] = [];

  // Part 1: Outer Brushed Titanium Bezel Ring
  const outerRingMat = new THREE.MeshPhysicalMaterial({
    color: 0x64748b,
    metalness: 0.92,
    roughness: 0.22,
    anisotropy: 0.85,
  });
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.11, 20, 64), outerRingMat);
  outerRing.rotation.x = Math.PI / 2;
  outerRing.castShadow = !isSoftwareGl;
  outerRing.userData.partInfo = {
    id: 'bezel',
    name: '1. Réteg: Szálcsiszolt Titán Peremgyűrű',
    note: 'A 82°-os jégmag-fúrásból kiemelt védőgyűrű, rajta mikroszkopikus hőstressz-nyomokkal.',
  } as ArtifactPartInfo;
  artifactRoot.add(outerRing);
  clickableParts.push(outerRing);

  // Part 2: 6 Brass Acoustic Locking Pins (InstancedMesh)
  const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.24, 12);
  const brassPinMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.26,
  });
  const pinsMesh = new THREE.InstancedMesh(pinGeo, brassPinMat, 6);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 1.05, 0.02, Math.sin(a) * 1.05);
    dummy.rotation.set(0, a, 0);
    dummy.updateMatrix();
    pinsMesh.setMatrixAt(i, dummy.matrix);
  }
  pinsMesh.computeBoundingSphere();
  pinsMesh.userData.partInfo = {
    id: 'pins',
    name: '2. Réteg: Hat Sárgaréz Hangolótüske',
    note: 'Minden tüske a Kilenc Őrző hatodik harmonikus felhangjára van hangolva.',
  } as ArtifactPartInfo;
  artifactRoot.add(pinsMesh);
  clickableParts.push(pinsMesh);

  // Part 3: Etched Logarithmic Spiral Core Plate (with UV hidden layer reveal)
  const plateMat = new THREE.MeshStandardMaterial({
    map: etchedSpiralTex,
    emissive: 0x0891b2,
    emissiveMap: etchedSpiralTex,
    emissiveIntensity: 0.25,
    roughness: 0.38,
    metalness: 0.55,
  });
  const spiralPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.09, 48), plateMat);
  spiralPlate.castShadow = !isSoftwareGl;
  spiralPlate.userData.partInfo = {
    id: 'spiral_plate',
    name: '3. Réteg: Logaritmikus Spirál-lemez',
    note: 'UV fényben láthatóvá válik az 1982.11.09-es bejegyzés: a jég nem tárolja, hanem ismétli a hangot.',
  } as ArtifactPartInfo;
  artifactRoot.add(spiralPlate);
  clickableParts.push(spiralPlate);

  const uvOverlayMat = new THREE.MeshBasicMaterial({
    map: uvSpiralTex,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const uvOverlay = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), uvOverlayMat);
  uvOverlay.rotation.x = -Math.PI / 2;
  uvOverlay.position.y = 0.048;
  spiralPlate.add(uvOverlay);

  // Part 4: Inner Rotating Acoustic Copper Resonance Coil
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    metalness: 0.88,
    roughness: 0.28,
  });
  const copperCoil = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.045, 16, 48), copperMat);
  copperCoil.rotation.x = Math.PI / 2;
  copperCoil.userData.partInfo = {
    id: 'copper_coil',
    name: '4. Réteg: Akusztikus Réz Rezonancia-tekercs',
    note: 'Dr. Lena V. 1983-as dekódoló tekercse, amely 54 Hz-es állóhullámmá alakítja az emléktöredéket.',
  } as ArtifactPartInfo;
  artifactRoot.add(copperCoil);
  clickableParts.push(copperCoil);

  // Part 5: Floating Δ–82 Prism Crystal Core
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.55,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
    ior: 2.1,
  });
  const coreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), crystalMat);
  coreCrystal.userData.partInfo = {
    id: 'crystal_core',
    name: '5. Réteg: Δ–82 Szubglaciális Kristálymag',
    note: 'Hőmérséklete állandó -18,4 °C marad akkor is, ha szobahőmérsékleten vizsgálják.',
  } as ArtifactPartInfo;
  artifactRoot.add(coreCrystal);
  clickableParts.push(coreCrystal);

  // Part 6: Optical Ice-Sapphire Protective Dome (sorted outer transparency)
  const domeMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    metalness: 0,
    roughness: 0.06,
    transmission: isSoftwareGl ? 0 : 0.88,
    transparent: true,
    opacity: isSoftwareGl ? 0.34 : 1.0,
    ior: 1.56,
    thickness: 0.6,
    clearcoat: 1.0,
    depthWrite: false,
  });
  const glassDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.48),
    domeMat
  );
  glassDome.renderOrder = 2;
  glassDome.position.y = 0.04;
  glassDome.userData.partInfo = {
    id: 'sapphire_dome',
    name: '6. Réteg: Jégzafír Optikai Búra',
    note: 'Torzításmentesen fókuszálja a megfigyelő tekintetét a belső spirálra.',
  } as ArtifactPartInfo;
  artifactRoot.add(glassDome);
  clickableParts.push(glassDome);

  let opts: Artifact3DStageOptions = { ...initialOpts };
  let currentExplode = initialOpts.explodeAmount;
  let currentUv = initialOpts.uvActive ? 1 : 0;

  const raycaster = new THREE.Raycaster();
  const onClick = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(_mouse, camera);
    const hits = raycaster.intersectObjects(clickableParts, false);
    if (hits.length > 0 && hits[0].object.userData?.partInfo) {
      opts.onSelectPart?.(hits[0].object.userData.partInfo as ArtifactPartInfo);
    }
  };
  renderer.domElement.addEventListener('click', onClick);

  const onContextLost = (e: Event) => {
    e.preventDefault();
    opts.onContextLost?.();
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);

  const handleResize = () => {
    const w = container.clientWidth || 640;
    const h = container.clientHeight || 400;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  let disposed = false;
  let frameId = 0;
  const timers: number[] = [];
  const clock = new THREE.Clock();
  let fpsAccum = 0;
  let fpsFrames = 0;
  const backendLabel = isSoftwareGl ? 'Software WebGL' : 'Hardware WebGL';

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

    // Silky smooth exponential damping for Exploded View & UV reveal
    currentExplode = THREE.MathUtils.damp(currentExplode, opts.explodeAmount, 6.5, delta);
    currentUv = THREE.MathUtils.damp(currentUv, opts.uvActive ? 1 : 0, 7.0, delta);

    glassDome.position.y = 0.04 + currentExplode * 0.95;
    coreCrystal.position.y = 0.16 + currentExplode * 0.56;
    copperCoil.position.y = 0.06 + currentExplode * 0.28;
    spiralPlate.position.y = -currentExplode * 0.08;
    outerRing.position.y = -currentExplode * 0.26;
    pinsMesh.position.y = -currentExplode * 0.44;

    uvOverlayMat.opacity = currentUv * 0.95;
    uvSpotLight.intensity = currentUv * 6.5;
    crystalMat.emissive.setHex(opts.uvActive ? 0xc084fc : 0x06b6d4);
    crystalMat.emissiveIntensity = 0.5 + currentUv * 0.85;

    if (!opts.reducedMotion) {
      artifactRoot.rotation.y += delta * 0.18;
      coreCrystal.rotation.y -= delta * 0.8;
      coreCrystal.rotation.x = Math.sin(elapsed * 0.9) * 0.22;
      copperCoil.rotation.z += delta * 0.35;
    }

    controls.update();
    renderer.render(scene, camera);

    if (isSoftwareGl) {
      afterSoftwareDraw(renderer, tick, (id) => timers.push(id));
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
      camera.position.set(0, 2.1, 4.1);
      controls.target.set(0, 0.72, 0);
      controls.update();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => window.clearTimeout(id));
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      disposeThreeScene(scene, renderer, controls, [
        envTex,
        shadowTex,
        etchedSpiralTex,
        uvSpiralTex,
      ]);
    },
  };
}
