'use client';

import { useWeatherStore } from '@/store/weather-store';
import { Cloud, CloudRain, CloudSnow, Loader2 } from 'lucide-react';

interface WeatherToggleProps {
  className?: string;
}

export function WeatherToggle({ className = '' }: WeatherToggleProps) {
  const { 
    isEnabled, 
    condition, 
    isLoading, 
    error, 
    location,
    temperature,
    toggleWeather,
    fetchWeatherData 
  } = useWeatherStore();

  const handleToggle = () => {
    toggleWeather();
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchWeatherData();
  };

  const getWeatherIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    
    if (!isEnabled) {
      return <Cloud className="w-5 h-5" />;
    }

    switch (condition) {
      case 'snow':
        return <CloudSnow className="w-5 h-5" />;
      case 'rain':
        return <CloudRain className="w-5 h-5" />;
      default:
        return <Cloud className="w-5 h-5" />;
    }
  };

  const getConditionText = () => {
    if (error) return 'Error';
    if (isLoading) return 'Loading...';
    if (!isEnabled) return 'Weather Off';
    
    const conditionLabel = condition.charAt(0).toUpperCase() + condition.slice(1);
    return `${conditionLabel} • ${Math.round(temperature)}°C`;
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        bg-white/10 hover:bg-white/20 backdrop-blur-sm
        border border-white/20 transition-all
        ${isEnabled ? 'ring-2 ring-blue-400/50' : ''}
        ${className}
      `}
      aria-label={isEnabled ? 'Disable weather effects' : 'Enable weather effects'}
      aria-pressed={isEnabled}
    >
      {getWeatherIcon()}
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium text-white">
          {getConditionText()}
        </span>
        {isEnabled && location && !error && (
          <span className="text-xs text-white/70">{location}</span>
        )}
        {error && (
          <button
            onClick={handleRetry}
            className="text-xs text-red-300 hover:text-red-200 underline"
            aria-label="Retry fetching weather data"
          >
            Retry
          </button>
        )}
      </div>
    </button>
  );
}
