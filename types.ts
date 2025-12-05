export enum TreeMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  scatter: [number, number, number];
  tree: [number, number, number];
  rotationScatter: [number, number, number];
  rotationTree: [number, number, number];
  scale: number;
  color: string;
}

export const THEME = {
  emerald: '#002b18',
  emeraldLight: '#005c35',
  gold: '#FFD700',
  goldRose: '#E0BFB8',
  white: '#FFFFFF',
  bloomThreshold: 0.6,
  bloomIntensity: 1.5
};
