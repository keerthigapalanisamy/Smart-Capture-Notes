import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { CaptureRecord } from '../types/record';
import { THEME } from '../constants/theme';
import { getCategoryConfig } from '../constants/categories';
import { DeleteTrashIcon, EditPencilIcon, CalendarIcon } from './ActionIcons';

interface RecordCardProps {
  record: CaptureRecord;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onPress,
  onEdit,
  onDelete,
}) => {
  // Normalize attached images
  const images = Array.isArray(record.imageUris) && record.imageUris.length > 0
    ? record.imageUris
    : (record.imageUri ? [record.imageUri] : []);

  const [hasPrimaryError, setHasPrimaryError] = useState(false);
  const [isLoadingPrimary, setIsLoadingPrimary] = useState(true);

  // Reset load/error state when record changes
  useEffect(() => {
    setHasPrimaryError(false);
    setIsLoadingPrimary(true);
  }, [record.id, record.imageUri, images[0]]);

  const categoryConfig = getCategoryConfig(record.category);

  // Format date like "29 Oct 2026"
  const dateObj = new Date(record.createdAt);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  const renderThumbnail = () => {
    // 0 images: display clean empty state
    if (images.length === 0) {
      return (
        <View style={styles.fallbackThumbnail}>
          <Text style={styles.fallbackIcon}>📷</Text>
          <Text style={styles.fallbackText}>No Image</Text>
        </View>
      );
    }

    // 1 image: standard single thumbnail
    if (images.length === 1) {
      if (hasPrimaryError) {
        return (
          <View style={styles.fallbackThumbnail}>
            <Text style={styles.fallbackIcon}>📷</Text>
            <Text style={styles.fallbackText}>No Image</Text>
          </View>
        );
      }
      return (
        <>
          <Image
            source={{ uri: images[0] }}
            style={styles.thumbnail}
            resizeMode="cover"
            onLoadStart={() => setIsLoadingPrimary(true)}
            onLoadEnd={() => setIsLoadingPrimary(false)}
            onError={() => {
              setIsLoadingPrimary(false);
              setHasPrimaryError(true);
            }}
          />
          {isLoadingPrimary && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="small" color={THEME.colors.primary} />
            </View>
          )}
        </>
      );
    }

    // 2 images: 2 vertical half-columns
    if (images.length === 2) {
      return (
        <View style={styles.gridTwoContainer}>
          <Image source={{ uri: images[0] }} style={styles.gridHalfImage} resizeMode="cover" />
          <Image source={{ uri: images[1] }} style={styles.gridHalfImage} resizeMode="cover" />
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeIcon}>📷</Text>
            <Text style={styles.countBadgeText}>2</Text>
          </View>
        </View>
      );
    }

    // 3 images: left half + right 2 stacked
    if (images.length === 3) {
      return (
        <View style={styles.gridThreeContainer}>
          <Image source={{ uri: images[0] }} style={styles.gridHalfImage} resizeMode="cover" />
          <View style={styles.gridRightColumn}>
            <Image source={{ uri: images[1] }} style={styles.gridQuarterImage} resizeMode="cover" />
            <Image source={{ uri: images[2] }} style={styles.gridQuarterImage} resizeMode="cover" />
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeIcon}>📷</Text>
            <Text style={styles.countBadgeText}>3</Text>
          </View>
        </View>
      );
    }

    // 4 or more images: 2x2 quadrant grid with optional +N on the 4th quadrant
    const remainingCount = images.length - 4;
    return (
      <View style={styles.gridFourContainer}>
        <View style={styles.gridRow}>
          <Image source={{ uri: images[0] }} style={styles.gridQuarterImage} resizeMode="cover" />
          <Image source={{ uri: images[1] }} style={styles.gridQuarterImage} resizeMode="cover" />
        </View>
        <View style={styles.gridRow}>
          <Image source={{ uri: images[2] }} style={styles.gridQuarterImage} resizeMode="cover" />
          <View style={styles.gridQuarterWrapper}>
            <Image source={{ uri: images[3] }} style={styles.gridQuarterImage} resizeMode="cover" />
            {remainingCount > 0 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreOverlayText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeIcon}>📷</Text>
          <Text style={styles.countBadgeText}>{images.length}</Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Note: ${record.title}, ${images.length} ${images.length === 1 ? 'photo' : 'photos'} attached`}
    >
      {/* Thumbnail Container */}
      <View style={styles.thumbnailContainer}>{renderThumbnail()}</View>

      {/* Details Container */}
      <View style={styles.detailsContainer}>
        {/* Top Row: Category Badge + Date */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: categoryConfig.backgroundColor,
              },
            ]}
          >
            <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
            <Text
              style={[styles.categoryText, { color: categoryConfig.color }]}
              numberOfLines={1}
            >
              {record.category}
            </Text>
          </View>

          <View style={styles.dateRow}>
            <CalendarIcon color="#64748B" />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {record.title}
        </Text>

        {/* Notes Preview */}
        {record.notes.trim().length > 0 ? (
          <Text style={styles.notes} numberOfLines={2}>
            {record.notes}
          </Text>
        ) : (
          <Text style={styles.emptyNotes}>No additional notes</Text>
        )}

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel={`Edit ${record.title}`}
            accessibilityRole="button"
          >
            <EditPencilIcon color={THEME.colors.editText} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel={`Delete ${record.title}`}
            accessibilityRole="button"
          >
            <DeleteTrashIcon
              color={THEME.colors.deleteText}
              bodyLineColor={THEME.colors.deleteBg}
            />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEFF5',
    ...THEME.shadows.card,
  },
  thumbnailContainer: {
    width: 94,
    height: 94,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceSubtle,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackThumbnail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 6,
  },
  fallbackIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  fallbackText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  gridTwoContainer: {
    width: 94,
    height: 94,
    flexDirection: 'row',
    gap: 2,
    position: 'relative',
  },
  gridHalfImage: {
    flex: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  gridThreeContainer: {
    width: 94,
    height: 94,
    flexDirection: 'row',
    gap: 2,
    position: 'relative',
  },
  gridRightColumn: {
    flex: 1,
    height: '100%',
    gap: 2,
  },
  gridFourContainer: {
    width: 94,
    height: 94,
    gap: 2,
    position: 'relative',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  gridQuarterImage: {
    flex: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  gridQuarterWrapper: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  countBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  countBadgeIcon: {
    fontSize: 8,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    maxWidth: '55%',
  },
  categoryIcon: {
    fontSize: 11,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  notes: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  emptyNotes: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: THEME.colors.editBg,
    gap: 5,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.editText,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: THEME.colors.deleteBg,
    gap: 5,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.deleteText,
  },
});
