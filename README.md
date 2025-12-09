# Rank Factory

A modern ranking and battle system built with Hono, React, Vite, and Bun.

## 🚀 Tech Stack

- **Backend**: Hono 4.10.8 (Edge-optimized web framework)
- **Frontend**: React 19.2.1 + Vite 7.2
- **Runtime**: Bun 1.3.3
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Generative AI (Gemini)
- **Deployment**: Cloudflare Pages Functions
- **Styling**: Tailwind CSS 4.1

## 🔒 Security

This project uses React 19.2.1, which includes critical security patches for CVE-2025-55182 (CVSS 10.0). We do not use React Server Components, ensuring our application is not vulnerable to this critical security issue.

## 📁 Project Structure

```
rank-factory/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components
│   │   ├── lib/           # Utilities (API client, Supabase)
│   │   ├── hooks/         # React hooks
│   │   └── styles/        # Global styles
│   ├── index.html         # HTML entry
│   └── vite.config.ts     # Vite configuration
│
├── server/                # Hono backend
│   ├── routes/           # API routes
│   ├── middleware/       # Middleware functions
│   ├── lib/              # Server utilities
│   └── app.ts            # Hono app setup
│
├── functions/            # Cloudflare Pages Functions
│   └── [[path]].ts      # Catch-all route handler
│
├── shared/              # Shared types and constants
│   ├── types.ts
│   └── constants.ts
│
└── dist/                # Build output
```

## 🛠️ Development

### Prerequisites

- Bun 1.3.3 or higher
- Node.js 20.19+ or 22.12+ (for Vite compatibility)

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vite (Client)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Google AI
GOOGLE_API_KEY=your_google_api_key
GOOGLE_TEXT_MODEL=gemini-2.5-flash
GOOGLE_IMAGE_MODEL=gemini-2.5-flash-image
```

### Install Dependencies

```bash
bun install
```

### Run Development Server

```bash
bun run dev
```

This starts:
- Frontend (Vite): http://localhost:5173
- Backend (Wrangler): http://localhost:8787

### Build for Production

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## 🚢 Deployment

Deploy to Cloudflare Pages:

```bash
bun run deploy
```

### Environment Variables (Production)

Set these in Cloudflare Pages dashboard:
1. Go to your Cloudflare Pages project
2. Settings → Environment variables
3. Add all variables from `.env.local`

## 📖 API Routes

### Authentication
- `GET /api/auth/callback` - OAuth callback handler

### Topics
- `GET /api/topics` - List all topics
- `GET /api/topics/:id` - Get single topic with items
- `POST /api/topics` - Create new topic
- `POST /api/topics/generate` - Generate topic with AI
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic

### Ranking
- `GET /api/ranking/:topicId/items` - Get ranking items
- `GET /api/ranking/:topicId/pair` - Get random battle pair
- `POST /api/ranking/:topicId/vote` - Submit vote (ELO update)

### Admin
- `POST /api/admin/topics/new` - Create topic (admin)
- `PUT /api/admin/topics/:id` - Update topic (admin)
- `DELETE /api/admin/topics/:id` - Delete topic (admin)

### Utility
- `GET /api/seed` - Seed database with sample data
- `GET /api/health` - Health check

## 🎮 Features

- **Battle Mode**: 1v1 item comparison with ELO ranking
- **Tier System**: Organize items by tier
- **Fact Mode**: Display item statistics
- **Test Mode**: Quiz-style ranking
- **AI Generation**: Auto-generate topics and images with Gemini
- **Games**: Mini-games (Tetris, Reaction Time, Color Match, Runner, One Minute)

## 📝 License

Private project

## 🤝 Contributing

This is a private project. Contributions are not accepted at this time.
