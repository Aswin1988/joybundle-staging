const allowed = new Map([
  ['image/jpeg', { extension: 'jpg', signature: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 }],
  ['image/png', { extension: 'png', signature: (bytes) => bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 }],
  ['image/webp', { extension: 'webp', signature: (bytes) => bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 }],
]);

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageMetadata(file) {
  const rule = allowed.get(file.type);
  if (!rule) throw new Error('Only JPG, PNG, and WebP images are allowed.');
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_PRODUCT_IMAGE_BYTES) throw new Error('Image must be smaller than 5 MB.');
  return rule;
}
