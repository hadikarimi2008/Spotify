## ⚠️ License & Copyright

**Copyright (c) 2026 Hadi. All rights reserved.**

> [!IMPORTANT]
> This project is **NOT** open-source. All rights belong to **Hadi**. 
> Unauthorized use, reproduction, or distribution of this code is strictly prohibited.
> Published on: Saturday, February 21, 2026

**Report Link**: [View Full Analysis](https://pagespeed.web.dev/analysis/https-spotify-three-bay-vercel-app/kytf7b5g09?form_factor=desktop)  
#Mobile Analysis  
<img width="1536" height="1024" alt="Copilot_20260222_015511" src="https://github.com/user-attachments/assets/a2a727ce-3cb8-4ca8-8dc7-c9a0b2e5d627" />  
#Desktop Analysis  
<img width="1536" height="1024" alt="Copilot_20260222_015844" src="https://github.com/user-attachments/assets/6d5fc0c9-cb03-4372-8989-df9085f063a6" />






<img width="3840" height="2160" alt="Spotify-Logo" src="https://github.com/user-attachments/assets/759d3454-4d43-4743-8fbb-b3fa3b0f80b6" />




# Spotify Clone - Music Streaming Platform

A full-featured music streaming web application built with Next.js, featuring a modern UI inspired by Spotify, complete user authentication, music playback, admin dashboard, and comprehensive analytics.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Key Functionalities](#key-functionalities)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Contributing](#contributing)
- [Credits](#credits)

## Overview

This project is a comprehensive music streaming platform that replicates core Spotify functionality with additional features. The application provides users with the ability to stream music, create playlists, manage their library, view detailed analytics, and discover new content. Administrators have full control over content management through a dedicated dashboard.

The project architecture follows modern web development best practices, utilizing Next.js App Router for server-side rendering, React Server Actions for data mutations, and Prisma ORM for type-safe database interactions. The UI is fully responsive and optimized for both desktop and mobile devices.

## Technology Stack

### Core Framework
- **Next.js 16.1.6** - React framework with App Router, Server Components, and Server Actions
- **React 19.2.3** - UI library with latest features and React Compiler optimization
- **TypeScript 5.9.3** - Type-safe development

### Database & ORM
- **PostgreSQL** - Relational database for data persistence
- **Prisma 7.4.0** - Next-generation ORM with type-safe database access
- **@prisma/client** - Prisma Client for database queries

### Authentication & Security
- **NextAuth.js 4.24.13** - Complete authentication solution
- **bcrypt 6.0.0** - Password hashing and security

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React 0.563.0** - Modern icon library
- **Montserrat Font** - Google Fonts integration

### Additional Libraries
- **lottie-react 2.4.1** - Animation support
- **@supabase/supabase-js 2.95.3** - Supabase client (optional integration)

### Development Tools
- **ESLint** - Code linting
- **React Compiler** - Automatic React optimization
- **SWC Minify** - Fast JavaScript minification

## Features

### User Features

#### Music Playback
- Full-featured audio player with play/pause, skip, shuffle, and repeat controls
- Volume control with smooth transitions
- Fullscreen player mode with enhanced UI
- Progress bar with seek functionality
- Real-time playback state synchronization

#### Library Management
- Personal library with favorite songs
- Recently played songs tracking
- Listening history with detailed analytics
- Download management for offline access

#### Discovery & Search
- Advanced search functionality across songs, artists, and albums
- Real-time search results with debouncing
- Popular artists and trending content
- New album recommendations
- Personalized recommendations based on listening habits

#### User Dashboard
- Comprehensive statistics and analytics
- Listening time tracking
- Top artists and albums visualization
- Privacy settings management
- Profile customization with image upload
- Password change functionality
- Year in Review feature with annual statistics

#### Social Features
- Share functionality for songs, artists, albums, and playlists
- Dedicated share pages with optimized metadata
- Social media integration

### Admin Features

#### Content Management
- Complete CRUD operations for songs, artists, and albums
- File upload system for audio files and images
- Bulk content management
- Content editing with preview functionality
- Image optimization and processing

#### Analytics & Monitoring
- User activity monitoring
- Content performance metrics
- System statistics

### Technical Features

#### SEO Optimization
- Comprehensive meta tags (Open Graph, Twitter Cards)
- Dynamic sitemap generation
- Robots.txt configuration
- JSON-LD structured data
- Canonical URLs
- Theme color and favicon support

#### Performance
- Image optimization with AVIF and WebP formats
- Server-side rendering for improved SEO
- Code splitting and lazy loading
- React Compiler for automatic optimization
- SWC minification for smaller bundle sizes
- Compression enabled

#### Internationalization
- Multi-language support (English/Persian)
- RTL (Right-to-Left) layout support
- Language switching with localStorage persistence
- Dynamic HTML dir and lang attributes

#### Responsive Design
- Mobile-first approach
- Custom mobile navigation bar
- Adaptive layouts for tablet and desktop
- Touch-optimized controls
- Custom Spotify-themed scrollbars

#### Real-time Updates
- Custom event system for instant UI updates
- No page refresh required for library updates
- Live favorite status synchronization

## Project Structure

```
spotify/
├── app/                          # Next.js App Router
│   ├── actions.js               # Server actions for public routes
│   ├── admin/                   # Admin dashboard
│   │   └── dashboard/
│   │       ├── actions.js      # Admin server actions
│   │       └── page.jsx         # Admin dashboard UI
│   ├── api/                     # API routes
│   │   └── auth/
│   │       └── [...nextauth]/   # NextAuth configuration
│   ├── artist/[id]/            # Dynamic artist pages
│   │   ├── client.jsx          # Client component for artist page
│   │   └── page.jsx            # Server component
│   ├── dashboard/              # User dashboard
│   │   ├── actions.js         # User dashboard actions
│   │   └── page.jsx           # Dashboard UI
│   ├── search/                # Search page
│   ├── share/[type]/[id]/     # Share pages
│   ├── layout.jsx            # Root layout with metadata
│   ├── page.jsx              # Home page
│   ├── sitemap.js            # Dynamic sitemap generation
│   └── robots.js             # Robots.txt generation
├── components/                 # React components
│   ├── fullscreenPlayer/     # Fullscreen music player
│   ├── header/               # Site header with search
│   ├── heroSection/          # Main content section
│   ├── mobileNavbar/         # Mobile navigation
│   ├── spotifyPlayer/        # Main music player
│   └── yourLibrary/         # User library sidebar
├── lib/                      # Utility libraries
│   ├── prisma.js            # Prisma client instance
│   ├── auth.js             # Authentication utilities
│   └── share.js              # Sharing utilities
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma        # Prisma schema definition
│   └── migrations/          # Database migration files
├── public/                   # Static assets
│   ├── logo/                # Application logos
│   └── songs/               # Audio files and images
├── contexts/                 # React contexts
├── hooks/                    # Custom React hooks
├── locales/                  # Translation files
├── next.config.mjs           # Next.js configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- npm or yarn package manager

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd spotify
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Database Setup

Create a PostgreSQL database and update the connection string in your environment variables.

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with initial data
```

### Step 4: Environment Configuration

Create a `.env` file in the root directory and configure the required environment variables (see [Environment Variables](#environment-variables) section).

### Step 5: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Step 6: Create Admin User

Use the provided script to create an admin user:

```bash
node scripts/set-admin.js
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/spotify?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# SEO Verification (Optional)
GOOGLE_VERIFICATION=""
YANDEX_VERIFICATION=""
YAHOO_VERIFICATION=""
```

## Database Schema

The application uses Prisma ORM with the following main models:

- **User** - User accounts with authentication and privacy settings
- **Artist** - Music artists with profiles and verification
- **Album** - Music albums with release information
- **Song** - Individual tracks with metadata
- **Playlist** - User-created playlists
- **FavoriteSong** - User favorite songs
- **RecentlyPlayed** - Recent playback tracking
- **ListeningHistory** - Detailed listening analytics
- **UserDownload** - Download tracking
- **UserSong** - User's personal song library

All models include proper relationships, indexes for performance, and cascade delete rules for data integrity.

## Key Functionalities

### Authentication System

- Secure user registration and login
- Password hashing with bcrypt
- Session management with NextAuth.js
- Protected routes and API endpoints
- Admin role-based access control

### Music Player

- HTML5 audio player with custom controls
- Playlist management and queue system
- Shuffle and repeat modes
- Volume control with persistence
- Fullscreen mode with enhanced UI
- Real-time progress tracking

### Content Management

- Server Actions for data mutations
- File upload handling for audio and images
- Image optimization and processing
- Content validation and error handling
- Real-time content updates

### Search & Discovery

- Full-text search across multiple content types
- Debounced search for performance
- Real-time search results
- Search result categorization
- Search history and suggestions

### Analytics & Statistics

- User listening statistics
- Top artists and albums calculation
- Listening time tracking
- Play count analytics
- Year in Review feature

### SEO & Sharing

- Dynamic metadata generation
- Open Graph and Twitter Card support
- Structured data (JSON-LD)
- Dynamic sitemap generation
- Shareable URLs with rich previews

### Performance Optimizations

- Server-side rendering for SEO
- Image optimization with multiple formats
- Code splitting and lazy loading
- React Compiler for automatic optimization
- Efficient database queries with Prisma
- Custom scrollbar styling
- Compression and minification

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Generate Prisma Client
npx prisma generate

# Create database migration
npx prisma migrate dev

# Push schema changes (development only)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Code Organization

- **Server Components**: Default in App Router, used for data fetching and SEO
- **Client Components**: Marked with `"use client"` for interactivity
- **Server Actions**: Async functions in `"use server"` files for mutations
- **API Routes**: RESTful endpoints in `app/api/` directory
- **Components**: Reusable UI components in `components/` directory
- **Utilities**: Helper functions in `lib/` directory

### Best Practices

- Type safety with TypeScript
- Server Actions for data mutations
- Optimistic UI updates where applicable
- Error boundaries for error handling
- Loading states for better UX
- Responsive design principles
- Accessibility considerations

## Build & Deployment

### Production Build

```bash
npm run build
```

This command:
- Optimizes all assets
- Generates static pages where possible
- Minifies JavaScript and CSS
- Creates optimized production bundle

### Deployment Considerations

1. **Database**: Ensure PostgreSQL database is accessible
2. **Environment Variables**: Configure all required variables
3. **File Storage**: Configure proper file storage for uploads
4. **CDN**: Consider CDN for static assets
5. **Caching**: Configure appropriate caching strategies
6. **Monitoring**: Set up error tracking and monitoring

### Recommended Platforms

- **Vercel** - Optimal for Next.js applications
- **Netlify** - Good alternative with similar features
- **AWS/Google Cloud** - For custom infrastructure needs

## Contributing

This project was developed as a learning exercise and portfolio piece. Contributions, suggestions, and feedback are welcome.

## Credits

**Developer**: Hadi

**Development Approach**: 
This project was primarily developed by Hadi, who designed and implemented the core architecture, UI components, and overall project structure. Approximately 50% of the development involved collaborative work with AI assistance, particularly for advanced logic implementation, debugging complex issues, and implementing sophisticated features such as real-time updates, SEO optimization, and performance enhancements.

**Key Contributions**:
- **Hadi**: Project architecture, core structure, UI/UX design, component development, routing, and fundamental functionality
- **AI Assistance**: Advanced logic implementation, debugging, SEO features, performance optimization, and complex feature development

**Technologies & Libraries**:
- Next.js, React, Prisma, PostgreSQL, NextAuth.js, Tailwind CSS, TypeScript, and various supporting libraries as listed in the Technology Stack section.

---

**License**: This project is for educational and portfolio purposes.

