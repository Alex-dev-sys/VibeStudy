'use client';

import { Canvas } from '@react-three/fiber';
import { useWeatherStore } from '@/store/weather-store';
import { Sun } from './Sun';
import { ParticleSystem } from './ParticleSystem';
import { useRef } from 'react';
import * as THREE from 'three';

interface WeatherSceneProps {
  className?: string;
}

export function WeatherScene({ className = '' }: WeatherSceneProps) {
  const { condition, isDaytime } = useWeatherStore();
  const sunRef = useRef<THREE.Group>(null);

  // Calculate sun intensity based on day/night
  const sunIntensity = isDaytime ? 1.0 : 0.3;
  
  // Calculate ambient light intensity
  const ambientIntensity = isDaytime ? 0.5 : 0.2;

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Ambient light */}
        <ambientLight intensity={ambientIntensity} />
        
        {/* Directional light for general scene lighting */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={isDaytime ? 0.5 : 0.2}
          castShadow
        />
        
        {/* Sun component with day/night intensity */}
        <Sun ref={sunRef} intensity={sunIntensity} position={[0, 5, -5]} />
        
        {/* Particle system based on weather condition */}
        <ParticleSystem type={condition === 'clear' ? null : condition} />
      </Canvas>
    </div>
  );
}
