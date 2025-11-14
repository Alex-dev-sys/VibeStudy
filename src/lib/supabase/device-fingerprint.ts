export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  hash: string;
}

/**
 * Generate a device fingerprint based on browser characteristics
 */
export function generateDeviceFingerprint(): DeviceFingerprint {
  if (typeof window === 'undefined') {
    throw new Error('Device fingerprinting can only be done in the browser');
  }

  const userAgent = navigator.userAgent;
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;

  // Generate a simple hash from the fingerprint data
  const fingerprintString = `${userAgent}|${screenResolution}|${timezone}|${language}|${platform}`;
  const hash = simpleHash(fingerprintString);

  return {
    userAgent,
    screenResolution,
    timezone,
    language,
    platform,
    hash
  };
}

/**
 * Simple hash function for fingerprint
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Store device fingerprint in localStorage
 */
export function storeDeviceFingerprint(fingerprint: DeviceFingerprint): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('device-fingerprint', JSON.stringify(fingerprint));
  } catch (error) {
    console.error('Failed to store device fingerprint:', error);
  }
}

/**
 * Get stored device fingerprint from localStorage
 */
export function getStoredDeviceFingerprint(): DeviceFingerprint | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('device-fingerprint');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to get stored device fingerprint:', error);
  }
  
  return null;
}

/**
 * Verify if current device matches stored fingerprint
 */
export function verifyDeviceFingerprint(): boolean {
  const stored = getStoredDeviceFingerprint();
  if (!stored) return false;
  
  const current = generateDeviceFingerprint();
  
  // Compare hash (allows for minor changes in screen resolution, etc.)
  return stored.hash === current.hash;
}

/**
 * Get a human-readable device name
 */
export function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device';
  
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';
  
  return `${browser} on ${os}`;
}
