/**
 * Image processing utilities for team and player image uploads
 * Resizes and compresses image to maintain lean localStorage
 */

export async function processImageFile(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function processMultipleImageFiles(
  files: FileList | File[],
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<string[]> {
  const fileArray = Array.from(files);
  const results: string[] = [];
  for (const file of fileArray) {
    try {
      const dataUrl = await processImageFile(file, maxWidth, maxHeight, quality);
      results.push(dataUrl);
    } catch (err) {
      console.error('Failed to process image file:', err);
    }
  }
  return results;
}


export const DEFAULT_AVATARS = [
  '🏸', '🏏', '⚽', '🏆', '⭐', '🔥', '🥇', '🦁', '⚡', '👑'
];
