'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  type: 'snow' | 'rain' | 'clear' | null;
  count?: number;
}

interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  sizes: Float32Array;
}

export function ParticleSystem({ type, count = 1000 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const particleDataRef = useRef<ParticleData | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Particle configuration based on type
  const config = useMemo(() => {
    if (type === 'snow') {
      return {
        count: 1000,
        size: { min: 0.02, max: 0.05 },
        color: '#FFFFFF',
        opacity: 0.8,
        velocity: { min: 0.5, max: 1.5 },
        geometry: new THREE.SphereGeometry(1, 8, 8),
      };
    } else if (type === 'rain') {
      return {
        count: 2000,
        size: { min: 0.02, max: 0.02 },
        color: '#4A90E2',
        opacity: 0.6,
        velocity: { min: 2.0, max: 4.0 },
        geometry: new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
      };
    }
    return null;
  }, [type]);

  // Initialize particle data
  useEffect(() => {
    if (!config || !meshRef.current) return;

    const particleCount = config.count;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    // Initialize particles with random positions and properties
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random position in scene
      positions[i3] = (Math.random() - 0.5) * 20; // x
      positions[i3 + 1] = Math.random() * 20; // y (0 to 20)
      positions[i3 + 2] = (Math.random() - 0.5) * 20; // z
      
      // Random velocity
      velocities[i] = 
        config.velocity.min + 
        Math.random() * (config.velocity.max - config.velocity.min);
      
      // Random size
      sizes[i] = 
        config.size.min + 
        Math.random() * (config.size.max - config.size.min);
    }

    particleDataRef.current = { positions, velocities, sizes };

    // Set initial instance matrices
    const dummy = new THREE.Object3D();
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      dummy.position.set(
        positions[i3],
        positions[i3 + 1],
        positions[i3 + 2]
      );
      dummy.scale.setScalar(sizes[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [config]);

  // Animate particles
  useFrame((state, delta) => {
    if (!config || !meshRef.current || !particleDataRef.current || prefersReducedMotion) {
      return;
    }

    const { positions, velocities, sizes } = particleDataRef.current;
    const dummy = new THREE.Object3D();
    const particleCount = config.count;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Update Y position (falling)
      positions[i3 + 1] -= velocities[i] * delta;
      
      // Reset particle when it reaches ground
      if (positions[i3 + 1] < 0) {
        positions[i3 + 1] = 20;
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;
      }
      
      // Update instance matrix
      dummy.position.set(
        positions[i3],
        positions[i3 + 1],
        positions[i3 + 2]
      );
      dummy.scale.setScalar(sizes[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Не показываем частицы для солнечной погоды или если тип не задан
  if (!config || !type || type === 'clear') return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[config.geometry, undefined, config.count]}
      frustumCulled
    >
      <meshBasicMaterial
        color={config.color}
        transparent
        opacity={config.opacity}
      />
    </instancedMesh>
  );
}
