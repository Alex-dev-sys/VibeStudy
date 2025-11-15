'use client';

import { useRef, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SunProps {
  intensity?: number; // 0.3 for night, 1.0 for day
  position?: [number, number, number];
}

export const Sun = forwardRef<THREE.Group, SunProps>(
  ({ intensity = 1.0, position = [0, 5, 0] }, ref) => {
    const groupRef = useRef<THREE.Group>(null!);
    const lightRef = useRef<THREE.PointLight>(null!);

    // Use forwarded ref or internal ref
    const sunRef = (ref as React.MutableRefObject<THREE.Group>) || groupRef;

    // Rotation animation
    useFrame((state, delta) => {
      if (sunRef.current) {
        sunRef.current.rotation.y += delta * 0.2;
      }
    });

    // Smooth intensity transition
    useFrame(() => {
      if (lightRef.current) {
        const currentIntensity = lightRef.current.intensity;
        const targetIntensity = intensity;
        const diff = targetIntensity - currentIntensity;
        
        // Smooth transition over 2 seconds (approximately)
        if (Math.abs(diff) > 0.01) {
          lightRef.current.intensity += diff * 0.05;
        } else {
          lightRef.current.intensity = targetIntensity;
        }
      }
    });

    return (
      <group ref={sunRef} position={position}>
        {/* Sun sphere */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#FDB813" />
        </mesh>
        
        {/* Sun glow */}
        <mesh scale={1.2}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color="#FDB813"
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Point light */}
        <pointLight
          ref={lightRef}
          color="#FDB813"
          intensity={intensity}
          distance={50}
          decay={2}
        />
      </group>
    );
  }
);

Sun.displayName = 'Sun';
