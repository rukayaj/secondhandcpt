import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary-600',
  fullScreen = false
}: LoadingSpinnerProps) {
  // Map size to class names
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-${color} ${sizeClasses[size]}`}></div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-${color} ${sizeClasses[size]}`}></div>
    </div>
  );
} 