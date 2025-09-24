# RideShare PK

## Overview

RideShare PK is a modern carpooling web application designed for the Pakistani market. The platform connects drivers offering rides with passengers looking for affordable transportation. The application features a mobile-first design optimized for smartphone usage, dual-mode functionality (passenger and driver), comprehensive ride management, and user authentication with session management.

Key features include:
- **Dual Mode Interface**: Users can switch between finding rides (passenger mode) and offering rides (driver mode)
- **Ride Management**: Complete lifecycle from ride creation to booking and completion
- **Car Verification System**: Driver vehicle registration and verification process
- **Real-time Search**: Location-based ride search with date filtering
- **Mobile-Optimized**: Responsive design with mobile status bar simulation
- **User Authentication**: Secure login/registration with session management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for server state management, caching, and data synchronization
- **shadcn/ui** component library built on Radix UI primitives for accessible UI components
- **Tailwind CSS** for utility-first styling with custom design tokens

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints and middleware
- **RESTful API** design with clear separation between authentication, rides, cars, and bookings
- **Session-based authentication** using Passport.js with local strategy
- **Password hashing** using Node.js crypto module with scrypt algorithm
- **Middleware architecture** for authentication, logging, and error handling

### Database Design
- **PostgreSQL** as the primary database with Drizzle ORM for type-safe database operations
- **Neon Database** serverless PostgreSQL hosting for scalability
- **Schema-driven development** with shared TypeScript types between frontend and backend
- **Database migrations** managed through Drizzle Kit

**Core Tables:**
- `users`: User authentication and profile information
- `cars`: Vehicle registration with verification status tracking
- `rides`: Trip details including pickup/destination coordinates and pricing
- `bookings`: Ride reservations linking passengers to specific rides

### Authentication & Authorization
- **Passport.js Local Strategy** for username/email and password authentication
- **Express sessions** with PostgreSQL session store for persistence
- **Route protection** middleware for authenticated endpoints
- **Password security** using scrypt hashing with salt for secure credential storage

### State Management Pattern
- **Server state** managed by TanStack Query with automatic caching and background updates
- **Client state** handled by React hooks and context for UI state
- **Form state** managed by React Hook Form with Zod validation schemas
- **Authentication state** provided through React context with automatic session validation

### Development & Build Tools
- **TypeScript** for static type checking across the entire stack
- **Zod** for runtime validation and type inference
- **ESBuild** for server-side bundling in production
- **Path aliases** for clean imports (@/, @shared/, @assets/)
- **Hot Module Replacement** in development with Vite

### API Structure
The application follows RESTful conventions with these main endpoints:
- `/api/auth/*` - Authentication endpoints (login, register, logout)
- `/api/cars/*` - Vehicle management and verification
- `/api/rides/*` - Ride creation, search, and management
- `/api/bookings/*` - Ride booking and reservation management

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI

### Authentication & Security
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management with secure cookie handling
- **Node.js Crypto**: Built-in cryptographic functions for password hashing

### Development Tools
- **Vite**: Build tool with HMR and development server
- **TypeScript**: Static type checking and enhanced IDE support
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation and type inference
- **date-fns**: Date manipulation and formatting utilities

### Hosting & Deployment
- **Replit**: Development and hosting environment
- **Environment Variables**: Secure configuration management for database URLs and session secrets