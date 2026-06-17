import React from 'react';

interface LogoProps {
  variant?: 'default' | 'dark' | 'light' | 'icon';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'default', className = '' }) => {
  const base = `inline-flex items-center gap-2.5 ${className}`;

  if (variant === 'icon') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="32" height="32" rx="8" fill="#0A66C2" />
        <path d="M9 10.5L16 7L23 10.5V21.5L16 25L9 21.5V10.5Z" fill="white" />
        <path d="M16 7V25" stroke="#0A66C2" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="3" fill="#0A66C2" />
      </svg>
    );
  }

  return (
    <div className={base}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="9" fill="#0A66C2" />
        <path d="M10 12L18 8L26 12V25L18 29L10 25V12Z" fill="white" />
        <path d="M18 8V29" stroke="#0A66C2" strokeWidth="1.75" />
        <circle cx="18" cy="18" r="3.5" fill="#0A66C2" />
      </svg>
      <span className="font-semibold tracking-[-0.02em] text-2xl text-zinc-950 dark:text-white">EduCore</span>
    </div>
  );
};

export const LogoIcon = (props: Omit<LogoProps, 'variant'>) => <Logo variant="icon" {...props} />;
