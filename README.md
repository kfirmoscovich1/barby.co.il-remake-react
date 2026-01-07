# Barby Music Club Website

A modern remake of the official Barby Music Club website (barby.co.il) - Israel's iconic live music venue since 1988.

This project is an educational/demonstration remake built with modern technologies and improved architecture. It is not officially affiliated with Barby Music Club.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Production Deployment](#production-deployment)
- [Security](#security)
- [Accessibility](#accessibility)
- [License](#license)

## Overview

This full-stack application includes:

- Shows calendar with infinite scroll pagination
- Ticket status management (available, few left, sold out)
- Secure admin dashboard for content management
- Responsive design for all devices
- Full accessibility support (WCAG 2.1)
- SEO optimization with structured data
- RTL (Right-to-Left) Hebrew language support

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| React Query | Server state management and caching |
| React Router v6 | Client-side routing |
| React Hook Form | Form handling |
| Zod | Schema validation |

### Backend

| Technology | Purpose |
|------------|---------|
| Express.js | REST API framework |
| TypeScript | Type safety |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| Multer + Sharp | Image upload and processing |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |

### Validation

| Technology | Purpose |
|------------|---------|
| Zod | Schema validation (frontend & backend) |
| TypeScript | Shared type definitions |

## Installation

### Prerequisites

- Node.js 18 or higher
- MongoDB 6 or higher
- npm or yarn

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/your-username/barby.co.il.git
cd barby.co.il

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
```

### Environment Variables

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

#### Backend (backend/.env)

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/barby
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
CORS_ORIGIN=http://localhost:5173
```

## Running the Project

### Development Mode

```bash
# Terminal 1 - Start backend
cd backend && npm run dev

# Terminal 2 - Start frontend
npm run dev
```

### Using Docker Compose

```bash
docker-compose up -d
```

The application will be available at:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| MongoDB | localhost:27017 |

### Database Seeding

```bash
cd backend && npm run seed
```

This creates an initial admin user with credentials defined in your .env file.

## Project Structure

```
barby.co.il/
├── src/                          # Frontend (React)
│   ├── components/
│   │   ├── common/               # Reusable components (Button, Input, Modal)
│   │   ├── feature/              # Feature components (ShowCard, ShowGrid)
│   │   └── layout/               # Layout components (Header, Footer)
│   ├── pages/                    # Page components
│   │   └── admin/                # Admin dashboard pages
│   ├── context/                  # React Context providers
│   ├── hooks/                    # Custom hooks
│   ├── services/                 # API services and React Query
│   ├── types/                    # TypeScript type definitions
│   ├── lib/validation/           # Validation schemas and utilities
│   └── utils/                    # Utility functions
│
├── backend/                      # Backend (Express)
│   └── src/
│       ├── config/               # Configuration (database, environment)
│       ├── middleware/           # Express middleware
│       ├── models/               # Mongoose models
│       ├── routes/               # API route handlers
│       ├── services/             # Business logic
│       ├── types/                # TypeScript type definitions
│       ├── validation/           # Zod validation schemas
│       └── scripts/              # Database scripts
│
├── public/                       # Static assets
│   └── accessibility/            # Accessibility widget
├── docker-compose.yml            # Docker configuration
├── nginx.conf                    # Nginx reverse proxy configuration
├── vercel.json                   # Vercel deployment configuration
├── render.yaml                   # Render deployment configuration
└── vite.config.ts                # Vite configuration
```

## Production Deployment

### Live URLs

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://barby.kfirmoscovich.com |
| Backend API | Render | https://barby-api.onrender.com |

### Deploying to Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Configure the following settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://barby-api.onrender.com/api
   ```
4. Deploy

### Deploying to Render (Backend)

1. Connect your GitHub repository to Render
2. Use the `render.yaml` blueprint or configure manually:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
3. Add environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Generate with `openssl rand -base64 64`
   - `JWT_REFRESH_SECRET` - Generate with `openssl rand -base64 64`
   - `CORS_ORIGIN` - `https://barby.kfirmoscovich.com`
   - `ADMIN_EMAIL` - Admin user email
   - `ADMIN_PASSWORD` - Admin user password
4. Deploy

### Building for Production

```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build
```

### Deployment Checklist

- [ ] Update environment variables for production
- [ ] Generate new JWT_SECRET and JWT_REFRESH_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure correct CORS origins
- [ ] Enable HTTPS
- [ ] Configure appropriate rate limiting
- [ ] Set up MongoDB backups
- [ ] Configure PM2 or systemd for process management

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Security

This application implements the following security measures:

- JWT authentication with refresh tokens
- Rate limiting on all API routes
- Helmet security headers
- CORS configuration
- Input sanitization
- Password hashing with bcrypt
- NoSQL injection protection
- XSS protection
- HTTPS redirect in production

## Accessibility

The application follows WCAG 2.1 guidelines:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Skip to content link
- Focus visible indicators
- Screen reader compatibility
- Full RTL support

## License

MIT License - See [LICENSE](LICENSE) file for details.

Note: The Barby logo, images, and content belong to their respective owners. This project is for educational and demonstration purposes only.

