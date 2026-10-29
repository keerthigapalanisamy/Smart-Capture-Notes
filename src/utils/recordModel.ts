import { CaptureRecord } from '../types/record';

/**
 * Normalizes a raw record loaded from storage to guarantee both `imageUri`
 * and `imageUris` exist, preserving full backward compatibility with old records.
 */
export function normalizeRecord(raw: any): CaptureRecord {
  const rawImageUris: string[] = Array.isArray(raw?.imageUris)
    ? raw.imageUris.filter((u: any) => typeof u === 'string' && u.trim().length > 0)
    : [];

  let imageUris: string[] = rawImageUris;
  if (imageUris.length === 0 && raw?.imageUri && typeof raw.imageUri === 'string' && raw.imageUri.trim().length > 0) {
    imageUris = [raw.imageUri.trim()];
  }

  const primaryImageUri = raw?.imageUri || (imageUris.length > 0 ? imageUris[0] : '');

  return {
    id: String(raw?.id || `rec_${Date.now()}`),
    title: String(raw?.title || ''),
    notes: String(raw?.notes || ''),
    category: String(raw?.category || 'General'),
    imageUri: primaryImageUri,
    imageUris,
    createdAt: typeof raw?.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw?.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}

/**
 * Checks whether an image file URI is referenced by any record other than `excludeRecordId`.
 * This prevents accidental deletion of image files shared or referenced by another record.
 */
export function isImageReferencedByOtherRecords(
  records: CaptureRecord[],
  imageUri: string,
  excludeRecordId?: string
): boolean {
  if (!imageUri) return false;
  return records.some((r) => {
    if (excludeRecordId && r.id === excludeRecordId) return false;
    if (r.imageUri === imageUri) return true;
    if (Array.isArray(r.imageUris) && r.imageUris.includes(imageUri)) return true;
    return false;
  });
}

