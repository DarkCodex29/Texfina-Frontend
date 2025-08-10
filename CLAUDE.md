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
- **UI Libraries**: Angular Material + PrimeNG (for data tables and UI components)
- **Icons**: PrimeIcons + Material Icons
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
- `PrimeDataTableComponent`: Reusable data table with sorting, filtering, pagination
- `FormularioDialogComponent`: Generic form dialog for CRUD operations
- `DetalleDialogComponent`: Generic detail view dialog (also used for comparisons)
- `ConfirmacionDialogComponent`: Confirmation dialogs
- `NotificationComponent`: User notifications with badge support
- `NotificationItemComponent`: Individual notification items in dropdown

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

#### Design System Integration
- Angular Material components for forms and dialogs
- PrimeNG components for data tables and advanced UI
- Custom theming in `styles.scss`
- Transparent Material Dialog containers for cleaner appearance
- Responsive breakpoints with CDK Layout
- Consistent design system across components
- Custom action button styles (icon-only, no borders)

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

## UI/UX Standards

### Visual Design Guidelines
- **Logo**: Use PNG format (`assets/logo.png`) throughout the application
- **Icons**: PrimeIcons for actions, Material Icons for UI elements
- **Colors**: 
  - Primary: Texfina brand colors
  - Actions: View (blue #3b82f6), Edit (gray #374151), Delete (red #ef4444)
- **Modals**: Transparent container backgrounds for cleaner appearance
- **Buttons**: Icon-only action buttons without borders in tables

### Component Standards

#### Login Page
- Modern, subtle design with gradient backgrounds
- Compact form with reduced spacing
- PNG logo display
- Password visibility toggle with proper icon display

#### Sidebar Navigation
- Logo display instead of text
- Icon-based menu items with labels
- Role-based menu visibility
- Gradient hover effects

#### Data Tables (PrimeDataTable)
- Consistent column configurations in config files
- Action buttons: View, Edit, Delete with standardized colors
- Export functionality in header
- Add/Bulk Upload buttons in table header
- Natural loading states without artificial delays

#### Notifications
- Dropdown with badge counter
- Color-coded by priority (High: red, Medium: orange, Low: blue)
- White check icon for marking as resolved
- Notification items with icon indicators

### Modal Dialogs
- **FormularioDialog**: For create/edit operations
- **DetalleDialog**: For viewing details and comparisons
- **ConfirmacionDialog**: For delete confirmations
- Transparent backgrounds to eliminate white borders
- Consistent header with gradient background
- Maximum width of 800px for standard modals

## Development Best Practices

### Code Organization
1. Use standalone components with explicit imports
2. Place table configurations in `src/app/shared/configs/`
3. Follow established naming conventions
4. Implement proper TypeScript typing

### State Management
- Service-based state with BehaviorSubjects
- Proper error handling with RxJS operators
- Loading states managed at component level

### Performance
- Lazy loading for all feature routes
- OnPush change detection where applicable
- Efficient API calls with proper caching
- Optimized bundle sizes for production

### Security
- JWT token management
- Route guards for authentication
- Input validation and sanitization
- No hardcoded credentials or sensitive data