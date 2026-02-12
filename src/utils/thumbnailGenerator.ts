/**
 * Utility functions for generating design thumbnails
 */

/**
 * Captures a canvas element as a data URL
 */
export const captureCanvasAsImage = (canvas: HTMLCanvasElement, width: number = 400, height: number = 300): string => {
  try {
    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw the original canvas onto the temp canvas (resized)
    ctx.drawImage(canvas, 0, 0, width, height);
    
    // Convert to data URL (JPEG for smaller file size)
    return tempCanvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error capturing canvas:', error);
    return '';
  }
};

/**
 * Generates a placeholder thumbnail based on design data
 * Creates a realistic-looking room preview with 3D perspective
 */
export const generatePlaceholderThumbnail = (
  roomShape: string,
  furnitureCount: number
): string => {
  console.log('Generating placeholder thumbnail for:', { roomShape, furnitureCount });
  
  // Always use SVG for consistency and reliability
  return createSVGPlaceholder(roomShape, furnitureCount);
  
  /* Canvas-based generation (disabled for now due to reliability issues)
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.log('Canvas context not available, using SVG fallback');
    // Fallback: return a simple SVG data URL if canvas context is not available
    return createSVGPlaceholder(roomShape, furnitureCount);
  }

  try {
    // Draw floor with perspective
    const floorGradient = ctx.createLinearGradient(0, 150, 0, 300);
    floorGradient.addColorStop(0, '#D4C5B9');
    floorGradient.addColorStop(1, '#B8A89C');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, 150, 400, 150);

    // Draw back wall
    const wallGradient = ctx.createLinearGradient(0, 0, 0, 150);
    wallGradient.addColorStop(0, '#F5F5F5');
    wallGradient.addColorStop(1, '#E8E8E8');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, 400, 150);

    // Draw room with perspective based on shape
    if (roomShape === 'rectangular' || roomShape === 'square') {
      // Draw perspective lines for depth
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 2;
      
      // Left wall
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(80, 60);
      ctx.lineTo(80, 200);
      ctx.lineTo(0, 150);
      ctx.closePath();
      ctx.fillStyle = '#D8D8D8';
      ctx.fill();
      ctx.stroke();
      
      // Right wall
      ctx.beginPath();
      ctx.moveTo(400, 0);
      ctx.lineTo(320, 60);
      ctx.lineTo(320, 200);
      ctx.lineTo(400, 150);
      ctx.closePath();
      ctx.fillStyle = '#D8D8D8';
      ctx.fill();
      ctx.stroke();
    }

    // Draw furniture items with 3D appearance
    if (furnitureCount > 0) {
      const furnitureTypes = [
        { name: 'couch', color: '#8B7355', x: 120, y: 120, w: 160, h: 60 },
        { name: 'table', color: '#A0826D', x: 180, y: 180, w: 80, h: 50 },
        { name: 'chair', color: '#6B5D52', x: 100, y: 200, w: 40, h: 40 },
        { name: 'chair', color: '#6B5D52', x: 260, y: 200, w: 40, h: 40 },
        { name: 'plant', color: '#4A7C59', x: 320, y: 140, w: 30, h: 50 },
      ];

      const itemsToShow = Math.min(furnitureCount, furnitureTypes.length);
      
      for (let i = 0; i < itemsToShow; i++) {
        const item = furnitureTypes[i];
        
        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(item.x + 5, item.y + item.h - 5, item.w, 8);
        
        // Draw furniture item with 3D effect
        const itemGradient = ctx.createLinearGradient(item.x, item.y, item.x, item.y + item.h);
        itemGradient.addColorStop(0, item.color);
        itemGradient.addColorStop(1, shadeColor(item.color, -20));
        ctx.fillStyle = itemGradient;
        ctx.fillRect(item.x, item.y, item.w, item.h);
        
        // Add highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(item.x, item.y, item.w, item.h * 0.3);
        
        // Add border
        ctx.strokeStyle = shadeColor(item.color, -30);
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x, item.y, item.w, item.h);
      }
    }

    // Add subtle grid on floor for depth
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 400; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 150);
      ctx.lineTo(i, 300);
      ctx.stroke();
    }
    for (let i = 150; i < 300; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(400, i);
      ctx.stroke();
    }

    // Add furniture count badge
    if (furnitureCount > 0) {
      ctx.fillStyle = 'rgba(15, 118, 110, 0.9)';
      ctx.beginPath();
      // Use arc for rounded corners if roundRect is not available
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(10, 10, 100, 35, 8);
      } else {
        // Fallback for browsers without roundRect
        ctx.rect(10, 10, 100, 35);
      }
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🪑 ${furnitureCount} pieces`, 20, 27);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Generated canvas thumbnail, length:', dataUrl.length);
    return dataUrl || createSVGPlaceholder(roomShape, furnitureCount);
  } catch (error) {
    console.error('Error generating placeholder thumbnail:', error);
    return createSVGPlaceholder(roomShape, furnitureCount);
  }
  */
};

/**
 * Creates an SVG-based placeholder as a fallback
 */
export function createSVGPlaceholder(_roomShape: string, furnitureCount: number): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <defs>
        <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#D4C5B9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B8A89C;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#F5F5F5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E8E8E8;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Back wall -->
      <rect x="0" y="0" width="400" height="150" fill="url(#wall)"/>
      
      <!-- Floor -->
      <rect x="0" y="150" width="400" height="150" fill="url(#floor)"/>
      
      <!-- Left wall -->
      <polygon points="0,0 80,60 80,200 0,150" fill="#D8D8D8" stroke="#C0C0C0" stroke-width="2"/>
      
      <!-- Right wall -->
      <polygon points="400,0 320,60 320,200 400,150" fill="#D8D8D8" stroke="#C0C0C0" stroke-width="2"/>
      
      <!-- Furniture items -->
      ${furnitureCount > 0 ? `
        <!-- Couch -->
        <rect x="125" y="125" width="160" height="60" fill="#8B7355" stroke="#6B5D52" stroke-width="2"/>
        <rect x="125" y="125" width="160" height="20" fill="rgba(255,255,255,0.2)"/>
        ${furnitureCount > 1 ? `
        <!-- Table -->
        <rect x="185" y="185" width="80" height="50" fill="#A0826D" stroke="#8B7355" stroke-width="2"/>
        <rect x="185" y="185" width="80" height="15" fill="rgba(255,255,255,0.2)"/>
        ` : ''}
        ${furnitureCount > 2 ? `
        <!-- Chair 1 -->
        <rect x="105" y="205" width="40" height="40" fill="#6B5D52" stroke="#5B4D42" stroke-width="2"/>
        ` : ''}
        ${furnitureCount > 3 ? `
        <!-- Chair 2 -->
        <rect x="265" y="205" width="40" height="40" fill="#6B5D52" stroke="#5B4D42" stroke-width="2"/>
        ` : ''}
        ${furnitureCount > 4 ? `
        <!-- Plant -->
        <rect x="325" y="145" width="30" height="50" fill="#4A7C59" stroke="#3A6C49" stroke-width="2"/>
        ` : ''}
      ` : ''}
      
      <!-- Furniture count badge -->
      ${furnitureCount > 0 ? `
        <rect x="10" y="10" width="100" height="35" rx="8" fill="rgba(15,118,110,0.9)"/>
        <text x="20" y="32" font-family="Arial" font-size="16" font-weight="bold" fill="white">${furnitureCount} pieces</text>
      ` : ''}
    </svg>
  `;
  
  // Use encodeURIComponent instead of btoa to handle all characters including emojis
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Helper function to darken or lighten a color
 */
// function shadeColor(color: string, percent: number): string {
//   const num = parseInt(color.replace('#', ''), 16);
//   const amt = Math.round(2.55 * percent);
//   const R = (num >> 16) + amt;
//   const G = (num >> 8 & 0x00FF) + amt;
//   const B = (num & 0x0000FF) + amt;
//   return '#' + (
//     0x1000000 +
//     (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
//     (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
//     (B < 255 ? (B < 1 ? 0 : B) : 255)
//   ).toString(16).slice(1);
// }

/**
 * Finds the 3D canvas element in the document
 */
export const find3DCanvas = (): HTMLCanvasElement | null => {
  // Try to find the Three.js canvas
  const canvases = document.querySelectorAll('canvas');
  
  for (const canvas of canvases) {
    // Check if it's a WebGL canvas (Three.js uses WebGL)
    const context = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (context) {
      return canvas;
    }
  }
  
  return null;
};

/**
 * Generates a thumbnail for a design
 * First tries to capture the 3D canvas, falls back to placeholder
 */
export const generateDesignThumbnail = (
  roomShape: string,
  furnitureCount: number
): string => {
  // Try to find and capture the 3D canvas
  const canvas3D = find3DCanvas();
  
  if (canvas3D && canvas3D.width > 0 && canvas3D.height > 0) {
    const thumbnail = captureCanvasAsImage(canvas3D);
    if (thumbnail) {
      return thumbnail;
    }
  }
  
  // Fallback to placeholder
  return generatePlaceholderThumbnail(roomShape, furnitureCount);
};
