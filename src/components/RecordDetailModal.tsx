import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CaptureRecord } from '../types/record';
import { THEME } from '../constants/theme';
import { getCategoryConfig } from '../constants/categories';
import { checkImageExists } from '../utils/fileStorage';
import { DeleteTrashIcon, EditPencilIcon } from './ActionIcons';

interface RecordDetailModalProps {
  record: CaptureRecord | null;
  visible: boolean;
  onClose: () => void;
  onEdit: (record: CaptureRecord) => void;
  onDelete: (record: CaptureRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  visible,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  // Normalize all attached image URIs
  const images: string[] = React.useMemo(() => {
    if (!record) return [];
    if (Array.isArray(record.imageUris) && record.imageUris.length > 0) {
      return record.imageUris;
    }
    return record.imageUri ? [record.imageUri] : [];
  }, [record]);

  // Reset index when opening modal or viewing a different record
  useEffect(() => {
    setActiveIndex(0);
  }, [record?.id, visible]);

  // Pre-verify image existence whenever activeIndex or record changes
  useEffect(() => {
    let isMounted = true;
    setHasImageError(false);
    setIsLoadingImage(true);

    const currentUri = images[activeIndex];
    if (!currentUri) {
      setHasImageError(true);
      setIsLoadingImage(false);
      return;
    }

    checkImageExists(currentUri)
      .then((exists) => {
        if (isMounted) {
          if (!exists) {
            setHasImageError(true);
            setIsLoadingImage(false);
          }
        }
      })
      .catch(() => {
        // Fallback: <Image onError /> handles it
      });

    return () => {
      isMounted = false;
    };
  }, [record?.id, activeIndex, images]);

  if (!record) return null;

  const categoryConfig = getCategoryConfig(record.category);

  const formattedCreated = new Date(record.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const isUpdated = record.updatedAt && record.updatedAt > record.createdAt;
  const formattedUpdated = isUpdated
    ? new Date(record.updatedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  const activeUri = images[activeIndex];

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.safeArea}>
        {/* Modal Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Close detail view"
            accessibilityRole="button"
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Note Details</Text>

          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.actionPillButton}
              onPress={() => onEdit(record)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Edit note"
              accessibilityRole="button"
            >
              <EditPencilIcon color="#2160E8" />
              <Text style={styles.actionPillText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionPillButton, styles.deletePillButton]}
              onPress={() => onDelete(record)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Delete note"
              accessibilityRole="button"
            >
              <DeleteTrashIcon color="#EF4444" bodyLineColor="#FFF0F2" />
              <Text style={[styles.actionPillText, styles.deletePillText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Photo Card */}
          <View style={styles.photoSection}>
            <View style={styles.photoHeader}>
              <Text style={styles.photoSectionTitle}>
                {images.length === 0
                  ? 'ATTACHED PHOTOS (0)'
                  : images.length === 1
                  ? 'ATTACHED PHOTO'
                  : `ATTACHED PHOTOS (${activeIndex + 1} OF ${images.length})`}
              </Text>

              {images.length > 1 && (
                <View style={styles.photoHeaderPill}>
                  <Text style={styles.photoHeaderPillText}>
                    {activeIndex + 1} / {images.length}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.imageContainer}>
              {images.length === 0 ? (
                <View style={styles.imageFallback}>
                  <Text style={styles.fallbackIcon}>📷</Text>
                  <Text style={styles.imageFallbackTitle}>No Photos Attached</Text>
                  <Text style={styles.imageFallbackSub}>
                    This note was saved without any image attachments.
                  </Text>
                </View>
              ) : hasImageError ? (
                <View style={styles.imageFallback}>
                  <Text style={styles.fallbackIcon}>📷</Text>
                  <Text style={styles.imageFallbackTitle}>Image Unavailable</Text>
                  <Text style={styles.imageFallbackSub}>
                    The image file could not be loaded from local storage.
                  </Text>
                </View>
              ) : (
                <>
                  <Image
                    key={activeUri}
                    source={{ uri: activeUri }}
                    style={styles.fullImage}
                    resizeMode="contain"
                    onLoadStart={() => setIsLoadingImage(true)}
                    onLoadEnd={() => setIsLoadingImage(false)}
                    onError={() => {
                      setIsLoadingImage(false);
                      setHasImageError(true);
                    }}
                  />

                  {isLoadingImage && (
                    <View style={styles.imageLoadingOverlay}>
                      <ActivityIndicator size="large" color={THEME.colors.primary} />
                    </View>
                  )}

                  {/* Previous / Next Arrow Controls when multiple images exist */}
                  {images.length > 1 && (
                    <>
                      <TouchableOpacity
                        style={[styles.navArrow, styles.navArrowLeft]}
                        onPress={handlePrevImage}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Previous image"
                      >
                        <Text style={styles.navArrowText}>‹</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.navArrow, styles.navArrowRight]}
                        onPress={handleNextImage}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Next image"
                      >
                        <Text style={styles.navArrowText}>›</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>

            {/* Thumbnail Carousel Strip for Multi-Image Records */}
            {images.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailStrip}
              >
                {images.map((uri, index) => {
                  const isSelected = index === activeIndex;
                  return (
                    <TouchableOpacity
                      key={`${uri}_${index}`}
                      style={[
                        styles.stripItem,
                        isSelected ? styles.stripItemActive : null,
                      ]}
                      onPress={() => setActiveIndex(index)}
                      activeOpacity={0.8}
                      accessibilityLabel={`View photo ${index + 1}`}
                    >
                      <Image
                        source={{ uri }}
                        style={styles.stripThumbnail}
                        resizeMode="cover"
                      />
                      <View style={[
                        styles.stripBadge,
                        isSelected ? styles.stripBadgeActive : null,
                      ]}>
                        <Text style={styles.stripBadgeText}>{index + 1}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Details Section */}
          <View style={styles.contentCard}>
            {/* Category Tag */}
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: categoryConfig.backgroundColor,
                  borderColor: categoryConfig.borderColor,
                },
              ]}
            >
              <Text style={styles.categoryIcon}>{categoryConfig.icon}</Text>
              <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                {record.category}
              </Text>
            </View>

            {/* Note Title */}
            <Text style={styles.title}>{record.title}</Text>

            {/* Timestamps */}
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>Captured: {formattedCreated}</Text>
              {formattedUpdated && (
                <Text style={styles.metaText}>Updated: {formattedUpdated}</Text>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Notes Body */}
            <Text style={styles.sectionLabel}>Notes</Text>
            {record.notes.trim().length > 0 ? (
              <Text style={styles.notesText}>{record.notes}</Text>
            ) : (
              <Text style={styles.emptyNotesText}>No additional notes entered.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    height: 54,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  actionPillButton: {
    flexDirection: 'row',
    height: 32,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  deletePillButton: {
    backgroundColor: THEME.colors.dangerLight,
    borderColor: THEME.colors.dangerBorder,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  deletePillText: {
    color: THEME.colors.danger,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
    gap: THEME.spacing.lg,
  },
  photoSection: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
    paddingHorizontal: 4,
  },
  photoSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.6,
  },
  photoHeaderPill: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  photoHeaderPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 38,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowLeft: {
    left: 10,
  },
  navArrowRight: {
    right: 10,
  },
  navArrowText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  fallbackIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  imageFallbackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F87171',
    marginBottom: 4,
  },
  imageFallbackSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 2,
  },
  stripItem: {
    width: 62,
    height: 62,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  stripItemActive: {
    borderColor: THEME.colors.primary,
  },
  stripThumbnail: {
    width: '100%',
    height: '100%',
  },
  stripBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripBadgeActive: {
    backgroundColor: THEME.colors.primary,
  },
  stripBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  contentCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    gap: 5,
    marginBottom: THEME.spacing.md,
  },
  categoryIcon: {
    fontSize: 11,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: THEME.spacing.xs,
  },
  metaContainer: {
    gap: 3,
    marginBottom: THEME.spacing.md,
  },
  metaText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 15,
    color: THEME.colors.textSecondary,
    lineHeight: 24,
  },
  emptyNotesText: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
});
