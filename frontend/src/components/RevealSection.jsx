import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function RevealSection({ 
  children, 
  className = '', 
  animation = 'reveal-fade-up',
  delayClass = '',
  as = 'section',
  ...props 
}) {
  const ref = useScrollReveal({ threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  const Component = as;

  return (
    <Component 
      ref={ref} 
      className={`reveal ${animation} ${delayClass} ${className}`} 
      {...props}
    >
      {children}
    </Component>
  );
}
