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
- View which WhatsApp group the listing came from in a human-readable format

## Architecture

The application uses the following technologies:

- **Next.js**: Frontend framework
- **Supabase**: Backend database and storage
- **Tailwind CSS**: Styling

The application is structured as a simple read-only frontend that displays data from the Supabase database without any unnecessary complexity.

## Data Structure

The listings data is stored in Supabase as `ListingRecord` objects that include:

- Basic listing information (title, description, price, etc.)
- Category and condition data
- Location information
- WhatsApp group identifiers (stored as codes like "120363139582792913@g.us")
- Images stored in Supabase storage

### WhatsApp Group Name Conversion

WhatsApp groups are stored in the database using internal identifiers, but the application adds user-friendly group names through a simple mapping process:

1. The listing service (`listingService.ts`) attaches a `group_name` to each listing when retrieved
2. Components can use this field directly for display

This simplified approach avoids unnecessary data transformations while ensuring users see friendly group names.

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
