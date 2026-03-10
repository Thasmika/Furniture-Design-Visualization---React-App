import React from 'react';

interface OptimizedImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

/**
 * OptimizedImage component provides WebP format with fallback support
 * Implements lazy loading for below-fold images
 * Optimizes image loading for different formats
 * 
 * Requirements: 17.2, 17.3
 * 
 * @param src - Fallback image source (PNG/JPG)
 * @param webpSrc - WebP format image source (optional)
 * @param alt - Alt text for accessibility
 * @param className - CSS class name
 * @param loading - Loading strategy (lazy or eager)
 * @param width - Image width for optimization
 * @param height - Image height for optimization
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  webpSrc,
  alt,
  className,
  loading = 'lazy',
  width,
  height,
}) => {
  // If WebP source is provided, use picture element for format fallback
  if (webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          className={className}
          loading={loading}
          width={width}
          height={height}
        />
      </picture>
    );
  }

  // Otherwise, use standard img element
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      width={width}
      height={height}
    />
  );
};
