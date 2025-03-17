# Nifty thrifty

A new web application for browsing, searching and filtering second-hand baby items from WhatsApp in Cape Town, powered by Supabase. Still under development.

## Overview

This application provides a read-only frontend for browsing and searching listings of second-hand baby items. Users can:

- Browse all listings
- Search for specific items
- Filter by category
- Filter by location
- View "In Search Of" (ISO) listings
- See detailed information for each listing

## Architecture

The application uses the following technologies:

- **Next.js**: Frontend framework
- **Supabase**: Backend database and authentication
- **Tailwind CSS**: Styling

The application is structured as a read-only frontend that displays data from the Supabase database. It does not include any functionality for adding, updating, or deleting listings through the application itself.

## Environment Variables

The application requires the following environment variables to be set in a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Getting Started

To run the application locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the required environment variables
4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

This application is designed to be deployed to Vercel:

```bash
npm run vercel-deploy
```
