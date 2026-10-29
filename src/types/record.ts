export interface CaptureRecord {
  id: string;
  title: string;
  notes: string;
  category: string;
  /** Primary / first image URI for backward compatibility */
  imageUri: string;
  /** Array of all attached image URIs */
  imageUris: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RecordFormData {
  title: string;
  notes: string;
  category: string;
  /** Primary image URI for backward compatibility */
  imageUri?: string | null;
  /** Array of all attached image URIs */
  imageUris: string[];
}

export type Category = 'General' | 'Work' | 'Personal' | 'Ideas' | 'Receipts' | 'Other' | string;
