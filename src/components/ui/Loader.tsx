import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false }) => {
  return <LoadingSpinner size={size} fullScreen={fullScreen} color="primary-600" />;
};

export default Loader; 