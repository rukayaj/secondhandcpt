// Generated from raw WhatsApp messages: nifty-thrifty-0-1-years-raw.ts
// Generated on: 2025-03-05T10:55:18.111Z
// Total potential listings: 9
// From 9 unique phone numbers

export interface RawWhatsAppMessage {
  id: string;
  date: string;
  time: string;
  phoneNumber: string;
  message: string;
  images: string[];
  hasPrice: boolean;
  priceValue: number | null;
}

export interface ListingCandidate extends RawWhatsAppMessage {
  isListing: boolean;
  isISO: boolean;
}

export const potentialListings: ListingCandidate[] = [
  {
    "id": "nifty-thrifty-0-1-years-1",
    "date": "12/05/23",
    "time": "09:15:32",
    "phoneNumber": "+27 82 123 4567",
    "message": "Hi everyone! I'm selling a baby cot in excellent condition. R800. Located in Claremont.",
    "images": [],
    "hasPrice": true,
    "priceValue": 800,
    "isListing": true,
    "isISO": false
  },
  {
    "id": "nifty-thrifty-0-1-years-5",
    "date": "12/05/23",
    "time": "10:30:15",
    "phoneNumber": "+27 84 567 8901",
    "message": "Selling baby clothes 0-3 months. All in good condition. R50 each or R200 for the lot.\nIMG-20230512-WA0001.jpg\nIMG-20230512-WA0002.jpg\nLocated in Sea Point.",
    "images": [
      "IMG-20230512-WA0001.jpg",
      "IMG-20230512-WA0002.jpg"
    ],
    "hasPrice": true,
    "priceValue": 50,
    "isListing": true,
    "isISO": false
  },
  {
    "id": "nifty-thrifty-0-1-years-7",
    "date": "12/05/23",
    "time": "12:20:10",
    "phoneNumber": "+27 86 789 0123",
    "message": "I have a baby bath for sale. Used only a few times. Like new condition. R150.\nIMG-20230512-WA0003.jpg\nCan deliver in Cape Town CBD area.",
    "images": [
      "IMG-20230512-WA0003.jpg"
    ],
    "hasPrice": true,
    "priceValue": 150,
    "isListing": true,
    "isISO": false
  },
  {
    "id": "nifty-thrifty-0-1-years-8",
    "date": "12/05/23",
    "time": "14:05:33",
    "phoneNumber": "+27 87 890 1234",
    "message": "Selling a Chicco stroller. R600. Good condition with minor wear.\nIMG-20230512-WA0004.jpg\nIMG-20230512-WA0005.jpg\nLocated in Rondebosch.",
    "images": [
      "IMG-20230512-WA0004.jpg",
      "IMG-20230512-WA0005.jpg"
    ],
    "hasPrice": true,
    "priceValue": 600,
    "isListing": true,
    "isISO": false
  },
  {
    "id": "nifty-thrifty-0-1-years-9",
    "date": "12/05/23",
    "time": "15:30:45",
    "phoneNumber": "+27 88 901 2345",
    "message": "Brand new baby bottles, never used. Still in original packaging. R80 for set of 3.\nIMG-20230512-WA0006.jpg\nPickup in Woodstock.",
    "images": [
      "IMG-20230512-WA0006.jpg"
    ],
    "hasPrice": true,
    "priceValue": 80,
    "isListing": true,
    "isISO": false
  },
  {
    "id": "nifty-thrifty-0-1-years-10",
    "date": "12/05/23",
    "time": "16:45:12",
    "phoneNumber": "+27 89 012 3456",
    "message": "ISO baby monitor with video. Budget around R500.",
    "images": [],
    "hasPrice": true,
    "priceValue": 500,
    "isListing": true,
    "isISO": true
  },
  {
    "id": "nifty-thrifty-0-1-years-11",
    "date": "12/05/23",
    "time": "17:20:30",
    "phoneNumber": "+27 82 345 6789",
    "message": "Selling baby toys suitable for 0-12 months. All in excellent condition. R30 each or R150 for all.\nIMG-20230512-WA0007.jpg\nIMG-20230512-WA0008.jpg\nLocated in Claremont.",
    "images": [
      "IMG-20230512-WA0007.jpg",
      "IMG-20230512-WA0008.jpg"
    ],
    "hasPrice": true,
    "priceValue": 0,
    "isListing": true,
    "isISO": false
  },
  {
    "id": "nifty-thrifty-0-1-years-12",
    "date": "12/05/23",
    "time": "18:10:25",
    "phoneNumber": "+27 83 567 8901",
    "message": "Baby carrier for sale. Ergobaby original. Used but in good condition. R350.\nIMG-20230512-WA0009.jpg\nPickup in Observatory.",
    "images": [
      "IMG-20230512-WA0009.jpg"
    ],
    "hasPrice": true,
    "priceValue": 350,
    "isListing": true,
    "isISO": false
  },
  {
    "id": "nifty-thrifty-0-1-years-13",
    "date": "12/05/23",
    "time": "19:05:40",
    "phoneNumber": "+27 84 678 9012",
    "message": "Selling newborn clothes, never worn. Some still with tags. R40 each or R300 for all 10 items.\nIMG-20230512-WA0010.jpg\nIMG-20230512-WA0011.jpg\nLocated in Green Point.",
    "images": [
      "IMG-20230512-WA0010.jpg",
      "IMG-20230512-WA0011.jpg"
    ],
    "hasPrice": true,
    "priceValue": 40,
    "isListing": true,
    "isISO": false
  }
];

// Listings grouped by phone number
export const listingsByPhone: Record<string, ListingCandidate[]> = {
  "+27 82 123 4567": [
    {
      "id": "nifty-thrifty-0-1-years-1",
      "date": "12/05/23",
      "time": "09:15:32",
      "phoneNumber": "+27 82 123 4567",
      "message": "Hi everyone! I'm selling a baby cot in excellent condition. R800. Located in Claremont.",
      "images": [],
      "hasPrice": true,
      "priceValue": 800,
      "isListing": true,
      "isISO": false
    }
  ],
  "+27 84 567 8901": [
    {
      "id": "nifty-thrifty-0-1-years-5",
      "date": "12/05/23",
      "time": "10:30:15",
      "phoneNumber": "+27 84 567 8901",
      "message": "Selling baby clothes 0-3 months. All in good condition. R50 each or R200 for the lot.\nIMG-20230512-WA0001.jpg\nIMG-20230512-WA0002.jpg\nLocated in Sea Point.",
      "images": [
        "IMG-20230512-WA0001.jpg",
        "IMG-20230512-WA0002.jpg"
      ],
      "hasPrice": true,
      "priceValue": 50,
      "isListing": true,
      "isISO": false
    }
  ],
  "+27 86 789 0123": [
    {
      "id": "nifty-thrifty-0-1-years-7",
      "date": "12/05/23",
      "time": "12:20:10",
      "phoneNumber": "+27 86 789 0123",
      "message": "I have a baby bath for sale. Used only a few times. Like new condition. R150.\nIMG-20230512-WA0003.jpg\nCan deliver in Cape Town CBD area.",
      "images": [
        "IMG-20230512-WA0003.jpg"
      ],
      "hasPrice": true,
      "priceValue": 150,
      "isListing": true,
      "isISO": false
    }
  ],
  "+27 87 890 1234": [
    {
      "id": "nifty-thrifty-0-1-years-8",
      "date": "12/05/23",
      "time": "14:05:33",
      "phoneNumber": "+27 87 890 1234",
      "message": "Selling a Chicco stroller. R600. Good condition with minor wear.\nIMG-20230512-WA0004.jpg\nIMG-20230512-WA0005.jpg\nLocated in Rondebosch.",
      "images": [
        "IMG-20230512-WA0004.jpg",
        "IMG-20230512-WA0005.jpg"
      ],
      "hasPrice": true,
      "priceValue": 600,
      "isListing": true,
      "isISO": false
    }
  ],
  "+27 88 901 2345": [
    {
      "id": "nifty-thrifty-0-1-years-9",
      "date": "12/05/23",
      "time": "15:30:45",
      "phoneNumber": "+27 88 901 2345",
      "message": "Brand new baby bottles, never used. Still in original packaging. R80 for set of 3.\nIMG-20230512-WA0006.jpg\nPickup in Woodstock.",
      "images": [
        "IMG-20230512-WA0006.jpg"
      ],
      "hasPrice": true,
      "priceValue": 80,
      "isListing": true,
      "isISO": false
    }
  ],
  "+27 89 012 3456": [
    {
      "id": "nifty-thrifty-0-1-years-10",
      "date": "12/05/23",
      "time": "16:45:12",
      "phoneNumber": "+27 89 012 3456",
      "message": "ISO baby monitor with video. Budget around R500.",
      "images": [],
      "hasPrice": true,
      "priceValue": 500,
      "isListing": true,
      "isISO": true
    }
  ],
  "+27 82 345 6789": [
    {
      "id": "nifty-thrifty-0-1-years-11",
      "date": "12/05/23",
      "time": "17:20:30",
      "phoneNumber": "+27 82 345 6789",
      "message": "Selling baby toys suitable for 0-12 months. All in excellent condition. R30 each or R150 for all.\nIMG-20230512-WA0007.jpg\nIMG-20230512-WA0008.jpg\nLocated in Claremont.",
      "images": [
        "IMG-20230512-WA0007.jpg",
        "IMG-20230512-WA0008.jpg"
      ],
      "hasPrice": true,
      "priceValue": 0,
      "isListing": true,
      "isISO": false
    }
  ],
  "+27 83 567 8901": [
    {
      "id": "nifty-thrifty-0-1-years-12",
      "date": "12/05/23",
      "time": "18:10:25",
      "phoneNumber": "+27 83 567 8901",
      "message": "Baby carrier for sale. Ergobaby original. Used but in good condition. R350.\nIMG-20230512-WA0009.jpg\nPickup in Observatory.",
      "images": [
        "IMG-20230512-WA0009.jpg"
      ],
      "hasPrice": true,
      "priceValue": 350,
      "isListing": true,
      "isISO": false
    }
  ],
  "+27 84 678 9012": [
    {
      "id": "nifty-thrifty-0-1-years-13",
      "date": "12/05/23",
      "time": "19:05:40",
      "phoneNumber": "+27 84 678 9012",
      "message": "Selling newborn clothes, never worn. Some still with tags. R40 each or R300 for all 10 items.\nIMG-20230512-WA0010.jpg\nIMG-20230512-WA0011.jpg\nLocated in Green Point.",
      "images": [
        "IMG-20230512-WA0010.jpg",
        "IMG-20230512-WA0011.jpg"
      ],
      "hasPrice": true,
      "priceValue": 40,
      "isListing": true,
      "isISO": false
    }
  ]
};
