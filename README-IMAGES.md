# Handling Images for WhatsApp Imports

This document explains how to handle images for WhatsApp imports in the application.

## Image Structure

When importing WhatsApp chat exports, the system extracts references to images in the format `IMG-YYYYMMDD-WAXXXX.jpg`. These references are stored in the listings data, but the actual image files need to be manually copied to the correct location.

## Image Location

The application expects images to be located in the following directory:

```
public/images/listings/
```

## Adding Images

To add images from WhatsApp exports:

1. Export the images from WhatsApp to your device
2. Rename the images to match the format referenced in the listings (if needed)
3. Copy the images to the `public/images/listings/` directory

## Troubleshooting Missing Images

If you see placeholder images or "No image available" messages in the application, it means the referenced image files are missing from the `public/images/listings/` directory.

### Common Issues:

1. **Image file doesn't exist**: Ensure the image file exists in the correct location
2. **Image filename mismatch**: Make sure the filename exactly matches the reference in the listing
3. **Permissions issue**: Check that the image files have the correct read permissions

## Fallback Mechanism

The application includes a fallback mechanism that displays a placeholder with the category name when an image is missing or fails to load.

## Bulk Image Processing

For bulk processing of WhatsApp images:

1. Create a directory for your WhatsApp export images
2. Run the following command to copy all images to the correct location:

```bash
cp /path/to/whatsapp/images/*.jpg public/images/listings/
```

## Image Optimization

The application uses Next.js Image component for optimization. For external placeholder images, we use the `unoptimized` property to avoid optimization errors. 