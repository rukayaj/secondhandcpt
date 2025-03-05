import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getValidImagePath } from '@/utils/imageUtils';

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  category?: string | null;
  fallbackText?: string;
}

/**
 * A component that safely renders images with proper fallbacks
 * It uses the getValidImagePath utility to ensure the image exists
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  category,
  fallbackText,
  alt,
  className,
  ...props
}) => {
  const [error, setError] = useState(false);
  const validSrc = getValidImagePath(src, category);
  
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-secondary-100 ${className}`}>
        <div className="text-center p-4">
          <i className="fa-solid fa-image text-secondary-300 text-4xl mb-2"></i>
          <p className="text-secondary-400">{fallbackText || category || 'Image not available'}</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={validSrc}
      alt={alt || 'Image'}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default SafeImage; 