const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

export function validateUploadFile(file: File, kind: 'image' | 'video' | 'any', maxMegabytes: number): string | null {
  const valid = kind === 'image' ? IMAGE_TYPES.has(file.type)
    : kind === 'video' ? VIDEO_TYPES.has(file.type)
      : IMAGE_TYPES.has(file.type) || VIDEO_TYPES.has(file.type);
  if (!valid) return 'Formato não aceito. Use PNG, JPEG, GIF, WebP, MP4 ou WebM conforme o tipo de mídia.';
  if (!file.size || file.size > maxMegabytes * 1024 * 1024) return `A mídia deve ter no máximo ${maxMegabytes} MB.`;
  return null;
}
