import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMode, THEME } from '../types';
import { getConePoint, getRandomSpherePoint } from '../utils';

// Vertex Shader: Interpolates between two positions and adds a "breathing" noise
const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0 = Scatter, 1 = Tree
  
  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aSize;
  attribute float aRandom;
  
  varying vec3 vColor;
  varying float vAlpha;

  // Simple noise function
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
  }

  void main() {
    // Cubic easing for smoother transition
    float t = uProgress;
    float ease = t * t * (3.0 - 2.0 * t);
    
    // Interpolate Position
    vec3 finalPos = mix(aScatterPos, aTreePos, ease);
    
    // Add "Breathing" / Floating effect
    // Heavier floating when scattered (uProgress close to 0)
    // Subtle shivering when tree (uProgress close to 1)
    float floatIntensity = mix(1.0, 0.1, ease);
    float floatSpeed = mix(0.5, 2.0, ease);
    
    finalPos.x += sin(uTime * floatSpeed + aRandom * 10.0) * 0.2 * floatIntensity;
    finalPos.y += cos(uTime * floatSpeed * 0.8 + aRandom * 20.0) * 0.2 * floatIntensity;
    finalPos.z += sin(uTime * floatSpeed * 1.2 + aRandom * 30.0) * 0.2 * floatIntensity;

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    
    // Dynamic coloring based on position and time
    // Deep emerald core, golden tips
    float heightMix = (finalPos.y + 7.0) / 14.0; 
    vec3 emerald = vec3(0.0, 0.25, 0.15); // Deep Green
    vec3 gold = vec3(1.0, 0.84, 0.0); // Gold
    
    // Mix based on random + gentle time pulse
    float colorPulse = 0.5 + 0.5 * sin(uTime + aRandom * 10.0);
    vColor = mix(emerald, gold, colorPulse * 0.2); // Mostly green, slight gold shimmer
    
    // Fade out slightly when scattered to look like dust
    vAlpha = mix(0.6, 1.0, ease);
  }
`;

// Fragment Shader: Soft circular glow
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft edge
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  mode: TreeMode;
  count?: number;
}

export const Foliage: React.FC<FoliageProps> = ({ mode, count = 15000 }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate Geometry Data
  const { positions, scatterPositions, treePositions, sizes, randoms } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const sp = new Float32Array(count * 3);
    const tp = new Float32Array(count * 3);
    const s = new Float32Array(count);
    const r = new Float32Array(count);

    const treeHeight = 16;
    const treeRadius = 6;
    const scatterRadius = 20;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const scatter = getRandomSpherePoint(scatterRadius);
      const tree = getConePoint(treeHeight, treeRadius);

      sp[i3] = scatter[0];
      sp[i3 + 1] = scatter[1];
      sp[i3 + 2] = scatter[2];

      tp[i3] = tree[0];
      tp[i3 + 1] = tree[1];
      tp[i3 + 2] = tree[2];
      
      // Initial position (doesn't matter much as shader handles it)
      p[i3] = 0; p[i3+1] = 0; p[i3+2] = 0;

      s[i] = Math.random() * 0.5 + 0.5; // Size variation
      r[i] = Math.random();
    }

    return { 
      positions: p, 
      scatterPositions: sp, 
      treePositions: tp, 
      sizes: s, 
      randoms: r 
    };
  }, [count]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Smoothly interpolate uProgress based on mode
      const target = mode === TreeMode.TREE_SHAPE ? 1.0 : 0.0;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        target,
        0.03 // Lerp speed
      );
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 }
  }), []);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
