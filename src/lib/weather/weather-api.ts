// WeatherAPI response types
export interface WeatherAPIResponse {
  location: {
    name: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      code: number;
    };
    is_day: number;
  };
}

// Our internal weather data type
export interface WeatherData {
  condition: 'clear' | 'rain' | 'snow';
  isDaytime: boolean;
  temperature: number;
  location: string;
  localtime: string;
}

// Weather condition codes from WeatherAPI
const SNOW_CODES = [1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258];
const RAIN_CODES = [
  1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198,
  1201, 1240, 1243, 1246,
];

/**
 * Parse weather condition code to our simplified condition type
 */
export function parseWeatherCondition(
  conditionCode: number
): 'clear' | 'rain' | 'snow' {
  if (SNOW_CODES.includes(conditionCode)) {
    return 'snow';
  }
  if (RAIN_CODES.includes(conditionCode)) {
    return 'rain';
  }
  return 'clear';
}

/**
 * Determine if it's daytime based on local time string
 * Format: "2024-11-15 14:30" (YYYY-MM-DD HH:MM)
 */
export function isDaytime(localtime: string): boolean {
  try {
    const timePart = localtime.split(' ')[1];
    if (!timePart) return true; // Default to day if parsing fails
    
    const [hours] = timePart.split(':').map(Number);
    
    // Daytime is between 06:00 and 18:00
    return hours >= 6 && hours < 18;
  } catch (error) {
    console.error('Error parsing localtime:', error);
    return true; // Default to day
  }
}

/**
 * Fetch weather data from our API endpoint
 */
export async function fetchWeather(
  location: string = 'auto:ip'
): Promise<WeatherData> {
  const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to fetch weather data');
  }
  
  const data: WeatherAPIResponse = await response.json();
  
  return {
    condition: parseWeatherCondition(data.current.condition.code),
    isDaytime: isDaytime(data.location.localtime),
    temperature: data.current.temp_c,
    location: data.location.name,
    localtime: data.location.localtime,
  };
}
