import { create } from 'zustand';
import { fetchWeather, WeatherData } from '@/lib/weather/weather-api';

export interface WeatherState {
  // Toggle state
  isEnabled: boolean;
  
  // Weather data
  condition: 'clear' | 'rain' | 'snow';
  isDaytime: boolean;
  temperature: number;
  location: string;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  toggleWeather: () => void;
  fetchWeatherData: (location?: string) => Promise<void>;
  setCondition: (condition: 'clear' | 'rain' | 'snow') => void;
  setDaytime: (isDaytime: boolean) => void;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  // Initial state
  isEnabled: false,
  condition: 'clear',
  isDaytime: true,
  temperature: 20,
  location: '',
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  // Toggle weather on/off
  toggleWeather: () => {
    set((state) => ({ isEnabled: !state.isEnabled }));
  },
  
  // Fetch weather data from API
  fetchWeatherData: async (location = 'auto:ip') => {
    set({ isLoading: true, error: null });
    
    try {
      const data: WeatherData = await fetchWeather(location);
      
      set({
        condition: data.condition,
        isDaytime: data.isDaytime,
        temperature: data.temperature,
        location: data.location,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data';
      
      set({
        error: errorMessage,
        isLoading: false,
        // Fallback to clear weather on error
        condition: 'clear',
        isDaytime: true,
      });
      
      console.error('Weather fetch error:', error);
    }
  },
  
  // Manual setters for testing/debugging
  setCondition: (condition) => {
    set({ condition });
  },
  
  setDaytime: (isDaytime) => {
    set({ isDaytime });
  },
}));
