# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is **Co-Pilot: Drowsiness Guard**, a driver drowsiness detection PWA built with React, TypeScript, and Vite. The app monitors drivers in real-time using camera-based ML to detect signs of drowsiness and alert them to prevent accidents.

## Common Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Testing
There are currently no test scripts configured in this project.

## Architecture

### Application Flow
1. **Index** (`/`) - Route handler that checks `localStorage` for onboarding completion
2. **Onboarding** (`/onboarding`) - First-time user experience
3. **Camera Setup** (`/camera-setup`) - Camera permission and calibration
4. **Home** (`/home`) - Main dashboard after onboarding
5. **Drive Mode** (`/drive`) - Active monitoring with real-time ML analysis
6. **Alert Screen** (`/alert`) - Triggered when drowsiness is detected
7. **Trip History** (`/history`) - Historical trip data and alerts
8. **Trip Details** (`/trip/:id`) - Individual trip analysis
9. **Settings** (`/settings`) - User preferences and configuration

### Key Design Patterns

**Route-Based State Management**: The app uses URL navigation to manage major state transitions (e.g., navigating to `/alert` when drowsiness is detected). This is the primary flow control mechanism.

**Mock Data System**: Currently uses `src/data/mockData.ts` for all data. In production, this would be replaced with real ML model outputs and backend API calls. When implementing real features, start by understanding the mock data structure.

**Camera Management**: The `useCamera` hook (`src/hooks/useCamera.ts`) centralizes camera access logic. It handles:
- Permission requests
- Stream management
- Error handling for common camera issues
- Automatic cleanup on unmount

**Progressive Web App**: Configured via `vite-plugin-pwa` with:
- Offline support
- Install prompts (`/install` page)
- Service worker for caching
- Mobile-first design with safe area handling

### Type System

All core types are in `src/types/index.ts`:
- `MLOutput` - Real-time ML model outputs (blink rate, eye closure, yawn/nod detection)
- `Alert` - Individual drowsiness detection events
- `Trip` - Driving session with associated alerts and metrics
- `UserSettings` - User preferences for alerts and emergency contacts
- `CameraStatus` - Camera calibration and quality metrics

When adding features, extend these types rather than creating new parallel structures.

### Component Organization

**UI Components** (`src/components/ui/`): shadcn/ui components - do not modify these directly. Regenerate via `npx shadcn@latest add [component]`.

**Custom Components** (`src/components/`):
- `AlertnessGauge` - Visual alertness indicator in drive mode
- `CameraPreview` - Real-time camera feed display
- `DriveControls` - Bottom control panel during active monitoring
- `Header` - Top navigation bar
- `StatusCard` - Alertness status display on home screen
- `TripCard` - Trip history list items

### Styling Architecture

**CSS Variables**: All colors and theme tokens are defined in `src/index.css` using HSL CSS variables. This includes:
- Standard light/dark mode tokens
- Special `drive-*` tokens for the dark drive mode interface
- `alert-*` tokens for severity-based coloring
- Safe area inset utilities (`.safe-top`, `.safe-bottom`) for mobile notch handling

**Tailwind Config**: Extended in `tailwind.config.ts` with custom colors matching the CSS variables. When adding new colors, define them in both files.

**Font**: Uses Outfit font family via `@fontsource/outfit`.

### State Persistence

Currently uses `localStorage` for:
- Onboarding completion status (`onboarding_complete`)
- (Likely) user settings (not yet fully implemented)

No external state management library is used - state is managed via React hooks and URL navigation.

## Development Guidelines

### Adding New Routes
1. Create page component in `src/pages/`
2. Add route to `src/App.tsx` in the `<Routes>` block
3. Follow the existing navigation pattern using `react-router-dom`

### Working with Camera/ML
- Always use the `useCamera` hook for camera access
- ML simulation logic is in `DriveMode.tsx` (currently triggers alert after 10s)
- Real ML integration should replace `mockMLOutput` with actual model inference
- Camera preview requires proper error handling - see existing patterns in `useCamera.ts`

### Mobile-First Considerations
- Use `safe-top` and `safe-bottom` utility classes for notch/home indicator areas
- Follow the `.touch-target` utility (48px minimum) for interactive elements
- Test in mobile viewport (app is portrait-oriented PWA)

### Adding Dependencies
Use npm for package management. The project uses:
- **React Router** for navigation
- **TanStack Query** for data fetching (not yet fully utilized)
- **Radix UI** (via shadcn) for accessible components
- **date-fns** for date formatting
- **Zod** for validation (via react-hook-form)

## PWA Configuration

The app is configured as a standalone PWA in `vite.config.ts`:
- Manifest name: "Co-Pilot: Drowsiness Guard"
- Theme color: `#0f172a` (dark blue)
- Portrait orientation
- Icons: `/pwa-192x192.png`, `/pwa-512x512.png`
- Service worker auto-updates via Workbox

## Important Notes

- **No TypeScript unused vars linting**: Disabled in ESLint config
- **Path alias**: `@/` maps to `src/`
- **Lovable integration**: Project was created with Lovable (see README.md) - changes pushed here sync to Lovable platform
- **No test suite**: Testing infrastructure needs to be added if required
- **Mock data**: All data is currently simulated - no backend or real ML model connected yet
