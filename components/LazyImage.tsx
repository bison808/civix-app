'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'empty' | 'blur' | 'shimmer';
  blurDataURL?: string;
  onLoad?: () => void;
  quality?: number;
}

// Generate blur placeholder
const generateBlurPlaceholder = (width: number = 10, height: number = 10) => {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) return undefined;
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

export function LazyImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  priority = false,
  placeholder = 'shimmer',
  blurDataURL,
  onLoad,
  quality = 75
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setHasLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setHasLoaded(true);
  };

  // Shimmer effect styles
  const shimmerStyles = placeholder === 'shimmer' ? {
    background: `linear-gradient(
      90deg,
      #f0f0f0 0%,
      #f8f8f8 50%,
      #f0f0f0 100%
    )`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite'
  } : {};

  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8 text-gray-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M18 12H6m6-6v12"
          />
        </svg>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder while loading */}
      {!hasLoaded && placeholder === 'shimmer' && (
        <div 
          className="absolute inset-0 bg-gray-200"
          style={shimmerStyles}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          className={`${className} ${hasLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={placeholder === 'blur' ? 'blur' : 'empty'}
          blurDataURL={blurDataURL || generateBlurPlaceholder()}
          priority={priority}
        />
      )}

      {/* Loading skeleton */}
      {!isInView && (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// Optimized Representative Photo Component
export function RepresentativePhoto({
  src,
  name,
  size = 'md',
  priority = false
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}) {
  const sizes = {
    sm: { width: 40, height: 40, text: 'text-xs' },
    md: { width: 80, height: 80, text: 'text-sm' },
    lg: { width: 120, height: 120, text: 'text-base' }
  };

  const { width, height, text } = sizes[size];

  if (!src) {
    // Fallback to initials
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div 
        className={`bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center rounded-full font-semibold ${text}`}
        style={{ width, height }}
      >
        {initials}
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={name}
      width={width}
      height={height}
      className="rounded-full object-cover"
      priority={priority}
      quality={60} // Lower quality for photos
    />
  );
}

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}