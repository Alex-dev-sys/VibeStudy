# Weather System Design Document

## Overview

The Weather System is a new 3D visualization feature that adds dynamic weather effects and day/night cycles to the application. It integrates with WeatherAPI to display real-time weather conditions through particle effects (snow, rain) and lighting adjustments. The system is designed as a standalone module that can be toggled on/off by users.

### Key Design Principles

- **Modularity**: Weather system components are self-contained and can be easily enabled/disabled
- **Performance**: Particle systems use instanced rendering to minimize performance impact
- **Integration**: Seamlessly works with existing 3D components (like Sun) without breaking changes
- **User Control**: Simple toggle interface for enabling/disabling weather effects

## Architecture

### Component Hierarchy

```
WeatherSystem (Container)
├── WeatherToggle (UI Control)
├── WeatherScene (3D Canvas)
│   ├── Sun (Existing Component - Modified)
│   ├── ParticleSystem (Snow/Rain)
│   └── Lighting (Day/Night)
└── WeatherAPI (Data Service)
```

### Technology Stack

- **3D Rendering**: Three.js with @react-three/fiber
- **3D Helpers**: @react-three/drei for common 3D utilities
- **State Management**: Zustand (already in project)
- **API Integration**: Native fetch API
- **UI Components**: Existing UI component library (Radix UI)

### New Dependencies Required

```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.95.0",
  "@types/three": "^0.160.0"
}
```

## Components and Interfaces

### 1. Weather Store (Zustand)

**Location**: `src/store/weather-store.ts`

```typescript
interface WeatherState {
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
```

### 2. Weather API Service

**Location**: `src/lib/weather-api.ts`

```typescript
interface WeatherAPIResponse {
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

interface WeatherData {
  condition: 'clear' | 'rain' | 'snow';
  isDaytime: boolean;
  temperature: number;
  location: string;
  localtime: string;
}

// API Functions
async function fetchWeather(apiKey: string, location: string): Promise<WeatherData>
function parseWeatherCondition(conditionCode: number): 'clear' | 'rain' | 'snow'
function isDaytime(localtime: string): boolean
```

**Weather Condition Mapping** (based on WeatherAPI codes):
- Snow: 1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258
- Rain: 1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246
- Clear: All other codes

### 3. Weather Toggle Component

**Location**: `src/components/weather/WeatherToggle.tsx`

```typescript
interface WeatherToggleProps {
  className?: string;
}

// Renders a button with:
// - Cloud icon with toggle state indicator
// - Current weather condition display (when enabled)
// - Loading state
// - Error state
```

### 4. Particle System Component

**Location**: `src/components/weather/ParticleSystem.tsx`

```typescript
interface ParticleSystemProps {
  type: 'snow' | 'rain' | null;
  count?: number; // Default: 1000
}

interface Particle {
  position: [number, number, number];
  velocity: number;
  size: number;
}
```

**Particle Specifications**:

**Snow Particles**:
- Count: 1000 particles
- Size: Random between 0.02 - 0.05 units
- Color: White (#FFFFFF) with 0.8 opacity
- Velocity: Random between 0.5 - 1.5 units/second
- Distribution: Random X/Z within scene bounds, Y from 0 to 20
- Reset: When Y < 0, reset to Y = 20

**Rain Particles**:
- Count: 2000 particles
- Size: 0.02 width, 0.2 height (elongated)
- Color: Blue (#4A90E2) with 0.6 opacity
- Velocity: Random between 2.0 - 4.0 units/second
- Distribution: Random X/Z within scene bounds, Y from 0 to 20
- Reset: When Y < 0, reset to Y = 20

### 5. Weather Scene Component

**Location**: `src/components/weather/WeatherScene.tsx`

```typescript
interface WeatherSceneProps {
  sunRef?: React.RefObject<THREE.Group>;
  className?: string;
}

// Renders:
// - Canvas with camera and controls
// - Sun component (passed or created)
// - ParticleSystem based on weather condition
// - Ambient and directional lighting
// - Day/night transitions
```

### 6. Modified Sun Component

**Location**: `src/components/weather/Sun.tsx`

The Sun component provided by the user will be enhanced to:
- Accept intensity prop for day/night control
- Expose ref for external control
- Maintain existing rotation animation

```typescript
interface SunProps {
  intensity?: number; // 0.3 for night, 1.0 for day
  position?: [number, number, number];
}
```

### 7. Weather Container Component

**Location**: `src/components/weather/WeatherSystem.tsx`

Main container that orchestrates all weather components:

```typescript
interface WeatherSystemProps {
  defaultLocation?: string; // Default: 'auto:ip' for IP-based location
  apiKey: string;
  className?: string;
}

// Responsibilities:
// - Initialize weather store
// - Fetch weather data on mount and periodically (every 30 minutes)
// - Render WeatherToggle and WeatherScene
// - Handle error states
```

## Data Models

### Weather State Model

```typescript
type WeatherCondition = 'clear' | 'rain' | 'snow';

interface WeatherState {
  isEnabled: boolean;
  condition: WeatherCondition;
  isDaytime: boolean;
  temperature: number;
  location: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
```

### Particle Data Model

```typescript
interface ParticleData {
  positions: Float32Array; // [x, y, z, x, y, z, ...]
  velocities: Float32Array; // [v, v, v, ...]
  sizes: Float32Array; // [s, s, s, ...]
}
```

## Error Handling

### API Errors

1. **Network Failure**
   - Fallback: Display last known weather or default to 'clear' condition
   - User Feedback: Show error toast with retry option
   - Logging: Log error to console for debugging

2. **Invalid API Key**
   - Fallback: Disable weather fetching, allow manual condition selection
   - User Feedback: Show configuration error message
   - Logging: Log authentication error

3. **Rate Limiting**
   - Fallback: Use cached weather data
   - User Feedback: Show "Using cached data" message
   - Retry Strategy: Exponential backoff (1min, 5min, 15min)

### Rendering Errors

1. **WebGL Not Supported**
   - Fallback: Hide weather system entirely
   - User Feedback: Show "3D features not supported" message

2. **Performance Issues**
   - Fallback: Reduce particle count by 50%
   - Detection: Monitor FPS, if < 30fps for 5 seconds, reduce particles

### State Errors

1. **Store Initialization Failure**
   - Fallback: Use local component state
   - User Feedback: Weather toggle still works, but state not persisted

## Testing Strategy

### Unit Tests

**Location**: `src/components/weather/__tests__/`

1. **Weather Store Tests**
   - Test toggle functionality
   - Test state updates
   - Test error handling
   - Mock API calls

2. **Weather API Service Tests**
   - Test API response parsing
   - Test condition mapping
   - Test daytime calculation
   - Mock fetch responses

3. **Component Tests**
   - Test WeatherToggle rendering
   - Test button click handlers
   - Test loading states
   - Test error states

### Integration Tests

1. **Weather System Integration**
   - Test full weather data flow (API → Store → UI)
   - Test particle system activation based on conditions
   - Test day/night transitions
   - Test toggle on/off behavior

### Visual Tests

1. **3D Rendering Tests**
   - Verify snow particles render correctly
   - Verify rain particles render correctly
   - Verify day/night lighting changes
   - Verify Sun component integration

### Performance Tests

1. **Particle Performance**
   - Measure FPS with 1000 snow particles
   - Measure FPS with 2000 rain particles
   - Test on low-end devices
   - Target: Maintain 60 FPS on mid-range devices

## Implementation Phases

### Phase 1: Foundation (Core Infrastructure)
- Install Three.js dependencies
- Create weather store
- Create weather API service
- Create basic WeatherToggle UI component

### Phase 2: 3D Scene Setup
- Create WeatherScene component with Canvas
- Integrate/modify Sun component
- Set up basic lighting
- Implement day/night transitions

### Phase 3: Particle Systems
- Implement snow particle system
- Implement rain particle system
- Optimize particle rendering
- Add particle animations

### Phase 4: Integration & Polish
- Connect all components in WeatherSystem container
- Implement error handling
- Add loading states
- Performance optimization
- Testing

## Performance Considerations

### Optimization Strategies

1. **Instanced Rendering**
   - Use `THREE.InstancedMesh` for particles
   - Reduces draw calls from N to 1

2. **Particle Pooling**
   - Reuse particle objects instead of creating/destroying
   - Update positions in place

3. **Frustum Culling**
   - Only render particles within camera view
   - Automatically handled by Three.js

4. **Adaptive Quality**
   - Reduce particle count on low-end devices
   - Detect device capabilities on mount

5. **Lazy Loading**
   - Load 3D components only when weather is enabled
   - Use React.lazy() for code splitting

### Performance Targets

- **Initial Load**: < 100ms additional load time
- **FPS**: Maintain 60 FPS with weather enabled
- **Memory**: < 50MB additional memory usage
- **Bundle Size**: < 200KB additional (gzipped)

## Security Considerations

1. **API Key Protection**
   - Store API key in environment variables
   - Never expose in client-side code
   - Use server-side API route for weather fetching

2. **API Route Implementation**
   - Create `/api/weather` endpoint
   - Validate requests
   - Rate limit requests (max 1 per minute per user)
   - Sanitize location input

3. **Data Validation**
   - Validate all API responses
   - Sanitize user inputs
   - Handle malformed data gracefully

## Accessibility

1. **Keyboard Navigation**
   - Weather toggle accessible via keyboard
   - Focus indicators on interactive elements

2. **Screen Readers**
   - ARIA labels on weather toggle
   - Announce weather condition changes
   - Describe visual effects for screen reader users

3. **Reduced Motion**
   - Respect `prefers-reduced-motion` setting
   - Disable particle animations if user prefers reduced motion
   - Keep day/night transitions but make them instant

4. **Color Contrast**
   - Ensure toggle button meets WCAG AA standards
   - Weather condition text readable in all states

## Future Enhancements

1. **Additional Weather Conditions**
   - Fog effects
   - Thunderstorms with lightning
   - Clouds

2. **User Customization**
   - Manual location selection
   - Custom particle colors
   - Adjustable particle density

3. **Advanced Effects**
   - Wind direction affecting particles
   - Puddle reflections for rain
   - Snow accumulation on surfaces

4. **Performance Modes**
   - Low/Medium/High quality presets
   - Auto-detect optimal settings
