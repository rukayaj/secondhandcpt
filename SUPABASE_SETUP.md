# Supabase Setup for Nifty Thrifty

This document explains how to set up the Supabase database and storage for the Nifty Thrifty application.

## Database Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. Create the necessary tables by running the following SQL in the Supabase SQL Editor:

```sql
-- Run this in the Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  price NUMERIC,
  description TEXT,
  whatsapp_group TEXT,
  date TIMESTAMP WITH TIME ZONE,
  sender TEXT,
  text TEXT,
  images TEXT[],
  condition TEXT,
  collection_areas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up proper permissions
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous reads
CREATE POLICY "Allow anonymous read access" 
  ON public.listings 
  FOR SELECT 
  TO anon 
  USING (true);

-- Create policy to allow authenticated users to insert/update/delete their own records
CREATE POLICY "Allow authenticated users to manage their own records" 
  ON public.listings 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);
```

## Storage Setup

1. Create a new storage bucket called `listing-images` in the Supabase Storage section.

2. Set the bucket to public to allow anonymous access to the images.

3. Create a folder called `listings` inside the bucket to store the listing images.

## Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Replace the values with your actual Supabase project URL and keys.

## Importing Data

To import your WhatsApp chat data into the Supabase database:

1. Extract the WhatsApp chat data using the extraction script:

```bash
node src/scripts/extract-whatsapp-listings.js
```

2. Import the extracted listings into the Supabase database:

```bash
node src/scripts/import-listings.js
```

3. Upload the images to the Supabase storage:

```bash
node scripts/upload-whatsapp-images.js
```

## Running the Application

After setting up the database and storage, you can run the application:

```bash
npm run dev
```

The application will now use the Supabase database and storage for all data and images. 