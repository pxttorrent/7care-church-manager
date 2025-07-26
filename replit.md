# 7Care Plus - Church Management System

## Overview

7Care Plus is a full-stack church management system built with React/TypeScript frontend and Express backend. The application provides comprehensive tools for managing church members, interested individuals, meetings, communications, and various church activities through role-based access control.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

- **Frontend**: React 18 with TypeScript, Vite build tool, mobile-first responsive design
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: React Router for client-side navigation

## Key Components

### Frontend Architecture
- **Mobile-First Design**: The app is designed primarily for mobile devices with responsive layouts
- **Component Library**: Uses shadcn/ui components built on Radix UI primitives
- **Layout System**: Separate mobile and desktop layouts with bottom navigation for mobile
- **Authentication Flow**: Role-based authentication with different user types (admin, missionary, member, interested)

### Backend Architecture
- **RESTful API**: Express server with route organization for API endpoints
- **Storage Layer**: Abstracted storage interface with memory storage implementation (designed to be swapped for database)
- **Middleware**: Request logging, JSON parsing, error handling
- **Development Setup**: Vite integration for development with HMR support

### Database Schema
The application uses a simple user management schema:
- **Users Table**: Stores user information including username, password, role, and approval status
- **Drizzle ORM**: Provides type-safe database operations with PostgreSQL dialect
- **Schema Validation**: Uses Zod for runtime validation of database inputs

### Authentication System
- **Role-Based Access**: Four user roles with different permissions
  - Admin: Full system access
  - Missionary: Can manage assigned contacts and communications
  - Member: Limited access to meetings and communications
  - Interested: Basic access for potential new members
- **Session Management**: Mock authentication system (to be replaced with proper JWT/session handling)
- **Approval System**: New users require admin approval except for "interested" role

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **Route Handling**: Express routes process requests and interact with storage layer
3. **Storage Operations**: Abstract storage interface handles CRUD operations
4. **Response Handling**: Data flows back through the same path with proper error handling
5. **State Updates**: TanStack Query manages cache invalidation and UI updates

## External Dependencies

### UI & Functionality
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Type-safe CSS class variants

### Development
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Database & ORM
- **Drizzle ORM**: Type-safe database toolkit
- **Neon Database**: Serverless PostgreSQL (via @neondatabase/serverless)
- **Drizzle-Zod**: Integration between Drizzle and Zod for validation

## Deployment Strategy

The application is configured for modern deployment with:

- **Build Process**: Vite builds the client, ESBuild bundles the server
- **Environment Variables**: Database URL configuration through environment variables
- **Production Ready**: Separate development and production configurations
- **Static Assets**: Client build outputs to dist/public for serving
- **Replit Integration**: Special configuration for Replit deployment with development tools

### Key Configuration Files
- `vite.config.ts`: Frontend build configuration with aliases and plugins
- `drizzle.config.ts`: Database configuration and migration settings
- `tsconfig.json`: TypeScript configuration with path aliases
- `tailwind.config.ts`: Styling configuration with design system variables

The architecture is designed to be scalable and maintainable, with clear separation of concerns and modern development practices throughout.