-- Migration to add phone_number column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS phone_number TEXT; 