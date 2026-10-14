const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_FILE_SIZE_MB = 25;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File, kind: 'image' | 'video'): ValidationResult {
  const acceptedTypes = kind === 'image' ? ACCEPTED_IMAGE_TYPES : ACCEPTED_VIDEO_TYPES;

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `${file.name} isn't a supported ${kind} format. Use ${acceptedTypes
        .map((t) => t.split('/')[1])
        .join(', ')}.`,
    };
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_FILE_SIZE_MB) {
    return {
      valid: false,
      error: `${file.name} is ${sizeMb.toFixed(1)} MB. The limit is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

export function validateUrl(value: string): ValidationResult {
  if (!value.trim()) {
    return { valid: false, error: 'Enter a URL to check.' };
  }
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'That doesn\u2019t look like a valid URL.' };
  }
}
