import React from 'react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  // Define the styling based on the alert type
  const getAlertStyle = () => {
    switch (type) {
      case 'info':
        return {
          containerClass: 'bg-blue-50 border-blue-300 text-blue-700',
          iconClass: 'fa-info-circle text-blue-500'
        };
      case 'success':
        return {
          containerClass: 'bg-green-50 border-green-300 text-green-700',
          iconClass: 'fa-check-circle text-green-500'
        };
      case 'warning':
        return {
          containerClass: 'bg-yellow-50 border-yellow-300 text-yellow-700',
          iconClass: 'fa-exclamation-triangle text-yellow-500'
        };
      case 'error':
        return {
          containerClass: 'bg-red-50 border-red-300 text-red-700',
          iconClass: 'fa-exclamation-circle text-red-500'
        };
      default:
        return {
          containerClass: 'bg-gray-50 border-gray-300 text-gray-700',
          iconClass: 'fa-info-circle text-gray-500'
        };
    }
  };

  const styles = getAlertStyle();

  return (
    <div className={`rounded-md border p-4 ${styles.containerClass} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={`fas ${styles.iconClass} mt-0.5`} aria-hidden="true"></i>
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert; 