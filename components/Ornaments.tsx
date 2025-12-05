import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode, THEME } from '../types';
import { generateOrnamentData } from '../utils';

interface OrnamentLayerProps {
  mode: TreeMode;
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  scaleFactor: number;
  type: 'box' | 'sphere';
}

const OrnamentLayer: React.FC<OrnamentLayerProps> = ({ 
  mode, count, geometry, material, scaleFactor, type 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [data] = useState(() => generateOrnamentData(count, type));
  
  // Temporary objects for calculations to avoid GC
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempVec3 = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const currentProgress = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth transition logic
    const target = mode === TreeMode.TREE_SHAPE ? 1.0 : 0.0;
    // Boxes (heavier) move slower than spheres
    const lerpSpeed = type === 'box' ? 0.02 : 0.04;
    
    currentProgress.current = THREE.MathUtils.lerp(
      currentProgress.current,
      target,
      lerpSpeed
    );

    const t = currentProgress.current;
    // Ease function
    const ease = t * t * (3.0 - 2.0 * t);
    
    // Time for floating animation
    const time = state.clock.getElapsedTime();

    data.forEach((item, i) => {
      // Interpolate Position
      const sx = item.scatter[0];
      const sy = item.scatter[1];
      const sz = item.scatter[2];
      
      const tx = item.tree[0];
      const ty = item.tree[1];
      const tz = item.tree[2];

      tempObj.position.set(
        THREE.MathUtils.lerp(sx, tx, ease),
        THREE.MathUtils.lerp(sy, ty, ease),
        THREE.MathUtils.lerp(sz, tz, ease)
      );

      // Add Floating noise
      // Float intensity higher when scattered
      const floatAmp = THREE.MathUtils.lerp(1.5, 0.05, ease); 
      const yOffset = Math.sin(time * 0.5 + item.id) * floatAmp;
      const rotateOffset = Math.cos(time * 0.2 + item.id) * floatAmp * 0.1;

      tempObj.position.y += yOffset;

      // Rotation
      // Scattered: Random rotation. Tree: Upright or specific orientation
      // We perform a rough interpolation of rotation via lookAt or Euler mixing
      tempObj.rotation.set(
        THREE.MathUtils.lerp(item.rotationScatter[0], item.rotationTree[0], ease),
        THREE.MathUtils.lerp(item.rotationScatter[1], item.rotationTree[1] + rotateOffset, ease),
        THREE.MathUtils.lerp(item.rotationScatter[2], item.rotationTree[2], ease)
      );

      // Scale
      tempObj.scale.setScalar(item.scale * scaleFactor);

      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};

export const Ornaments: React.FC<{ mode: TreeMode }> = ({ mode }) => {
  // Geometries
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const starGeo = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(1, 0);
    return geo;
  }, []);

  // Materials
  // Gold Mirror
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: THEME.gold,
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 2.0
  }), []);

  // Red/Green Satin
  const redMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8a0a0a',
    metalness: 0.4,
    roughness: 0.3,
    envMapIntensity: 1.0
  }), []);

  // Glowing White Lights
  const lightMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#fffae3',
  }), []);

  return (
    <group>
      {/* Heavy Gifts - Red */}
      <OrnamentLayer 
        mode={mode} 
        count={50} 
        geometry={boxGeo} 
        material={redMat} 
        scaleFactor={1.5} 
        type="box"
      />
      
      {/* Golden Baubles */}
      <OrnamentLayer 
        mode={mode} 
        count={120} 
        geometry={sphereGeo} 
        material={goldMat} 
        scaleFactor={0.8} 
        type="sphere"
      />

      {/* Tiny Lights / Stars - Treated as 'sphere' type for movement but different visual */}
      <OrnamentLayer
        mode={mode}
        count={200}
        geometry={starGeo}
        material={lightMat}
        scaleFactor={0.3}
        type="sphere"
      />
    </group>
  );
};
