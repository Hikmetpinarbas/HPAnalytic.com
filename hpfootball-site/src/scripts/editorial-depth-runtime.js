/* Progressive enhancement; the static Astro/CSS/SVG scene is fully usable without JS. */
const SCENE_SELECTOR = '[data-depth-scene]';
const MOTION_WINDOW_MS = 16000;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const eligible = () => !prefersReducedMotion() && !navigator.connection?.saveData &&
  !window.matchMedia('(max-width: 359px)').matches;
let gsapLoading;
function loadGsap() {
  if (window.gsap) return Promise.resolve(window.gsap);
  if (!gsapLoading) gsapLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = '/vendor/hp-depth/gsap.min.js'; s.async = true;
    s.onload = () => resolve(window.gsap); s.onerror = reject;
    document.head.append(s);
  });
  return gsapLoading;
}
async function start(element) {
  if (!eligible() || element.dataset.depthEnhanced) return;
  const host = element.querySelector('[data-depth-webgl]');
  if (!host || !host.clientWidth || !host.clientHeight) return;
  let THREE;
  const threeModuleUrl = '/vendor/hp-depth/three.module.js';
  try { THREE = await import(/* @vite-ignore */ threeModuleUrl); } catch { return; }
  if (!element.isConnected || !eligible()) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }); }
  catch { return; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 30);
  camera.position.z = 5.5;
  const geo = new THREE.PlaneGeometry(11, 7, 24, 18);
  const position = geo.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i);
    position.setZ(i, Math.sin(x * .55) * Math.cos(y * .66) * .22);
  }
  geo.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: 0x8ea58b, transparent: true, opacity: .45, roughness: .85,
    metalness: 0, side: THREE.DoubleSide, depthWrite: false
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.rotation.z = -.13; scene.add(mesh);
  scene.add(new THREE.AmbientLight(0xfffefb, 1.3));
  const sun = new THREE.DirectionalLight(0xc3a469, 1.6);
  sun.position.set(2, 3, 5); scene.add(sun);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  host.append(renderer.domElement);
  element.dataset.depthEnhanced = 'true';
  let visible = true, raf = 0, disposed = false, lastFrame = 0;
  let motionUntil = performance.now() + MOTION_WINDOW_MS;
  const resize = () => {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  const io = new IntersectionObserver(entries => {
    const nextVisible = entries[0]?.isIntersecting ?? false;
    if (nextVisible && !visible) { motionUntil = performance.now() + MOTION_WINDOW_MS; scheduleFrame(); }
    visible = nextVisible;
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
  });
  io.observe(element);
  const pointer = { x: 0, y: 0 };
  const onPointer = ev => {
    const box = element.getBoundingClientRect();
    pointer.x = (ev.clientX - box.left) / box.width - .5;
    pointer.y = (ev.clientY - box.top) / box.height - .5;
    motionUntil = performance.now() + 900;
    scheduleFrame();
  };
  element.addEventListener('pointermove', onPointer, { passive: true });
  let tween;
  loadGsap().then(gsap => {
    if (disposed || !gsap) return;
    tween = gsap.to(mesh.rotation, { y: .045, duration: 6, repeat: 1, yoyo: true, ease: 'sine.inOut' });
  }).catch(() => {});
  function scheduleFrame() {
    if (!disposed && !raf && visible && !document.hidden && eligible()) raf = requestAnimationFrame(tick);
  }
  const tick = ms => {
    raf = 0;
    if (disposed || !visible || document.hidden || !eligible() || ms > motionUntil) return;
    if (ms - lastFrame < 33) { scheduleFrame(); return; }
    lastFrame = ms;
    mesh.rotation.x += ((pointer.y * .055) - mesh.rotation.x) * .035;
    mesh.rotation.z += ((-.13 + pointer.x * .05) - mesh.rotation.z) * .035;
    renderer.render(scene, camera);
    scheduleFrame();
  };
  scheduleFrame();
  const onVisibility = () => { if (!document.hidden) { motionUntil = performance.now() + 900; scheduleFrame(); } };
  document.addEventListener('visibilitychange', onVisibility);
  const dispose = () => {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    element.removeEventListener('pointermove', onPointer); document.removeEventListener('visibilitychange', onVisibility);
    tween?.kill(); geo.dispose(); material.dispose(); renderer.dispose();
    renderer.domElement.remove(); element.removeAttribute('data-depth-enhanced');
  };
  window.addEventListener('pagehide', dispose, { once: true });
  const motionChange = () => { if (prefersReducedMotion()) dispose(); };
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', motionChange, { once: true });
}
function init() {
  if (!eligible()) return;
  document.querySelectorAll(SCENE_SELECTOR).forEach(element => {
    const io = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) { io.disconnect(); void start(element); }
    }, { rootMargin: '120px' });
    io.observe(element);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
