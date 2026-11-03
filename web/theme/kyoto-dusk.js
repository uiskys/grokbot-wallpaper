// Kyoto Dusk: lilac–orange blue hour around the office tower. Procedural only
// (canvas textures + a few thousand triangles). Loaded only when
// ?theme=kyoto-dusk or localStorage bothq.theme says so.
//
// Scenery sits on layer 1. The studio aura pass only sees layer 0, so the
// silhouette stays the building's. Lights get layer 1 enabled here; layer 0
// stays on so the tower is lit as before.
import * as THREE from 'three';

const REDUCE = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const kyotoDuskTheme = {
  id: 'kyoto-dusk',
  label: '京都暮色',
  loading: '暮色渐起…',
  themeColor: '#C9A0D8',
  css: new URL('./kyoto-dusk.css', import.meta.url).href,
  fontHref: 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&display=swap',
  // Paper-warm pool in the open upper sky (a low centre sits behind the tower), then lilac, then violet corners.
  sky: {
    centre: [0.18, 0.12],
    radii: [1.08, 0.95],
    stops: [[0, '#FFD4A8'], [0.38, '#C9A0D8'], [1, '#5A4A88']],
    shadow: '#3A2858',
  },
  lightPhase: 'dusk',
  light: {
    night: 0.42, bake: 0.28, lamps: 0.92, windows: 0.78,
    sunI: 0.55, sunEl: -1.5, sunAz: 238, sunC: '#FF9A70',
    hemiI: 0.78, hemiSky: '#B8A0D8', hemiGnd: '#3E3048',
    fillI: 0.30, fillC: '#E8B888', envI: 0.32, exposure: 1.04,
    shadow: 0.26,
    tint: [1.48, 1.18, 0.92],
    floorSun: 0, floorSunC: '#FFD27E',
    glassC: '#8A78C0', glassA: 0.72, glassE: 0.55,
  },
  restyle: restyleOffice,
  mount: mountKyoto,
};

function restyleOffice(templates) {
  const openMats = new Set();
  templates.floor_open?.traverse?.((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of list) if (m) openMats.add(m);
  });
  const seen = new Set();
  for (const [name, root] of Object.entries(templates)) {
    if (name === 'floor_open' || !root?.traverse) continue;
    root.traverse((o) => {
      if (!o.isMesh) return;
      const list = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of list) {
        if (!m || seen.has(m) || openMats.has(m)) continue;
        seen.add(m);
        tintMaterial(m);
      }
    });
  }
}

function tintMaterial(m) {
  if (m.isMeshBasicMaterial && m.map) {
    m.color.set('#D8D0E0');
    return;
  }
  if (!m.color) return;
  if (m.transparent && m.opacity < 0.65) {
    m.color.set('#C8B8E4');
    return;
  }
  const hsl = { h: 0, s: 0, l: 0 };
  m.color.getHSL(hsl);
  // Soft maple shift on greenish foliage materials.
  if (hsl.h > 0.22 && hsl.h < 0.48 && hsl.s > 0.12) {
    m.color.set(hsl.l > 0.4 ? '#C45A28' : '#8A3830');
  } else if (hsl.s < 0.14) {
    if (hsl.l > 0.78) m.color.set('#E8E4F0');
    else if (hsl.l > 0.45) m.color.set('#B8B0C4');
    else m.color.set('#3A3448');
  } else {
    // Drift saturated accents slightly toward cool violet / warm amber midpoint.
    let dh = 0.78 - hsl.h;
    if (dh > 0.5) dh -= 1;
    if (dh < -0.5) dh += 1;
    m.color.offsetHSL(dh * 0.25, -0.02, 0);
  }
  if (m.emissive && m.emissive.getHex() !== 0) {
    m.emissive.set(m.name === 'night_screen' ? '#FFB86A' : '#FFD27F');
  }
}

function mountKyoto({ scene }) {
  const geos = [];
  const mats = [];
  const texs = [];
  const sway = [];
  const root = new THREE.Group();
  root.name = 'theme-kyoto-dusk';

  const mat = (color, roughness = 0.88, metalness = 0, extra) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    mats.push(m);
    return m;
  };
  const geo = (g) => { geos.push(g); return g; };

  const bark = mat('#4A3028', 0.94);
  const mapleDeep = mat('#B83228', 0.82);
  const mapleMid = mat('#E85A28', 0.78);
  const mapleLite = mat('#C45A20', 0.8);
  const moss = mat('#3A5A40', 0.92);
  const stone = mat('#8A8890', 0.96);
  const stoneLite = mat('#C4C0C8', 0.96);
  const stoneDark = mat('#6A6870', 0.94);
  const gravel = mat('#ffffff', 0.95, 0, { map: gravelTexture(texs) });
  const bamboo = mat('#5A6A48', 0.86);
  const paper = mat('#FFD27F', 0.4, 0, { emissive: '#FFD27F', emissiveIntensity: 1.35 });

  root.add(pad(geo, gravel, moss, stoneLite, 15.5, 2.4, 3.0));
  root.add(softShadow(geo, mats, texs));

  // Momiji — keep sparse; leave sky readable behind.
  maple(root, geo, bark, mapleDeep, mapleMid, mapleLite, sway, -6.0, -10.6, 1.35);
  maple(root, geo, bark, mapleDeep, mapleMid, mapleLite, sway, 7.2, -11.4, 1.5);
  maple(root, geo, bark, mapleDeep, mapleMid, mapleLite, sway, -11.8, -2.8, 1.1);
  maple(root, geo, bark, mapleDeep, mapleMid, mapleLite, sway, 13.6, -4.8, 1.05);
  maple(root, geo, bark, mapleDeep, mapleMid, mapleLite, sway, -8.8, 7.0, 0.95);
  maple(root, geo, bark, mapleDeep, mapleMid, mapleLite, sway, 9.8, 6.6, 0.9);
  maple(root, geo, bark, mapleDeep, mapleMid, mapleLite, sway, 4.2, -12.2, 0.85);

  bambooClump(root, geo, bamboo, -13.2, -7.6, 2.4);
  bambooClump(root, geo, bamboo, 14.4, -8.8, 2.2);

  for (const [x, z, s, dark] of [
    [-7.6, 8.2, 0.75, false], [-5.8, 8.8, 0.45, true], [7.4, 8.4, 0.7, false],
    [10.6, -7.0, 0.9, true], [-9.8, -7.2, 0.65, false], [3.8, -10.0, 0.5, true],
  ]) root.add(rock(geo, dark ? stoneDark : stoneLite, x, z, s));

  // Stone lanterns outside the 16.4×12.4 slab, on the camera side and one garden bed.
  const lan1 = toro(geo, stone, stoneDark, paper);
  lan1.position.set(-9.6, 0, 8.2);
  lan1.scale.setScalar(1.65);
  root.add(lan1);

  const lan2 = toro(geo, stone, stoneDark, paper);
  lan2.position.set(10.2, 0, 7.6);
  lan2.scale.setScalar(1.4);
  root.add(lan2);

  const lan3 = toro(geo, stone, stoneDark, paper);
  lan3.position.set(-12.6, 0, -1.4);
  lan3.scale.setScalar(1.2);
  root.add(lan3);

  root.traverse((o) => { o.layers.set(1); o.castShadow = false; o.receiveShadow = false; });
  scene.add(root);
  scene.traverse((o) => { if (o.isLight) o.layers.enable(1); });

  let t = 0;
  return {
    update(dt) {
      if (REDUCE) return;
      t += dt;
      for (const c of sway) c.rotation.y = Math.sin(t * 0.4 + c.userData.phase) * 0.03;
    },
    dispose() {
      root.removeFromParent();
      for (const g of geos) g.dispose();
      for (const m of mats) m.dispose();
      for (const tex of texs) tex.dispose();
    },
  };
}

function canvasTex(w, h, draw, texs) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  texs.push(t);
  return t;
}

function gravelTexture(texs) {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#C8C2CE';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const s = 0.6 + Math.random() * 1.8;
      g.fillStyle = Math.random() > 0.5 ? '#B4AEBA' : '#D8D2DC';
      g.fillRect(x, y, s, s);
    }
  }, texs);
}

function pad(geo, gravel, moss, curbMat, w, nearZ, farDepth) {
  const g = new THREE.Group();
  const ground = new THREE.Mesh(geo(new THREE.CircleGeometry(w * 0.42, 48)), gravel);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0.01, nearZ - farDepth * 0.35);
  ground.scale.set(1.15, 0.72, 1);
  g.add(ground);

  for (const [x, z, s] of [[-5.5, 5.5, 1.8], [5.2, 5.8, 1.5], [-2.2, -8.5, 1.2], [6.5, -9.0, 1.4]]) {
    const m = new THREE.Mesh(geo(new THREE.CircleGeometry(s, 20)), moss);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.02, z);
    g.add(m);
  }

  // Low stone curb ring (partial) — refined border, not a wall.
  const curb = new THREE.Mesh(geo(new THREE.TorusGeometry(w * 0.38, 0.08, 6, 48)), curbMat);
  curb.rotation.x = Math.PI / 2;
  curb.position.set(0, 0.06, nearZ - farDepth * 0.35);
  curb.scale.set(1.1, 0.7, 1);
  g.add(curb);
  return g;
}

function softShadow(geo, mats, texs) {
  const t = canvasTex(128, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(40, 28, 64, 0.35)');
    grd.addColorStop(1, 'rgba(40, 28, 64, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  }, texs);
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });
  mats.push(m);
  const mesh = new THREE.Mesh(geo(new THREE.PlaneGeometry(18, 12)), m);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.005, 1.5);
  return mesh;
}

function maple(root, geo, bark, deep, mid, lite, sway, x, z, s) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.08 * s, 0.14 * s, 1.6 * s, 7)), bark);
  trunk.position.y = 0.8 * s;
  g.add(trunk);
  const places = [
    [0, 1.7, 0, 1.0, deep], [0.45, 1.55, 0.2, 0.7, mid], [-0.4, 1.5, -0.15, 0.65, lite],
    [0.15, 2.05, -0.25, 0.55, mid], [-0.2, 1.95, 0.3, 0.5, deep],
  ];
  for (const [px, py, pz, sc, mat] of places) {
    const canopy = new THREE.Mesh(geo(new THREE.IcosahedronGeometry(0.55 * s * sc, 1)), mat);
    canopy.position.set(px * s, py * s, pz * s);
    canopy.userData.phase = Math.random() * Math.PI * 2;
    sway.push(canopy);
    g.add(canopy);
  }
  g.position.set(x, 0, z);
  root.add(g);
}

function bambooClump(root, geo, bamboo, x, z, h) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const stalk = new THREE.Mesh(
      geo(new THREE.CylinderGeometry(0.04, 0.05, h * (0.75 + Math.random() * 0.3), 6)),
      bamboo,
    );
    stalk.position.set((Math.random() - 0.5) * 0.5, h * 0.4, (Math.random() - 0.5) * 0.5);
    g.add(stalk);
  }
  g.position.set(x, 0, z);
  root.add(g);
}

function rock(geo, mat, x, z, s) {
  const m = new THREE.Mesh(geo(new THREE.DodecahedronGeometry(0.35 * s, 0)), mat);
  m.position.set(x, 0.12 * s, z);
  m.rotation.set(Math.random(), Math.random(), Math.random());
  m.scale.set(1.2, 0.7, 1);
  return m;
}

/** Kasuga-style stone lantern: base, post, an open firebox so the paper core is visible, a roof. */
function toro(geo, stone, dark, paper) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.34, 0.4, 0.14, 8)), stone);
  base.position.y = 0.07;
  g.add(base);
  const post = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.1, 0.12, 0.72, 8)), stone);
  post.position.y = 0.48;
  g.add(post);
  for (const [x, z] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) {
    const leg = new THREE.Mesh(geo(new THREE.BoxGeometry(0.06, 0.32, 0.06)), dark);
    leg.position.set(x, 0.98, z);
    g.add(leg);
  }
  const glow = new THREE.Mesh(geo(new THREE.SphereGeometry(0.12, 12, 10)), paper);
  glow.position.y = 0.98;
  g.add(glow);
  const cap = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 8)), stone);
  cap.position.y = 1.16;
  g.add(cap);
  const roof = new THREE.Mesh(geo(new THREE.ConeGeometry(0.42, 0.22, 4)), stone);
  roof.position.y = 1.32;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  return g;
}
