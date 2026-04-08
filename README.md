# Barby Music Club Website

A modern remake of the official Barby Music Club website (barby.co.il) - Israel's iconic live music venue since 1988.

This project is an educational/demonstration remake built with modern technologies and improved architecture. It is not officially affiliated with Barby Music Club.

## Overview

- Shows calendar with infinite scroll (cursor-based pagination)
- Ticket status management (available, few left, sold out, cancelled)
- Secure admin dashboard for content management
- Gift card system
- Order management
- Responsive design for all devices
- Full accessibility support (WCAG 2.1)
- RTL (Right-to-Left) Hebrew language support

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Firebase Auth | Authentication (email/password) |
| Firebase Firestore | NoSQL database |
| React Query | Server state management and caching |
| React Router v6 | Client-side routing |
| React Hook Form | Form handling |
| Zod | Schema validation |
| DOMPurify | XSS protection |

## Installation

### Prerequisites

- Node.js 18 or higher
- A Firebase project with Firestore and Authentication enabled

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/your-username/barby.co.il.git
cd barby.co.il

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Firebase config
```

### Environment Variables (.env)

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Running the Project

```bash
# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## Project Structure

```
barby.co.il/
├── src/
│   ├── components/
│   │   ├── common/               # Reusable components (Button, Input, Modal)
│   │   ├── feature/              # Feature components (ShowCard, Chandelier)
│   │   └── layout/               # Layout components (Header, Footer)
│   ├── pages/                    # Page components
│   │   └── admin/                # Admin dashboard pages (lazy loaded)
│   ├── context/                  # Auth context (Firebase)
│   ├── hooks/                    # Custom hooks (useInfiniteScroll)
│   ├── lib/                      # Firebase config, validation schemas
│   ├── services/                 # Firestore API layer, React Query
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── public/                       # Static assets
│   └── accessibility/            # Accessibility widget
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore composite indexes
├── vercel.json                   # Vercel deployment configuration
└── vite.config.ts                # Vite configuration
```

## Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Framework Preset: **Vite**
3. Add environment variables in Vercel Dashboard (same as .env)
4. Deploy

### Firebase Setup

1. Deploy Firestore security rules: copy `firestore.rules` to Firebase Console
2. Create composite indexes: use `firestore.indexes.json` or let Firebase auto-create them
3. Enable Email/Password authentication in Firebase Console

## Security

- Firebase Auth with role-based access (admin, editor, viewer)
- Firestore security rules with self-escalation prevention
- DOMPurify for XSS protection on user-generated HTML
- Server-side price validation for orders
- Transactional gift card operations
- Cryptographically secure gift card codes
- Security headers via Vercel

## License

MIT License - See [LICENSE](LICENSE) file for details.

Note: The Barby logo, images, and content belong to their respective owners. This project is for educational and demonstration purposes only.

