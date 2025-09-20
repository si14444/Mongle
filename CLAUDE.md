# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mongle is a React Native dream recording and interpretation app built with Expo. The app allows users to record their dreams, categorize them by emotion, and generate AI-powered interpretations. It uses a tab-based navigation with four main screens: Home (statistics), Record (dream entry), Interpret (AI analysis), and Timeline (dream history).

## Development Commands

### Core Development
- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start web version
- `npx expo start` - Alternative way to start development server

### Code Quality
- `npm run lint` - Run ESLint for code linting
- `npx tsc --noEmit` - Run TypeScript type checking (no test framework configured)

### Project Reset
- `npm run reset-project` - Move starter code to app-example and create blank app directory

## Architecture Overview

### Navigation Structure
- **File-based routing** using Expo Router
- Root layout (`app/_layout.tsx`) wraps everything with QueryProvider and ThemeProvider
- Tab layout (`app/(tabs)/_layout.tsx`) defines 4 main tabs
- Dynamic route for dream details (`app/dream/[id].tsx`)

### State Management
- **React Query** (@tanstack/react-query) for server state and caching
- **AsyncStorage** for local data persistence (no external database)
- Dreams and interpretations stored as JSON in device storage

### Data Layer
- `DreamService` class handles all data operations (CRUD)
- Custom hooks (`useDreams`, `useSaveDream`, etc.) wrap React Query operations
- Dreams stored with automatic ID generation and timestamps

### UI Component Architecture
- **Reusable component system** recently refactored for consistency
- Core reusable components:
  - `SearchBar` - Unified search functionality across tabs
  - `SectionHeader` - Section headers with icons and action buttons
  - `EmptyState` - Consistent empty state handling
  - `GradientButton` - Buttons with gradient styling and variants
  - `DreamCard` - Dream display component with emotion indicators
  - `CustomModal`/`ConfirmModal` - Replacement for native Alert dialogs

### Theming System
- Light/dark mode support using React Navigation themes
- Custom color palette defined in `constants/theme.ts`
- Consistent gradient backgrounds and shadow effects
- Themed components (`ThemedText`, `ThemedView`) for automatic color adaptation

### Key Features
- **Dream Recording**: Title, content, date, emotion categorization
- **AI Interpretation**: Mock interpretation system with symbols, themes, and mood analysis
- **Search & Filtering**: Search by title/content, filter by emotion
- **Statistics**: Dream count tracking and emotion analysis
- **Timeline View**: Monthly grouping with dream cards

## Code Patterns

### Path Aliasing
- `@/` maps to project root
- Use absolute imports: `@/components/ui/button` instead of relative paths

### Data Flow
1. UI components call custom hooks (`useDreams`, `useSaveDream`)
2. Hooks use React Query for caching and state management
3. Hooks call `DreamService` static methods
4. `DreamService` reads/writes to AsyncStorage

### Styling Conventions
- `CommonStyles` for shared style patterns (flex, padding, shadows)
- StyleSheet.create for component-specific styles
- Gradient backgrounds and shadows for visual depth
- Consistent spacing (8px, 12px, 16px, 20px, 24px increments)

### Component Development
- Use TypeScript interfaces for all props
- Implement proper theme color integration
- Follow established patterns for modals, buttons, and cards
- Prefer reusable components over duplicated code

## Important Notes

### Data Storage
- All data stored locally in AsyncStorage (no backend)
- Dreams and interpretations use separate storage keys
- Data persists across app launches

### React Query Configuration
- 5-minute stale time for most queries
- Dreams query uses staleTime: 0 for always-fresh data
- Proper cache invalidation after mutations

### Navigation
- Uses Expo Router with typed routes experiment enabled
- Tab navigation with haptic feedback
- Stack navigation for dream detail views

### Performance Considerations
- New Architecture enabled for React Native
- React Compiler experiment enabled
- Edge-to-edge UI on Android
- Optimized shadows and gradients for smooth performance