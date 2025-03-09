import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImage, uploadMultipleImages } from '@/utils/imageUtils';

interface ImageUploaderProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  listingId: string;
  maxImages?: number;
  existingImages?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesUploaded,
  listingId,
  maxImages = 5,
  existingImages = []
}) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the maximum
    if (images.length + files.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload the files to Supabase Storage
      const newImageUrls = await uploadMultipleImages(Array.from(files), listingId);
      
      // Update the state with the new image URLs
      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);
      
      // Call the callback with the updated image URLs
      onImagesUploaded(updatedImages);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={`Uploaded image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="w-24 h-24 border-2 border-dashed border-secondary-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-secondary-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-secondary-500 mt-1">Add Image</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      
      {uploading && (
        <div className="text-sm text-secondary-600">
          Uploading images...
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="text-xs text-secondary-500">
        {images.length} of {maxImages} images uploaded. Click on an image to remove it.
      </div>
    </div>
  );
};

export default ImageUploader; 