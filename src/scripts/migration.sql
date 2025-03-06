
-- Drop the table if it exists
DROP TABLE IF EXISTS listings;

-- Create the listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whatsapp_group TEXT NOT NULL,
  date TEXT NOT NULL,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  price NUMERIC,
  condition TEXT,
  collection_areas TEXT[] DEFAULT '{}',
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_iso BOOLEAN DEFAULT FALSE
);

-- Insert the listings data
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/5/24 1:24 pm',
  '+27 63 359 3846',
  'All 3. @R80 fluffy shoes size 2&3 sandal size 2
Collection: Cape Gate Brackenfell
DM me if interested.',
  ['IMG-20241205-WA0003.jpg']::text[],
  80,
  NULL,
  ['Brackenfell','Cape Gate']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/5/24 2:16 pm',
  '+27 82 460 9944',
  'Baby Sense Book
Perfect condition 
R50 
Collection Constantia
Cross posted',
  ['IMG-20241205-WA0005.jpg']::text[],
  50,
  NULL,
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/5/24 9:34 pm',
  '+27 73 048 9276',
  'Evening is anyone selling a baby mobile?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 7:45 am',
  '+27 82 823 8933',
  'Paps Kids Boutique shoes. Size 21. Perfect for Christmas! Never worn. R100. Collection Plumstead xposted',
  []::text[],
  100,
  'NEW',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 7:50 am',
  '+27 82 823 8933',
  'Ackermans coat. 12-18 months. Well worn but still has alot of wear left. One or two marks on the neck area. R50. Collection Plumstead XPosted',
  []::text[],
  50,
  NULL,
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 7:58 am',
  '+27 82 823 8933',
  'H&M white sandals. Very good condition. Size 22. R100. Collection Plumstead xposted',
  []::text[],
  100,
  'VERY_GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 8:25 am',
  '+27 73 805 7695',
  'Selling toys: stroller (metal base) with twins dolls+accessories(R250) , wooden walker (R350), and horse 4 in 1 riding, rocking, pushing and pulling(R850). All together will be R1200. Everything in very good condition. Collection Sea Point.',
  ['IMG-20241121-WA0021.jpg']::text[],
  250,
  'VERY_GOOD',
  ['Sea Point']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 9:30 am',
  '+27 66 587 1094',
  'Winnie the Pooh one seater couch. Fair to good condition. R200. It’s made to be waterproof so it’s wrapped in plastic. This plastic is starting to tear in some places from wear and tear and a move. Otherwise the couch is still very sturdy. Collection in Claremont. Xposted.',
  ['IMG-20241013-WA0011.jpg']::text[],
  200,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 9:31 am',
  '+27 66 587 1094',
  'Babysense summer sleep sack. Says ‘one size’. Never used. Bought for R530, selling for R290. Collection in Claremont.  Xposted.',
  ['IMG-20241013-WA0002.jpg']::text[],
  530,
  'NEW',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 9:42 am',
  '+27 83 287 1870',
  'Boba Classic Newborn Wrap - Grey
In excellent condition
R 250.00
Collection in Wynberg Upper 
X Posted',
  []::text[],
  250,
  'EXCELLENT',
  ['Wynberg','Wynberg Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:10 am',
  '+27 72 270 9283',
  '*BUNDLE*
Items: Cot/Nap mosquito/fly Net (folds up flat), Numbers Foam Mat Puzzle, Splash Sprinkler Inflatable Pool
Condition: Great 
Price: R350 for all 
Collection: Goodwood | Delivery via Uber
Cross Posting 
PLEASE DM IF INTERESTED 🌼',
  []::text[],
  350,
  'VERY_GOOD',
  ['Goodwood']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:11 am',
  '+27 66 587 1094',
  'Woolies, white Walkmates - size 5 - R100. Good condition. Collection in Claremont. Xposted.',
  []::text[],
  100,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:13 am',
  '+27 66 587 1094',
  'Woolies, white Walkmate takkies- size 4. R100. Good condition. Collection in Claremont. Xposted.',
  []::text[],
  100,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:44 am',
  '+27 66 587 1094',
  'Woolies (doesn’t specify tog but is thicker than a summer sleep sack so maybe for autumn) unicorn sleep sack- 6-12 months. Good condition. R180. Collection in Claremont.',
  ['IMG-20240912-WA0037.jpg']::text[],
  180,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:48 am',
  '+27 66 587 1094',
  'Woolies striped jumpsuit. Worn once. 3-6 months. R90. Collection in Claremont.',
  ['IMG-20240911-WA0012.jpg']::text[],
  90,
  'LIKE_NEW',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:49 am',
  '+27 66 587 1094',
  'Woolies, denim dress, 6-12 months, good condition. R90. Collection in Claremont.',
  ['IMG-20240911-WA0016.jpg']::text[],
  90,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:53 am',
  '+27 66 587 1094',
  'Woolies, pink dinosaur pajamas. 6-12 months. Good condition. R70. Collection in Claremont.',
  ['IMG-20240911-WA0017.jpg']::text[],
  70,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:54 am',
  '+27 66 587 1094',
  'Woolies, pink and white cloud pajamas- 6-12 months. Good condition except for small patch of discolouration on right hand side. R60. Collection in Claremont.',
  ['IMG-20240911-WA0019.jpg']::text[],
  60,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 10:56 am',
  '+27 66 587 1094',
  'Woolies, shorts and tee set. 6 -12 months. Good condition. R80. Collection in Claremont.',
  ['IMG-20240909-WA0009.jpg']::text[],
  80,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 11:06 am',
  '+27 66 587 1094',
  'Woolies, Grey dress with headband - 6-12 months, good condition, R90. Collection in Claremont.',
  ['IMG-20240909-WA0007.jpg']::text[],
  90,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 11:33 am',
  '+27 66 587 1094',
  'Woolies, Zip-up yellow hoodie, 3-6 months, good condition. R70. Collection in Claremont.',
  ['IMG-20240909-WA0012.jpg']::text[],
  70,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 11:34 am',
  '+27 66 587 1094',
  'Woolies, Zip-up pink hoodie, 3-6 months, fair good condition. Some discolouration. R50. Collection in Claremont.',
  ['IMG-20240909-WA0011.jpg']::text[],
  50,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 11:35 am',
  '+27 66 587 1094',
  'Woolies hearts onesie/pjs. 6-12 months. Fair condition. Just some fading at the knees legs. R80. Collection in Claremont.',
  ['IMG-20240909-WA0010.jpg']::text[],
  80,
  'FAIR',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 1:44 pm',
  '+27 66 587 1094',
  'Wooden teething ring and dummy chain inscribed with name ‘Nina’. As new. R200. Collection in Claremont. Xposted.',
  ['IMG-20240908-WA0011.jpg']::text[],
  200,
  NULL,
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 2:12 pm',
  '+27 83 287 1870',
  'Ko-Coon Zipped Swaddle - Cotton knit (premies - 3m) x2
In excellent condition (one never used)
R 350.00 for both
Collection in Wynberg Upper
X Posted',
  ['IMG-20241128-WA0004.jpg']::text[],
  350,
  'EXCELLENT',
  ['Wynberg','Wynberg Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 2:14 pm',
  '+27 83 288 7570',
  '2x Tommee Tippee 6-18 months 0.2 tog sleep sacks and 2x Tommee tippee 6-18 months 1.0 tog sleep sacks. R200 each or R700 for all.',
  ['IMG-20241207-WA0000.jpg']::text[],
  200,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 8:27 pm',
  '+27 78 789 4429',
  'Snuza Pico (original). excellent condition. connects to app for cool analysis of baby''s sleep. doesn''t come with original manual, but it is available online. r800 collection constantia',
  []::text[],
  800,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 9:44 pm',
  '+27 65 838 4802',
  '2 Tracksuits 0-3months
Good condition
R50 for both
Collection Plumstead',
  []::text[],
  50,
  'GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 9:45 pm',
  '+27 65 838 4802',
  '0-3month Summer Bundle
Good condition
R75 for everything
Collection Plumstead',
  []::text[],
  75,
  'GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 9:46 pm',
  '+27 65 838 4802',
  'Splash About
Happy Nappy Re-Usable Swim Nappy.
Protection against any faecal leaks.
6-12 months, still fairly new, baby started swimming late.
R150 - Collection Plumstead',
  []::text[],
  150,
  NULL,
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/6/24 9:46 pm',
  '+27 65 838 4802',
  'Snuggletime Plush Swaddle Wrap. 
0-6 months brand new, unused gift. 
R50 - Collection Plumstead',
  []::text[],
  50,
  'NEW',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/7/24 9:50 am',
  '+27 72 399 9245',
  'Anyone selling a doll carrier?',
  ['IMG-20241207-WA0001.jpg']::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/8/24 8:54 am',
  '+27 84 402 2317',
  'Maxi cosi pebble infant car seat with base. R500 for both. Good condition but with some scuff marks. Never been in an accident. Collect in Newlands',
  ['IMG-20241208-WA0001.jpg']::text[],
  500,
  'GOOD',
  ['Newlands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/8/24 9:16 am',
  '+27 84 243 5548',
  'Dr Brown''s wide neck bottles 150ml only used for 2 days.  Have x 4 R100 each collect in Kenilworth',
  ['IMG-20241208-WA0003.jpg']::text[],
  100,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:46 am',
  '+27 84 402 2317',
  'Price drop: maxi cosi pebble infant car seat with base. Good condition. R300 for both. Clearing out garage so hence good price as needs to go this week. Collect Newlands or Tokai',
  []::text[],
  300,
  'GOOD',
  ['Newlands','Tokai']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 9:39 am',
  '+27 82 783 3775',
  '0-3 month clothing bundle, mostly Woolworths, some new and unused, R50, collection Plumstead',
  []::text[],
  50,
  'NEW',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 10:14 am',
  '+27 82 824 6198',
  '18x playmat blocks. Used this weekend for party decor only. Each block measures 31cm x 31cm. R300 Claremont Upper',
  []::text[],
  300,
  NULL,
  ['Claremont','Claremont Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 6:02 pm',
  '+27 83 287 1870',
  'Newborn or small 0-3 month onesie 
Feels like cotton (no label)
In great condition 
R 50.00
Collection in Wynberg Upper
X Posted',
  ['IMG-20241209-WA0008.jpg']::text[],
  50,
  'VERY_GOOD',
  ['Wynberg','Wynberg Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 6:04 pm',
  '+27 83 287 1870',
  'Snuggletime Head and Back Sleep Positioner
Like new condition 
R 100.00
Collection in Wynberg Upper or Pudo/Paxi at Buyers Cost
X Posted',
  ['IMG-20241203-WA0008.jpg']::text[],
  100,
  'NEW',
  ['Wynberg','Wynberg Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 6:04 pm',
  '+27 83 287 1870',
  'Selection of baby teething items
Never been used
R 300.00 for all 4 items. 
Collection in Wynberg Upper',
  ['IMG-20241201-WA0014.jpg']::text[],
  300,
  'NEW',
  ['Wynberg','Wynberg Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 6:05 pm',
  '+27 83 287 1870',
  'My First Green Toys | First Keys
Brand New
R200.00
Collection in Wynberg Upper
X Posted',
  ['IMG-20241130-WA0032.jpg']::text[],
  200,
  'NEW',
  ['Wynberg','Wynberg Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:21 pm',
  '+27 82 395 7346',
  '6-12 months dungaree. Ackermans. Perfect condition.  Collect in Sunningdale or pudo',
  ['IMG-20241209-WA0018.jpg']::text[],
  100,
  'EXCELLENT',
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:22 pm',
  '+27 82 395 7346',
  'WW dungaree 6-12 months. R60
 Perfect condition. Collect in Sunningdale or Pudo',
  ['IMG-20241209-WA0017.jpg']::text[],
  60,
  NULL,
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:23 pm',
  '+27 82 395 7346',
  '6-12 months. Naartjie dungaree
 Perfect condition.  Collect in Sunningdale or pudo',
  ['IMG-20241209-WA0016.jpg']::text[],
  150,
  'EXCELLENT',
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:24 pm',
  '+27 82 395 7346',
  'WW Swimsuit. 6-12 months. R70
 Perfect condition. Collect in Sunningdale or pudo',
  ['IMG-20241209-WA0015.jpg']::text[],
  70,
  NULL,
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:25 pm',
  '+27 82 395 7346',
  'Swimsuit 6-12months.  Perfect condition.  R70. 
Collect in Sunningdale or pudo',
  ['IMG-20241209-WA0003.jpg']::text[],
  70,
  NULL,
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:26 pm',
  '+27 82 395 7346',
  'PNP dungaree. 6-12months. R30. Collect in Sunningdale or pudo',
  ['IMG-20241209-WA0014.jpg']::text[],
  30,
  NULL,
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:30 pm',
  '+27 82 395 7346',
  'Cotton on 3-6 months.  Perfect condition.  R70. Collect in Sunningdale or  pudo',
  ['IMG-20241209-WA0013.jpg']::text[],
  70,
  NULL,
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:31 pm',
  '+27 82 395 7346',
  'Nr3 shoes. Brand new.   Pnp and Pep. R100 for all 3. Collect in Sunningdale or pudo',
  ['IMG-20241209-WA0002.jpg']::text[],
  100,
  'NEW',
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 7:32 pm',
  '+27 82 395 7346',
  'Nr4 shoes. WW and Pnp. Good condition. 
R100 all 3 pairs. Collect in Sunningdale or Pudo',
  ['IMG-20241209-WA0001.jpg']::text[],
  100,
  'GOOD',
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/9/24 8:47 pm',
  '+27 82 395 7346',
  'Sorry. R50',
  []::text[],
  50,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/10/24 10:43 am',
  '+27 83 584 7692',
  'Graco Trilogic, Height adjustable car seat. The back can be removed to use the base as a booster. Very good condition, was a spare seat. R500. Collection in Bergvliet. X - posted',
  ['IMG-20241210-WA0003.jpg']::text[],
  500,
  'VERY_GOOD',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/10/24 12:37 pm',
  '+27 83 766 2340',
  'SWADDLE UP ORIGINAL 1.0 TOG GREY. Size: Small (3.5-6kg). R200. Excellent condition. Collect Newlands.',
  ['IMG-20241210-WA0020.jpg']::text[],
  200,
  'EXCELLENT',
  ['Newlands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/10/24 12:44 pm',
  '+27 63 017 1933',
  'Mastela 3-in-1 Deluxe Multi-Function Bassinet Electric Baby Rocker
I''m excellent condition as hardly used, selling for 950 Rand, collection in Hout Bay or can arrange to meet in town /Seapoint. 
The multi functional bassinet imitates the design of the mother''s arms, and strongly supports the baby''s back to protect the baby''s spine. It comes with soft sleepy music, making it easier for your baby to fall asleep. Electric sleepy bassinet, completely liberates the mother''s hands, folding small, 3 timer settings, 15 melodies, full recline seat. The hanging toy on the bassinet can train the baby''s finger grasping ability to attract your baby''s attention. The removable & foldable mosquito net provides fully enclosed protection against biting insects and mosquitoes when sleeping outdoors or indoors.',
  ['IMG-20241210-WA0021.jpg']::text[],
  NULL,
  'EXCELLENT',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/10/24 3:15 pm',
  '+27 84 548 4889',
  '0-3 Months girl''s bundle. All exceptional condition, worn once or twice.
Includes H&M, Disney, Next Baby, Woolies, Ackermans, Cotton On, Naartjie brands.
Items include:
- 5x sets
- 5x t-shirts
- 1x tracksuit
- 4x shorts
- 5x vests
All 100% cotton.
R500 for the bundle.
Collection in Stellenbosch or courier can be arranged at buyer''s expense.',
  []::text[],
  500,
  'LIKE_NEW',
  ['Stellenbosch']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/10/24 5:06 pm',
  '+27 82 546 0212',
  'Hi, I’m looking for a 1st birthday girl crown or something like that she can wear for photos? Doubt anything will stay on her head but hopefully for a picture 🤞. Preferably in the Tokai area.Thanks 🙏🏻',
  []::text[],
  NULL,
  NULL,
  ['Tokai']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/10/24 5:37 pm',
  '+27 82 320 2648',
  'Anyone selling a maxi Cosi isofox 360 pro?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/11/24 3:34 pm',
  '+27 68 434 0560',
  'Hi mommies, lm looking for a bundle of baby girls clothing from 3 months up to 12 months, please DM me with pictures and prices. Thanks',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/11/24 7:53 pm',
  '+27 63 017 1933',
  'Selling 2 ezpz Happy Bowl silicone placemat + bowl for 180 Rand each or 300 for both. Sells new for 580 each.
Great condition, collection in Hout Bay',
  ['IMG-20241211-WA0006.jpg']::text[],
  300,
  'VERY_GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/11/24 7:54 pm',
  '+27 78 789 4429',
  'Looking for a baby grow in this pattern size 6-12 months 🙏❤️',
  ['IMG-20241211-WA0007.jpg']::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/11/24 7:58 pm',
  '+27 63 017 1933',
  'Selling this cute INTEX mushroom pool for 220 Rand on great condition, only used twice. Collection in Hout Bay or can arrange meet up in Constantia /Seapoint /Claremont',
  ['IMG-20241211-WA0008.jpg']::text[],
  220,
  'VERY_GOOD',
  ['Constantia','Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 8:36 am',
  '+27 60 626 1732',
  'Anyone selling accessories for mud kitchen for kids',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 8:49 am',
  '+27 78 789 4429',
  'Selling our baby Splash About vest and Happy Nappy for the pool, for any water babies this summer! Moderately used but still in pristine condition. We loved it - the Happy Nappy is truly leak-proof, even with watery breastfeeding poos, and the vest kept baby warm and comfortable in the pool. 
R400 for both, retail value R870. 
BabyWrap neoprene vest - size 0-6mo, SPF 50, R520 new. https://splashabout.co.za/collections/baby-wrap
Happy Nappy - size 3-6 months, SPF 50, R350 new. https://splashabout.co.za/collections/baby-wrap|
Collection Harfield Village. Xposted',
  ['IMG-20241212-WA0010.jpg']::text[],
  400,
  'LIKE_NEW',
  ['Harfield Village']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 8:55 am',
  '+27 72 123 4952',
  'Summer romper 3-6 months. Excellent condition, worn twice. Earth child. Collect Zeekoevlei. R100. X posted.',
  ['IMG-20241212-WA0012.jpg']::text[],
  100,
  'EXCELLENT',
  ['Zeekoevlei']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 8:57 am',
  '+27 72 123 4952',
  'Golf vest. Ackermans. Great condition. 6-12 months. Collect Zeekoevlei. X posted. R30.',
  ['IMG-20241212-WA0013.jpg']::text[],
  30,
  'VERY_GOOD',
  ['Zeekoevlei']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 8:59 am',
  '+27 72 123 4952',
  '1/2 swimsuit. Pnp clothing. Good condition, minor pilling at bum area. X posted. R50.',
  ['IMG-20241212-WA0014.jpg']::text[],
  50,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:03 am',
  '+27 72 123 4952',
  'Earth child lightweight romper. 6-12 months. R130. Excellent condition. X posted. R130.',
  ['IMG-20241212-WA0015.jpg']::text[],
  130,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:10 am',
  '+27 72 118 4955',
  '6 to 12 months Cotton On .Excellent condition R120. Collect Kenilworth',
  ['IMG-20241117-WA0029.jpg']::text[],
  120,
  'EXCELLENT',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:10 am',
  '+27 72 118 4955',
  'Keedo 9 to 12 months. Beautiful thick stretchy cotton. Great condition R130. Collect Kenilworth',
  ['IMG-20241124-WA0023.jpg']::text[],
  130,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:11 am',
  '+27 72 118 4955',
  '9 to 12 months H&M vests. Great condition R100 for both. Collect Kenilworth',
  ['IMG-20240904-WA0014.jpg']::text[],
  100,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:11 am',
  '+27 72 118 4955',
  '3 to 6 months girls 100% cotton bundle. Good condition. R120. (Woolies, Ackermans, Peekaboo) Collect Kenilworth Xposted',
  ['IMG-20241119-WA0044.jpg']::text[],
  120,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:11 am',
  '+27 72 118 4955',
  '6 to 12 month Naartjie set. Super cute. Top has a back frill not properly seen in this pic. Good to very good condition R130. Collect Kenilworth Xposted',
  ['IMG-20241117-WA0013.jpg']::text[],
  130,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:12 am',
  '+27 72 118 4955',
  '6 to 12 month Cath Kids ditsy pink floral 100% summer cotton dress.  Good to very good condition. Can even be worn as a top as she grows. Just stunning R150. Collect Kenilworth Xposted',
  ['IMG-20241117-WA0014.jpg']::text[],
  150,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:12 am',
  '+27 72 118 4955',
  '6 to 12 months girls'' summer bundle R120. 100% Cotton. Some items fair condition others good. (Woolies, naartjie, Peanuts,H&M, clicks) The cat sunglasses flip up. Please note that there is a tiny hole in bum of grey H&M leggings and a tiny hole in Peanuts tee. Collect Kenilworth Xposted',
  ['IMG-20241117-WA0016.jpg']::text[],
  120,
  'FAIR',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:12 am',
  '+27 72 118 4955',
  '6 to 12 months woolies blue melange romper. Super cute. Very good condition R80. Collect Kenilworth',
  ['IMG-20241117-WA0027.jpg']::text[],
  80,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:13 am',
  '+27 72 118 4955',
  '6 to 12 month pnp denim shorts with floral waistband. Cotton. Very good condition. R50 Collect Kenilworth. Xposted',
  ['IMG-20241212-WA0016.jpg']::text[],
  50,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:13 am',
  '+27 72 118 4955',
  'White and pale grey hooded bath towels. Woolies. 100% cotton.  Good condition. R100 for both. Collect Kenilworth',
  ['IMG-20241009-WA0015.jpg']::text[],
  100,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:13 am',
  '+27 72 118 4955',
  'Brand new Fisher-Price soft grip spoons. Handle is different vegetables (tomato, peas in a pod, carrot, corn) R120 Collect Kenilworth',
  ['IMG-20241009-WA0016.jpg']::text[],
  120,
  'NEW',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:13 am',
  '+27 72 118 4955',
  'Well loved Organic Ergobaby carrier with baby insert. Newly washed and ready for the next baby! R600 Collect Kenilworth',
  ['IMG-20241117-WA0022.jpg']::text[],
  600,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 11:49 am',
  '+27 76 183 7770',
  'Cotton On Baby Christmas Mariah Carey T -Shirt
Size: 6-12 months
Price: R100
Condition: Brand New with Tag
Collect Diep River
Cross Posting',
  ['IMG-20241212-WA0024.jpg']::text[],
  100,
  'NEW',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 12:38 pm',
  '+27 82 783 3775',
  'Brand new Bibs De Lux, size 2, bought in Germany, collection Plumstead, R100',
  ['IMG-20241212-WA0036.jpg']::text[],
  100,
  'NEW',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 1:08 pm',
  '+27 71 324 1743',
  'Hi anyone selling knee pad socks maybe?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 1:34 pm',
  '+27 83 844 3975',
  'Chicco feeding chair with detachable table, chair can be strapped onto larger chair. R150. Collection Sunningdale.',
  ['IMG-20241212-WA0035.jpg']::text[],
  150,
  NULL,
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 1:38 pm',
  '+27 82 294 0890',
  'Electra humidifier. Excellent condition - R300. Collection in Constantia.',
  ['IMG-20241212-WA0034.jpg']::text[],
  300,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 2:03 pm',
  '+27 82 294 0890',
  'For hiking and outdoor enthusiasts, Osprey’s super comfortable top of the range child carrier (6 months to 4 yrs old), Poco Premium, packed full of useful features and with a good sized detachable day pack. In excellent condition.  Height adjustable for baby/child and has a fully adjustable back panel and hip belt to ensure Mum or Dad enjoy their day out too. My husband is 6ft2 and I''m 5ft and both of us used this with our kids comfortably. 
Price: R3000 
Collection in Constantia',
  ['IMG-20241212-WA0033.jpg']::text[],
  3000,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 2:44 pm',
  '+27 82 575 8271',
  'Bright and colorful baby play mat. Includes 4 dangly toys with make sounds when shaken. Can come apart to store. Good condition. R180. Collect in Constantia.',
  ['IMG-20241212-WA0032.jpg']::text[],
  180,
  'GOOD',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 2:46 pm',
  '+27 82 294 0890',
  'Melissa & Doug sound puzzles.
Pets - excellent condition R100
Motorised transport - good condition but missing 1 piece R70
Both together R150.
Collection: Constantia
Please DM if interested',
  ['IMG-20241212-WA0031.jpg']::text[],
  100,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 2:48 pm',
  '+27 71 530 5817',
  'Baby onesie 0-3 months
Excellent condition 
R80
Collect in Plattekloof 
Paxi or Pudo for buyers account 
Cross Posted',
  ['IMG-20241212-WA0030.jpg']::text[],
  80,
  'EXCELLENT',
  ['Plattekloof']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 3:19 pm',
  '+27 82 294 0890',
  'Fun wooden pop up people bus. Push down and release people and they jump out. Little ones love it. Excellent condition. 
Price: R100.
Collection: Constantia
Please direct message me.',
  ['IMG-20241212-WA0029.jpg']::text[],
  100,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 3:23 pm',
  '+27 82 294 0890',
  'Peppa & George Pig plushies.
Excellent condition.
Price: R200 for both.
Collection: Constantia
Please direct message me if interested.',
  ['IMG-20241212-WA0028.jpg']::text[],
  200,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 3:31 pm',
  '+27 82 294 0890',
  'Sophie The Giraffe teethers in good condition. 1 no longer squeaks. The little one never squeaked.
Price: R400 for the lot.
Collection: Constantia
Please direct message me if interested.',
  ['IMG-20241212-WA0027.jpg']::text[],
  400,
  'GOOD',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 4:28 pm',
  '+27 82 575 8271',
  'Starfish inflatable life vest- Inflatable life vest for age 1-2 with removable neck support. 11-15kg. R250. Collect in constantia. X posted.',
  []::text[],
  250,
  NULL,
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 6:25 pm',
  '+27 83 584 7692',
  'Beautiful Nursery Rhymes Book. Great condition, but no CD. R60. Collection in Bergvliet or Pudo/pargo at buyers expense. X posted.',
  ['IMG-20241212-WA0038.jpg']::text[],
  60,
  'VERY_GOOD',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 6:59 pm',
  '+27 72 864 5732',
  'Little White House Large Cot/ toddler bed with Sealy mattress- in good condition and has another side that can be put up to enclose it. Collection Rondebosch R 4000 neg.',
  ['IMG-20241212-WA0040.jpg']::text[],
  4000,
  'GOOD',
  ['Rondebosch']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 7:19 pm',
  '+27 76 183 7770',
  'Meadow Days Mobile and Cot Arm with batteries (and original box)
Brand: Tiny Love
Condition: Great
Price: R350
Collect Diep River
Cross Posting',
  ['IMG-20241212-WA0042.jpg']::text[],
  350,
  'VERY_GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:08 pm',
  '+27 82 562 7025',
  'Wilphi portable Bottle warmer. With 2 x Dr Browns wide neck bottle attachments and 1 x Nuk attachment. Excellent condition. New R1099, selling for R600. Collection Bergvliet, cross posted.',
  ['IMG-20241212-WA0043.jpg']::text[],
  1099,
  'EXCELLENT',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/12/24 9:10 pm',
  '+27 82 562 7025',
  'Dr Browns InstaFeed bottle warmer. Retails around R1000, selling for R600. Excellent condition. Collection Bergvliet, cross posted.',
  ['IMG-20241212-WA0044.jpg']::text[],
  1000,
  'EXCELLENT',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 8:35 am',
  '+27 82 681 5927',
  'BabyBjörn Baby Carrier Harmony 3D Mesh in great conditions with original box. It retails new for 5995, asking R2500- collection in Gardens or Newlands',
  ['IMG-20241213-WA0001.jpg']::text[],
  2500,
  NULL,
  ['Gardens','Newlands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 8:59 am',
  '+27 64 543 0834',
  'Anybody selling a sadie',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:19 am',
  '+27 76 183 7770',
  'WabbaNub Elephant Soft Toy and Pacifier (0-6 months) 
Condition: Brand new from the USA and sealed in packaging.
Price: R100
Collect Diep River.
Cross Posting.',
  ['IMG-20241213-WA0007.jpg']::text[],
  100,
  'NEW',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:21 am',
  '+27 76 183 7770',
  'Teethers
Brands: Pigeon, Woolworths, Baby Gund (bought in Ireland)
Condition: Good
Price: R60 for all 3
Collect Diep River.
Cross Posting.',
  ['IMG-20241213-WA0008.jpg']::text[],
  60,
  'GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:23 am',
  '+27 76 183 7770',
  'Leather Dummy Clip
Brands: Jean Kelly
Condition: Good
Price: R50
Collect Diep River.
Cross Posting.',
  ['IMG-20241213-WA0009.jpg']::text[],
  50,
  'GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:28 am',
  '+27 76 183 7770',
  'Bib Bundle (10 items)
Condition: Some new to used (we didn''t use many bibs)
Brands: 3 x Unknown, 1 x Woolworths, 1 x PnP, 5 x Mr Price
Price: R100
Collect Diep River.
Cross Posting.',
  ['IMG-20241213-WA0010.jpg']::text[],
  100,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:31 am',
  '+27 76 183 7770',
  'Woolworths Formal Shirt
80% cotton 20% linen
Size: 3-6 months
Price: R100
Condition: Great (never worn)
Collect Diep River
Cross Posting',
  ['IMG-20241213-WA0011.jpg']::text[],
  100,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:35 am',
  '+27 76 183 7770',
  '2 x "Jeans"
Size: 6-12 months
Brands: Disney Baby and Little Hero
Price: R100
Condition: Great
Collect Diep River
Cross Posting',
  ['IMG-20241213-WA0012.jpg']::text[],
  100,
  'VERY_GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:36 am',
  '+27 71 865 0872',
  'Bounce High Chair. Good condition. R150. Rondebosch east',
  ['IMG-20241213-WA0013.jpg']::text[],
  150,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:37 am',
  '+27 76 183 7770',
  '2 x Long Sleeve vests (grey and blue)
Size: 6-12 months
Brands: Mr Price
Price: R40
Condition: Good
Collect Diep River
Cross Posting',
  ['IMG-20241213-WA0014.jpg']::text[],
  40,
  'GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:45 am',
  '+27 76 183 7770',
  'Bear Shoes
Brand: Little Hero
Size: 2
Condition: New (never worn)
Price: R50
Collect: Diep River
Cross Posting.',
  ['IMG-20241213-WA0015.jpg']::text[],
  50,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 11:55 am',
  '+27 76 183 7770',
  '3 x soft toys/soothers
Brands: Snuggletime, Jolly Tots and Mr Price
Condition: New (never used)
Price: R100
Collect: Diep River
Cross Posting.',
  ['IMG-20241213-WA0016.jpg']::text[],
  100,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 12:53 pm',
  '+27 82 294 0890',
  'Matching unicorn melamine plate, cup and spoon set. Dishwasher safe. Excellent condition, cup has some scratches on it. 
Price: R50 for the set
Collection: Constantia',
  ['IMG-20241213-WA0017.jpg']::text[],
  50,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 12:53 pm',
  '+27 82 294 0890',
  'Munchkin infant soft tip spoons x 4. Fair condition. 
Price: R20 for all
Collection: Constantia',
  ['IMG-20241213-WA0018.jpg']::text[],
  20,
  'FAIR',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 12:53 pm',
  '+27 82 294 0890',
  'Vital toddler spoon and fork sets x 2. Good condition. 
Price: R60 per set. R100 for both sets.
Collection: Constantia',
  ['IMG-20241213-WA0019.jpg']::text[],
  60,
  'GOOD',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 12:53 pm',
  '+27 82 294 0890',
  'Marcus & Marcus baby & toddler silicone suction bowl. Excellent condition / as new. Dishwasher safe & microwave safe, although I never put it in the microwave. 
Price: R100
Collection: Constantia',
  ['IMG-20241213-WA0021.jpg']::text[],
  100,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 12:53 pm',
  '+27 82 294 0890',
  'Unbranded toddler silicone sectionalised suction plate in turquoise. Excellent condition / as new. Dishwasher safe. 
Price: R200 for both
Collection: Constantia',
  ['IMG-20241213-WA0020.jpg']::text[],
  200,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 12:53 pm',
  '+27 82 294 0890',
  'Unbranded toddler silicone sectionalised suction plate in green. Excellent condition / as new. Dishwasher safe. 
Price: R200 for both
Collection: Constantia',
  ['IMG-20241213-WA0022.jpg']::text[],
  200,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/13/24 1:09 pm',
  '+27 76 479 5579',
  'Kids kitchen sink play including A few toys. 
Uses water and needs batteries. Working condition with a small tear top right side ( the eye) cross posted. Collection kenwyn R90',
  ['IMG-20241213-WA0023.jpg']::text[],
  90,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 9:14 am',
  '+27 76 183 7770',
  'Avent Steriliser (SCF284) including manuals and box
Price: R800
Condition: Good except the operation light doesn''t turn on.
Collect: Diep River
Cross Posting.',
  ['IMG-20241214-WA0000.jpg']::text[],
  800,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 9:16 am',
  '+27 76 183 7770',
  'Avent Bottle Warmer (SCF355) including manuals and box
Price: R500
Condition: Great
Collect: Diep River
Cross Posting.',
  ['IMG-20241214-WA0002.jpg']::text[],
  500,
  'VERY_GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 9:17 am',
  '+27 76 183 7770',
  'Glass Bottle and Teat Combo
Brand: Philips Avent
What''s Included: 
2 x Philips Avent Natural Response Glass Baby Bottle 0m+ 120ml
2 x Philips Avent Natural Response Glass Baby Bottle 1m+ 240ml
6 x bottle seals
3 x size 1 natural teats
2 x size 2 natural teats
2 x size 3 natural teats
2 x size 4 natural teats
1 x extra cap fitting 
Price: R900
Collect: Diep River
Cross Posting.',
  ['IMG-20241214-WA0003.jpg']::text[],
  900,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 9:18 am',
  '+27 76 183 7770',
  'Travel Bottle and Food Warmer 
Brand: Tommee Tippee
Condition: Good
Price: R400
Collect: Diep River
Cross Posting.',
  ['IMG-20241214-WA0004.jpg']::text[],
  400,
  'GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 9:20 am',
  '+27 76 183 7770',
  '2 x Philips Avent Penguin Spout Cup
Age: 6m+
Condition: Like new (used once or twice)
Price: R200 for both
Collect: Diep River
Cross Posting.',
  ['IMG-20241214-WA0005.jpg']::text[],
  200,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 12:46 pm',
  '+27 83 549 1852',
  'Hello :) does anyone living in Southern Suburbs have high contrast tummy time books to sell that are affordable and in good/ excellent condition? Please direct message me with photos, price and your location/ suburb. Thank you 🔆',
  []::text[],
  NULL,
  'EXCELLENT',
  ['Southern Suburbs']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 8:33 pm',
  '+27 83 244 2953',
  'Unisex baby keepsake box 
R180
Muizenberg/Goodwood 
Cross posted',
  ['IMG-20241214-WA0013.jpg']::text[],
  180,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 8:34 pm',
  '+27 76 595 4501',
  'Girls 3-6 month tracksuit set
Brand new, never worn
Excellent condition
R100
Collection Retreat (near food lovers market) or pudo at buyers cost',
  ['IMG-20241214-WA0019.jpg']::text[],
  100,
  'NEW',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 8:34 pm',
  '+27 83 244 2953',
  'Pregnancy and baby journal 
R150
New
Muizenberg/Goodwood 
Cross posted',
  ['IMG-20241214-WA0020.jpg']::text[],
  150,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 8:36 pm',
  '+27 83 244 2953',
  'Hanging decor
Baby room
Grey
New
R30
Muizenberg/Goodwood',
  ['IMG-20241214-WA0021.jpg']::text[],
  30,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 8:36 pm',
  '+27 76 595 4501',
  'Baby vest, 0-3 month
Brand new, never worn
Excellent condition
R60
Collection Retreat (near food lovers market) or pudo at buyers cost',
  ['IMG-20241214-WA0022.jpg']::text[],
  60,
  'NEW',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 8:38 pm',
  '+27 83 244 2953',
  'Playgro fold & go playgym 
R230
Muizenberg/Goodwood 
Cross posted',
  ['IMG-20241214-WA0023.jpg']::text[],
  230,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 8:43 pm',
  '+27 83 244 2953',
  'Baby food squeeze spoon
Blue
R100
New
Muizenberg/Goodwood 
Cross posted',
  ['IMG-20241214-WA0024.jpg']::text[],
  100,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 8:47 pm',
  '+27 83 244 2953',
  'SnuggleRoo Travel 3in1 cover 
Grey
R130
Muizenberg/Goodwood 
Cross posted',
  ['IMG-20241214-WA0025.jpg']::text[],
  130,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/14/24 11:05 pm',
  '+27 83 444 6719',
  'Complete IKEA antilop feeding chair, with inflatable cushion insert, all straps and nibble and rest foot rest. Chair has gone through 2 babies so well used but all completely functional. R400 neg collect Bergvliet.',
  ['IMG-20241215-WA0001.jpg']::text[],
  400,
  NULL,
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/15/24 8:19 am',
  '+27 74 526 1072',
  'Bumbo seat with tray, great condition R200
Tommee Tippee nappy bin, great condition R100
Baby chair, comes as is. R100
Waterproof baby changing pad, good condition R60
📍Diep River 
Xposted',
  ['IMG-20241215-WA0003.jpg']::text[],
  200,
  'VERY_GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/15/24 4:03 pm',
  '+27 73 727 0511',
  'Closed bag of Huggies dry comfort size 2
Bought for R249.99
Selling for R170
Collection in Ottery/meet up close by.',
  ['IMG-20241215-WA0009.jpg']::text[],
  249,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 8:45 am',
  '+27 72 216 6840',
  'Baby bundle 500
Good condition
Collection Fishhoek',
  ['IMG-20241216-WA0000.jpg']::text[],
  500,
  'GOOD',
  ['Fish Hoek']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 8:51 am',
  '+27 72 660 5424',
  'Does anyone have a baby brezza and know how to use it in increments that aren’t 30ml?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:12 am',
  '+27 82 473 7690',
  'ErgoPouch 2.5 tog 0-3 month sleepsacks
Excellent condition 
R600 each
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0001.jpg']::text[],
  600,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:13 am',
  '+27 82 473 7690',
  'Newborn summer sleepsack.  Not sure what make
R80
Washed never used
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0009.jpg']::text[],
  80,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:13 am',
  '+27 82 473 7690',
  'Newborn from Portugal 
Excellent condition 
R70
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0008.jpg']::text[],
  70,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:15 am',
  '+27 82 473 7690',
  'Newborn knitted items from Portugal 
Excellent condition 
Matching set R70
Jersey R40
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0007.jpg']::text[],
  70,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:15 am',
  '+27 82 473 7690',
  '0-3 month matching set from Portugal 
Excellent condition 
R70 
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0006.jpg']::text[],
  70,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:16 am',
  '+27 82 473 7690',
  '0-3 month zip ups from Woolies
R50 each
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0005.jpg']::text[],
  50,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:17 am',
  '+27 82 473 7690',
  'Shein romper
3-6 months
Excellent condition -used once
R70
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0004.jpg']::text[],
  70,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:18 am',
  '+27 82 473 7690',
  'Shein dress 0-3 months
Washed never used
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0003.jpg']::text[],
  100,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 9:43 am',
  '+27 82 473 7690',
  'Tulips and tea baby wrap-washed never used
Retails for R570
Selling for R340
Paxi at buyers cost as I''m based in JHB',
  ['IMG-20241216-WA0002.jpg']::text[],
  570,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 10:45 am',
  '+27 82 546 0212',
  'Anyone by chance selling one of these?',
  ['IMG-20241216-WA0010.jpg']::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 11:03 am',
  '+27 82 824 6198',
  'Bugaboo Bee 5. Great, sturdy pram with forwards and back facing seat. Several recline positions and lie flat options with huge hood. R2400. Collect Claremont Upper',
  ['IMG-20241216-WA0011.jpg']::text[],
  2400,
  NULL,
  ['Claremont','Claremont Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 1:00 pm',
  '+27 73 169 4831',
  'Only Used once 
selling for R450',
  ['IMG-20241216-WA0013.jpg']::text[],
  450,
  'LIKE_NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/16/24 4:17 pm',
  '+27 84 964 4217',
  'Multi seat bumbo slate, still in new condition, used it only twice and my baby ddnt like it. Bought for 850 and selling it for 500, negotiable. Collection in parow valley.',
  ['IMG-20241216-WA0029.jpg']::text[],
  500,
  'NEW',
  ['Parow','Parow Valley']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 11:09 am',
  '+27 84 964 4217',
  'Angelcare bath seat grey pink, in new condition. Used few times. 350, collection in parow valley.',
  ['IMG-20241217-WA0005.jpg']::text[],
  350,
  'NEW',
  ['Parow','Parow Valley']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 11:52 am',
  '+27 68 273 8262',
  'Woolies pajamas
3-6 months
R70
Retreat',
  ['IMG-20241217-WA0008.jpg']::text[],
  70,
  NULL,
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 11:53 am',
  '+27 68 273 8262',
  'Woolies
6-12 momths
R60
Retreat',
  ['IMG-20241217-WA0011.jpg']::text[],
  60,
  NULL,
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 11:55 am',
  '+27 68 273 8262',
  'Naartjie top
Size 12-18 months
R100
Retreat',
  ['IMG-20241217-WA0012.jpg']::text[],
  100,
  NULL,
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 1:45 pm',
  '+27 66 587 1094',
  'Babysense summer sleep sack. Says ‘one size’. Never used. Bought for R530, selling for R250. Collection in Claremont.   Xposted.',
  ['IMG-20241013-WA0002.jpg']::text[],
  530,
  'NEW',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 3:01 pm',
  '+27 71 105 4595',
  'Baby bjorn carrier
R700 
Collection in mitchells plain',
  ['IMG-20241217-WA0018.jpg']::text[],
  700,
  NULL,
  ['Mitchells Plain']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 4:02 pm',
  '+27 72 507 4428',
  'Clicks - Bottle and food warmer, heats up baby''s milk and food quickly. Fits any bottle size and comes with grip tongs. Excellent condition, R150. Collection Sunningdale / Table View',
  ['IMG-20241217-WA0020.jpg']::text[],
  150,
  'EXCELLENT',
  ['Sunningdale','Table View']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 4:52 pm',
  '+27 83 584 7692',
  'Most beautiful Christmas Glove Puppet and a book, all in one. From America. Never used. R100. Collection Bergvliet or Pudo/Pargo at buyers expense. X posted.',
  ['IMG-20241217-WA0022.jpg']::text[],
  100,
  'NEW',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 6:18 pm',
  '+27 63 017 1933',
  'White compactum for 700 Rand, needs a bit of paint but is very sturdy and has lots of space. Collection in Hout Bay',
  ['IMG-20241217-WA0024.jpg']::text[],
  700,
  'GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 6:25 pm',
  '+27 76 994 0960',
  '3 bunnies. Very soft. Take all 3 together for R200. Constantia. XP',
  ['IMG-20241217-WA0025.jpg']::text[],
  200,
  NULL,
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 7:02 pm',
  '+27 71 382 8809',
  'Nursing pillow R200 - Kenwyn',
  ['IMG-20241217-WA0027.jpg']::text[],
  200,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/17/24 7:20 pm',
  '+27 76 595 4501',
  '*Baby Girl bundle 13 items*
-2 Yellow babygrows: woolworths (0-3 months) 
-5 Longsleeve vests: top two clicks, woolworths, ackermans, woolworths (0-3 months)
-3 Plain white vests: ackermans (new born)
-2 Pattern vests: carter''s, baby gear (0-3 months)
-1 Short dungaree: unknown brand (0-3 months)
 *R250* 
Bought pre-loved, selling because I have an over supply and need space. 
All good/fair condition, stain on neckline of polkadot vest and one of the white vests, other than that all good.
Collection: Retreat near food lovers, or pudo at buyers cost',
  ['IMG-20241217-WA0028.jpg']::text[],
  250,
  'FAIR',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:05 pm',
  '+44 7754 432718',
  'Nursing pillow with pink cover R100. Little used. Kenilworth. Cash only',
  ['IMG-20241218-WA0005.jpg']::text[],
  100,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:29 pm',
  '+27 66 224 1810',
  'Wooliesbabes swaddle 
Good condition, used once 
3-6m 
R100
Collect Ottery',
  ['IMG-20241218-WA0006.jpg']::text[],
  100,
  'GOOD',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:30 pm',
  '+27 66 224 1810',
  'Disney Baby onesie 
Brand new with tag 
0-3m 
R70 
Collect Ottery',
  ['IMG-20241218-WA0007.jpg']::text[],
  70,
  'NEW',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:33 pm',
  '+27 66 224 1810',
  'Ackermans bomber suit 
Received as gift but was never able to use it 
Never worn 
Newborn 
R60 
Collect Ottery',
  ['IMG-20241218-WA0008.jpg']::text[],
  60,
  'NEW',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:36 pm',
  '+27 66 224 1810',
  'Wooliesbabes onesie with matching hat  
Good condition, worn once 
1-3m 
R50 
Collect Ottery',
  ['IMG-20241218-WA0009.jpg']::text[],
  50,
  'GOOD',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:38 pm',
  '+27 66 224 1810',
  'Disney Baby pants and hoodie set 
Good condition 
0-3m 
R50
Collect Ottery',
  ['IMG-20241218-WA0010.jpg']::text[],
  50,
  'GOOD',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:40 pm',
  '+27 66 224 1810',
  'Disney baby onesie 
Never worn 
0-3m
R70 
Collect Ottery',
  ['IMG-20241218-WA0011.jpg']::text[],
  70,
  'NEW',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:41 pm',
  '+27 66 224 1810',
  'Disney Baby set 
Good condition, worn once 
Newborn 
R50
Collect Ottery',
  ['IMG-20241218-WA0012.jpg']::text[],
  50,
  'GOOD',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 12:44 pm',
  '+27 66 224 1810',
  'Earth Child pants and top 
Received as gift but was never able to use it 
Never worn 
0-3m
R80 for both  
Collect Ottery',
  ['IMG-20241218-WA0013.jpg']::text[],
  80,
  'NEW',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 1:32 pm',
  '+27 84 825 7377',
  'Still available. FIL did not collect
Baby Lounger Bassinet Bed. R350
Was great for playtime, naps and travel. Can zip up for easy transport. Has two pockets. Covers can be unzipped for easy cleaning. 
  
- Size : 85 x 45 x 12 cm (taken from site purchased)
Collection in Kuils River. X posted',
  ['IMG-20241218-WA0015.jpg']::text[],
  350,
  NULL,
  ['Kuils River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 2:31 pm',
  '+27 84 060 6121',
  'Boni camp cot 
Including mattress and pillow breathable 
X posted 
Price R 800
Collection Belgravia 
Condition Used',
  ['IMG-20241218-WA0019.jpg']::text[],
  800,
  'POOR',
  ['Belgravia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 6:32 pm',
  '+27 83 679 3328',
  'Pigeon rapid steam sterilizer 
Very good condition 
R800
Collection in Somerset west',
  ['IMG-20241218-WA0021.jpg']::text[],
  800,
  'VERY_GOOD',
  ['Somerset West']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 6:43 pm',
  '+27 83 679 3328',
  'Joie Steadi car seat 
Suitable for 0-18kg
Very good condition 
R2000
Collection in Somerset west',
  ['IMG-20241218-WA0023.jpg']::text[],
  2000,
  'VERY_GOOD',
  ['Somerset West']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 6:49 pm',
  '+27 71 865 0872',
  'Boni stroller / pram. Still in good condition but needs a clean. R400. Rondebosch east. Xposted',
  ['IMG-20241218-WA0025.jpg']::text[],
  400,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 6:53 pm',
  '+27 83 244 2953',
  'tiny tots 
3-6 months
R40
Muizenberg/Goodwood',
  ['IMG-20241218-WA0026.jpg']::text[],
  40,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 6:53 pm',
  '+27 83 244 2953',
  'Baby Cat & Jack
3-6 months
R80
Muizenberg/Goodwood',
  ['IMG-20241218-WA0028.jpg']::text[],
  80,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 6:53 pm',
  '+27 83 244 2953',
  'Adidas
3-6 months
R100
Muizenberg/Goodwood',
  ['IMG-20241218-WA0027.jpg']::text[],
  100,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 6:54 pm',
  '+27 83 244 2953',
  'Woolworths
3-6 months
R80
Muizenberg/Goodwood',
  ['IMG-20241218-WA0029.jpg']::text[],
  80,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 6:54 pm',
  '+27 83 244 2953',
  'tiny tots 
3-6 months
R40
Muizenberg/Goodwood',
  ['IMG-20241218-WA0030.jpg']::text[],
  40,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 7:06 pm',
  '+27 63 017 1933',
  'Mastela 3-in-1 Deluxe Multi-Function Bassinet Electric Baby Rocker. Plays 15 melodies and has 3 different timer settings. It''s in excellent condition. Selling for 900 Rand. Collection in Hout Bay or can arrange to meet in town / Constantia or Seapoint.',
  ['IMG-20241218-WA0031.jpg']::text[],
  900,
  'EXCELLENT',
  ['Constantia','Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 7:11 pm',
  '+27 83 679 3328',
  'Lyssa Love baby carrier 
Includes a sheep-skin inner for extra warmth and comfort.
Includes a bag.
Basically new, only used a few times.
R500
Collection in Somerset west',
  ['IMG-20241218-WA0032.jpg']::text[],
  500,
  NULL,
  ['Somerset West']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 7:12 pm',
  '+27 63 017 1933',
  'Moon Child Pikler Triangle, in great condition. It''s hardly used as my daughter didn''t like it that much. 900 Rand, collection in Hout Bay or can arrange to meet in town /Constantia / Seapoint',
  ['IMG-20241218-WA0033.jpg']::text[],
  900,
  'VERY_GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 7:16 pm',
  '+27 83 679 3328',
  'Woolies cot betting, includes:
- Duvet inner and cover
- Pillow and cover 
- Bumper inner and cover 
- x3 mattress fitted sheets 
Good condition 
R600 for the set 
Collection in Somerset west',
  ['IMG-20241218-WA0034.jpg']::text[],
  600,
  'GOOD',
  ['Somerset West']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 8:17 pm',
  '+27 73 805 7695',
  'Walker excellent condition 400R. Collection Sea Point.',
  ['IMG-20241218-WA0047.jpg']::text[],
  400,
  'EXCELLENT',
  ['Sea Point']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/18/24 8:17 pm',
  '+27 73 805 7695',
  'Horse excellent condition 4 in 1 rocking, riding, pushing and pulling. 900R Collection Sea Point.',
  ['IMG-20241129-WA0022.jpg']::text[],
  900,
  'EXCELLENT',
  ['Sea Point']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 12:06 pm',
  '+27 72 354 5095',
  'I have 3x maxi cosi pearls and 2 way iso fix bases for sale in the Grey dappled colour. All in good condition. Collection Newlands. First come first serve. R1500 for chair and base.',
  ['IMG-20241219-WA0003.jpg']::text[],
  1500,
  'GOOD',
  ['Newlands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 12:08 pm',
  '+27 72 354 5095',
  '1 Maxicosi Pearl in black with stripy head rest. Good condition. My daughter''s favorite. Straps a bit tight, so R1000 for this one. Collection in Newlands.',
  ['IMG-20241219-WA0005.jpg']::text[],
  1000,
  'GOOD',
  ['Newlands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 12:14 pm',
  '+27 84 298 5811',
  'Hi 🌸Anyone selling a Maxi Cosi Kori (or similar) bouncer?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 1:59 pm',
  '+27 78 789 4429',
  'Price drop r350 for both',
  []::text[],
  350,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:03 pm',
  '+27 76 786 6072',
  'Woolworths size 0 shoe with matching headband. Good condition, R80. Collection in Gatesville',
  ['IMG-20241219-WA0007.jpg']::text[],
  80,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:04 pm',
  '+27 76 786 6072',
  'Woolworths size 2 shoe. Good condition, R80. Collection in Gatesville',
  ['IMG-20241219-WA0008.jpg']::text[],
  80,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:08 pm',
  '+27 72 118 4955',
  '6 to 12 months Cotton On .Excellent condition R120. Collect Kenilworth',
  ['IMG-20241117-WA0029.jpg']::text[],
  120,
  'EXCELLENT',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:08 pm',
  '+27 72 118 4955',
  'Keedo 9 to 12 months. Beautiful thick stretchy cotton. Great condition R130. Collect Kenilworth',
  ['IMG-20241124-WA0023.jpg']::text[],
  130,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:09 pm',
  '+27 76 786 6072',
  'Woolies, New born legging bundle (7 leggings). Good condition, R170. Collection in Gatesville',
  ['IMG-20241219-WA0010.jpg']::text[],
  170,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:09 pm',
  '+27 72 118 4955',
  '9 to 12 months H&M vests. Great condition R100 for both. Collect Kenilworth',
  ['IMG-20240904-WA0014.jpg']::text[],
  100,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:09 pm',
  '+27 72 118 4955',
  '6 to 12 month Naartjie set. Super cute. Top has a back frill not properly seen in this pic. Good to very good condition R130. Collect Kenilworth Xposted',
  ['IMG-20241117-WA0013.jpg']::text[],
  130,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:09 pm',
  '+27 72 118 4955',
  '6 to 12 months girls'' summer bundle R120. 100% Cotton. Some items fair condition others good. (Woolies, naartjie, Peanuts,H&M, clicks) The cat sunglasses flip up. Please note that there is a tiny hole in bum of grey H&M leggings and a tiny hole in Peanuts tee. Collect Kenilworth Xposted',
  ['IMG-20241117-WA0016.jpg']::text[],
  120,
  'FAIR',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:09 pm',
  '+27 72 118 4955',
  '6 to 12 months woolies blue melange romper. Super cute. Very good condition R80. Collect Kenilworth',
  ['IMG-20241117-WA0027.jpg']::text[],
  80,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:10 pm',
  '+27 72 118 4955',
  '3 to 6 months girls 100% cotton bundle. Good condition. R120. (Woolies, Ackermans, Peekaboo) Collect Kenilworth Xposted',
  ['IMG-20241119-WA0044.jpg']::text[],
  120,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:10 pm',
  '+27 72 118 4955',
  '6 to 12 month pnp denim shorts with floral waistband. Cotton. Very good condition. R50 Collect Kenilworth. Xposted',
  ['IMG-20241212-WA0016.jpg']::text[],
  50,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:10 pm',
  '+27 72 118 4955',
  '6 to 12 month Cath Kids ditsy pink floral 100% summer cotton dress.  Good to very good condition. Can even be worn as a top as she grows. Just stunning R150. Collect Kenilworth Xposted',
  ['IMG-20241117-WA0014.jpg']::text[],
  150,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:10 pm',
  '+27 72 118 4955',
  'White and pale grey hooded bath towels. Woolies. 100% cotton.  Good condition. R100 for both. Collect Kenilworth',
  ['IMG-20241009-WA0015.jpg']::text[],
  100,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:11 pm',
  '+27 72 118 4955',
  'Brand new Fisher-Price soft grip spoons. Handle is different vegetables (tomato, peas in a pod, carrot, corn) R120 Collect Kenilworth',
  ['IMG-20241009-WA0016.jpg']::text[],
  120,
  'NEW',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:11 pm',
  '+27 72 118 4955',
  'Well loved Organic Ergobaby carrier with baby insert. Newly washed and ready for the next baby! R600 Collect Kenilworth',
  ['IMG-20241117-WA0022.jpg']::text[],
  600,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:11 pm',
  '+27 76 786 6072',
  'Cotton on and Woolies new born growers (7 growers) good condition. R200. Collection in Gatesville',
  ['IMG-20241219-WA0011.jpg']::text[],
  200,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:11 pm',
  '+27 72 118 4955',
  '3 to 6 months Naartjie boys cool cotton chinos. Excellent condition. R50. Collect Kenilworth',
  ['IMG-20241219-WA0012.jpg']::text[],
  50,
  'EXCELLENT',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:13 pm',
  '+27 76 786 6072',
  'Woolies new born long sleeve vests (one no name brand) good condition, 9 vests R180. Collection in Gatesville',
  ['IMG-20241219-WA0014.jpg']::text[],
  180,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 5:14 pm',
  '+27 76 786 6072',
  '4 Woolies new born short sleeve vests, good condition, R60. Collection in Gatesville',
  ['IMG-20241219-WA0015.jpg']::text[],
  60,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 8:24 pm',
  '+27 81 322 1128',
  'Hi Nifty Peeps, any baby monitors/cameras available please',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/19/24 8:29 pm',
  '+27 82 564 0854',
  'Bath & Changing Unit 
Selling for: R1800 (Retails for R2600)
Condition: Like New
Collection: Bergvliet
Cross Posted
Very useful in the early days and then all the way through to toddlerhood! 
This unit is the perfect multi-use station for you and your baby. Whether it''s changing nappies, outfits or taking a bath, this unit has all the storage you will need to keep all your essentials close at hand! The raised edges help keep baby safe during nappy changes and beneath the sturdy padded table is a bath.
The concealed bath features a practical drainage tube so it allows parents to easily empty the bath after use.
It comes complete with comfy padded changing mat and lots of storage trays underneath for your bath time and nappy changing essentials such as towels, powders and nappies! .
Lockable wheels make it easy to move around the room while offering stability during washing or changed',
  ['IMG-20241219-WA0020.jpg']::text[],
  1800,
  'NEW',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 7:18 am',
  '+27 64 721 1831',
  'Free. Collect Newlands. DM please',
  ['IMG-20241220-WA0000.jpg']::text[],
  0,
  NULL,
  ['Newlands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 7:42 am',
  '+27 76 994 0960',
  'As new. Maternity Belt. Helped so much with holding the bump weight. Retails for R300, selling for R100. Constantia XP',
  ['IMG-20241220-WA0001.jpg']::text[],
  300,
  NULL,
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 7:49 am',
  '+27 76 994 0960',
  'R50',
  ['IMG-20241220-WA0002.jpg']::text[],
  50,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 10:09 am',
  '+27 76 994 0960',
  'Changing mat with foam inner (thick) and genuine leather dummy strap. 
Both never used. 
Both for R100. Constantia XP',
  ['IMG-20241220-WA0003.jpg']::text[],
  100,
  'NEW',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 3:54 pm',
  '+44 7754 432718',
  'Brand new. Clipo vehicle mini bucket. R80. Kenilworth',
  ['IMG-20241220-WA0006.jpg']::text[],
  80,
  'NEW',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 5:03 pm',
  '+27 76 183 7770',
  'Meadow Days Mobile and Cot Arm with batteries (and original box)
Brand: Tiny Love
Condition: Great
Price: R300
Collect Diep River
Cross Posting',
  ['IMG-20241212-WA0042.jpg']::text[],
  300,
  'VERY_GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 5:06 pm',
  '+27 76 183 7770',
  'Travel Bottle and Food Warmer 
Brand: Tommee Tippee
Condition: Good
Price: R400
Collect: Diep River
Cross Posting.',
  ['IMG-20241214-WA0004.jpg']::text[],
  400,
  'GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 8:30 pm',
  '+44 7754 432718',
  'Beanies Buddy Collection owl. R60. Has been in cabinet. Kenilworth.',
  ['IMG-20241220-WA0007.jpg']::text[],
  60,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 8:31 pm',
  '+27 83 244 2953',
  'Size 1
R40
Muizenberg/Goodwood
Xposted',
  ['IMG-20241220-WA0008.jpg']::text[],
  40,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 8:31 pm',
  '+27 83 244 2953',
  'Playgro fold & go playgym 
R250
Muizenberg/Goodwood 
Xposted',
  ['IMG-20241220-WA0009.jpg']::text[],
  250,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 8:33 pm',
  '+44 7754 432718',
  'Rabbit. Slightly used. R60. Kenilworth.',
  ['IMG-20241220-WA0010.jpg']::text[],
  60,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/20/24 8:41 pm',
  '+27 83 244 2953',
  'Beanies 
R20 each
Muizenberg/Goodwood 
Xposted',
  ['IMG-20241220-WA0011.jpg']::text[],
  20,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 8:46 am',
  '+27 76 183 7770',
  'Teethers
Brands: Pigeon, Woolworths, Baby Gund (bought in Ireland)
Condition: Good
Price: R50 for all 3
Collect Diep River.
Cross Posting.',
  ['IMG-20241213-WA0008.jpg']::text[],
  50,
  'GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 9:29 am',
  '+27 71 865 0872',
  '*Reduced to R250* - if collected today ‼️ Boni stroller. Fair condition. Working but Needs clean. Rondebosch east . Xposted',
  []::text[],
  250,
  'FAIR',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 9:32 am',
  '+27 71 324 1743',
  'Hi anyone selling muslin blankets?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 10:14 am',
  '+27 76 183 7770',
  'Babysense Cuddlewrap Swaddle Blanket
Condition: Excellent (used twice because my baby hated being swaddled)
Price: R100
Collect in Diep River or can drop off in Kirstenhof/Tokai.
Cross Posting.',
  ['IMG-20241221-WA0008.jpg']::text[],
  100,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 10:14 am',
  '+27 76 183 7770',
  '6 Baby Blankets Bundle
Good to Excellent condition
3 x pink fleece blankets (2 x Ackermans and 1 Woolies)
1 x knitted blanket (Homemade)
2 x cotton blankets (Woolworths)
Price: R120
Collect in Diep River or can drop off in Kirstenhof/Tokai.
Cross Posting.',
  ['IMG-20241203-WA0030.jpg']::text[],
  120,
  'EXCELLENT',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 10:15 am',
  '+27 76 183 7770',
  '5 Receiving Blankets Bundle
Great Condition
3 x Yeah Baby (Cloud, blue polka dots and grey stripes)
1 x Pnp (pink and blue stripes)
1 x Squiggle (plain grey)
Price: R100
Collect in Diep River or can drop off in Kirstenhof/Tokai.
Cross Posting.',
  ['IMG-20241203-WA0031.jpg']::text[],
  100,
  'VERY_GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 1:01 pm',
  '+27 83 584 7692',
  'Finger puppets, a few have a googly eye missing, otherwise is great condition. R50 for all. Collection Bergvliet or Pudo/Pargo at buyers expense. X posted',
  ['IMG-20241221-WA0014.jpg']::text[],
  50,
  'VERY_GOOD',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 7:57 pm',
  '+27 64 031 0019',
  'It’s all packed up. Mattress cover is currently drying',
  ['IMG-20241221-WA0028.jpg']::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 8:50 pm',
  '+27 76 183 7770',
  'Avent Bottle and Food Warmer (SCF355) including manuals and box
Price: R500
Condition: Great
Collect: Diep River
Cross Posting.',
  ['IMG-20241214-WA0002.jpg']::text[],
  500,
  'VERY_GOOD',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 8:51 pm',
  '+27 76 183 7770',
  'Avent Steriliser (SCF284) including manuals and box
Price: R800
Condition: Good except the operation light doesn''t turn on.
Collect: Diep River
Cross Posting.',
  ['IMG-20241214-WA0000.jpg']::text[],
  800,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 8:54 pm',
  '+27 76 183 7770',
  'Snuggletime Pram Wedge (30 x 33cm)
Brand: Snuggletime
Condition: Excellent
Price: R50
Collect in Diep River
Cross Posting',
  ['IMG-20241203-WA0029.jpg']::text[],
  50,
  'EXCELLENT',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 8:55 pm',
  '+27 76 183 7770',
  'Premium MAXI Noola BabyPod - White and Silver (0-18months)
It comes with its own bag.
Condition: Excellent 
Price: R900
Collect Diep River or can drop in Tokai/Kirstenhof
Cross Posting.',
  ['IMG-20241203-WA0023.jpg']::text[],
  900,
  'EXCELLENT',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 8:57 pm',
  '+27 76 183 7770',
  'Chicco Next2Me CoSleeper (with carry bag and original box) PLUS linen
Extras: Self-made mattress protector, 2 x fitted sheets (white) AND 2 x waterproof fitted sheets.
Details: one side drops down for easy access to baby, different height levels, can tilt, can rock, can attach to bed with safety straps and folds into carry bag.
Condition: Like new
Price: R3800
Collect Diep River or can deliver to Tokai/Kirstenhof
Cross Posting',
  ['IMG-20241203-WA0007.jpg']::text[],
  3800,
  'NEW',
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/21/24 9:41 pm',
  '+27 82 731 8822',
  'Snuggletime bedside co-sleeper. 
Good condition 👍 
Includes storage/travel bag and three white sheets as well. 
R1700
Collection Sunningdale.',
  ['IMG-20241221-WA0038.jpg']::text[],
  1700,
  'GOOD',
  ['Sunningdale']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 9:37 am',
  '+27 63 017 1933',
  'Selling this solid wood Crib to Bed Cot on wheels that transforms into a toddler bed by removing the middle piece. The toddler bed and mattress are roughly 1.30 x 67cm The smaller baby cot is
77x61cm
Comes with foam mattresses for both sizes. It''s in fair condition, needs a bit of TLC and paint but is very sturdy and practical with the wheels. 1000 Rand, collection in Hout Bay or can arrange to meet in Seapoint / Constantia.',
  ['IMG-20241222-WA0002.jpg']::text[],
  1000,
  'FAIR',
  ['Constantia','Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:11 am',
  '+27 78 839 3292',
  'Woolies
Size: Prem
Price: R80
Condition: Great
Collect: Pinelands',
  ['IMG-20241222-WA0004.jpg']::text[],
  80,
  'VERY_GOOD',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:13 am',
  '+27 78 839 3292',
  'Woolies
Size: Newborn
Price: R80
Condition: good- worn once
Collect: Pinelands',
  ['IMG-20241222-WA0010.jpg']::text[],
  80,
  'LIKE_NEW',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:15 am',
  '+27 78 839 3292',
  'Woolies
Size: Newborn
Price: R120 for all 3 or R50 each 
Condition: Great- worn twice at most
Collect: Pinelands',
  ['IMG-20241222-WA0009.jpg']::text[],
  120,
  'LIKE_NEW',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:16 am',
  '+27 78 839 3292',
  'Woolies
Size: Newborn
Price: R60 for all 3
Condition: Great- worn twice at most
Collect: Pinelands',
  ['IMG-20241222-WA0008.jpg']::text[],
  60,
  'LIKE_NEW',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:17 am',
  '+27 78 839 3292',
  'Woolies
Size: Newborn
Price: R80 
Condition: Great- worn once
Collect: Pinelands',
  ['IMG-20241222-WA0007.jpg']::text[],
  80,
  'LIKE_NEW',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:20 am',
  '+27 78 839 3292',
  'Woolies
Size: Newborn
Price: R50 each 
Condition: Good- there is a tiny mark on the vest but the dungaree covers it. DM for a picture of the mark 
Collect: Pinelands',
  ['IMG-20241222-WA0006.jpg']::text[],
  50,
  NULL,
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:21 am',
  '+27 78 839 3292',
  'Woolies
Size: Newborn
Price: R60 for all 4 
Condition: Good
Collect: Pinelands',
  ['IMG-20241222-WA0005.jpg']::text[],
  60,
  'GOOD',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:22 am',
  '+27 78 839 3292',
  'Woolies
Size: Newborn
Price: R20 for both. 
Condition: never been worn
Collect: Pinelands',
  ['IMG-20241222-WA0011.jpg']::text[],
  20,
  'POOR',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:23 am',
  '+27 78 839 3292',
  'Woolies
Size: Newborn
Price: R100
Condition: Good
Collect: Pinelands',
  ['IMG-20241222-WA0012.jpg']::text[],
  100,
  'GOOD',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 11:25 am',
  '+27 78 839 3292',
  'Tommee Tippee Nappy Bin
Price: R200 
Condition: Great
Collect: Pinelands',
  ['IMG-20241222-WA0013.jpg']::text[],
  200,
  'VERY_GOOD',
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 12:15 pm',
  '+27 71 530 5817',
  'Earthchild 3-6 months
Excellent Condition 
R80
Collect in Plattekloof 
Paxi or Pudo for buyers account 
Cross Posted',
  ['IMG-20241222-WA0016.jpg']::text[],
  80,
  'EXCELLENT',
  ['Plattekloof']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 12:32 pm',
  '+27 76 786 6072',
  'Selling 0/1-3 month girl essentials; vests, leggings, growers etc. Dm for more info. Collection in Gatesville. Condition great-good.',
  []::text[],
  200,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 12:33 pm',
  '+27 76 786 6072',
  'Woolies 1-3m dress. Good condition. R100, collection in Gatesville',
  ['IMG-20241222-WA0017.jpg']::text[],
  100,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 12:34 pm',
  '+27 76 786 6072',
  'Keedo 0-3m dress. Never been worn. R100. Collection in Gatesville',
  ['IMG-20241222-WA0018.jpg']::text[],
  100,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 12:36 pm',
  '+27 76 786 6072',
  'Pnp 0-3m. Excellent condition. R50 collection in Gatesville',
  ['IMG-20241222-WA0019.jpg']::text[],
  50,
  'EXCELLENT',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 12:38 pm',
  '+27 76 786 6072',
  'Pnp 0-3m, good condition R50. Collection in Gatesville',
  ['IMG-20241222-WA0020.jpg']::text[],
  50,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 12:42 pm',
  '+27 76 786 6072',
  'Cotton on and cuddlesome 0-3 month sets. Good condition R150 for all. Collection in Gatesville',
  ['IMG-20241222-WA0021.jpg']::text[],
  150,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 12:51 pm',
  '+27 76 786 6072',
  'Woolies 1-3m romper. Excellent condition. R100 for all. Collection in Gatesville',
  ['IMG-20241222-WA0022.jpg']::text[],
  100,
  'EXCELLENT',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 1:17 pm',
  '+27 76 786 6072',
  'Woolies 1-3m, good condition. R80 for all. Collection in Gatesville',
  ['IMG-20241222-WA0023.jpg']::text[],
  80,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 1:19 pm',
  '+27 76 786 6072',
  'Woolies 1-3m, never been worn. R80. Collection in Gatesville',
  ['IMG-20241222-WA0024.jpg']::text[],
  80,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 1:21 pm',
  '+27 76 786 6072',
  'Woolies 1-3m. Good condition. R50. Collection in Gatesville',
  ['IMG-20241222-WA0025.jpg']::text[],
  50,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 1:28 pm',
  '+27 63 017 1933',
  'Baby Gate in good condition for 400 Rand, collection in Hout Bay',
  ['IMG-20241222-WA0026.jpg']::text[],
  400,
  'GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 2:50 pm',
  '+27 63 017 1933',
  'Surprisingly comfortable baby carrier in excellent condition for 250. Collection in Hout Bay or can arrange to meet in Constantia or Seapoint.',
  ['IMG-20241222-WA0027.jpg']::text[],
  250,
  'EXCELLENT',
  ['Constantia','Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 2:55 pm',
  '+27 63 017 1933',
  'Very cute Winnie Pooh Baby door jumper as good as new Attaches to door frames, adjustable height. 500 Rand, collection in Hout Bay or can arrange to meet in Seapoint/Constantia',
  ['IMG-20241222-WA0028.jpg']::text[],
  500,
  NULL,
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 4:05 pm',
  '+27 63 017 1933',
  'Selling this premium MAXI Noola Baby Pod for 800 Rand (sells new for 1500). It''s in great condition and comes with the Noola bag for easy transport.
Collection in Hout Bay or can arrange to meet in Seapoint or Constantia.',
  ['IMG-20241222-WA0029.jpg']::text[],
  800,
  'VERY_GOOD',
  ['Constantia','Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 4:58 pm',
  '+27 65 513 3654',
  'looking for something like this small and easy to fold',
  ['IMG-20241222-WA0031.jpg']::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 6:07 pm',
  '+27 71 324 1743',
  'Brand new slippers size 3.
Brand Woolworths 
Collection Hout bay or Wynberg,selling for R80',
  ['IMG-20241222-WA0033.jpg']::text[],
  80,
  'NEW',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 9:38 pm',
  '+27 84 404 3453',
  'Clevamama insert 
Good condition 
R80
Collection Rondebosch East or paxi/Uber at buyer''s cost',
  ['IMG-20241110-WA0007.jpg']::text[],
  80,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 9:39 pm',
  '+27 84 404 3453',
  '0-3 month bundle 
1x Baby Republic grower 
2x Woolworths popper sleepsuits (pink& purple)
1x Nanas very cute grey turban 
1x Ackermans floral grey sweater
1x Woolworths long-sleeved vest&pants 
2x Mini Boss short-sleeved vests 
R180 
Collection Rondebosch East or paxi/Uber at buyer''s cos',
  ['IMG-20240915-WA0010.jpg']::text[],
  180,
  NULL,
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/22/24 9:47 pm',
  '+27 84 404 3453',
  'Pink Bath Pillow 
Good condition, some fading due to drying in the sun
R80 
Collection Rondebosch East or uber at buyer''s cost',
  ['IMG-20241110-WA0008.jpg']::text[],
  80,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 9:17 am',
  '+27 82 783 3775',
  '0-6 month Christmas dress, good condition, R30, collection Plumstead',
  ['IMG-20241223-WA0001.jpg']::text[],
  30,
  'GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 9:18 am',
  '+27 82 783 3775',
  'Nurture One, good condition, R250, collection Plumstead',
  ['IMG-20241223-WA0002.jpg']::text[],
  250,
  'GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 9:20 am',
  '+27 82 783 3775',
  '2 x 100ml haakaas with lids and milk
bags and pads, R200, collection Plumstead',
  ['IMG-20241223-WA0003.jpg']::text[],
  200,
  NULL,
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 1:45 pm',
  '+27 79 272 9676',
  'Snuza Hero with new battery. R750 collect Observatory',
  ['IMG-20241223-WA0008.jpg']::text[],
  750,
  NULL,
  ['Observatory']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 2:00 pm',
  '+27 67 648 6116',
  'Baby changing mat with a small hole at the back
Used a few times
Selling for R100
Collection in grassy park',
  ['IMG-20241223-WA0009.jpg']::text[],
  100,
  NULL,
  ['Grassy Park']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 2:02 pm',
  '+27 71 865 0872',
  'Electric Bottle & food warmer. Well used but still works perfectly. R200. Rondebosch east. Xposted',
  ['IMG-20241223-WA0011.jpg']::text[],
  200,
  NULL,
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 2:06 pm',
  '+27 71 865 0872',
  'Tommee Tippee microwave sterilizer - very good condition R300. Rondebosch east. Xposted',
  ['IMG-20241223-WA0012.jpg']::text[],
  300,
  'VERY_GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 2:42 pm',
  '+27 72 507 4428',
  'Clicks - Bottle and food warmer, heats up baby''s milk and food quickly. Fits any bottle size and comes with grip tongs. Excellent condition, R100. Collection Sunningdale / Table View',
  ['IMG-20241217-WA0020.jpg']::text[],
  100,
  'EXCELLENT',
  ['Sunningdale','Table View']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:27 pm',
  '+27 76 786 6072',
  'One two three, 3-6M, worn once. R140 for both. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0014.jpg']::text[],
  140,
  'LIKE_NEW',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:28 pm',
  '+27 76 786 6072',
  'Mother’s choice, 3-6M, never been worn. R60. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0015.jpg']::text[],
  60,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:29 pm',
  '+27 76 786 6072',
  'Earthchild, 3-6M, never been worn. R110. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0016.jpg']::text[],
  110,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:30 pm',
  '+27 76 786 6072',
  'Woolies, 3-6M, great condition. R150 for all. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0017.jpg']::text[],
  150,
  'VERY_GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:32 pm',
  '+27 76 786 6072',
  'Woolies, 3-6M, never been worn. R110. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0018.jpg']::text[],
  110,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:32 pm',
  '+27 76 786 6072',
  'Ackermans, 3-6M, worn once. R50. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0019.jpg']::text[],
  50,
  'LIKE_NEW',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:33 pm',
  '+27 76 786 6072',
  'Ackermans, 3-6M, worn once. R55. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0020.jpg']::text[],
  55,
  'LIKE_NEW',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:35 pm',
  '+27 76 786 6072',
  'Woolies, 3-6M, worn once. R120. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0021.jpg']::text[],
  120,
  'LIKE_NEW',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:35 pm',
  '+27 76 786 6072',
  'Woolies, 3-6M, worn once. R120. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0022.jpg']::text[],
  120,
  'LIKE_NEW',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:36 pm',
  '+27 76 786 6072',
  'Woolies, 3-6M, never been worn. R120. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0023.jpg']::text[],
  120,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:37 pm',
  '+27 76 786 6072',
  'Ackermans, 3-6M, never been worn. R50. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0024.jpg']::text[],
  50,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:37 pm',
  '+27 76 786 6072',
  'Ackermans, 3-6M, never been worn. R100 for both. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0025.jpg']::text[],
  100,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:38 pm',
  '+27 76 786 6072',
  'Cotton on, 3-6M, never been worn. R55. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0026.jpg']::text[],
  55,
  NULL,
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:38 pm',
  '+27 76 786 6072',
  'Ackermans, 3-6M, worn once. R20. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0027.jpg']::text[],
  20,
  'LIKE_NEW',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 4:39 pm',
  '+27 76 786 6072',
  'H&M, 4-6M, good condition. R60. Collection in Gatesville or Aramex at buyers cost',
  ['IMG-20241223-WA0028.jpg']::text[],
  60,
  'GOOD',
  ['Gatesville']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 5:29 pm',
  '+27 84 060 6121',
  'Feeding seat 
Inner strap missing but still works 100 percent 
Price reduction R120
Collection Belgravia 
Condition Used',
  ['IMG-20241215-WA0010.jpg']::text[],
  120,
  'POOR',
  ['Belgravia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 5:29 pm',
  '+27 84 060 6121',
  'Crawling socks
Condition Used 
Price R50 for all
Collection Belgravia',
  ['IMG-20241215-WA0008.jpg']::text[],
  50,
  'POOR',
  ['Belgravia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 5:43 pm',
  '+27 84 060 6121',
  'Hi Any moms  near me selling a cot bumper perhaps I''m based in belgravia side',
  []::text[],
  NULL,
  NULL,
  ['Belgravia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/23/24 5:47 pm',
  '+27 61 035 2468',
  'Good afternoon does anybody have a camp cot mattress to sell please',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/24/24 10:00 am',
  '+27 72 864 5732',
  'Reduced to R3000',
  []::text[],
  3000,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/24/24 10:14 am',
  '+27 81 247 4247',
  'Doona and tommee tippee bottle warmer 
R4000
Gooood condition 
Collection in athlone or arrange a meet up',
  ['IMG-20241224-WA0002.jpg']::text[],
  4000,
  NULL,
  ['Athlone']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/24/24 11:34 am',
  '+27 84 060 6121',
  'Hi anyone close to me I''m in belgravia have toddler bedding for a toddler bed perhaps it''s a girl',
  []::text[],
  NULL,
  NULL,
  ['Belgravia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/24/24 12:03 pm',
  '+27 72 864 5732',
  'Little One Camp Cot Grey Black and Snuggle Time Mattress for sale. Both in good condition. R1000 for all. Collection Hout Bay.',
  ['IMG-20241224-WA0006.jpg']::text[],
  1000,
  'GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/24/24 10:11 pm',
  '+27 83 600 4711',
  'Crocs excellent condition. R200. Size 4. Collection in Sea Point, pudo or paxi at buyers cost. Xposted',
  ['IMG-20241224-WA0018.jpg']::text[],
  200,
  'EXCELLENT',
  ['Sea Point']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/25/24 10:16 am',
  '+27 63 017 1933',
  'Selling this cute INTEX mushroom pool for 220 Rand on great condition, only used twice. Collection in Hout Bay or can arrange meet up in Constantia /Seapoint /Claremont',
  ['IMG-20241211-WA0008.jpg']::text[],
  220,
  'VERY_GOOD',
  ['Constantia','Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/25/24 10:16 am',
  '+27 63 017 1933',
  'Very cute Winnie Pooh Baby door jumper as good as new Attaches to door frames, adjustable height. 500 Rand, collection in Hout Bay or can arrange to meet in Seapoint/Constantia',
  ['IMG-20241222-WA0028.jpg']::text[],
  500,
  'LIKE_NEW',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/25/24 10:17 am',
  '+27 63 017 1933',
  'Selling this premium MAXI Noola Baby Pod for 800 Rand (sells new for 1500). It''s in great condition and comes with the Noola bag for easy transport.
Collection in Hout Bay or can arrange to meet in Seapoint or Constantia.',
  ['IMG-20241222-WA0029.jpg']::text[],
  800,
  'VERY_GOOD',
  ['Constantia','Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/25/24 8:31 pm',
  '+27 63 064 9988',
  'Good evening everybody anybody by any chance have tommee tippee pacifiers for sale I''m in steenberg DM ME picture only for reference doesn''t have to be the exact same',
  ['IMG-20241225-WA0024.jpg']::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 11:39 am',
  '+27 79 130 7742',
  'Anyone selling a Bumbo Elipad? TIA',
  ['IMG-20241226-WA0004.jpg']::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 1:03 pm',
  '+27 83 490 4033',
  'Naartjie 6-12months |  R80 |  like new | collection in bergvliet | cross posted',
  ['IMG-20240816-WA0006.jpg']::text[],
  80,
  'NEW',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 1:04 pm',
  '+27 83 490 4033',
  'Woolies pajamas  | 6-12 months | R80 | like new | collection in bergvliet | cross posted',
  ['IMG-20240816-WA0005.jpg']::text[],
  80,
  'NEW',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 1:04 pm',
  '+27 83 490 4033',
  'Woolies 6-12 months | R40 | excellent condition | collection in Bergvliet',
  ['IMG-20240819-WA0005.jpg']::text[],
  40,
  'EXCELLENT',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 1:05 pm',
  '+27 83 490 4033',
  '0-3 months | R100 for both | excellent condition | collection in Bergvliet',
  ['IMG-20240929-WA0007.jpg']::text[],
  100,
  'EXCELLENT',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 1:05 pm',
  '+27 83 490 4033',
  'Mr Price shorts | 6-12 months | never worn | R40 | collection bergvliet | cross posted',
  ['IMG-20240816-WA0007.jpg']::text[],
  40,
  'NEW',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 1:06 pm',
  '+27 83 490 4033',
  '3-6 months cotton on t shirts | R100 for all 3 | collection in Bergvliet | cross posted',
  ['IMG-20240719-WA0017.jpg']::text[],
  100,
  NULL,
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 1:06 pm',
  '+27 83 490 4033',
  'Cotton on waffle pants | 3-6 months | like new | collection in bergvliet | cross posted | R40',
  ['IMG-20240711-WA0029.jpg']::text[],
  40,
  'NEW',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 1:06 pm',
  '+27 83 490 4033',
  'Mr Price board shorts | R40 | 6-12 months | excellent condition | collection in Bergvliet',
  ['IMG-20240901-WA0000.jpg']::text[],
  40,
  'EXCELLENT',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 4:02 pm',
  '+27 61 529 7511',
  'IKEA Sniglar Changing Table with Storage Boxes and Bumbo Changing Mat. Good condition. 
Entire set retails for R2800 new. R1600. 
Collect Woodstock',
  ['IMG-20241219-WA0004.jpg']::text[],
  2800,
  'GOOD',
  ['Woodstock']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 4:16 pm',
  '+27 61 529 7511',
  'Bumbo Changing Mat sold. changing table and caddies R1300 :-)',
  []::text[],
  1300,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 6:13 pm',
  '+27 82 823 8933',
  'Duplo giraffe. R40. good condition. Collection Plumstead xposted',
  ['IMG-20241226-WA0006.jpg']::text[],
  40,
  'GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 6:14 pm',
  '+27 82 823 8933',
  'Foam bath zoo animals. Fair condition but still has some life in them. Comes with a little bag. R50. Collection Plumstead xposted',
  ['IMG-20241226-WA0007.jpg']::text[],
  50,
  'FAIR',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 9:51 pm',
  '+27 83 600 4711',
  'Woolworths size 3. Never worn. R150. Collection in sea point. X posted.',
  ['IMG-20241226-WA0008.jpg']::text[],
  150,
  'NEW',
  ['Sea Point']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/26/24 9:54 pm',
  '+27 83 600 4711',
  'Nike size 3.5. R300. Never worn. Collection in Sea Point. X posted',
  ['IMG-20241226-WA0009.jpg']::text[],
  300,
  'NEW',
  ['Sea Point']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/27/24 3:14 pm',
  '+27 82 888 7900',
  'ISO a white compactum/chest of drawers with only horizontal drawers.
Budget R3000.
Please DM me.',
  []::text[],
  3000,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/27/24 4:00 pm',
  '+27 82 395 5029',
  'Unfortunately it says it can’t load the link, but thanks for trying',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/27/24 6:40 pm',
  '+27 84 460 8146',
  'B.Box spoon and Bib, plus 5 bibs and 4 bandana-bibs. All excellent condition. R150. Collection Tokai.',
  ['IMG-20241227-WA0010.jpg']::text[],
  150,
  'EXCELLENT',
  ['Tokai']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/27/24 7:41 pm',
  '+27 82 823 8933',
  'Maxi Cosi Axissfix Plus 360. Honestly this was a lifesaver for me. Very very good condition and never been in an accident. Newborn insert too. R4500 neg. Collection Plumstead XPosted',
  ['IMG-20241227-WA0011.jpg']::text[],
  4500,
  'VERY_GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '12/27/24 9:33 pm',
  '+27 73 471 6862',
  'https://chat.whatsapp.com/L1PSQR8w4v66uo0YdzKUn0',
  []::text[],
  8,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/26/25 11:39 am',
  '+27 73 153 1385',
  'Angelcare nappy bin. Good condition. R100. Plumstead',
  ['IMG-20250226-WA0018.jpg']::text[],
  100,
  'GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/26/25 11:40 am',
  '+27 73 153 1385',
  'Bottle steriliser. Fair condition. R100. Plumstead.',
  ['IMG-20250226-WA0019.jpg']::text[],
  100,
  'FAIR',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/26/25 11:41 am',
  '+27 73 153 1385',
  'Simply child bath cushion.
Great condition. R80. Plumstead.',
  ['IMG-20250226-WA0020.jpg']::text[],
  80,
  'VERY_GOOD',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/26/25 11:54 am',
  '+27 71 277 8959',
  'Co-Luxury Sleepers. We have two available from our twin girls. They are both in excellent condition, with mattress'' and mosquito nets, and rolling wheels for easy mobility. They can be adjusted for height, and zips on the side allow for connection on a bedside. R1.6K each (neg.) Collection in West Beach or Observatory.',
  ['IMG-20250226-WA0024.jpg']::text[],
  1,
  'EXCELLENT',
  ['Observatory','West Beach']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 10:05 am',
  '+27 83 395 9959',
  'Ko-coon nesting pod, in perfect condition, only used for 1 baby, with an extra cover (so 3 covers in total). We absolutely loved this pod. R2000 (R2970 new). Collection Tokai, X posted.',
  ['IMG-20250227-WA0004.jpg']::text[],
  2000,
  NULL,
  ['Tokai']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 10:06 am',
  '+27 79 496 1854',
  'Cute pop-up toy. Good condition with light wear. R100, collection Mowbray/pudo',
  ['IMG-20250227-WA0005.jpg']::text[],
  100,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 12:14 pm',
  '+27 83 288 7570',
  'Keepsake Baby print set and Baby''s first time book. R200. Collection Kenilworth. CP',
  ['IMG-20250227-WA0028.jpg']::text[],
  200,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 12:16 pm',
  '+27 83 355 9691',
  'Hi there, is anyone selling NOOLA ISOFIX BASE please? xx',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 12:17 pm',
  '+27 71 479 3588',
  'Stokke Pram. Good condition. R8000. Collection Heathfield/Claremont',
  ['IMG-20250227-WA0030.jpg']::text[],
  8000,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 12:21 pm',
  '+27 71 277 8959',
  '2 x Baby Gyms - R600 each OR R1.1K for both 😊
*Good condition with all toys the toys
*Easy to disemble and assemble
*Collection : West Beach or Observatory',
  ['IMG-20250227-WA0034.jpg']::text[],
  600,
  'GOOD',
  ['Observatory','West Beach']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 12:54 pm',
  '+27 71 277 8959',
  '2 x Electronic Baby Rockers R1K each
*Both in perfectly good condition. 
*They have different motion settings to motion speed
*One rocker swings (& vibrates) and the other bounces (with music)
Collection: West Beach or Observatory',
  ['IMG-20250227-WA0045.jpg']::text[],
  1,
  'GOOD',
  ['Observatory','West Beach']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:29 pm',
  '+27 84 404 3453',
  '18 - 24 months rash vest. Woolworths. Great condition. Collection Rondebosch East or uber or paxi at buyer''s cost. R80',
  ['IMG-20250227-WA0047.jpg']::text[],
  80,
  'VERY_GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:31 pm',
  '+27 84 404 3453',
  '12 - 18 months. GAP zip hoody. Good condition. R100. Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0048.jpg']::text[],
  100,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:32 pm',
  '+27 84 404 3453',
  'Woolworths puffer jacket. Reversible. Excellent condition. 18 - 24 months R140. Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0049.jpg']::text[],
  140,
  'EXCELLENT',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:37 pm',
  '+27 84 404 3453',
  'Adidas tracksuit. 9 - 12 months. R200. Good condition. Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0050.jpg']::text[],
  200,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:37 pm',
  '+27 84 404 3453',
  'Woolworths 3-6months romper. R50. Good condition. Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0051.jpg']::text[],
  50,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:38 pm',
  '+27 84 404 3453',
  'Woolworths romper and headband. Brand new. R100. Collection Rondebosch East or uber or paxi at buyer''s',
  ['IMG-20250227-WA0052.jpg']::text[],
  100,
  'NEW',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:39 pm',
  '+27 84 404 3453',
  'Woolworths tutu romper. R90. Great condition. 3 to 6 months. Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0053.jpg']::text[],
  90,
  'VERY_GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:40 pm',
  '+27 84 404 3453',
  'Mamas&papas dress. 3 to 6 months. Good condition. R60.  Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0054.jpg']::text[],
  60,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 1:41 pm',
  '+27 84 404 3453',
  'Woolworths tutu romper. Excellent condition. 1 to 3 months. R90. Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0055.jpg']::text[],
  90,
  'EXCELLENT',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:05 pm',
  '+27 72 868 1381',
  'Woolworths 
size 3
Good condition
R40 
Collection in Parklands or Claremont can be arranged
Cash or FNB geo payment accepted
X-posted',
  ['IMG-20250227-WA0058.jpg']::text[],
  40,
  'GOOD',
  ['Parklands','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:06 pm',
  '+27 72 868 1381',
  'Adidas original
Size 3-6mnths
Good condition
R50
Collection in Parklands or Claremont can be arranged
Cash or FNB geo payment accepted
X-posted',
  ['IMG-20250227-WA0059.jpg']::text[],
  50,
  'GOOD',
  ['Parklands','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:06 pm',
  '+27 72 868 1381',
  'Woolworths
Silicone bib
Great condition
R50
Collection in Parklands or Claremont can be arranged
Cash or FNB geo payment accepted
X-posted',
  ['IMG-20250227-WA0060.jpg']::text[],
  50,
  'VERY_GOOD',
  ['Parklands','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:07 pm',
  '+27 72 868 1381',
  'H&M summer shorts
Size 4-6 months
Great condition
R50 for both
Collection in Parklands or Claremont can be arranged
Cash or FNB geo payment accepted
X-posted',
  ['IMG-20250227-WA0061.jpg']::text[],
  50,
  'VERY_GOOD',
  ['Parklands','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:07 pm',
  '+27 72 868 1381',
  'H&M
Size 4-6mnths 
Great condition. Worn twice. Such a stunning little dress, perfect for spring
R70
Collection in Parklands or Claremont can be arranged Cash or FNB geo payment accepted
X-posted',
  ['IMG-20250227-WA0063.jpg']::text[],
  70,
  'VERY_GOOD',
  ['Parklands','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:09 pm',
  '+27 83 502 7640',
  'Dymples grower 
12months 
Fair condition 
R50 
Pickup in Claremont',
  ['IMG-20250227-WA0064.jpg']::text[],
  50,
  'FAIR',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:10 pm',
  '+27 83 502 7640',
  'Sprout grower
6-12Months 
Good condition 
R50 
Pickup in Claremont',
  ['IMG-20250227-WA0065.jpg']::text[],
  50,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:11 pm',
  '+27 83 502 7640',
  'Peteralexander grower 
6-12months 
Good condition 
R70 
Pickup in Claremont',
  ['IMG-20250227-WA0066.jpg']::text[],
  70,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:12 pm',
  '+27 83 502 7640',
  'Sprout grower 
6-12months 
Good condition
R70 
Pickup in Claremont',
  ['IMG-20250227-WA0068.jpg']::text[],
  70,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:13 pm',
  '+27 83 502 7640',
  'Mama&papas 
Swimming costume 
6-9months 
R80 
Pickup in Claremont',
  ['IMG-20250227-WA0069.jpg']::text[],
  80,
  NULL,
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:15 pm',
  '+27 83 502 7640',
  'Target 
Swimming costume 
6-12months 
Good condition 
R80 
Pickup in Claremont',
  ['IMG-20250227-WA0070.jpg']::text[],
  80,
  'GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 4:18 pm',
  '+27 83 502 7640',
  'Assorted shorts 
Sprout 
Target 
Seed 
Dymples 
Size 6-12month 
Fair condition 
R50each Bundle price R250 
Pickup in claremont',
  ['IMG-20250227-WA0071.jpg']::text[],
  50,
  'FAIR',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 6:43 pm',
  '+27 76 994 0960',
  'Baby Einstein Jumper. R1000. Constantia. XP',
  ['IMG-20250227-WA0075.jpg']::text[],
  1000,
  NULL,
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 8:23 pm',
  '+27 83 288 7570',
  'Selling  this hip seat carrier. Similar to the hiparoo brand but a different brand. Really great. Forward sitting or outward sitting. R300. Collect Kenilworth',
  ['IMG-20250227-WA0076.jpg']::text[],
  300,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/27/25 8:27 pm',
  '+27 74 715 5114',
  'Looking for a hands free breast pump',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/28/25 11:54 am',
  '+27 72 864 5732',
  'Ruby Melon Frame - R200 in good condition Collection Hout Bay',
  ['IMG-20250228-WA0015.jpg']::text[],
  200,
  'GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/28/25 12:25 pm',
  '+27 72 864 5732',
  'Xoxo nursing pillow R300. removable washable cover. In good condition. collection Hout Bay.',
  ['IMG-20250228-WA0016.jpg']::text[],
  300,
  'GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/28/25 12:25 pm',
  '+27 72 864 5732',
  'Boon Portable baby bath R200 Good Condition - Collection Hout Bay',
  ['IMG-20250228-WA0017.jpg']::text[],
  200,
  'GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/28/25 12:28 pm',
  '+27 72 864 5732',
  'Skiphop PlayMat Beige Animal themed
2 x dangling toys
Well used and in fair condition. R400 Collection Hout Bay',
  ['IMG-20250228-WA0018.jpg']::text[],
  400,
  'FAIR',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/28/25 12:30 pm',
  '+27 72 864 5732',
  'Ingenuity Wooden Frame Reversible Play Mat with dangles. In good condition. R750 Collection Hout Bay',
  ['IMG-20250228-WA0019.jpg']::text[],
  750,
  'GOOD',
  ['Hout Bay']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/28/25 1:03 pm',
  '+27 78 099 9691',
  'Hi Mommas, I am ISO baby books specifically for boys / gender neutral for 3 months and up.',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/28/25 6:29 pm',
  '+27 82 395 5029',
  'Swaddle set (3x SwaddleMe swaddles and 1x babysense swaddling blanket)  Excellent condition. Selling for R250. Collection in Plumstead.',
  ['IMG-20250228-WA0031.jpg']::text[],
  250,
  'EXCELLENT',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '2/28/25 10:11 pm',
  '+27 82 752 1495',
  'Hi there, anyone selling a rocking chair?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 10:20 am',
  '+27 82 426 5303',
  'Hand and footprint mould with frame (never used). R150. Collection in Constantia',
  ['IMG-20250301-WA0001.jpg']::text[],
  150,
  'NEW',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 11:10 am',
  '+27 83 287 1870',
  'Beautiful Ko-Coon Baby Cot plus Ko-Coon bassinet mattress (good/fair condition) and Ko-Coon cot bumper (great condition)
We never ended up using the cot. Condition like new. 
Lovely clean wood and hemp design 
45cm x 75cm x 68cm high
R 2500.00 
Collection in Wynberg Upper',
  ['IMG-20250301-WA0002.jpg']::text[],
  2500,
  'VERY_GOOD',
  ['Wynberg','Wynberg Upper']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 12:04 pm',
  '+27 76 595 4501',
  '*SnuggleRoo grey baby carrier wrap* 
Excellent condition, used a hand full of times, washed.
*R250* 
Collection: Retreat near food lovers market',
  ['IMG-20250301-WA0003.jpg']::text[],
  250,
  'EXCELLENT',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 12:07 pm',
  '+27 76 595 4501',
  '*Babysense baby cuddlewrap swaddle* 
(Grey & pink)
Excellent condition, hardly used, washed.
*R100* 
Collection: Retreat near food lovers market',
  ['IMG-20250301-WA0004.jpg']::text[],
  100,
  'EXCELLENT',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 12:09 pm',
  '+27 76 595 4501',
  '*Crochet baby bibs/collar* 
(Dark grey, brown)
Excellent condition, like new, hardly used, washed.
*R100 for both* 
Collection: Retreat near food lovers market',
  ['IMG-20250301-WA0005.jpg']::text[],
  100,
  'EXCELLENT',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 12:11 pm',
  '+27 76 595 4501',
  '*Milk bottle nursing cover or car seat cover* 
Good condition, used a few times, washed.
*R90* 
Collection: Retreat near food lovers market',
  ['IMG-20250301-WA0006.jpg']::text[],
  90,
  'GOOD',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 3:49 pm',
  '+27 82 562 7025',
  'Sadie Kids playpen with safety gate. Retails R2300 new, selling R1000 like new. Matt not included. 200 x 180 cm. Collection Bergvliet Cape Town.',
  ['IMG-20250301-WA0009.jpg']::text[],
  2300,
  'NEW',
  ['Bergvliet','Cape Town']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 5:45 pm',
  '+27 82 562 7025',
  'ERGOBABY EMBRACE carrier R1250 - excellent condition, collection bergvliet',
  ['IMG-20250301-WA0014.jpg']::text[],
  1250,
  'EXCELLENT',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/1/25 5:53 pm',
  '+27 76 595 4501',
  '*Baby changing pad* 
Good condition, small hole in fabric at the back due to getting hooked on a nail, used a few times.
*R90*   
Collection: Retreat near food lovers market',
  ['IMG-20250301-WA0015.jpg']::text[],
  90,
  'GOOD',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 10:19 am',
  '+27 82 562 7025',
  'Fischer Price tummy time pillow- plays music and vibrates R300 like new. Collection bergvliet',
  ['IMG-20250302-WA0023.jpg']::text[],
  300,
  'NEW',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 10:27 am',
  '+27 66 224 1810',
  'Car seat insert 
Good condition 
R120
Collect Ottery / Claremont',
  ['IMG-20250302-WA0024.jpg']::text[],
  120,
  'GOOD',
  ['Ottery','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 11:19 am',
  '+27 79 130 7742',
  'Vibrating, musical baby bouncer. Retails for R1249, *selling for R350*.
Great condition, all in working order (music and vibrating) battery operated, but the toy bar is a bit loose. *we tied it with a ribbon
Collection Harfield Village, Claremont.
Price slightly negotiable',
  ['IMG-20250302-WA0026.jpg']::text[],
  1249,
  'VERY_GOOD',
  ['Claremont','Harfield Village']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 12:21 pm',
  '+27 76 992 3318',
  'Baby Bjorn feeding chair. Foldable with tray that comes off for easy wash. R800. Collection Seapoint. Please DM me',
  ['IMG-20250302-WA0029.jpg']::text[],
  800,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 12:24 pm',
  '+27 82 684 6774',
  'Looking for a baby bjorn bouncer in the mesh material - if anyone is selling.',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:03 pm',
  '+27 72 118 4955',
  'Fitted sheet for camp cot. 100% cotton. Very good condition, Mr Price Baby. R60 Collect Kenilworth Xposted',
  ['IMG-20250302-WA0044.jpg']::text[],
  60,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:04 pm',
  '+27 72 118 4955',
  'White and pale grey hooded bath towels. Woolies. 100% cotton.  Good condition. R100 for both. Collect Kenilworth',
  ['IMG-20241009-WA0015.jpg']::text[],
  100,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:04 pm',
  '+27 72 118 4955',
  'Brand new Fisher-Price soft grip spoons. Handle is different vegetables (tomato, peas in a pod, carrot, corn) R120 Collect Kenilworth',
  ['IMG-20241009-WA0016.jpg']::text[],
  120,
  'NEW',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:04 pm',
  '+27 72 118 4955',
  '6 to 12 months Cotton On .Excellent condition R100. Collect Kenilworth',
  ['IMG-20241117-WA0029.jpg']::text[],
  100,
  'EXCELLENT',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:12 pm',
  '+27 83 229 7886',
  'Baby wombworld white noise & heartbeat machine.  Portable , 3 months old. Perfect condition.  Selling for R400 , collection in Loevenstein',
  ['IMG-20250302-WA0046.jpg']::text[],
  400,
  NULL,
  ['Loevenstein']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:13 pm',
  '+27 83 229 7886',
  'Woolies newborn suits. Worn about 3 times each. R80 for both,  collection in Loevenstein',
  ['IMG-20250302-WA0048.jpg']::text[],
  80,
  NULL,
  ['Loevenstein']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:14 pm',
  '+27 83 229 7886',
  '0- 3m baby sleep suit. R100. Collection in Loevenstein',
  ['IMG-20250302-WA0050.jpg']::text[],
  100,
  NULL,
  ['Loevenstein']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:15 pm',
  '+27 83 229 7886',
  'Baby inserts . R100 for both or R50 each. Collection in Loevenstein',
  ['IMG-20250302-WA0052.jpg']::text[],
  100,
  NULL,
  ['Loevenstein']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:17 pm',
  '+27 83 229 7886',
  '0_3m baby top and soft dungaree.  R100 , collection in Loevenstein',
  ['IMG-20250302-WA0054.jpg']::text[],
  100,
  NULL,
  ['Loevenstein']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:18 pm',
  '+27 83 229 7886',
  'Baby singing pull toy. Used twice . R80 . Collection in Loevenstein',
  ['IMG-20250302-WA0056.jpg']::text[],
  80,
  'LIKE_NEW',
  ['Loevenstein']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/2/25 2:19 pm',
  '+27 83 229 7886',
  'Woolies mittens and booties , brand new R50 collection in Loevenstein',
  ['IMG-20250302-WA0058.jpg']::text[],
  50,
  'NEW',
  ['Loevenstein']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 7:27 am',
  '+27 76 934 3676',
  'Weighted blanket R100. Collect Kirstenhof',
  ['IMG-20250303-WA0000.jpg']::text[],
  100,
  NULL,
  ['Kirstenhof']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 12:29 pm',
  '+27 78 135 4333',
  'Ubuntu baba stage 2 carrier. Excellent condition, only used a few times. R1200. Collection Constantia',
  ['IMG-20250303-WA0006.jpg']::text[],
  1200,
  'EXCELLENT',
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 1:05 pm',
  '+27 71 294 7803',
  'ISO Love to Dream sleep sacks. Preferably 0.1-1.5 TOG. 0-3m.
Southern Suburbs.',
  []::text[],
  NULL,
  NULL,
  ['Southern Suburbs']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 1:25 pm',
  '+27 82 546 0212',
  'Snookums breast milk storage bags, unopened box. R80. Collect in Stonehurst',
  ['IMG-20250303-WA0008.jpg']::text[],
  80,
  NULL,
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 1:31 pm',
  '+27 82 546 0212',
  'Tommee tippee dummies. Still in box, unused. R180 for 2 boxes of 2.Collect in Stonehurst',
  ['IMG-20250303-WA0010.jpg']::text[],
  180,
  'NEW',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 1:33 pm',
  '+27 82 546 0212',
  'Phillips Avent dummies. Unopened box of 2. R80 Collect in Stonehurst',
  ['IMG-20250303-WA0011.jpg']::text[],
  80,
  NULL,
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 1:42 pm',
  '+27 82 546 0212',
  'Ko-coon zipped swaddle. Dusty pink. We never used it, good condition but needs a bit of an iron. R180. Collect in Stonehurst',
  ['IMG-20250303-WA0012.jpg']::text[],
  180,
  'GOOD',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 1:50 pm',
  '+27 82 546 0212',
  'Baby soothers. Unused gifts. R60 each, R100 for both. Collect in Stonehurst',
  ['IMG-20250303-WA0015.jpg']::text[],
  60,
  'NEW',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 1:55 pm',
  '+27 82 546 0212',
  'Woolworths 6-12 denim dungarees. Never used, still has tag on. R80 collect in Stonehurst',
  ['IMG-20250303-WA0016.jpg']::text[],
  80,
  'NEW',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 1:58 pm',
  '+27 82 546 0212',
  'Woolworths baby girl 6-12 cardigan. Never used, tag still in. R100',
  ['IMG-20250303-WA0017.jpg']::text[],
  100,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 2:03 pm',
  '+27 82 546 0212',
  'Baba Fishees classic onesie. 6-12m R80. Collect in Stonehurst.',
  ['IMG-20250303-WA0018.jpg']::text[],
  80,
  NULL,
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 2:03 pm',
  '+27 74 106 1933',
  'Tommee Tippee bottle sterilizer. Never used. Unboxed but doesn’t fit my Bibs bottles.
R1500. Retails for R2299. 
X posted',
  ['IMG-20250303-WA0019.jpg']::text[],
  1500,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 2:15 pm',
  '+27 82 546 0212',
  'Jet 3-6m baby girl tracksuit, used a few times, still good condition, R50. Collect in Stonehurst',
  ['IMG-20250303-WA0021.jpg']::text[],
  50,
  'GOOD',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 2:24 pm',
  '+27 82 546 0212',
  'Snug portable nursing sleeve. R70. Comes with a bag. Collect in Stonehurst',
  ['IMG-20250303-WA0027.jpg']::text[],
  70,
  NULL,
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 2:26 pm',
  '+27 82 546 0212',
  'Woolworths summer outfit. 1-3m. Unused, tag still on. R70 Collect in Stonehurst',
  ['IMG-20250303-WA0028.jpg']::text[],
  70,
  'NEW',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 5:20 pm',
  '+27 76 934 3676',
  'Cow stuff toy with bell inside. Excellent condition R50. Collect Kirstenhof',
  ['IMG-20250303-WA0034.jpg']::text[],
  50,
  'EXCELLENT',
  ['Kirstenhof']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 6:22 pm',
  '+27 76 992 3318',
  'Grandpas workshop wooden walker, with rubber stoppers. Good condition. R400 Collection Seapoint. Please DM for details and more pics. Cross posted. Thank you',
  ['IMG-20250303-WA0032.jpg']::text[],
  400,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 6:45 pm',
  '+27 71 334 3938',
  'Longsleeve feeding bibs. Good condition. R90 each. Collection Malmesbury / Table View. Pudo/paxi to buyers acc',
  ['IMG-20250303-WA0039.jpg']::text[],
  90,
  'GOOD',
  ['Malmesbury','Table View']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 8:18 pm',
  '+27 79 272 9676',
  'OSFM 12x Pop-ins all in one with pop-in absorbers and boosters. 
Bought from a member on this group but I never used them. They were washed according to guidelines. Water tested. Excellent condition. 
Selling for R150 per nappy / R1800 for all. 
Will add in extra fleece liners for free. 
DM for extra photos. 
Collection Obs or Pudo.',
  ['IMG-20250303-WA0031.jpg']::text[],
  150,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 8:44 pm',
  '+27 81 247 4247',
  'Bugaboo car seat adapters 
R150
Good condition 
Collection in athlone',
  ['IMG-20250303-WA0042.jpg']::text[],
  150,
  'GOOD',
  ['Athlone']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 9:08 pm',
  '+27 72 118 4955',
  '6 to 12 months girls'' summer bundle R120. 100% Cotton. Some items fair condition others good. (Woolies, naartjie, Peanuts,H&M, clicks) The cat sunglasses flip up. Please note that there is a tiny hole in bum of grey H&M leggings and a tiny hole in Peanuts tee. Collect Kenilworth Xposted',
  []::text[],
  120,
  'FAIR',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 9:08 pm',
  '+27 72 118 4955',
  '6 to 12 month Cath Kids ditsy pink floral 100% summer cotton dress.  Good to very good condition. Can even be worn as a top as she grows. Just stunning R150. Collect Kenilworth Xposted',
  []::text[],
  150,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 9:11 pm',
  '+27 72 118 4955',
  'Keedo 9 to 12 months. Beautiful thick stretchy cotton. Great condition R130. Collect Kenilworth',
  ['IMG-20241124-WA0023.jpg']::text[],
  130,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 9:11 pm',
  '+27 72 118 4955',
  '6 to 12 months woolies blue melange romper. Super cute. Very good condition R80. Collect Kenilworth',
  ['IMG-20241117-WA0027.jpg']::text[],
  80,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 9:12 pm',
  '+27 72 118 4955',
  'Well loved Organic Ergobaby carrier with baby insert. Newly washed and ready for the next baby! R600 Collect Kenilworth',
  ['IMG-20241117-WA0022.jpg']::text[],
  600,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/3/25 9:13 pm',
  '+27 72 118 4955',
  '3 to 6 months girls 100% cotton bundle. Good condition. R120. (Woolies, Ackermans, Peekaboo) Collect Kenilworth Xposted',
  ['IMG-20241119-WA0044.jpg']::text[],
  120,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/4/25 11:49 am',
  '+27 76 595 4501',
  '*Snuggle Time baby boppy pillow* 
(Grey)
Excellent condition, used only a handful of times, comes with dust bag cover, washed.
*R150*  
Collection: Retreat near food lovers market',
  ['IMG-20250304-WA0035.jpg']::text[],
  150,
  'EXCELLENT',
  ['Retreat']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/4/25 3:19 pm',
  '+27 82 460 9944',
  'Baby bath R50 
Perfect condition 
Collection CBD or Constantia
Please DM if interested 
Cross posted',
  ['IMG-20250304-WA0039.jpg']::text[],
  50,
  NULL,
  ['CBD','Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/4/25 3:58 pm',
  '+27 83 790 7471',
  'Angelcare bath seat
Good Condition 
Collection Table view 
R200',
  ['IMG-20250304-WA0040.jpg']::text[],
  200,
  'GOOD',
  ['Table View']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/4/25 5:35 pm',
  '+27 79 514 7165',
  'Angelcare nappy bin
R150
Collect in Milnerton
Crossposted',
  ['IMG-20250304-WA0061.jpg']::text[],
  150,
  NULL,
  ['Milnerton']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/5/25 9:18 am',
  '+27 82 460 9944',
  'Mr Price Cot Bumper R70
Perfect condition 
L190xW30 cm
Collection Constantia
Cross Posted, DM me if interested',
  ['IMG-20250305-WA0003.jpg']::text[],
  70,
  NULL,
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/5/25 9:21 am',
  '+27 82 460 9944',
  'Cot Mobile R150 Perfect Condition 
Wooden arm and soft teddies. 
Collect in Constantia 
Cross posted, DM me if interested',
  ['IMG-20250305-WA0010.jpg']::text[],
  150,
  NULL,
  ['Constantia']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 0-1 year',
  '3/5/25 9:58 am',
  '+27 82 772 4286',
  '*Complete Graco Evo Trio Travel System designed for busy parents - has everything you need to start out with your new-born. suitable from birth to 15kg (approx. 3 years).
*Reversible pushchair (pram) seat unit with 3 recline positions to lie flat.
*Adjustable handle and calf support on pushchair (pram) for added comfort.
*One-hand fold mechanism for quick and easy folding of the pushchair (pram)
*Travel System includes car seat, footmuff, rain cover and graco evo basic carrycot.
R3100 or nearest offer.
Cross posting 
Collection in Pinelands 
DM for more information.',
  []::text[],
  3100,
  NULL,
  ['Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/24/25 5:26 pm',
  '+27 72 753 4198',
  '2-3 years
Good condition
R70
PUDO or PAXI',
  ['IMG-20250224-WA0019.jpg']::text[],
  70,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/24/25 5:33 pm',
  '+27 72 753 4198',
  'Plush teddy 
Good condition 
R40
PUDO or PAXI',
  ['IMG-20250224-WA0021.jpg']::text[],
  40,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/24/25 5:36 pm',
  '+27 72 753 4198',
  'Keedo jumpsuit
18-24 months
Good condition
R50
PUDO or PAXI',
  ['IMG-20250224-WA0022.jpg']::text[],
  50,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/24/25 5:37 pm',
  '+27 72 753 4198',
  '18-24 months
Good condition 
R40
PUDO or PAXI',
  ['IMG-20250224-WA0023.jpg']::text[],
  40,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/24/25 5:40 pm',
  '+27 72 753 4198',
  'Corduroy dress
2-3 years 
Good condition 
R40',
  ['IMG-20250224-WA0024.jpg']::text[],
  40,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/24/25 7:19 pm',
  '+27 64 906 5445',
  'Boys dungaree and top set. New and unworn. 
Brand: Pep
Size: 18-24 months 
Price: R100
Collection: Constantia Village or Kirstenhof',
  ['IMG-20250224-WA0025.jpg']::text[],
  100,
  NULL,
  ['Constantia','Kirstenhof','Constantia Village']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/24/25 9:33 pm',
  '+27 73 727 0511',
  'Adidas kids UK8 and a half 
Brand new, bought in Australia 
R500
Collection in Ottery',
  ['IMG-20250224-WA0029.jpg']::text[],
  500,
  'NEW',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 7:11 am',
  '+27 83 502 1016',
  'Anyone selling 
1. A Single Bed Bed Rail 
2. ⁠An everyday small pram for toddler',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 7:13 am',
  '+27 76 741 9297',
  'Winnie the pooh toddler bed 137x74cm. Include mattress. Good condition. R950. Collection Wynberg',
  ['IMG-20250225-WA0002.jpg']::text[],
  950,
  'GOOD',
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 7:29 am',
  '+27 73 017 9444',
  'ISO of a campcot in reasonable condition 🙏🏼',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 8:31 am',
  '+27 82 854 6219',
  'Camp cot in perfect condition. Used once. Comes with mattress. R900. Collection in Seapoint. Cross posted',
  ['IMG-20250225-WA0005.jpg']::text[],
  900,
  'LIKE_NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 9:26 am',
  '+27 74 953 0644',
  'Looking for secondhand trolley seat covers for babies please 🙏🏻',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 9:27 am',
  '+27 82 522 4479',
  'Anyone got any dress up as a book character costumes for 2yr old. Would love a fairy dress. I am in Kenilworth, so somewhere close for pick up please.',
  []::text[],
  NULL,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 11:10 am',
  '+27 64 519 5947',
  'Infantino flip 4 in 1 convertible carrier
R550
New (box is rather damaged but the carrier has never been used)
Meet up Muizenberg 
X posted',
  ['IMG-20250225-WA0020.jpg']::text[],
  550,
  NULL,
  ['Muizenberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 11:25 am',
  '+27 76 892 2319',
  'ISO clothing bundle 18-24 months - autumn/ winter clothes. Not fussy about girls/ boys colours',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 11:31 am',
  '+27 84 488 8777',
  '18-24m bundle R440 
Mix of Edgars, Ackermans and pnp clothing',
  ['IMG-20250225-WA0023.jpg']::text[],
  440,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 2:37 pm',
  '+27 83 368 8367',
  'Toddler teepee floor bed with railing. Mattress included. R2000. Can be disassembled for transportation. Collect Kirstenhof . Cross posted.',
  ['IMG-20250225-WA0025.jpg']::text[],
  2000,
  NULL,
  ['Kirstenhof']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 3:16 pm',
  '+27 83 777 9642',
  'LilleBaby 6-in-1 carrier from Newborn to Toddler.
Great condition.
Not available in SA
Selling for R1000
Collection in Claremont',
  ['IMG-20250225-WA0027.jpg']::text[],
  1000,
  'VERY_GOOD',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:06 pm',
  '+27 72 118 4955',
  'Naartjie 18 to 24 months cotton track shorts. Good condition R110 for both. Collect Kenilworth Xposted',
  ['IMG-20250225-WA0030.jpg']::text[],
  110,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:06 pm',
  '+27 72 118 4955',
  'Age 1.5 to 2 Woolies body warmer. Thin sherpa fleece lined with diamond stitching on outside. Super retro cute! Good to fair condition due to how sherpa fleece "wears" and small section of diamond stitching on back has come out. Not noticeable - but happy to send a pic. R100 Collect Kenilworth',
  ['IMG-20250225-WA0031.jpg']::text[],
  100,
  'FAIR',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:06 pm',
  '+27 72 118 4955',
  'Age 3 Naartjie super cool hoodie, 100% cotton. Very good condition R120. Collect Kenilworth',
  ['IMG-20250225-WA0032.jpg']::text[],
  120,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:07 pm',
  '+27 72 118 4955',
  'Size 4 woolies canvas shoes. Never worn. R80 Collect Kenilworth Xposted',
  ['IMG-20250225-WA0033.jpg']::text[],
  80,
  'NEW',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:07 pm',
  '+27 72 118 4955',
  'Size 4 Woolies velcro sandals. Good condition R80. Collect Kenilworth Xposted',
  ['IMG-20250225-WA0034.jpg']::text[],
  80,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:07 pm',
  '+27 72 118 4955',
  'Size 4 Woolies stokies. Good condition R40. Collect Kenilworth Xposted',
  ['IMG-20250225-WA0035.jpg']::text[],
  40,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:07 pm',
  '+27 72 118 4955',
  'Age 2 JK kids cotton top. Good condition except for white spec on extended arm. R30. Collect Kenilworth Xposted',
  ['IMG-20250225-WA0036.jpg']::text[],
  30,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:08 pm',
  '+27 72 118 4955',
  'Age 3 100% cotton tees. Very good condition Cotton On and Lizzard. R130 for both. Collect Kenilworth Xposted',
  ['IMG-20250225-WA0037.jpg']::text[],
  130,
  'VERY_GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:09 pm',
  '+27 72 118 4955',
  'Well loved Organic Ergobaby carrier with baby insert. Newly washed and ready for the next baby! R600 Collect Kenilworth',
  ['IMG-20241117-WA0022.jpg']::text[],
  600,
  NULL,
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:10 pm',
  '+27 72 118 4955',
  'FOUR Brand new Fisher-Price soft grip spoons. Handle is different vegetables (tomato, peas in a pod, carrot, corn) R120 Collect Kenilworth',
  ['IMG-20241009-WA0016.jpg']::text[],
  120,
  'NEW',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:11 pm',
  '+27 72 118 4955',
  'Kids/toddler sleeping bag. 115cm long, 59cm wide. No name and no tags. Good condition R120. Collect Kenilworth Xposted',
  ['IMG-20250225-WA0038.jpg']::text[],
  120,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:32 pm',
  '+27 76 892 2319',
  'ISO construction toys (trucks/diggers etc) and dinosaur toys 🦕 we seem to be going through a phase.',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 6:36 pm',
  '+27 72 118 4955',
  'Age 2 to 3 Naartjie t shirt. Age 2 Hurley t shirt. 100% cotton. Good condition. Note Hurley tees has a faded "look to it". R100 for both. Collect Kenilworth Xposted',
  ['IMG-20250225-WA0039.jpg']::text[],
  100,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 8:59 pm',
  '+27 63 252 2817',
  'Vans R400
UK toddler 4
New 
Knysna, can pudo 
Cross posted',
  ['IMG-20250225-WA0049.jpg']::text[],
  400,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 9:01 pm',
  '+27 63 252 2817',
  'Duplo Lego R120
Great condition 
Knysna , can pudo',
  ['IMG-20250225-WA0050.jpg']::text[],
  120,
  'VERY_GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 9:09 pm',
  '+27 63 252 2817',
  'Young living feather the owl - diffuser, humidifier, night light , sound machine 
Like new 
Knysna 
Includes barely used essential oil 
R480',
  ['IMG-20250225-WA0051.jpg']::text[],
  480,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/25/25 9:11 pm',
  '+27 63 252 2817',
  'Flippables limited collection- Nessie R100
New 
Knysna',
  ['IMG-20250225-WA0052.jpg']::text[],
  100,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 7:33 am',
  '+27 61 482 3804',
  'Size 9, original Tod''s immaculate condition. Wore twice. Collection Diep River. R300',
  ['IMG-20250226-WA0001.jpg']::text[],
  300,
  NULL,
  ['Diep River']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 9:37 am',
  '+27 64 750 6994',
  'Brand new earth child sandals .12-18 months .R200',
  ['IMG-20250226-WA0005.jpg']::text[],
  200,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 10:38 am',
  '+27 76 595 6359',
  'Toddler toilet ladder/ seat for potty training. R250. Collect in Wynberg.  Xposted',
  ['IMG-20250226-WA0012.jpg']::text[],
  250,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 11:07 am',
  '+27 63 252 2817',
  'Puzzle - 2 puzzles ,27 pcs in total R70
Like new 
Knysna',
  ['IMG-20250226-WA0013.jpg']::text[],
  70,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 11:09 am',
  '+27 67 068 7750',
  'Angel Jouet
R90
Good Condition
Collection Crawford / Wetton',
  ['IMG-20250226-WA0014.jpg']::text[],
  90,
  'GOOD',
  ['Crawford','Wetton']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 11:44 am',
  '+27 73 153 1385',
  'Cotton on denim shorts. New condition. Age 3. R80. Plumstead',
  ['IMG-20250226-WA0021.jpg']::text[],
  80,
  'NEW',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 2:50 pm',
  '+27 72 416 8775',
  'Crocs C6 great condition apart from a bit of wear on front edge from riding scooter. Reduced to R200 including Jibbitz. Collection CBD/Vredehoek  cross posting.',
  ['IMG-20250226-WA0027.jpg']::text[],
  200,
  'VERY_GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 3:01 pm',
  '+27 72 416 8775',
  '18-24 months Woolworths Dungarees, good condition R60 collection CBD, cross posting',
  ['IMG-20250226-WA0028.jpg']::text[],
  60,
  'GOOD',
  ['CBD']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 3:02 pm',
  '+27 72 416 8775',
  'Hoolies 12-18 months zip-up babygrow. R80 great condition Collection CBD cross posting',
  ['IMG-20250226-WA0029.jpg']::text[],
  80,
  'VERY_GOOD',
  ['CBD']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 3:02 pm',
  '+27 72 416 8775',
  'Walkmates size 5, good condition,  bit of wear on heel and fraying around straps. R100 ,collection CBD cross posting',
  ['IMG-20250226-WA0030.jpg']::text[],
  100,
  'GOOD',
  ['CBD']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 3:31 pm',
  '+27 73 940 5999',
  'Baby womb world camp cot 
Used like New 
R1300 negotiable',
  ['IMG-20250226-WA0032.jpg']::text[],
  1300,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:29 pm',
  '+27 71 517 5009',
  'Speedo armbands for sale. Reason for selling: my son has grown and can swim independently, so he no longer needs them.
*Brand:*
- Speedo
*Size:*
- One size
*Condition:*
- Used, but good
*Pricing:*
- R150
*Collection in Rondebosch, Cape Town* 
- Cross-posted  
- Cash or EFT',
  ['IMG-20250226-WA0034.jpg']::text[],
  150,
  NULL,
  ['Rondebosch']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:54 pm',
  '+27 76 595 6359',
  'Clicks shirt and Ackermans jeans. Both size 12-18m. R100. Collect in Wynberg',
  ['IMG-20250226-WA0035.jpg']::text[],
  100,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:54 pm',
  '+27 76 595 6359',
  'Woolies 12-18months R50. Collect in Wynberg',
  ['IMG-20250226-WA0036.jpg']::text[],
  50,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:55 pm',
  '+27 76 595 6359',
  'R60. Collect im Wynberg',
  ['IMG-20250226-WA0037.jpg']::text[],
  60,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:56 pm',
  '+27 76 595 6359',
  'Ackermans shorts 12-18m. R40. Collect in Wynberg',
  ['IMG-20250226-WA0039.jpg']::text[],
  40,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:57 pm',
  '+27 76 595 6359',
  'Mrp 6-12m , R40. Collect in Wynberg',
  ['IMG-20250226-WA0040.jpg']::text[],
  40,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:57 pm',
  '+27 76 595 6359',
  'Mrp size 1-2, R40. Collect in Wynberg',
  ['IMG-20250226-WA0041.jpg']::text[],
  40,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:58 pm',
  '+27 76 595 6359',
  'Woolies size 2, R30. Collect in Wynberg',
  ['IMG-20250226-WA0042.jpg']::text[],
  30,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:58 pm',
  '+27 76 595 6359',
  'Ackermans size 2-3y. R30. Collect in Wynberg',
  ['IMG-20250226-WA0043.jpg']::text[],
  30,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:58 pm',
  '+27 76 595 6359',
  'Mrp soze 2-3y, R30. Collect in Wynberg',
  ['IMG-20250226-WA0044.jpg']::text[],
  30,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:58 pm',
  '+27 76 595 6359',
  'Mrp size 1-2, R80. Collect in Wynberg',
  ['IMG-20250226-WA0045.jpg']::text[],
  80,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:59 pm',
  '+27 76 595 6359',
  'Both woolies size 2. R100. Collect in Wynberg',
  ['IMG-20250226-WA0046.jpg']::text[],
  100,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:59 pm',
  '+27 76 595 6359',
  'Mrp size 6. R50. Collect in Wynberg',
  ['IMG-20250226-WA0047.jpg']::text[],
  50,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:59 pm',
  '+27 76 595 6359',
  'Woolies size 7. R80. Collect in Wynberg',
  ['IMG-20250226-WA0048.jpg']::text[],
  80,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:59 pm',
  '+27 76 595 6359',
  'Size 6. Dont know the brand. R50. Collect in Wynberg',
  ['IMG-20250226-WA0049.jpg']::text[],
  50,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 5:59 pm',
  '+27 76 595 6359',
  'Size 6. Dont know the brand. R60. Collect in Wynberg',
  ['IMG-20250226-WA0050.jpg']::text[],
  60,
  NULL,
  ['Wynberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 6:11 pm',
  '+27 66 224 1810',
  'Bounce camp cot 
Like new / barely used 
No mattress 
R800
Collect Ottery',
  ['IMG-20250226-WA0051.jpg']::text[],
  800,
  'NEW',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/26/25 6:53 pm',
  '+27 82 376 4013',
  'Black PnP clothing legging. Size 1-2. Brand new. R40. Collect Plumstead. I can return it, thought I’d check whether someone was interested in taking it over',
  ['IMG-20250226-WA0052.jpg']::text[],
  40,
  'NEW',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 8:29 am',
  '+27 82 060 3056',
  'Vans size UK 7
Good condition
R500 (Paid R799)
Collect Muizenberg /Pudo at buyers cost
X Posted',
  ['IMG-20250220-WA0011.jpg']::text[],
  500,
  'GOOD',
  ['Muizenberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 8:30 am',
  '+27 82 060 3056',
  'Woolworths Swimsuit and Cap 
Size 3
Good condition
R199 (Reatils for R299)
Collect Muizenberg /Pudo at buyers cost 
X Posted',
  ['IMG-20250227-WA0000.jpg']::text[],
  199,
  'GOOD',
  ['Muizenberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 8:34 am',
  '+27 82 060 3056',
  'Woolworths shoes
Size 1&2
Good condition
R120 for both
Collect Muizenberg /Pudo at buyers cost
X Posted',
  ['IMG-20250227-WA0001.jpg']::text[],
  120,
  'GOOD',
  ['Muizenberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 8:38 am',
  '+27 82 307 4232',
  'Toys in good condition. R400 for all. Collection Greenpoint',
  ['IMG-20250227-WA0002.jpg']::text[],
  400,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 10:01 am',
  '+27 79 496 1854',
  'Brand new, R80. Collection Mowbray/pudo',
  ['IMG-20250227-WA0003.jpg']::text[],
  80,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 10:47 am',
  '+27 73 727 0511',
  'Age 2-3 year old dress, brand new. Would also work for a 1-2 year old.
R120
Collection in Ottery',
  ['IMG-20250227-WA0006.jpg']::text[],
  120,
  'NEW',
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 10:48 am',
  '+27 73 727 0511',
  '12-18 months girls dress
R120
Collection in Ottery',
  ['IMG-20250227-WA0007.jpg']::text[],
  120,
  NULL,
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 10:49 am',
  '+27 73 727 0511',
  'Girls 18-24 months dress 
R80
Collection in Ottery',
  ['IMG-20250227-WA0008.jpg']::text[],
  80,
  NULL,
  ['Ottery']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:08 am',
  '+27 72 753 4198',
  'Size 2-3Y
Excellent condition
R50
PUDO or PAXI',
  ['IMG-20250227-WA0009.jpg']::text[],
  50,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:09 am',
  '+27 72 753 4198',
  'New set of head bows
R45 for the 3
PUDO or PAXI',
  ['IMG-20250227-WA0010.jpg']::text[],
  45,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:09 am',
  '+27 73 727 0511',
  'Aaaah I’m unable to edit the post now. 😣 They’re all in good condition.',
  []::text[],
  NULL,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:15 am',
  '+27 72 753 4198',
  '12-18 M
Excellent condition, practically new
R120
PUDO or PAXI',
  ['IMG-20250227-WA0011.jpg']::text[],
  120,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:17 am',
  '+27 72 753 4198',
  '18-24M
Good condition
R45
PUDO/PAXI',
  ['IMG-20250227-WA0012.jpg']::text[],
  45,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:38 am',
  '+27 72 632 8952',
  '10 Headbands selling the bundle for R130. Brands Woolworths, 1 H&M and boutique store. Collection Strandfontein or Claremont. Alternatively we can PUDO or Paxi for clients own account',
  ['IMG-20250227-WA0014.jpg']::text[],
  130,
  NULL,
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:39 am',
  '+27 72 632 8952',
  '10 Headbands selling the bundle for R130. Brands Woolworths, 1 Keedo and boutique store. Collection Strandfontein or Claremont. Alternatively we can PUDO or Paxi for clients own account',
  ['IMG-20250227-WA0015.jpg']::text[],
  130,
  NULL,
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:40 am',
  '+27 71 423 0962',
  '*Cotton On Kids NBA Backpack -R250* Brand new. |  XPosted  | Collection Marina Da Gama, Muizenberg. Pudo, uber, courier service at buyers cost',
  ['IMG-20250227-WA0016.jpg']::text[],
  250,
  'NEW',
  ['Muizenberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:40 am',
  '+27 72 632 8952',
  '10 Headbands selling the bundle for R130. Brands Woolworths and boutique store. Collection Strandfontein or Claremont. Alternatively we can PUDO or Paxi for clients own account',
  ['IMG-20250227-WA0017.jpg']::text[],
  130,
  NULL,
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:44 am',
  '+27 72 632 8952',
  'Woolworths sequins dress in good condition size 2 selling for R150. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0018.jpg']::text[],
  150,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:45 am',
  '+27 72 632 8952',
  'Edgars dress in good condition size 2-3 selling for R150. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0019.jpg']::text[],
  150,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:46 am',
  '+27 72 632 8952',
  'Pick ‘n Pay tutu in excellent condition size 1-2 selling for R70. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0020.jpg']::text[],
  70,
  'EXCELLENT',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:47 am',
  '+27 71 423 0962',
  '*Cotton On Baby Swimsuits -R180 each.  Size 18-24months* Brand new   |  XPosted  | Collection Marina Da Gama, Muizenberg. Pudo, uber, courier service at buyers cost',
  ['IMG-20250227-WA0021.jpg']::text[],
  180,
  'NEW',
  ['Muizenberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:48 am',
  '+27 71 423 0962',
  '*Cotton On Baby Swimsuit - R180*           Size 12-18months* Brand new   |  XPosted  | Collection Marina Da Gama, Muizenberg. Pudo, uber, courier service at buyers cost',
  ['IMG-20250227-WA0022.jpg']::text[],
  180,
  'NEW',
  ['Muizenberg']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:53 am',
  '+27 72 632 8952',
  'Shein white dress could fit a child of 2-3 in excellent  condition selling for R100. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0023.jpg']::text[],
  100,
  'EXCELLENT',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 11:56 am',
  '+27 72 632 8952',
  'Woolworths jumpsuit with matching band in good condition size 3 selling for R150. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0024.jpg']::text[],
  150,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:07 pm',
  '+27 71 479 3588',
  'Ship rocker (brand unknown) good condition. R500. Collection Heathfield. Cross posting',
  ['IMG-20250227-WA0025.jpg']::text[],
  500,
  'GOOD',
  ['Heathfield']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:07 pm',
  '+27 72 632 8952',
  'Pick n Pay dress with long sleeve top size 18-24months. Condition is fair as there is a mark on the top but dress is good condition selling for R70. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0026.jpg']::text[],
  70,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:11 pm',
  '+27 72 632 8952',
  'Woolworths jersey and shorts set in fair condition as the jersey has mark but shorts in excellent condition size 18-24months selling for R120. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0027.jpg']::text[],
  120,
  'EXCELLENT',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:15 pm',
  '+27 72 632 8952',
  'Naartjie full tracksuit in excellent condition size 2-3 selling for R200. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0029.jpg']::text[],
  200,
  'EXCELLENT',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:18 pm',
  '+27 72 632 8952',
  'Ackermans shorts in excellent condition size 2-3 selling both for R80. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0032.jpg']::text[],
  80,
  'EXCELLENT',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:20 pm',
  '+27 72 632 8952',
  'Clicks denim jean shorts in excellent condition size 18-24 months selling for R50. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0033.jpg']::text[],
  50,
  'EXCELLENT',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:31 pm',
  '+27 72 632 8952',
  '1 Woolworths and 3 Ackermans pjs in good condition size 2-3 selling the bundle for R300. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0035.jpg']::text[],
  300,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:33 pm',
  '+27 72 632 8952',
  '1 Woolworths and 3 Pick n Pay pjs in good condition size 2-3 selling the bundle for R260. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0036.jpg']::text[],
  260,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:35 pm',
  '+27 72 632 8952',
  'Ackermans dress and shirt set in good condition size 2-3 selling the bundle for R120. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0037.jpg']::text[],
  120,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:37 pm',
  '+27 72 632 8952',
  'Ackermans dress in good condition size 2-3 selling the bundle for R80. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0038.jpg']::text[],
  80,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:38 pm',
  '+27 72 632 8952',
  'Woolworths dress and matching headband brand new size 18-24 months selling for R120. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0039.jpg']::text[],
  120,
  'NEW',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:39 pm',
  '+27 72 632 8952',
  'Woolworths dress and matching headband brand new size 18-24 months selling for R120. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0040.jpg']::text[],
  120,
  'NEW',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:43 pm',
  '+27 72 632 8952',
  'Woolworths winter gown in good condition size 18-24 months selling for R90. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0041.jpg']::text[],
  90,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:44 pm',
  '+27 72 632 8952',
  'Woolworths winter gown in good condition size 18-24 months selling for R70. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0042.jpg']::text[],
  70,
  'GOOD',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:45 pm',
  '+27 72 632 8952',
  'Pick n Pay swimsuit in fair condition size 3-4 selling for R50. Collection Strandfontein or Claremont alternatively PUDO or Paxi for clients on account',
  ['IMG-20250227-WA0043.jpg']::text[],
  50,
  'FAIR',
  ['Strandfontein','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 12:47 pm',
  '+27 79 375 3861',
  'Original Elefante leather shoes 
Size: 6 
Condition: excellent worn once/ her feet grew quickly 🫣
Price: R300 
Location: Bothasig',
  ['IMG-20250227-WA0044.jpg']::text[],
  300,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 1:34 pm',
  '+27 84 404 3453',
  'Woolworths puffer jacket. Reversible. Excellent condition. 18 - 24 months R140. Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0049.jpg']::text[],
  140,
  'EXCELLENT',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 1:34 pm',
  '+27 84 404 3453',
  '12 - 18 months. GAP zip hoody. Good condition. R100. Collection Rondebosch East or uber or paxi at buyer''s cost',
  ['IMG-20250227-WA0048.jpg']::text[],
  100,
  'GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 1:34 pm',
  '+27 84 404 3453',
  '18 - 24 months rash vest. Woolworths. Great condition. Collection Rondebosch East or uber or paxi at buyer''s cost. R80',
  ['IMG-20250227-WA0047.jpg']::text[],
  80,
  'VERY_GOOD',
  ['Rondebosch','Rondebosch East']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 3:59 pm',
  '+27 84 375 6013',
  'Winter Sleep sac 
5-18 months 
Good condition 
R170
Century city',
  ['IMG-20250227-WA0056.jpg']::text[],
  170,
  'GOOD',
  ['Century City']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 4:07 pm',
  '+27 72 868 1381',
  'Back up due to non-collection. Sealed bag of 68 Pampers pants size 3. Bought a mega box but only used 1 bag from it. 
R190
Collection Parklands
Cash or FNB geo payment accepted 
X-posted',
  ['IMG-20250227-WA0062.jpg']::text[],
  190,
  NULL,
  ['Parklands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 4:11 pm',
  '+27 72 868 1381',
  'Keedo footless grower
12-18mnths
100% cotton
Paired with a matching headband (not keedo)
Lightly fleeced inner 
Good condition
R120
Collection in Parklands or Clarmeont can be arranged or/pudo/paxi at buyers expense
Cash or FNB geo payment
Xposted',
  ['IMG-20250227-WA0067.jpg']::text[],
  120,
  'GOOD',
  ['Parklands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/27/25 7:15 pm',
  '+27 78 958 8687',
  'ISO 2 baby gates',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 10:30 am',
  '+27 63 252 2817',
  'Soft toys 
New
Knysna 
R130',
  ['IMG-20250228-WA0007.jpg']::text[],
  130,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 1:24 pm',
  '+27 63 613 8684',
  'Angelcare baby monitor with box. Works perfectly. Just needs a charging cable for monitor. R1000. Collection Claremont.',
  ['IMG-20250228-WA0021.jpg']::text[],
  1000,
  NULL,
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 4:13 pm',
  '+27 72 753 4198',
  '18-24M
Great condition
R70
PUDO/PAXI. Alternatively DM for collection area',
  ['IMG-20250228-WA0026.jpg']::text[],
  70,
  'VERY_GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 4:14 pm',
  '+27 72 753 4198',
  '12-18M
Excellent condition
R20
PUDO/PAXI. DM for collection',
  ['IMG-20250228-WA0027.jpg']::text[],
  20,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 4:20 pm',
  '+27 83 457 7857',
  'H&M Dress excellent condition. R70. Size 12-18months. Collection Edgemead or paxi or pudo or Claremont.
 Xposted.',
  ['IMG-20250228-WA0028.jpg']::text[],
  70,
  'EXCELLENT',
  ['Edgemead','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 4:21 pm',
  '+27 72 753 4198',
  '2-3Y
Good condition
R70
PUDO/PAXI. DM for collection area',
  ['IMG-20250228-WA0029.jpg']::text[],
  70,
  'GOOD',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 4:24 pm',
  '+27 83 457 7857',
  'Size 2-3 R90. Collection Edgemead or paxi or pudo or Claremont. Xposted',
  ['IMG-20250228-WA0030.jpg']::text[],
  90,
  NULL,
  ['Edgemead','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 9:55 pm',
  '+27 83 457 7857',
  'R120 collection Edgemead or paxi or pudo or Claremont. Xposted',
  ['IMG-20250228-WA0034.jpg']::text[],
  120,
  NULL,
  ['Edgemead','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '2/28/25 10:11 pm',
  '+27 82 752 1495',
  'Anyone selling a rocking chair?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/1/25 7:16 am',
  '+27 82 446 8508',
  'In search of a Y-bike - preferably in the southern suburbs',
  []::text[],
  NULL,
  NULL,
  ['Southern Suburbs']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/1/25 7:17 am',
  '+27 82 752 1495',
  'Anyone selling “my first encyclopaedias”',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/1/25 2:32 pm',
  '+27 84 244 7073',
  'Reduced to R700',
  []::text[],
  700,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/1/25 3:50 pm',
  '+27 82 562 7025',
  'Sadie Kids playpen with safety gate. Retails R2300 new, selling R1000 like new. Matt not included. 200 x 180 cm. Collection Bergvliet Cape Town.',
  ['IMG-20250301-WA0009.jpg']::text[],
  2300,
  'NEW',
  ['Bergvliet','Cape Town']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/1/25 4:21 pm',
  '+27 82 472 0299',
  'Babygo Magnetic Safety locks. Box opened, never used. R200. Collect Plumstead',
  ['IMG-20250301-WA0010.jpg']::text[],
  200,
  'NEW',
  ['Plumstead']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/1/25 5:23 pm',
  '+27 71 517 5009',
  'Woolworths Heat Generation Long Sleeve Top & Pants 🩶
*Brand:*
- Woolworths 
*Size:*
- 4YRS 
*Condition:*
- Used, but in great condition
*Pricing:*
- R290 for both (top alone retails for R169)
*Collection in Rondebosch, Cape Town* 
- Cross-posted  
- Cash only',
  ['IMG-20250301-WA0013.jpg']::text[],
  290,
  'VERY_GOOD',
  ['Rondebosch']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/1/25 6:09 pm',
  '+27 67 068 7750',
  'Fisher Price Walker 
Good condition 
Has batteries already
R360
Crawford / Wetton / Pinelands',
  ['IMG-20250301-WA0016.jpg']::text[],
  360,
  'GOOD',
  ['Crawford','Wetton','Pinelands']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:17 am',
  '+27 82 821 2394',
  'Fisher price game toy. Good condition. R200. Collect Rondebosch of Gardens.',
  ['IMG-20250302-WA0007.jpg']::text[],
  200,
  'GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:17 am',
  '+27 82 821 2394',
  'Kids hobby horse. Great condition. Collect Rondebosch or Gardens. R100',
  ['IMG-20250302-WA0005.jpg']::text[],
  100,
  'VERY_GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:21 am',
  '+27 82 821 2394',
  '12-18 months shorts. Zara / River Island. Good condition. R100 for both. Collect Rondebosch or Gardens.',
  ['IMG-20250302-WA0004.jpg']::text[],
  100,
  'GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:22 am',
  '+27 82 821 2394',
  '2-3 H&M jeans. Great condition. R70. Collect Rondebosch or Gardens.',
  ['IMG-20250302-WA0013.jpg']::text[],
  70,
  'VERY_GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:23 am',
  '+27 82 821 2394',
  '2-3 H&M jeans. Great condition. R70. Collect Rondebosch or Gardens.',
  ['IMG-20250302-WA0011.jpg']::text[],
  70,
  'VERY_GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:23 am',
  '+27 82 821 2394',
  'Crocs C5. Good condition. R200. Collect Rondebosch or Gardens.',
  ['IMG-20250302-WA0012.jpg']::text[],
  200,
  'GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:23 am',
  '+27 82 821 2394',
  '2-3 yrs. 2 tops and 1 shorts unknown brand. Good condition. R90 for all. Collect Rondebosch or Gardens',
  ['IMG-20250302-WA0014.jpg']::text[],
  90,
  'GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:27 am',
  '+27 82 821 2394',
  'MooMoo kids sleep sac well loved. 18-36 months. Can’t remember the tog but I’d say 1.5 tog. R200. Collect Rondebosch or Gardens.',
  ['IMG-20250302-WA0015.jpg']::text[],
  200,
  NULL,
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:27 am',
  '+27 82 821 2394',
  'Portable baby travel / storage bag. Blue. Great condition. R120. Collect Rondebosch or Gardens',
  ['IMG-20250302-WA0017.jpg']::text[],
  120,
  'VERY_GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:27 am',
  '+27 82 821 2394',
  'Dotty Fish soft sole pre walkers. Never used. R100. Collect Rondebosch or Gardens',
  ['IMG-20250302-WA0016.jpg']::text[],
  100,
  'NEW',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:27 am',
  '+27 82 821 2394',
  '2-3 Fagottino long sleeve top. Great condition. R70. Collect Rondebosch or Gardens',
  ['IMG-20250302-WA0019.jpg']::text[],
  70,
  'VERY_GOOD',
  ['Rondebosch','Gardens']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 8:47 am',
  '+27 72 270 1324',
  'Anyone want to claim? Free. Fits 1-2 years. Some bigger some smaller! 
Pants have a little hole in the crotch.
Collect little Mowbray',
  ['IMG-20250302-WA0022.jpg']::text[],
  0,
  'FAIR',
  ['Mowbray','Little Mowbray']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 11:15 am',
  '+27 78 700 1372',
  'Hi anyone have a second hand pram',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 11:44 am',
  '+27 82 307 4232',
  'Thule
Pram - including bassinet(perfect condition hardly used) rain cover and skateboard for the back. The handle bar is unfortunately not working on extended setting. R8000. Collection Greenpoint',
  ['IMG-20250302-WA0027.jpg']::text[],
  8000,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 11:50 am',
  '+27 71 607 6883',
  'Anyone selling a stage 2 Ubuntu carrier?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 11:54 am',
  '+27 82 577 7663',
  'DokATot Grand. *Never used*. Protective cover included. Ages 9months-36months.  Retails for +R4500. Selling for R3300. Xposted. Collection in claremont or pudo at buyers expense.',
  ['IMG-20250302-WA0028.jpg']::text[],
  4500,
  'NEW',
  ['Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 11:59 am',
  '+27 72 270 1324',
  'The person who “hearted” my post hasn’t contacted me so I’m confirming with SIL.',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 12:21 pm',
  '+27 76 992 3318',
  'Baby Bjorn feeding chair. Foldable with tray that comes off for easy wash. R800. Collection Seapoint. Please DM me',
  ['IMG-20250302-WA0029.jpg']::text[],
  800,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 12:49 pm',
  '+27 81 369 8682',
  'Hi is anyone selling a busy/activity board please?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 1:18 pm',
  '+27 84 410 9218',
  'Anyone selling a baby walker?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 1:28 pm',
  '+27 64 750 6994',
  'R200',
  ['IMG-20250302-WA0030.jpg']::text[],
  200,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 1:37 pm',
  '+27 64 750 6994',
  'Hi some are new have not been worn and other worn once or twice .make me and offer if interested.Nike Jordan’s ,Woolies golden pumps,walking mates and crocs',
  ['IMG-20250302-WA0031.jpg']::text[],
  NULL,
  'LIKE_NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 1:37 pm',
  '+27 64 750 6994',
  'Toddlers size 2 and 3’s',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 1:59 pm',
  '+27 72 118 4955',
  'Age 2 cotton on denim skirt with pockets. Fair condition - samll mend at back. R30. Collect Kenilworth Xposted',
  ['IMG-20250302-WA0040.jpg']::text[],
  30,
  'FAIR',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 1:59 pm',
  '+27 72 118 4955',
  'Age 2 to 3 summer cotton bundle (woolies, jet, pnp) Good condition. R100 Collect Kenilworth Xposted',
  ['IMG-20250302-WA0041.jpg']::text[],
  100,
  'GOOD',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 1:59 pm',
  '+27 72 118 4955',
  'Disney glitter Prncess tote bag. 36cm by 24cm. Never used, but a mark on the single long strap. From the Disney store.R250. Collect Kenilworth Xposted',
  ['IMG-20250302-WA0042.jpg']::text[],
  250,
  'NEW',
  ['Kenilworth']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 2:04 pm',
  '+27 83 584 7692',
  'Size UK 9 Adidas Takkies. Both in great condition, apart from the circled bit on the pink pair, where there is a bit of foam exposed. Selling both for R500. Collection in Bergvliet. X posted',
  ['IMG-20250302-WA0043.jpg']::text[],
  500,
  'VERY_GOOD',
  ['Bergvliet']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 4:46 pm',
  '+27 79 299 2226',
  'In search of Thule stroller please',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/2/25 5:46 pm',
  '+27 84 851 9380',
  'Super warm Mickey Mouse outfit, excellent condition. Size 12-18m R80, collect in century city',
  ['IMG-20250302-WA0062.jpg']::text[],
  80,
  'EXCELLENT',
  ['Century City']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 7:28 am',
  '+27 76 934 3676',
  'Toddler sense book. Excellent condition.  R60. Collect Kirstenhof',
  ['IMG-20250303-WA0001.jpg']::text[],
  60,
  'EXCELLENT',
  ['Kirstenhof']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 7:28 am',
  '+27 76 934 3676',
  'Weighted blanket R100. Collect Kirstenhof',
  ['IMG-20250303-WA0000.jpg']::text[],
  100,
  NULL,
  ['Kirstenhof']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 8:28 am',
  '+27 69 470 7619',
  'I have a solid wood rolling single floor bed for sale. For R400.
DM for pics x',
  []::text[],
  400,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 9:11 am',
  '+27 82 522 4479',
  'Anyone selling toddler bed rails please?',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 9:28 am',
  '+27 82 520 7092',
  'Baby boy winter clothes bundle mixed for ages 1-2 years, 18-24 months and 2-3 years
All for R500, consists of 
1-2 years 
Gown x1
Pj set x1
Tracksuit top x1
Long sleeve t-shirt x2
18-24 months-
Tracksuit top x7
Pj sets x5
Long sleeve vests x3
Tracksuit pants x5
Woolen hats x2
Long sleeve tshirts x7
2-3 years-
Tracksuit tops x3
X1 long sleeve t-shirt 
X1 gown',
  []::text[],
  500,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 10:56 am',
  '+27 83 457 7857',
  'Filter stacking cups for bath or sensory play. Different filters. Have a carry handle. Excellent condition. R120. Collection Edgemead or paxi or pudo or Claremont.  Xposted.',
  ['IMG-20250303-WA0005.jpg']::text[],
  120,
  'EXCELLENT',
  ['Edgemead','Claremont']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 12:02 pm',
  '+27 61 070 6240',
  'ISO play kitchen set , pots , pans, lids etc.  Atlantic seaboard, town preferred',
  []::text[],
  NULL,
  NULL,
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  true
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 1:16 pm',
  '+27 72 200 9443',
  'Brand new super soft furry backpack purchased abroad zar 150 collection Bishopscourt or can drop off in Greenpoint pls dm me',
  ['IMG-20250303-WA0007.jpg']::text[],
  150,
  'NEW',
  ['Bishopscourt']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 1:25 pm',
  '+27 72 200 9443',
  'ZARA underwear tags still on size 2-3 wrong cut for my little one. I think she may have worn one of them once 😢 zar 100 for all collection Bishopscourt or can drop off in Greenpoint pls dm me',
  ['IMG-20250303-WA0009.jpg']::text[],
  100,
  'NEW',
  ['Bishopscourt']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 1:26 pm',
  '+27 82 546 0212',
  'Snookums breast milk storage bags, unopened box. R80. Collect in Stonehurst',
  ['IMG-20250303-WA0008.jpg']::text[],
  80,
  NULL,
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 1:45 pm',
  '+27 82 653 9880',
  'Single bed
Excellent condition
R750 slightly negotiable 
Needs to go asap
Has a bar on one side and has storage space underneath.
DM for more pictures',
  ['IMG-20250303-WA0013.jpg']::text[],
  750,
  'EXCELLENT',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 1:49 pm',
  '+27 82 546 0212',
  'Baby soothers. Unused gifts. R60 each, R100 for both. Collect in Stonehurst',
  ['IMG-20250303-WA0014.jpg']::text[],
  60,
  'NEW',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 1:56 pm',
  '+27 82 546 0212',
  'Woolworths 6-12 denim dungarees. Never used, still has tag on. R80 collect in Stonehurst',
  ['IMG-20250303-WA0016.jpg']::text[],
  80,
  'NEW',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 1:58 pm',
  '+27 82 546 0212',
  'Woolworths baby girl 6-12 cardigan. Never used, tag still in. R100',
  ['IMG-20250303-WA0017.jpg']::text[],
  100,
  'NEW',
  []::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 2:03 pm',
  '+27 82 546 0212',
  'Baba Fishees classic onesie. 6-12m R80. Collect in Stonehurst.',
  ['IMG-20250303-WA0018.jpg']::text[],
  80,
  NULL,
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 2:15 pm',
  '+27 82 546 0212',
  'Jet 3-6m baby girl tracksuit, used a few times, still good condition, R50. Collect in Stonehurst',
  ['IMG-20250303-WA0021.jpg']::text[],
  50,
  'GOOD',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 2:15 pm',
  '+27 72 200 9443',
  'Well loved 2-3y tracksuit bottoms and 2 jumpers. Marks as per photo but can be used for messy play. Zar 100 for all collection Bishopscourt or can drop off in Greenpoint pls dm me',
  ['IMG-20250303-WA0022.jpg']::text[],
  100,
  'FAIR',
  ['Bishopscourt']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 2:18 pm',
  '+27 72 200 9443',
  'Well loved leggings 2-3y zar 50 collection Bishopscourt or can drop off in Greenpoint pls dm me x',
  ['IMG-20250303-WA0024.jpg']::text[],
  50,
  'FAIR',
  ['Bishopscourt']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 2:19 pm',
  '+27 72 200 9443',
  'Woolworths 12-18m leggings zar 50 collection Bishopscourt or can drop off in Greenpoint pls dm me x',
  ['IMG-20250303-WA0025.jpg']::text[],
  50,
  'GOOD',
  ['Bishopscourt']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 2:24 pm',
  '+27 82 546 0212',
  'Snug portable nursing sleeve. R70. Comes with a bag. Collect in Stonehurst',
  ['IMG-20250303-WA0026.jpg']::text[],
  70,
  NULL,
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);
INSERT INTO listings (
  whatsapp_group, 
  date, 
  sender, 
  text, 
  images, 
  price, 
  condition, 
  collection_areas, 
  date_added, 
  checked_on,
  is_iso
) VALUES (
  'Nifty Thrifty 1-3 years',
  '3/3/25 2:26 pm',
  '+27 82 546 0212',
  'Woolworths summer outfit. 1-3m. Unused, tag still on. R70 Collect in Stonehurst',
  ['IMG-20250303-WA0028.jpg']::text[],
  70,
  'NEW',
  ['Stonehurst']::text[],
  '2025-03-06T13:21:08.483Z',
  '2025-03-06T13:21:08.483Z',
  false
);

-- Create indexes for better performance
CREATE INDEX idx_listings_whatsapp_group ON listings (whatsapp_group);
CREATE INDEX idx_listings_date ON listings (date);
CREATE INDEX idx_listings_price ON listings (price);
CREATE INDEX idx_listings_is_iso ON listings (is_iso);
