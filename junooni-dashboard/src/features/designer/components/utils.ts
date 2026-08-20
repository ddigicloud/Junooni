// ============================================================
// utils.ts — pure utility functions (no React, no state)
// All functions here are stateless and side-effect-free
// except for sessionStorage helpers and the render cache.
// ============================================================

import type { DesignElement } from './types';

// ── Module-level render cache (survives tab switches) ─────────────────────────
export const _renderCache = new Map<string, string>();

// ── Image element cache (avoids re-fetching mockup photos) ───────────────────
const _imageCache = new Map<string, HTMLImageElement>();

export const _loadImageCached = (url: string): Promise<HTMLImageElement> => {
  if (_imageCache.has(url)) return Promise.resolve(_imageCache.get(url)!);
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { _imageCache.set(url, img); res(img); };
    img.onerror = () => rej(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
};

export const _getCacheKey = (
  mockupId: string,
  viewAngle: string,
  productColor: string,
  designHash: string,
  resolution: number
): string => `${mockupId}||${viewAngle}||${productColor}||${designHash}||${resolution}`;

export const _hashDesignElements = (elements: Record<string, DesignElement[]>): string => {
  try {
    let hash = 0;
    Object.entries(elements).forEach(([area, els]) => {
      els.forEach(el => {
        const str = `${area}:${el.id}:${el.x}:${el.y}:${el.width}:${el.height}:${el.rotation}:${el.scaleX}:${el.scaleY}:${el.visible}`;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
      });
    });
    return hash.toString(36);
  } catch { return 'nohash'; }
};

// ── URL resolution ────────────────────────────────────────────────────────────
export const getApiConfig = () => ({
  BACKEND_URL: import.meta.env?.VITE_PAYLOAD_BASE_URL ?? '',
});

export const resolveImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const { BACKEND_URL } = getApiConfig();
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  return `${BACKEND_URL}/api/media/file/${url}`;
};

// ── File validation ───────────────────────────────────────────────────────────
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/'))
    return { valid: false, error: 'Please select an image file (PNG, JPG, GIF, etc.)' };
  if (file.size > 30 * 1024 * 1024)
    return { valid: false, error: 'File size must be less than 30MB' };
  return { valid: true };
};

// ── Base64 helpers ────────────────────────────────────────────────────────────
export const convertFileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const convertImageToBase64 = (img: HTMLImageElement): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not get canvas context')); return; }
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png', 0.95));
    } catch (error) { reject(error); }
  });

export const createImageFromBase64 = (base64: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = base64;
  });

// ── Image optimisation ────────────────────────────────────────────────────────
export const optimizeImage = async (
  img: HTMLImageElement,
  maxWidth = 1500,
  quality = 0.85
): Promise<{ optimizedImage: HTMLImageElement; optimizedBase64: string; originalSize: number; optimizedSize: number }> =>
  new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not get canvas context')); return; }

      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;
      let newWidth = originalWidth;
      let newHeight = originalHeight;

      if (originalWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = maxWidth * (originalHeight / originalWidth);
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const optimizedBase64 = canvas.toDataURL('image/png');
      const optimizedImg = new Image();
      optimizedImg.crossOrigin = 'anonymous';
      optimizedImg.onload = () =>
        resolve({ optimizedImage: optimizedImg, optimizedBase64, originalSize: img.src.length, optimizedSize: optimizedBase64.length });
      optimizedImg.onerror = () => reject(new Error('Failed to create optimized image'));
      optimizedImg.src = optimizedBase64;
    } catch (error) { reject(error); }
  });

// ── Transparent pixel cropping ────────────────────────────────────────────────
export const cropTransparentPixels = (img: HTMLImageElement): {
  croppedCanvas: HTMLCanvasElement;
  croppedBase64: string;
  bounds: { x: number; y: number; width: number; height: number };
  originalWidth: number;
  originalHeight: number;
} => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] > 10) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return {
      croppedCanvas: canvas,
      croppedBase64: canvas.toDataURL('image/png', 0.95),
      bounds: { x: 0, y: 0, width: canvas.width, height: canvas.height },
      originalWidth: canvas.width, originalHeight: canvas.height,
    };
  }

  minX = Math.max(0, minX - 2); minY = Math.max(0, minY - 2);
  maxX = Math.min(canvas.width - 1, maxX + 2); maxY = Math.min(canvas.height - 1, maxY + 2);

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width; croppedCanvas.height = height;
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) throw new Error('Could not get cropped canvas context');
  croppedCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);

  return {
    croppedCanvas,
    croppedBase64: croppedCanvas.toDataURL('image/png', 0.95),
    bounds: { x: minX, y: minY, width, height },
    originalWidth: canvas.width, originalHeight: canvas.height,
  };
};

// ── Mockup image compression ──────────────────────────────────────────────────
export const compressMockupImage = (
  base64Data: string,
  quality = 0.6,
  maxDimension = 800
): Promise<string> =>
  new Promise((resolve) => {
    if (!base64Data || base64Data.length < 100) { resolve(base64Data); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio); height = Math.round(height * ratio);
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const supportsWebP = canvas.toDataURL('image/webp').startsWith('data:image/webp');
      resolve(supportsWebP ? canvas.toDataURL('image/webp', quality) : canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Data);
    img.src = base64Data;
  });

// ── SessionStorage chunked save/load ─────────────────────────────────────────
export const saveToSessionStorage = (key: string, data: any): boolean => {
  try {
    // Clear previous chunks
    const existingChunks = sessionStorage.getItem(`${key}_chunks`);
    if (existingChunks) {
      const count = parseInt(existingChunks);
      for (let i = 0; i < count; i++) sessionStorage.removeItem(`${key}_chunk_${i}`);
      sessionStorage.removeItem(`${key}_chunks`);
      sessionStorage.removeItem(key);
    }

    const serialized = JSON.stringify(data);
    const chunkSize = 2 * 1024 * 1024;

    if (serialized.length <= chunkSize) {
      sessionStorage.setItem(key, serialized);
      sessionStorage.setItem(`${key}_chunks`, '1');
      return true;
    }

    const totalChunks = Math.ceil(serialized.length / chunkSize);
    for (let i = 0; i < totalChunks; i++) {
      sessionStorage.setItem(`${key}_chunk_${i}`, serialized.slice(i * chunkSize, (i + 1) * chunkSize));
    }
    sessionStorage.setItem(`${key}_chunks`, totalChunks.toString());
    return true;
  } catch (error) {
    try {
      const chunksStr = sessionStorage.getItem(`${key}_chunks`);
      if (chunksStr) {
        const count = parseInt(chunksStr);
        for (let i = 0; i < count; i++) sessionStorage.removeItem(`${key}_chunk_${i}`);
        sessionStorage.removeItem(`${key}_chunks`);
      }
      sessionStorage.removeItem(key);
    } catch {}
    return false;
  }
};

export const loadFromSessionStorage = (key: string): any | null => {
  try {
    const chunksStr = sessionStorage.getItem(`${key}_chunks`);
    if (!chunksStr) return null;
    const totalChunks = parseInt(chunksStr);
    if (totalChunks === 1) {
      const data = sessionStorage.getItem(key);
      if (!data) return null;
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(`${key}_chunks`);
      return JSON.parse(data);
    }
    let fullData = '';
    for (let i = 0; i < totalChunks; i++) {
      const chunk = sessionStorage.getItem(`${key}_chunk_${i}`);
      if (!chunk) return null;
      fullData += chunk;
      sessionStorage.removeItem(`${key}_chunk_${i}`);
    }
    sessionStorage.removeItem(`${key}_chunks`);
    return JSON.parse(fullData);
  } catch { return null; }
};

// ── Color utilities ───────────────────────────────────────────────────────────
export const getColorBrightness = (hexColor: string): number => {
  const hex = hexColor.replace('#', '');
  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  return (r * 299 + g * 587 + b * 114) / 1000;
};

export const isLightColor = (hexColor: string): boolean => getColorBrightness(hexColor) > 128;

export const VARIANT_HARD_LIMIT = 100;

export const calculateProjectedVariants = (
  colors: Array<{ name: string; value: string }>,
  sizes: string[],
): number => colors.length * sizes.length;