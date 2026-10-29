import AsyncStorage from '@react-native-async-storage/async-storage';
import { CaptureRecord, RecordFormData } from '../types/record';
import { deleteImageFile, persistMultipleImageFiles } from './fileStorage';
import { normalizeRecord, isImageReferencedByOtherRecords } from './recordModel';

export { normalizeRecord, isImageReferencedByOtherRecords };

const STORAGE_KEY = '@smart_capture_notes_records_v1';

/**
 * Loads all saved records from AsyncStorage, sorted by creation date descending.
 * Converts legacy single-image records to the modern multi-attachment format.
 */
export async function loadRecords(): Promise<CaptureRecord[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];

    const rawRecords = JSON.parse(json);
    if (!Array.isArray(rawRecords)) return [];

    const normalized = rawRecords.map(normalizeRecord);

    // Sort newest first
    return normalized.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Failed to load records from AsyncStorage:', error);
    throw new Error('Could not retrieve saved notes from local storage.');
  }
}

/**
 * Saves a new record with persistent image copies and metadata storage.
 */
export async function createRecord(data: RecordFormData): Promise<CaptureRecord> {
  if (!data.title.trim()) {
    throw new Error('Title is required.');
  }

  // Resolve image attachments from either `imageUris` or legacy `imageUri`
  const sourceUris = Array.isArray(data.imageUris) && data.imageUris.length > 0
    ? data.imageUris
    : (data.imageUri ? [data.imageUri] : []);

  if (sourceUris.length === 0) {
    throw new Error('An image must be captured or selected.');
  }

  // Persist all images into app's persistent document directory
  const persistentUris = await persistMultipleImageFiles(sourceUris);

  const now = Date.now();
  const newRecord: CaptureRecord = {
    id: `rec_${now}_${Math.random().toString(36).substring(2, 9)}`,
    title: data.title.trim(),
    notes: data.notes ? data.notes.trim() : '',
    category: data.category ? data.category.trim() || 'General' : 'General',
    imageUri: persistentUris[0] || '',
    imageUris: persistentUris,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const existingRecords = await loadRecords();
    const updatedList = [newRecord, ...existingRecords];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return newRecord;
  } catch (error) {
    // Cleanup any newly copied images if metadata saving failed
    for (const uri of persistentUris) {
      await deleteImageFile(uri);
    }
    console.error('Failed to save record metadata:', error);
    throw new Error('Failed to save note record. Please try again.');
  }
}

/**
 * Updates an existing record. Persists any newly added images and cleans up
 * removed images only when they are not referenced by any other record.
 */
export async function updateRecord(
  id: string,
  data: Partial<RecordFormData>
): Promise<CaptureRecord> {
  const existingRecords = await loadRecords();
  const targetIndex = existingRecords.findIndex((r) => r.id === id);

  if (targetIndex === -1) {
    throw new Error('Record not found.');
  }

  const existing = existingRecords[targetIndex];

  // Determine requested image attachments
  let requestedUris: string[];
  if (Array.isArray(data.imageUris)) {
    requestedUris = data.imageUris;
  } else if (data.imageUri !== undefined) {
    requestedUris = data.imageUri ? [data.imageUri] : [];
  } else {
    requestedUris = existing.imageUris;
  }

  // Persist any new images in the requested list
  const finalPersistentUris = await persistMultipleImageFiles(requestedUris);

  // Identify images that were removed in this edit
  const oldUris = existing.imageUris && existing.imageUris.length > 0
    ? existing.imageUris
    : (existing.imageUri ? [existing.imageUri] : []);

  const removedUris = oldUris.filter((u) => !finalPersistentUris.includes(u));

  // Safely delete removed images if no other record references them
  for (const removedUri of removedUris) {
    if (!isImageReferencedByOtherRecords(existingRecords, removedUri, existing.id)) {
      await deleteImageFile(removedUri);
    }
  }

  const updated: CaptureRecord = {
    ...existing,
    title: data.title !== undefined ? data.title.trim() : existing.title,
    notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
    category: data.category !== undefined ? data.category.trim() || 'General' : existing.category,
    imageUri: finalPersistentUris[0] || '',
    imageUris: finalPersistentUris,
    updatedAt: Date.now(),
  };

  existingRecords[targetIndex] = updated;

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingRecords));
    return updated;
  } catch (error) {
    console.error('Failed to update record in AsyncStorage:', error);
    throw new Error('Failed to update record. Please try again.');
  }
}

/**
 * Deletes a record from AsyncStorage and safely removes its associated persistent
 * image files, preserving any files still referenced by other records.
 */
export async function deleteRecord(id: string): Promise<void> {
  const existingRecords = await loadRecords();
  const target = existingRecords.find((r) => r.id === id);

  if (!target) return;

  const targetUris = new Set<string>();
  if (target.imageUri) targetUris.add(target.imageUri);
  if (Array.isArray(target.imageUris)) {
    target.imageUris.forEach((u) => {
      if (u) targetUris.add(u);
    });
  }

  const remainingRecords = existingRecords.filter((r) => r.id !== id);

  // Safely remove files that are not referenced by any remaining record
  for (const uri of Array.from(targetUris)) {
    if (!isImageReferencedByOtherRecords(remainingRecords, uri)) {
      await deleteImageFile(uri);
    }
  }

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remainingRecords));
  } catch (error) {
    console.error('Failed to remove record from AsyncStorage:', error);
    throw new Error('Failed to delete note record.');
  }
}
