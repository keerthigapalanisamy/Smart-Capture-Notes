export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  dotColor?: string;
}

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'Personal',
    label: 'Personal',
    icon: '👤',
    color: '#7C3AED',
    backgroundColor: '#F3F0FF',
    borderColor: '#E9D5FF',
  },
  {
    id: 'Work',
    label: 'Work',
    icon: '💼',
    color: '#2160E8',
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  {
    id: 'Ideas',
    label: 'Ideas',
    icon: '💡',
    color: '#D97706',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  {
    id: 'Receipts',
    label: 'Receipts',
    icon: '🧾',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  {
    id: 'Tasks',
    label: 'Tasks',
    icon: '✅',
    color: '#16A34A',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
];

export const getCategoryConfig = (categoryName: string): CategoryConfig => {
  const match = DEFAULT_CATEGORIES.find(
    (c) =>
      c.label.toLowerCase() === categoryName.toLowerCase() ||
      (categoryName.toLowerCase() === 'receipt' && c.id === 'Receipts')
  );
  if (match) return match;

  // Custom category fallback
  return {
    id: categoryName,
    label: categoryName,
    icon: '🏷️',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  };
};
