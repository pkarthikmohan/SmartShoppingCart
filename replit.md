# Smart Cart Application

## Overview

This is a comprehensive smart shopping cart application built for Indian retail markets. The system combines real-time Li-Fi positioning, barcode scanning, and weighing scale integration to create an intelligent shopping experience. The application supports both English and Hindi languages and is designed specifically for Indian consumer preferences.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom Indian market theme colors
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket server for live updates
- **API Design**: RESTful endpoints with real-time WebSocket overlay

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Storage**: Fallback storage implementation for development

## Key Components

### 1. Li-Fi Positioning System
- Real-time indoor positioning using Li-Fi technology
- Store section tracking and navigation
- Automatic position updates via WebSocket
- Navigation instructions between store sections

### 2. Product Management
- Comprehensive product catalog with bilingual support (English/Hindi)
- Barcode scanning integration
- Weight-based product handling
- Category-based organization
- Stock quantity tracking
- Nutritional information storage

### 3. Smart Cart Functionality
- Real-time cart synchronization across devices
- Automatic weight calculation for weighable items
- Session-based cart management
- Price calculation with tax and discount support

### 4. Promotions Engine
- Location-based promotion alerts
- Multiple discount types (percentage, fixed, BOGO)
- Category and product-specific promotions
- Time-based promotion validity

### 5. Checkout System
- Multiple payment method support (UPI, Card, Wallet, Cash)
- Real-time total calculation
- Indian payment gateway integration ready

## Data Flow

1. **Session Initialization**: User session created with unique identifier
2. **Li-Fi Tracking**: Continuous position updates sent via WebSocket
3. **Product Interaction**: Barcode scanning and weight measurement
4. **Cart Management**: Real-time cart updates synchronized across all connections
5. **Promotion Processing**: Location and cart-based promotion calculations
6. **Checkout Flow**: Payment processing and order completion

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **ws**: WebSocket implementation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Frontend build tool

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16
- **Development Server**: Vite dev server with HMR
- **Port Configuration**: Frontend (5000), Backend API integration

### Production Build
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied automatically
4. **Deployment**: Replit autoscale deployment target

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Session Management**: In-memory for development, database for production

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```