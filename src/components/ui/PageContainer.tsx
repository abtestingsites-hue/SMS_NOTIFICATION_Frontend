import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  className?: string;
  noPadding?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '7xl',
  className = '',
  noPadding = false
}) => {
  const maxWMap = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[1600px]',
    '7xl': 'max-w-[1600px]',
    full: 'max-w-full'
  };

  return (
    <div
      className={`w-full mx-auto space-y-5 sm:space-y-6 ${maxWMap[maxWidth]} ${
        noPadding ? '' : 'p-4 sm:p-6 lg:p-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

