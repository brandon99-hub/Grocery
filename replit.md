# GrocerSwift - Grocery Delivery Platform

## Overview

GrocerSwift is a full-stack grocery delivery web application that combines a modern React frontend with a robust Node.js/Express backend. The platform enables users to browse products, manage shopping carts, place orders, and track deliveries. It includes an admin dashboard for inventory and order management, integrated with Stripe for payments and PostgreSQL for data persistence.

## System Architecture

The application follows a client-server architecture with clear separation of concerns:

**Frontend Architecture:**
- React with TypeScript for component-based UI development
- Vite as the build tool and development server
- Tailwind CSS for styling with shadcn/ui component library
- React Query (TanStack Query) for server state management
- React Router (wouter) for client-side routing
- Context API for global state management (cart functionality)

**Backend Architecture:**
- Node.js with Express.js as the web server framework
- TypeScript for type safety across the entire application
- RESTful API design with proper HTTP status codes and error handling
- Middleware-based request processing with authentication and logging

**Database Layer:**
- PostgreSQL as the primary database
- Drizzle ORM for type-safe database operations
- Neon Database for cloud-hosted PostgreSQL

## Key Components

**Authentication System:**
- Replit Auth integration for user authentication
- Session-based authentication with PostgreSQL session storage
- Role-based access control (admin vs regular users)
- Protected routes and API endpoints

**Product Management:**
- Category-based product organization
- Full CRUD operations for products (admin only)
- Image upload and management
- Inventory tracking with stock levels
- Search and filtering capabilities

**Shopping Cart:**
- Real-time cart updates with React Query
- Persistent cart storage in database
- Add/remove/update quantity operations
- Cart slide-over component for quick access

**Order Processing:**
- Complete order lifecycle management
- Order status tracking (pending, processing, out-for-delivery, delivered)
- Order history and detailed order views
- Integration with payment processing

**Payment Integration:**
- MPesa payment processing for Kenyan market
- STK Push simulation for mobile money payments
- Order confirmation and payment verification
- Phone number validation for Kenyan numbers
- Real-time payment status tracking

**Admin Dashboard:**
- Product and category management
- Order management and status updates
- Sales analytics and reporting
- User management capabilities

## Data Flow

1. **User Authentication:** Users authenticate through Replit Auth, creating sessions stored in PostgreSQL
2. **Product Browsing:** Frontend fetches product data through REST APIs, with caching via React Query
3. **Cart Management:** Cart operations update both local state and database, maintaining consistency
4. **Order Placement:** Orders are created with payment intents, processed through Stripe, and stored in database
5. **Order Tracking:** Real-time order status updates flow from admin dashboard to user interface
6. **Admin Operations:** Admin users can perform CRUD operations on products, categories, and orders

## External Dependencies

**Frontend Dependencies:**
- @radix-ui components for accessible UI primitives
- @tanstack/react-query for server state management
- @stripe/react-stripe-js and @stripe/stripe-js for payment processing
- Tailwind CSS and shadcn/ui for styling
- Lucide React for icons
- wouter for routing

**Backend Dependencies:**
- @neondatabase/serverless for PostgreSQL connection
- drizzle-orm and drizzle-kit for database management
- express for web server
- passport and session management for authentication
- stripe for payment processing
- Various middleware for security and functionality

**Development Dependencies:**
- Vite for development and build tooling
- TypeScript for type checking
- PostCSS and Autoprefixer for CSS processing

## Deployment Strategy

**Development Setup:**
- Vite development server with hot module replacement
- Express server running in development mode with tsx
- Environment variables for database and API keys
- Replit-specific plugins for development experience

**Production Build:**
- Frontend: Vite builds optimized static assets
- Backend: esbuild bundles server code for Node.js
- Database migrations handled through Drizzle Kit
- Environment-specific configuration management

**Database Management:**
- Drizzle migrations for schema changes
- Shared schema definitions between frontend and backend
- Connection pooling for production performance

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Replaced Stripe payment integration with MPesa payment system
  - Removed Stripe dependencies from frontend and backend
  - Implemented MPesa STK Push simulation with phone number validation
  - Added currency conversion display (USD to KSh)
  - Updated checkout flow for mobile money payments
  - Added real-time payment status tracking with 30-second processing simulation