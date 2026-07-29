/**
 * Utility to optimize images before uploading/processing.
 * - Max width: 1920px (preserving aspect ratio)
 * - Max file size: 1 MB (1,048,576 bytes)
 */
export async function optimizeImage(
  file: File,
  maxWidth: number = 1920,
  maxSizeBytes: number = 1024 * 1024
): Promise<{ file: File; dataUrl: string }> {
  if (!file.type.startsWith('image/')) {
    const dataUrl = await fileToDataUrl(file);
    return { file, dataUrl };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize horizontally if width > 1920
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const fallbackDataUrl = e.target?.result as string;
          resolve({ file, dataUrl: fallbackDataUrl });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress quality iteratively if > 1MB
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (getDataUrlSizeBytes(dataUrl) > maxSizeBytes && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const blob = dataURItoBlob(dataUrl);
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
        const optimizedFile = new File([blob], newFileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        resolve({ file: optimizedFile, dataUrl });
      };

      img.onerror = () => {
        const fallbackDataUrl = e.target?.result as string;
        resolve({ file, dataUrl: fallbackDataUrl });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

function getDataUrlSizeBytes(dataUrl: string): number {
  const base64Str = dataUrl.split(',')[1] || '';
  return Math.round((base64Str.length * 3) / 4);
}

function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
