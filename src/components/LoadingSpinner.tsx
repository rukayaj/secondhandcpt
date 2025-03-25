import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false 
}) => {
  // Set the size of the spinner based on the size prop
  const sizeClass = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  // If fullScreen is true, we render the spinner with a full-screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className={`${sizeClass} border-4 border-secondary-200 border-t-primary-600 rounded-full animate-spin`}></div>
          <p className="mt-4 text-primary-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Regular spinner without full-screen overlay
  return (
    <div className={`${sizeClass} border-4 border-secondary-200 border-t-primary-600 rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner; 