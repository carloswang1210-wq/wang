import * as THREE from 'three';

// Generate a random point inside a sphere
export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Generate a point on a cone surface (Christmas tree shape)
export const getConePoint = (height: number, baseRadius: number): [number, number, number] => {
  // y goes from -height/2 to height/2
  const y = (Math.random() * height) - (height / 2);
  
  // Normalized height factor (0 at top, 1 at bottom)
  const hFactor = 0.5 - (y / height); // roughly 0 to 1
  
  const currentRadius = baseRadius * hFactor;
  const angle = Math.random() * Math.PI * 2;
  
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;
  
  return [x, y, z];
};

// Generate data for ornaments
export const generateOrnamentData = (count: number, type: 'box' | 'sphere'): any[] => {
  const data = [];
  const height = 14;
  const baseRadius = 5.5;
  const scatterRadius = 15;

  for (let i = 0; i < count; i++) {
    const scatter = getRandomSpherePoint(scatterRadius);
    const tree = getConePoint(height, baseRadius);
    
    // Add some noise to tree position so ornaments aren't perfectly on the surface
    tree[0] += (Math.random() - 0.5) * 0.5;
    tree[2] += (Math.random() - 0.5) * 0.5;

    data.push({
      scatter,
      tree,
      rotationScatter: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      rotationTree: [0, Math.atan2(tree[0], tree[2]), 0], // Face outward roughly
      scale: 0.2 + Math.random() * 0.3,
      id: i
    });
  }
  return data;
};
