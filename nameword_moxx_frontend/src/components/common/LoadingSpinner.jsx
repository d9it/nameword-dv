import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-darkbtn ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-2 text-sm text-primary dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 