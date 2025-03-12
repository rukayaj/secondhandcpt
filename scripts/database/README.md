# Database Migrations

This directory contains SQL scripts for database migrations.

## How to Run Migrations

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of the migration script
4. Run the script

## Migration History

- `add_category_column.sql`: Adds a category column to the listings table
- `add_multi_message_columns.sql`: Adds columns for multi-message support and sold status tracking
  - `is_multi_message`: Boolean flag indicating if a listing spans multiple messages
  - `message_count`: Number of messages that make up this listing
  - `is_sold`: Boolean flag indicating if the item has been sold
  - `sold_date`: Timestamp when the item was marked as sold
  - `title`: Extracted title of the listing

## Schema Evolution

The listings table has evolved over time to support more features:

1. Initial schema with basic fields
2. Added category support
3. Added multi-message support
4. Added sold status tracking

## Troubleshooting

If you encounter errors when running migrations:

1. Check if the columns already exist
2. Verify that you have the necessary permissions
3. Make sure the table exists before trying to alter it 