# Implementation Plan

- [x] 1. Install dependencies and setup project structure
  - Install three, @react-three/fiber, @react-three/drei, and @types/three packages
  - Create directory structure: src/components/weather/ and src/lib/weather/
  - _Requirements: 7.1, 7.2_

- [x] 2. Create Weather API service and server endpoint
  - [x] 2.1 Create API route for secure weather data fetching
    - Implement /api/weather endpoint in src/app/api/weather/route.ts
    - Add API key validation and rate limiting
    - Handle location parameter (default to 'auto:ip')
    - _Requirements: 5.1, 5.5_
  
  - [x] 2.2 Create weather API client service
    - Implement fetchWeather function in src/lib/weather-api.ts
    - Create parseWeatherCondition function to map API codes to snow/rain/clear
    - Implement isDaytime function to determine day/night from localtime string
    - Add TypeScript interfaces for API responses and weather data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_
  
  - [ ] 2.3 Write unit tests for weather API service
    - Test weather condition parsing with various API codes
    - Test daytime calculation with different times
    - Mock API responses and test error handling
    - _Requirements: 5.1, 5.5, 6.5_

- [x] 3. Create weather state management store
  - [x] 3.1 Implement Zustand weather store
    - Create weather-store.ts with WeatherState interface
    - Implement toggleWeather action
    - Implement fetchWeatherData action with error handling
    - Add loading and error states
    - _Requirements: 1.2, 1.3, 1.4, 5.5, 6.4_
  
  - [ ] 3.2 Write unit tests for weather store
    - Test toggle functionality
    - Test state updates from API data
    - Test error handling scenarios
    - _Requirements: 1.2, 1.3_

- [x] 4. Create Weather Toggle UI component
  - [x] 4.1 Implement WeatherToggle component
    - Create button component with cloud icon
    - Connect to weather store for toggle state
    - Display current weather condition when enabled
    - Add loading spinner during API calls
    - Show error state with retry option
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ] 4.2 Add accessibility features to toggle
    - Add ARIA labels and keyboard navigation
    - Implement focus indicators
    - Add screen reader announcements for state changes
    - _Requirements: 1.1, 1.5_
  
  - [ ] 4.3 Write component tests for WeatherToggle
    - Test button click handlers
    - Test loading and error states rendering
    - Test accessibility attributes
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 5. Create and integrate Sun component
  - [x] 5.1 Create enhanced Sun component
    - Implement Sun component in src/components/weather/Sun.tsx based on provided code
    - Add intensity prop for day/night control (default 1.0)
    - Expose ref for external control
    - Maintain rotation animation from original code
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [x] 5.2 Implement day/night intensity transitions
    - Add smooth transition logic for intensity changes (2 second duration)
    - Set night mode intensity to 0.3
    - Set day mode intensity to 1.0
    - Update pointLight intensity based on prop
    - _Requirements: 4.3, 4.4, 4.5, 7.2_

- [x] 6. Implement particle system for snow and rain
  - [x] 6.1 Create base ParticleSystem component
    - Implement ParticleSystem.tsx with type prop ('snow' | 'rain' | null)
    - Set up THREE.InstancedMesh for efficient rendering
    - Create particle data structures (positions, velocities, sizes)
    - Implement particle reset logic when reaching ground
    - _Requirements: 2.5, 3.5_
  
  - [x] 6.2 Implement snow particle effects
    - Configure 1000 snow particles
    - Set particle size range (0.02 - 0.05 units)
    - Set white color with 0.8 opacity
    - Implement downward velocity (0.5 - 1.5 units/second)
    - Add random distribution across scene
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 6.3 Implement rain particle effects
    - Configure 2000 rain particles
    - Create elongated particle geometry (0.02 x 0.2)
    - Set blue color (#4A90E2) with 0.6 opacity
    - Implement faster downward velocity (2.0 - 4.0 units/second)
    - Add random distribution across scene
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 6.4 Optimize particle rendering performance
    - Implement frustum culling
    - Add particle pooling to reuse objects
    - Implement adaptive quality based on FPS monitoring
    - Add reduced motion support (disable animations if prefers-reduced-motion)
    - _Requirements: 2.1, 3.1_

- [x] 7. Create WeatherScene 3D canvas component
  - [x] 7.1 Implement WeatherScene component
    - Create Canvas from @react-three/fiber
    - Set up camera and basic scene lighting
    - Integrate Sun component
    - Add ambient and directional lights
    - _Requirements: 4.1, 4.2, 7.1_
  
  - [x] 7.2 Integrate particle system with weather conditions
    - Conditionally render ParticleSystem based on weather store condition
    - Pass 'snow' type when condition is 'snow'
    - Pass 'rain' type when condition is 'rain'
    - Pass null when condition is 'clear'
    - _Requirements: 5.3, 5.4, 2.1, 3.1_
  
  - [x] 7.3 Implement day/night lighting transitions
    - Connect Sun intensity to isDaytime state from store
    - Adjust ambient light intensity for day/night
    - Implement smooth 2-second transitions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.2, 6.3_

- [x] 8. Create main WeatherSystem container component
  - [x] 8.1 Implement WeatherSystem container
    - Create WeatherSystem.tsx that orchestrates all components
    - Initialize weather store on mount
    - Fetch weather data on mount with default location
    - Implement periodic refresh (every 30 minutes)
    - Render WeatherToggle and conditionally render WeatherScene
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 6.1, 6.4_
  
  - [x] 8.2 Add error handling and fallbacks
    - Handle API errors with fallback to clear weather
    - Display error toasts with retry option
    - Implement exponential backoff for rate limiting
    - Handle WebGL not supported scenario
    - _Requirements: 5.5, 6.5_
  
  - [x] 8.3 Implement weather system enable/disable logic
    - Show/hide WeatherScene based on isEnabled state
    - Restore original Sun properties when disabled
    - Persist toggle state during session
    - _Requirements: 1.2, 1.3, 1.4, 7.3_

- [x] 9. Add environment configuration
  - [x] 9.1 Add weather API key to environment variables
    - Add WEATHER_API_KEY to .env.local.example
    - Document API key setup in comments
    - Add validation for missing API key
    - _Requirements: 5.1_
  
  - [ ] 9.2 Configure Next.js for API route
    - Ensure API route is properly configured
    - Add rate limiting middleware if needed
    - _Requirements: 5.1_

- [x] 10. Integrate WeatherSystem into application
  - [x] 10.1 Add WeatherSystem to appropriate page
    - Import and render WeatherSystem component
    - Position toggle button in UI (top-right corner or settings area)
    - Pass API key from environment
    - Test integration with existing layout
    - _Requirements: 1.1, 7.1, 7.2, 7.3_
  
  - [ ] 10.2 Verify Sun component integration
    - Ensure Sun component works with weather system
    - Verify rotation animation continues during weather effects
    - Test day/night transitions don't break Sun behavior
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Performance testing and optimization
  - Monitor FPS with weather effects enabled
  - Test on different devices and browsers
  - Optimize particle count if needed
  - Verify bundle size impact
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [ ] 12. Accessibility testing
  - Test keyboard navigation
  - Verify screen reader announcements
  - Test with reduced motion preferences
  - Validate WCAG AA compliance
  - _Requirements: 1.1, 1.5_
