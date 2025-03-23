"use client";

import React, { useRef, useEffect, useState } from 'react';

interface MobileOptimizedSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  'aria-labelledby'?: string;
}

export function MobileOptimizedSection({
  children,
  className = '',
  ...props
}: MobileOptimizedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sjekk om vi er på mobil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Første sjekk
    checkIsMobile();
    
    // Legg til eventhåndterer for endringer i vindusstørrelse
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Intersection Observer for lazy-loading
  useEffect(() => {
    if (!sectionRef.current || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Når seksjonen nærmer seg viewporten
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px 0px', // Starter lasting 200px før seksjonen er synlig
        threshold: 0.01
      }
    );

    observer.observe(sectionRef.current);
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Bruk content-visibility kun på mobil og kun når seksjonen ikke er synlig
  const mobileOptimizedClass = isMobile && !isVisible 
    ? 'content-visibility-auto' 
    : '';

  return (
    <section
      ref={sectionRef}
      className={`${className} ${mobileOptimizedClass}`}
      {...props}
    >
      {isVisible ? children : <div className="min-h-[200px]" />}
    </section>
  );
} 