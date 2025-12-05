import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeMode, THEME } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';

interface SceneProps {
  mode: TreeMode;
}

export const Scene: React.FC<SceneProps> = ({ mode }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: 3, toneMappingExposure: 1.2 }} // ACESFilmic
      shadows
      className="w-full h-full bg-black"
    >
      <PerspectiveCamera makeDefault position={[0, 5, 25]} fov={50} />
      
      <OrbitControls 
        enablePan={false}
        maxPolarAngle={Math.PI / 2 + 0.2}
        minDistance={10}
        maxDistance={40}
        autoRotate={mode === TreeMode.SCATTERED} // Gentle rotate when scattered
        autoRotateSpeed={0.5}
      />

      <Suspense fallback={null}>
        {/* Environment Reflection */}
        <Environment preset="city" />
        
        {/* Background Atmosphere */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Main 3D Content */}
        <group position={[0, -5, 0]}>
          <Foliage mode={mode} />
          <Ornaments mode={mode} />
        </group>

        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color={THEME.emerald} />
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.5} 
          penumbra={1} 
          intensity={500} 
          color={THEME.goldRose} 
          castShadow 
        />
        <pointLight position={[-10, 10, -10]} intensity={200} color="#214066" />
      </Suspense>

      {/* Post Processing for the "Arix Signature" Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={THEME.bloomThreshold} 
          mipmapBlur 
          intensity={THEME.bloomIntensity} 
          radius={0.6}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};
