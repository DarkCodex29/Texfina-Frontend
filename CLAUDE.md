# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` or `ng serve` - Start development server on http://localhost:4200
- `npm run build` or `ng build` - Build the project for production
- `npm test` or `ng test` - Run unit tests with Karma
- `npm run lint` or `ng lint` - Run ESLint for code quality
- `npm run watch` or `ng build --watch --configuration development` - Build with watch mode

### Build Configurations
- Production build: `ng build --configuration production`
- Development build: `ng build --configuration development`

## Architecture Overview

### Technology Stack
- **Framework**: Angular 20 (standalone components)
- **UI Library**: Angular Material
- **Styling**: SCSS with organized structure
- **Build Tool**: Angular CLI with @angular/build
- **Testing**: Jasmine with Karma
- **Linting**: ESLint with Angular-specific rules

### Project Structure
```
src/
├── app/
│   ├── core/                 # Core services and guards
│   │   ├── auth/            # Authentication service and guards
│   │   └── interceptors/    # HTTP interceptors (token)
│   ├── layout/              # Layout components
│   │   ├── main-layout/     # Main application layout
│   │   ├── sidebar/         # Navigation sidebar
│   │   └── toolbar/         # Application toolbar
│   ├── shared/              # Shared components and utilities
│   │   ├── components/      # Reusable components
│   │   ├── configs/         # Table configurations
│   │   └── dialogs/         # Modal dialogs
│   ├── services/            # Business logic services
│   ├── models/              # TypeScript interfaces
│   └── [feature-modules]/   # Feature-specific components
└── styles/                  # Global SCSS organization
```

### Key Architectural Patterns

#### Standalone Components
- All components use Angular's standalone API
- No NgModules - components import dependencies directly
- Lazy loading implemented with `loadComponent()`

#### Authentication Flow
- JWT token-based authentication via `AuthService`
- `authGuard` protects routes requiring authentication
- `tokenInterceptor` adds authorization headers automatically
- Role-based access control with user roles: ADMIN, SUPERVISOR, OPERARIO, CONSULTOR

#### State Management
- Service-based state management using BehaviorSubject
- `AuthService` manages authentication state
- `TexfinaApiService` handles all API communication with backend

#### Backend Integration
- Backend API: ASP.NET Core at `http://localhost:5116/api`
- Comprehensive API service with typed interfaces
- Full CRUD operations for inventory management
- Real-time stock tracking and alerts system

### Component Organization

#### Layout System
- `MainLayoutComponent`: Responsive layout with Material Design
- `SidebarComponent`: Navigation with role-based menu items
- `ToolbarComponent`: Top navigation with user actions
- Responsive design using Angular CDK Layout

#### Feature Components
- Each business domain has its own component directory
- Consistent naming: `feature-name/feature-name.component.ts`
- Dialog components for CRUD operations
- Table-based data display with filtering and pagination

#### Shared Components
- `FormularioDialogComponent`: Generic form dialog
- `DetalleDialogComponent`: Generic detail view dialog
- `ConfirmacionDialogComponent`: Confirmation dialogs
- `NotificationComponent`: User notifications

### Styling Architecture

#### SCSS Organization
```
styles/
├── base/              # Base styles and variables
├── components/        # Component-specific styles
├── layouts/           # Layout-specific styles
├── pages/             # Page-specific styles
├── utilities/         # Utility classes
└── vendors/           # Third-party overrides
```

#### Material Design Integration
- Angular Material components extensively used
- Custom theming in `styles.scss`
- Responsive breakpoints with CDK Layout
- Consistent design system across components

### Data Models
- TypeScript interfaces for type safety
- Models aligned with backend API DTOs
- Separation of concerns between UI and API models

### Development Workflow
1. Authentication is simulated in development (see `AuthService`)
2. Real API integration available via `TexfinaApiService`
3. All routes protected by authentication guard
4. Role-based feature access throughout application

### Testing Strategy
- Unit tests configured with Jasmine/Karma
- Component testing with Angular Testing Utilities
- ESLint rules enforce code quality and Angular best practices

## Backend API Integration

The application integrates with a comprehensive .NET Core API for inventory management. Key endpoints include:

- **Authentication**: `/api/auth/login`
- **Dashboard**: `/api/dashboard/resumen`, `/api/dashboard/alertas`
- **Inventory**: `/api/insumos`, `/api/stocks`, `/api/lotes`
- **Warehouse**: `/api/almacenes`, `/api/proveedores`
- **Reports**: `/api/reportes/*`

See `README_CONTROLADORES.md` for complete API documentation.

## Key Development Notes

### Component Conventions
- Use standalone components with explicit imports
- Follow Angular Material design patterns
- Implement responsive design with CDK Layout
- Use reactive forms for user input

### Service Patterns
- Injectable services with `providedIn: 'root'`
- HTTP client with interceptors for authentication
- Error handling with RxJS operators
- Type-safe API communications

### Security Considerations
- JWT token management in localStorage
- HTTP interceptor for automatic token inclusion
- Route guards for authentication and authorization
- Input validation and sanitization

### Performance Optimizations
- Lazy loading for all feature routes
- OnPush change detection where applicable
- Efficient data fetching with pagination
- Optimized build configurations for production