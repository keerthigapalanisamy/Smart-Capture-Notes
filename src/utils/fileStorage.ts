import * as FileSystem from 'expo-file-system/legacy';

const rawBase = FileSystem.documentDirectory || '';
const BASE_DIR = rawBase ? rawBase.replace(/\/*$/, '') + '/' : '';
export const IMAGES_DIR = `${BASE_DIR}smart_capture_images/`;

/**
 * Ensures that the persistent directory for storing captured images exists.
 */
export async function ensureImagesDirectoryExists(): Promise<void> {
  if (!BASE_DIR) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
  } catch (error) {
    console.warn('Failed to create persistent images directory:', error);
    throw new Error('Unable to initialize image storage directory.');
  }
}

/**
 * Extracts a file extension from a URI, defaulting to '.jpg' if not found.
 */
function getFileExtension(uri: string): string {
  const cleanUri = uri.split('?')[0].split('#')[0];
  const lastDot = cleanUri.lastIndexOf('.');
  if (lastDot !== -1) {
    const ext = cleanUri.substring(lastDot).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.heic'].includes(ext)) {
      return ext;
    }
  }
  return '.jpg';
}

/**
 * Checks whether an image URI points to our app's persistent storage directory.
 */
export function isPersistentImageFile(uri?: string | null): boolean {
  if (!uri || !IMAGES_DIR) return false;
  return uri.startsWith(IMAGES_DIR);
}

/**
 * Copies a temporary image (from camera or gallery) into persistent app storage.
 * Prevents OS cache eviction from breaking saved records.
 *
 * @param sourceUri Temporary URI provided by expo-image-picker
 * @returns Persistent file URI inside the app's document directory
 */
export async function persistImageFile(sourceUri: string): Promise<string> {
  if (!sourceUri) {
    throw new Error('No image URI provided to persist.');
  }

  // If already stored in our persistent directory, avoid redundant copying
  if (isPersistentImageFile(sourceUri)) {
    return sourceUri;
  }

  // If running in an environment without documentDirectory (e.g. web fallback)
  if (!BASE_DIR) {
    return sourceUri;
  }

  await ensureImagesDirectoryExists();

  const extension = getFileExtension(sourceUri);
  const uniqueName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${extension}`;
  const targetUri = `${IMAGES_DIR}${uniqueName}`;

  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri,
    });

    const fileInfo = await FileSystem.getInfoAsync(targetUri);
    if (!fileInfo.exists) {
      throw new Error('Persistent file copy verification failed.');
    }

    return targetUri;
  } catch (error) {
    console.error('Error persisting image file:', error);
    throw new Error('Failed to save image to persistent local storage.');
  }
}

/**
 * Persists multiple image files into app persistent storage.
 * If any file fails to copy, rolls back any newly copied files to avoid orphaned storage.
 */
export async function persistMultipleImageFiles(sourceUris: string[]): Promise<string[]> {
  const newlyCreated: string[] = [];
  const persistentResults: string[] = [];

  try {
    for (const uri of sourceUris) {
      if (!uri) continue;
      const wasAlreadyPersistent = isPersistentImageFile(uri);
      const persistentUri = await persistImageFile(uri);
      persistentResults.push(persistentUri);
      if (!wasAlreadyPersistent && persistentUri !== uri) {
        newlyCreated.push(persistentUri);
      }
    }
    return persistentResults;
  } catch (error) {
    for (const rollbackUri of newlyCreated) {
      await deleteImageFile(rollbackUri);
    }
    throw error;
  }
}

/**
 * Deletes a persistent image file from app storage.
 * Safe and idempotent (does not fail if file doesn't exist).
 *
 * @param fileUri Persistent file URI to delete
 */
export async function deleteImageFile(fileUri?: string | null): Promise<void> {
  if (!fileUri || !BASE_DIR) return;

  // Security check: only delete files stored within our app's document directory
  if (!fileUri.startsWith(BASE_DIR)) {
    return;
  }

  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch (error) {
    console.warn(`Could not delete image file at ${fileUri}:`, error);
  }
}

/**
 * Checks whether an image file physically exists in local storage.
 *
 * @param fileUri URI of the image to check
 * @returns true if the file exists and is accessible
 */
export async function checkImageExists(fileUri?: string | null): Promise<boolean> {
  if (!fileUri) return false;
  if (!BASE_DIR) return true; // Web fallback

  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  } catch {
    return false;
  }
}
