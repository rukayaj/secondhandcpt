SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'category');
