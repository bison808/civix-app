'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  fill = false,
  sizes,
  loading = 'lazy',
  quality = 85,
  onLoad,
  onError,
  fallback = '/placeholder-image.jpg',
  objectFit = 'cover',
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading optimization
  useEffect(() => {
    if (priority) return; // Skip intersection observer if priority is true

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Generate placeholder for civic content
  const generatePlaceholder = (w: number, h: number) => {
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${w}" height="${h}" fill="#f3f4f6"/>
        <rect x="${w * 0.3}" y="${h * 0.4}" width="${w * 0.4}" height="${h * 0.2}" fill="#e5e7eb" rx="4"/>
        <circle cx="${w * 0.5}" cy="${h * 0.3}" r="${Math.min(w, h) * 0.1}" fill="#d1d5db"/>
      </svg>`
    )}`;
  };

  const defaultBlurDataURL = blurDataURL || (width && height ? generatePlaceholder(width, height) : undefined);

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        !loaded && 'animate-pulse bg-gray-200',
        className
      )}
      style={fill ? { position: 'relative' } : undefined}
    >
      {isInView && (
        <Image
          src={error ? fallback : src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={defaultBlurDataURL}
          sizes={sizes || (fill ? '100vw' : undefined)}
          loading={loading}
          quality={quality}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            objectFit && `object-${objectFit}`
          )}
          style={!fill ? { objectFit } : undefined}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Loading placeholder for civic content */}
      {!loaded && !error && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-100',
            'animate-pulse'
          )}
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
}

// Specialized component for representative photos
export function RepresentativePhoto({
  src,
  name,
  party,
  className,
  size = 'md',
  ...props
}: {
  src?: string;
  name: string;
  party: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
} & Partial<OptimizedImageProps>) {
  const sizes = {
    sm: { width: 48, height: 48 },
    md: { width: 96, height: 96 },
    lg: { width: 128, height: 128 },
    xl: { width: 256, height: 256 },
  };

  const dimensions = sizes[size];
  
  // Fallback to initials if no image
  const fallbackSrc = `/api/avatar/${encodeURIComponent(name)}?party=${party}`;

  return (
    <OptimizedImage
      src={src || fallbackSrc}
      alt={`${name} - ${party} Representative`}
      width={dimensions.width}
      height={dimensions.height}
      className={cn(
        'rounded-full border-2 border-gray-200',
        className
      )}
      placeholder="blur"
      quality={90}
      objectFit="cover"
      fallback={fallbackSrc}
      {...props}
    />
  );
}

// Specialized component for bill sponsor photos
export function SponsorPhoto({
  sponsor,
  className,
  size = 'sm',
  ...props
}: {
  sponsor: { name: string; party: string; imageUrl?: string };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
} & Partial<OptimizedImageProps>) {
  return (
    <RepresentativePhoto
      src={sponsor.imageUrl}
      name={sponsor.name}
      party={sponsor.party}
      size={size}
      className={className}
      {...props}
    />
  );
}

// Hook for preloading critical images
export function useImagePreloader(urls: string[]) {
  useEffect(() => {
    const preloadImages = urls.map(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      return link;
    });

    preloadImages.forEach(link => document.head.appendChild(link));

    return () => {
      preloadImages.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [urls]);
}