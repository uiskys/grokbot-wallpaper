// Washi / paper-warm interior companion for Kyoto Dusk.
// id matches the exterior so unresolved floors inherit this look (THEMES contract step 4).
import { box, cachedProps, cluster, cyl, lit, mat } from '../kit.js';

const tint = {
  floor: '#E8D4B8',
  wall: '#F4EDE4',
  wood: '#A87850',
  metal: '#4A4850',
  fabric: '#E8DCC8',
  glass: '#E0A868',
};

function build() {
  const g = cluster();
  const wood = mat('#A87850', 0.82);
  const stone = mat('#8A8890', 0.94);
  const dark = mat('#4A4850', 0.7);
  const cream = mat('#F4EDE4', 0.55);
  const paper = lit('#FFD27F', 0.5);

  // Low display shelf
  box(g, wood, 1.4, 0.08, 0.42, 0.1, 0.85, 0.2);
  box(g, wood, 0.08, 0.85, 0.42, -0.55, 0.42, 0.2);
  box(g, wood, 0.08, 0.85, 0.42, 0.75, 0.42, 0.2);

  // Miniature tōrō
  cyl(g, stone, 0.1, 0.11, 0.06, -0.15, 0.95, 0.2, 8);
  cyl(g, stone, 0.04, 0.05, 0.28, -0.15, 1.12, 0.2, 8);
  box(g, dark, 0.14, 0.12, 0.14, -0.15, 1.32, 0.2);
  cyl(g, paper, 0.045, 0.05, 0.06, -0.15, 1.32, 0.2, 8);

  // Ikebana vase + stem
  cyl(g, cream, 0.06, 0.05, 0.16, 0.35, 1.0, 0.22, 10);
  cyl(g, mat('#3A5A40', 0.88), 0.012, 0.01, 0.28, 0.35, 1.22, 0.22, 6);

  // Slim shoji-ish panel
  box(g, cream, 0.7, 1.1, 0.03, 0.95, 1.2, -0.05);
  box(g, wood, 0.74, 0.04, 0.04, 0.95, 1.75, -0.03);
  box(g, wood, 0.74, 0.04, 0.04, 0.95, 0.65, -0.03);

  return g;
}

export const washiInterior = {
  // Same id as exterior → floors without a keyword still get paper-warm rooms.
  id: 'kyoto-dusk',
  label: '和纸暖光',
  accent: '#C45A28',
  ink: '#FFF8F0',
  glass: '#E0A868',
  tint,
  createProps: () => cachedProps('washi', build),
};
