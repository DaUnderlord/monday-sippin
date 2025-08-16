# Monday Sippin' Website

A premium crypto/finance publication website built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Modern Tech Stack**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- **Authentication**: Supabase Auth with social login support
- **UI Components**: Shadcn/ui component library
- **State Management**: Zustand for client-side state
- **Animations**: Framer Motion for smooth interactions
- **Brand Design**: Custom color palette and Manrope font family
- **Responsive Design**: Mobile-first approach with accessibility compliance

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── layout/            # Layout components (Header, Footer, AppLayout)
│   ├── ui/                # Shadcn/ui components
│   ├── forms/             # Form components
│   ├── content/           # Content-related components
│   └── admin/             # Admin dashboard components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries (Supabase client, etc.)
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions and constants
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd monday-sippin-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy the `.env.local` file and update with your actual values:
   
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   
   # Email Service Configuration (Resend)
   RESEND_API_KEY=your_resend_api_key
   
   # Search Service Configuration (Algolia)
   NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
   NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
   ALGOLIA_ADMIN_API_KEY=your_algolia_admin_api_key
   
   # Analytics
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your_google_analytics_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Brand Colors

The website uses a vibrant color palette:

- **Deep Teal**: `#1B4B5A`
- **Warm Orange**: `#F4A261` 
- **Rich Purple**: `#6B46C1`
- **Sage Green**: `#52B788`
- **Coral Pink**: `#E76F51`

## Typography

- **Font Family**: Manrope (ExtraBold for headings, Regular for body)
- **Fallback**: System fonts via Geist Sans

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Components

Use Shadcn/ui to add new components:

```bash
npx shadcn@latest add [component-name]
```

### State Management

The project uses Zustand for state management. Stores are located in `src/store/`.

Example usage:
```typescript
import { useAuthStore } from '@/store/auth'

const { user, setUser } = useAuthStore()
```

## Next Steps

This is the foundational setup for the Monday Sippin' website. The next tasks in the implementation plan include:

1. Database Schema and Authentication Setup
2. Brand Design System Implementation  
3. Core Layout and Navigation Components
4. User Authentication and Profile Management
5. Article Data Models and API Layer

Refer to the project specification documents for detailed implementation requirements.

## Contributing

Please follow the established code style and run linting before submitting changes:

```bash
npm run lint
```

## License

Private project - All rights reserved.
