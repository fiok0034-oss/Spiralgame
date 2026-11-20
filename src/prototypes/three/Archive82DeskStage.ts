import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  afterSoftwareDraw,
  applyRoomEnvironment,
  createCrtTelemetryTexture,
  createRadialContactShadowTexture,
  createStudioRenderer,
  detectSoftwareWebGL,
  disposeThreeScene,
} from './threeUtils';

export type ArchiveDeskItemId = 'crt' | 'dossier' | 'tape_reel';

export interface ArchiveDeskStageOptions {
  reducedMotion: boolean;
  onSelectObject?: (itemId: ArchiveDeskItemId, label: string) => void;
  onHoverObject?: (itemId: ArchiveDeskItemId | null, label: string | null) => void;
  onFpsUpdate?: (fps: number, backend: string) => void;
  onContextLost?: () => void;
}

export interface ArchiveDeskStageController {
  updateOptions: (opts: Partial<ArchiveDeskStageOptions>) => void;
  resetCamera: () => void;
  dispose: () => void;
}

const _mouse = new THREE.Vector2();

export function mountArchive82DeskStage(
  container: HTMLElement,
  initialOpts: ArchiveDeskStageOptions
): ArchiveDeskStageController {
  const isSoftwareGl = detectSoftwareWebGL();
  const renderer = createStudioRenderer(container, isSoftwareGl);
  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x070a12);
  scene.fog = new THREE.FogExp2(0x070a12, 0.065);

  const envTex = applyRoomEnvironment(renderer, scene);
  const shadowTex = createRadialContactShadowTexture(128);
  const crtTex = createCrtTelemetryTexture(renderer, 0);

  const camera = new THREE.PerspectiveCamera(
    44,
    (container.clientWidth || 640) / (container.clientHeight || 400),
    0.1,
    40
  );
  camera.position.set(0.2, 2.35, 3.6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !isSoftwareGl;
  controls.dampingFactor = 0.07;
  controls.minDistance = 2.0;
  controls.maxDistance = 5.4;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = Math.PI * 0.44;
  controls.minAzimuthAngle = -Math.PI * 0.32;
  controls.maxAzimuthAngle = Math.PI * 0.32;
  controls.target.set(0, 0.9, 0);

  // Room subtle cold ambient + warm brass desk lamp key light
  const hemi = new THREE.HemisphereLight(0x64748b, 0x090d16, 0.55);
  scene.add(hemi);

  const lampSpot = new THREE.SpotLight(0xfbbf24, 9.5, 9, Math.PI * 0.32, 0.55, 1.5);
  lampSpot.position.set(-1.35, 2.35, -0.3);
  lampSpot.target.position.set(0.15, 0.78, 0.15);
  if (!isSoftwareGl) {
    lampSpot.castShadow = true;
    lampSpot.shadow.mapSize.set(1024, 1024);
    lampSpot.shadow.bias = -0.0005;
  }
  scene.add(lampSpot);
  scene.add(lampSpot.target);

  const crtBounceLight = new THREE.PointLight(0x10b981, 1.4, 3.5);
  crtBounceLight.position.set(-0.25, 1.28, 0.1);
  scene.add(crtBounceLight);

  // Floor & subtle back archive wall
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x0b101b, roughness: 0.9, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = !isSoftwareGl;
  scene.add(floor);

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 7),
    new THREE.MeshStandardMaterial({ color: 0x0e1523, roughness: 0.88, metalness: 0.08 })
  );
  backWall.position.set(0, 3.5, -1.65);
  scene.add(backWall);

  // Desk base height = 0.78m
  const DESK_TOP_Y = 0.78;
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x3b271c,
    roughness: 0.65,
    metalness: 0.08,
  });
  const metalFrameMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.34,
    metalness: 0.82,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xb4843e,
    roughness: 0.25,
    metalness: 0.9,
  });

  const deskGroup = new THREE.Group();
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.55), woodMat);
  deskTop.position.y = DESK_TOP_Y - 0.04;
  deskTop.receiveShadow = !isSoftwareGl;
  deskTop.castShadow = !isSoftwareGl;
  deskGroup.add(deskTop);

  [
    [-1.45, -0.65],
    [1.45, -0.65],
    [-1.45, 0.65],
    [1.45, 0.65],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, DESK_TOP_Y - 0.08, 0.08), metalFrameMat);
    leg.position.set(lx, (DESK_TOP_Y - 0.08) / 2, lz);
    deskGroup.add(leg);
  });
  scene.add(deskGroup);

  const clickables: THREE.Object3D[] = [];

  // Interactive Item 1: 1982 CRT Telemetry Terminal (Composite 4-part group)
  const crtGroup = new THREE.Group();
  crtGroup.position.set(-0.35, DESK_TOP_Y, -0.22);
  crtGroup.rotation.y = 0.16;

  const crtChassisMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.55,
    metalness: 0.18,
  });
  const crtBase = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.1, 0.7), crtChassisMat);
  crtBase.position.y = 0.05;
  crtBase.castShadow = !isSoftwareGl;
  crtGroup.add(crtBase);

  const crtBody = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.62, 0.62), crtChassisMat);
  crtBody.position.y = 0.41;
  crtBody.castShadow = !isSoftwareGl;
  crtGroup.add(crtBody);

  const crtScreenMat = new THREE.MeshStandardMaterial({
    map: crtTex,
    emissive: 0x10b981,
    emissiveMap: crtTex,
    emissiveIntensity: 0.85,
    roughness: 0.18,
    metalness: 0.1,
  });
  const crtScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.46), crtScreenMat);
  crtScreen.position.set(0, 0.42, 0.314);
  crtGroup.add(crtScreen);

  const crtKeyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.05, 0.24),
    new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.65, metalness: 0.12 })
  );
  crtKeyboard.position.set(0, 0.025, 0.48);
  crtKeyboard.rotation.x = 0.08;
  crtGroup.add(crtKeyboard);

  crtGroup.userData.itemId = 'crt' as ArchiveDeskItemId;
  crtGroup.userData.label = 'ARCHÍV-82 CRT Terminál (Szeizmikus Adatfolyam)';
  scene.add(crtGroup);
  clickables.push(crtGroup);

  // Interactive Item 2: Manila Investigation Dossiers Stack (Composite 4-part group)
  const dossierGroup = new THREE.Group();
  dossierGroup.position.set(0.78, DESK_TOP_Y, 0.18);
  dossierGroup.rotation.y = -0.22;

  const manilaMatA = new THREE.MeshStandardMaterial({ color: 0xd6b57c, roughness: 0.85 });
  const manilaMatB = new THREE.MeshStandardMaterial({ color: 0xc29e62, roughness: 0.88 });
  const sheetMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });

  const folder1 = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.026, 0.42), manilaMatB);
  folder1.position.y = 0.013;
  folder1.castShadow = !isSoftwareGl;
  dossierGroup.add(folder1);

  const folder2 = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.024, 0.4), manilaMatA);
  folder2.position.set(0.02, 0.038, -0.01);
  folder2.rotation.y = 0.09;
  folder2.castShadow = !isSoftwareGl;
  dossierGroup.add(folder2);

  const topPaper = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.008, 0.34), sheetMat);
  topPaper.position.set(0.03, 0.054, 0);
  topPaper.rotation.y = -0.06;
  dossierGroup.add(topPaper);

  const redStamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.004, 0.055),
    new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.6 })
  );
  redStamp.position.set(0.1, 0.06, 0.06);
  dossierGroup.add(redStamp);

  dossierGroup.userData.itemId = 'dossier' as ArchiveDeskItemId;
  dossierGroup.userData.label = 'Titkosított 1982-es Akta-köteg (Δ-T1)';
  scene.add(dossierGroup);
  clickables.push(dossierGroup);

  // Interactive Item 3: Magnetic Tape Deck (Lena's 1983 Acoustic Reel)
  const tapeGroup = new THREE.Group();
  tapeGroup.position.set(-1.12, DESK_TOP_Y, 0.22);
  tapeGroup.rotation.y = 0.35;

  const deckBody = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.4), metalFrameMat);
  deckBody.position.y = 0.07;
  deckBody.castShadow = !isSoftwareGl;
  tapeGroup.add(deckBody);

  const reelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.25,
    metalness: 0.85,
  });
  const reelLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 18), reelMat);
  reelLeft.position.set(-0.12, 0.155, -0.03);
  tapeGroup.add(reelLeft);

  const reelRight = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 18), reelMat);
  reelRight.position.set(0.12, 0.155, -0.03);
  tapeGroup.add(reelRight);

  tapeGroup.userData.itemId = 'tape_reel' as ArchiveDeskItemId;
  tapeGroup.userData.label = '1983-as Mágnesszalag (Lena Rádiófelvétel)';
  scene.add(tapeGroup);
  clickables.push(tapeGroup);

  // Articulated Brass Lamp (Prop grounded on desk)
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-1.28, DESK_TOP_Y, -0.35);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.04, 16), brassMat);
  lampBase.position.y = 0.02;
  lampGroup.add(lampBase);
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.65, 10), brassMat);
  lampStem.position.set(0, 0.34, 0);
  lampStem.rotation.z = -0.18;
  lampGroup.add(lampStem);
  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.18, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x065f46,
      roughness: 0.3,
      metalness: 0.4,
      side: THREE.DoubleSide,
    })
  );
  lampShade.position.set(0.14, 0.65, 0.04);
  lampShade.rotation.z = -0.55;
  lampGroup.add(lampShade);
  scene.add(lampGroup);

  const deskShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 2.2),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.45,
    })
  );
  deskShadow.rotation.x = -Math.PI / 2;
  deskShadow.position.y = 0.015;
  scene.add(deskShadow);

  // Raycasting for hover & click
  const raycaster = new THREE.Raycaster();
  let lastMoveTime = 0;
  let hoveredItemId: ArchiveDeskItemId | null = null;
  let opts: ArchiveDeskStageOptions = { ...initialOpts };

  const resolveParentGroup = (obj: THREE.Object3D | null): THREE.Object3D | null => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (curr.userData?.itemId) return curr;
      curr = curr.parent;
    }
    return null;
  };

  const onPointerMove = (e: PointerEvent) => {
    const now = performance.now();
    if (now - lastMoveTime < 55) return;
    lastMoveTime = now;

    const rect = renderer.domElement.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(_mouse, camera);
    const hits = raycaster.intersectObjects(clickables, true);
    const target = hits.length > 0 ? resolveParentGroup(hits[0].object) : null;
    const nextId = (target?.userData?.itemId as ArchiveDeskItemId | undefined) ?? null;
    const nextLabel = (target?.userData?.label as string | undefined) ?? null;

    if (nextId !== hoveredItemId) {
      hoveredItemId = nextId;
      renderer.domElement.style.cursor = nextId ? 'pointer' : 'grab';
      opts.onHoverObject?.(nextId, nextLabel);
    }
  };

  const onClick = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(_mouse, camera);
    const hits = raycaster.intersectObjects(clickables, true);
    const target = hits.length > 0 ? resolveParentGroup(hits[0].object) : null;
    if (target) {
      opts.onSelectObject?.(
        target.userData.itemId as ArchiveDeskItemId,
        target.userData.label as string
      );
    }
  };

  renderer.domElement.addEventListener('pointermove', onPointerMove);
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

    if (!opts.reducedMotion) {
      reelLeft.rotation.y += delta * 1.4;
      reelRight.rotation.y += delta * 1.4;
      crtBounceLight.intensity = 1.2 + Math.sin(elapsed * 3.8) * 0.18;
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
      camera.position.set(0.2, 2.35, 3.6);
      controls.target.set(0, 0.9, 0);
      controls.update();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => window.clearTimeout(id));
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      disposeThreeScene(scene, renderer, controls, [envTex, shadowTex, crtTex]);
    },
  };
}
