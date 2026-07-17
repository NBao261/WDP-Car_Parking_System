export const getOptimizedImageUrl = (url: string | undefined | null, width: number = 500): string => {
  if (!url) return '';
  
  // If not a Cloudinary URL (e.g. local /uploads/alpr/...), return as is
  if (!url.includes('cloudinary.com')) return url;

  // Split by /upload/ to insert transformations
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url; // Unexpected format

  const [baseUrl, imagePath] = parts;

  // Insert f_auto, q_auto, and w_ parameters for max optimization
  return `${baseUrl}/upload/f_auto,q_auto,w_${width}/${imagePath}`;
};
