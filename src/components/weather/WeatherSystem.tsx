'use client';

import { useEffect, useRef } from 'react';
import { useWeatherStore } from '@/store/weather-store';
import { WeatherToggle } from './WeatherToggle';
import { WeatherScene } from './WeatherScene';
import { toast } from 'sonner';

interface WeatherSystemProps {
  defaultLocation?: string;
  className?: string;
}

export function WeatherSystem({ 
  defaultLocation = 'auto:ip',
  className = '' 
}: WeatherSystemProps) {
  const { isEnabled, error, fetchWeatherData } = useWeatherStore();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Fetch weather data on mount
  useEffect(() => {
    fetchWeatherData(defaultLocation);
  }, [defaultLocation]);

  // Set up periodic refresh (every 30 minutes)
  useEffect(() => {
    if (isEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        fetchWeatherData(defaultLocation);
      }, 30 * 60 * 1000); // 30 minutes

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [isEnabled, defaultLocation]);

  // Handle errors with exponential backoff
  useEffect(() => {
    if (error) {
      toast.error('Weather Error', {
        description: error,
        action: {
          label: 'Retry',
          onClick: () => {
            retryCountRef.current = 0;
            fetchWeatherData(defaultLocation);
          },
        },
      });

      // Exponential backoff: 1min, 5min, 15min
      const retryDelays = [60000, 300000, 900000]; // in milliseconds
      const delay = retryDelays[Math.min(retryCountRef.current, retryDelays.length - 1)];

      retryTimeoutRef.current = setTimeout(() => {
        retryCountRef.current++;
        fetchWeatherData(defaultLocation);
      }, delay);

      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    } else {
      // Reset retry count on success
      retryCountRef.current = 0;
    }
  }, [error, defaultLocation]);

  // Check for WebGL support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      toast.error('3D features not supported', {
        description: 'Your browser does not support WebGL, which is required for weather effects.',
      });
    }
  }, []);

  return (
    <>
      {/* Weather toggle button - высокий z-index для кликабельности */}
      <div className={`relative z-50 ${className}`}>
        <WeatherToggle />
      </div>
      
      {/* 3D weather scene - низкий z-index, за всем контентом */}
      {isEnabled && <WeatherScene className="z-0" />}
    </>
  );
}
