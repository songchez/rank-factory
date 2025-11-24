# Project Overview

This is a Next.js web application called "Rank Factory" that allows users to rank items in various categories. The project was bootstrapped with `v0.app`.

## Technologies Used

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [Supabase](https://supabase.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## Project Structure

- `app/`: Contains the main application code, including pages and layouts.
- `components/`: Contains reusable React components.
- `lib/`: Contains utility functions and the Supabase client.
- `public/`: Contains static assets like images and fonts.
- `styles/`: Contains global CSS styles.

## Getting Started

### Prerequisites

- Node.js and pnpm
- Supabase account and project

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file in the root of the project and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   ```

### Running the Development Server

To run the development server, use the following command:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Building and Running for Production

To build the application for production, use the following command:

```bash
pnpm build
```

To run the production server, use the following command:

```bash
pnpm start
```

## Development Conventions

The project uses ESLint for linting. To run the linter, use the following command:

```bash
pnpm lint
```
