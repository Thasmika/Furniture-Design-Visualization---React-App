# Furniture Design Visualizer - Project Setup

## Overview
This project is a React + TypeScript application built with Vite for creating and visualizing furniture layouts in virtual rooms.

## Technology Stack

### Core Framework
- **React 19.2** - UI framework
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 8.0** - Build tool and dev server

### State Management
- **Redux Toolkit 2.11** - Centralized state management
- **React Redux 9.2** - React bindings for Redux

### Visualization
- **react-konva 19.2** - 2D canvas rendering
- **Konva 10.2** - HTML5 Canvas library
- **react-three-fiber 9.5** - 3D WebGL rendering
- **@react-three/drei 10.7** - Three.js helpers
- **Three.js 0.182** - 3D graphics library

### Backend Services
- **Firebase 12.9** - Authentication and cloud storage

### Testing
- **Vitest 4.0** - Unit testing framework
- **@testing-library/react 16.3** - React component testing
- **@testing-library/jest-dom 6.9** - DOM matchers
- **@testing-library/user-event 14.6** - User interaction simulation
- **fast-check 4.5** - Property-based testing
- **jsdom 28.0** - DOM implementation for Node.js

## Project Structure

```
src/
├── models/         # Core data models (Room, Furniture, Design)
├── components/     # React UI components
├── store/          # Redux store configuration and slices
├── services/       # External services (Firebase, etc.)
├── utils/          # Utility functions
└── test/           # Test setup and utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI

## TypeScript Configuration

The project uses TypeScript in strict mode with the following key settings:
- Strict type checking enabled
- No unused locals or parameters
- No fallthrough cases in switch statements
- Module resolution: bundler mode
- JSX: react-jsx

## Testing Setup

Tests are configured with:
- Vitest as the test runner
- jsdom for DOM simulation
- React Testing Library for component testing
- Global test utilities and matchers
- Automatic cleanup after each test

## Next Steps

Refer to `.kiro/specs/furniture-design-visualizer/tasks.md` for the implementation plan.
