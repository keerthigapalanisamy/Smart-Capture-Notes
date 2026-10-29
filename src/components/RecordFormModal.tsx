import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CaptureRecord, RecordFormData } from '../types/record';
import { THEME } from '../constants/theme';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface RecordFormModalProps {
  visible: boolean;
  initialRecord?: CaptureRecord | null;
  onClose: () => void;
  onSave: (data: RecordFormData) => Promise<void>;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  visible,
  initialRecord,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Personal');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);

  // Validation & status states
  const [titleError, setTitleError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerActive, setIsPickerActive] = useState(false);

  const isEditing = !!initialRecord;

  // Pre-fill form when editing or resetting when opened fresh
  useEffect(() => {
    if (visible) {
      if (initialRecord) {
        setTitle(initialRecord.title);
        setNotes(initialRecord.notes || '');

        const existingUris = Array.isArray(initialRecord.imageUris) && initialRecord.imageUris.length > 0
          ? initialRecord.imageUris
          : (initialRecord.imageUri ? [initialRecord.imageUri] : []);
        setImageUris(existingUris);

        const isStandard = DEFAULT_CATEGORIES.some(
          (c) => c.label.toLowerCase() === initialRecord.category.toLowerCase()
        );
        if (isStandard) {
          setCategory(initialRecord.category);
          setIsCustomCategoryMode(false);
          setCustomCategory('');
        } else {
          setCategory('Custom');
          setIsCustomCategoryMode(true);
          setCustomCategory(initialRecord.category);
        }
      } else {
        // Defaults matching Screen 2
        setTitle('');
        setNotes('');
        setCategory('Personal');
        setCustomCategory('');
        setIsCustomCategoryMode(false);
        setImageUris([]);
      }
      setTitleError(null);
      setImageError(null);
      setGeneralError(null);
      setIsSaving(false);

      // Handle Android activity recreation if camera killed MainActivity
      if (Platform.OS === 'android') {
        ImagePicker.getPendingResultAsync()
          .then((result) => {
            if (
              result &&
              'assets' in result &&
              result.assets &&
              result.assets.length > 0
            ) {
              const pendingUris = result.assets.map((a) => a.uri).filter(Boolean);
              setImageUris((prev) => {
                const unique = pendingUris.filter((u) => !prev.includes(u));
                return [...prev, ...unique];
              });
              setImageError(null);
            }
          })
          .catch(() => {});
      }
    }
  }, [visible, initialRecord]);

  // Handle Photo Capture with Device Camera (appends to current attachments)
  const handleCapturePhoto = async () => {
    try {
      setIsPickerActive(true);
      setImageError(null);

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Camera Permission Denied',
          'Camera access is required to capture photos directly inside the app. Please grant camera permission in your system settings.',
          [{ text: 'OK' }]
        );
        setImageError('Camera permission is required to capture photos.');
        return;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const capturedUri = pickerResult.assets[0].uri;
        setImageUris((prev) => {
          if (prev.includes(capturedUri)) return prev;
          return [...prev, capturedUri];
        });
        setImageError(null);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setImageError('An unexpected error occurred while launching the camera.');
    } finally {
      setIsPickerActive(false);
    }
  };

  // Handle Gallery Selection with Multiple Image Selection support
  const handleSelectGallery = async () => {
    try {
      setIsPickerActive(true);
      setImageError(null);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Photo Library Permission Denied',
          'Access to your device photo library is needed to select images. Please grant permission in your system settings.',
          [{ text: 'OK' }]
        );
        setImageError('Photo library permission is required to select images.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.85,
        orderedSelection: true,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const selectedUris = pickerResult.assets.map((a) => a.uri).filter(Boolean);
        setImageUris((prev) => {
          // Prevent accidental duplicate attachments
          const toAdd = selectedUris.filter((u) => !prev.includes(u));
          return [...prev, ...toAdd];
        });
        if (selectedUris.length > 0) {
          setImageError(null);
        }
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
      setImageError('An unexpected error occurred while accessing the photo gallery.');
    } finally {
      setIsPickerActive(false);
    }
  };

  // Remove individual attachment
  const handleRemoveImage = (indexToRemove: number) => {
    setImageUris((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Validate and submit
  const handleSave = async () => {
    if (isSaving) return;

    let hasError = false;

    // Validate Title
    if (!title.trim()) {
      setTitleError('Title is required');
      hasError = true;
    } else {
      setTitleError(null);
    }

    // Validate Image Attachments
    if (imageUris.length === 0) {
      setImageError('Photo is required. Please capture or select a photo.');
      hasError = true;
    } else {
      setImageError(null);
    }

    // Validate Category
    let resolvedCategory = category;
    if (isCustomCategoryMode) {
      if (!customCategory.trim()) {
        resolvedCategory = 'General';
      } else {
        resolvedCategory = customCategory.trim();
      }
    }

    if (hasError) return;

    try {
      setIsSaving(true);
      setGeneralError(null);

      await onSave({
        title: title.trim(),
        notes: notes.trim(),
        category: resolvedCategory,
        imageUris,
        imageUri: imageUris[0] || null,
      });

      onClose();
    } catch (err: any) {
      console.error('Failed to save record:', err);
      setGeneralError(err?.message || 'Failed to save note. Please check disk storage.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Top Bar Header matching Screen 2 */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSaving}
              style={styles.cancelButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Note' : 'Add New Note'}
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving || isPickerActive}
              style={[
                styles.saveHeaderButton,
                isSaving ? styles.saveButtonDisabled : null,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={THEME.colors.textInverse} />
              ) : (
                <Text style={styles.saveHeaderText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* General Error Banner */}
            {generalError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            )}

            {/* Photo Attachment Section */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeading}>Photo Attachments</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <Text style={styles.sectionSubtext}>
                Capture photos or choose multiple pictures from your gallery
              </Text>

              {/* Side-by-side action buttons: Take Photo & Choose from Gallery */}
              <View style={styles.photoActionButtonsRow}>
                <TouchableOpacity
                  style={styles.photoActionButton}
                  onPress={handleCapturePhoto}
                  activeOpacity={0.75}
                  disabled={isPickerActive || isSaving}
                >
                  <View style={styles.buttonIconBox}>
                    <View style={styles.cameraIconTop} />
                    <View style={styles.cameraIconBody}>
                      <View style={styles.cameraIconLens} />
                    </View>
                  </View>
                  <Text style={styles.photoActionText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoActionButton}
                  onPress={handleSelectGallery}
                  activeOpacity={0.75}
                  disabled={isPickerActive || isSaving}
                >
                  <View style={styles.buttonIconBox}>
                    <View style={styles.galleryIconOuter}>
                      <View style={styles.galleryIconInner} />
                    </View>
                  </View>
                  <Text style={styles.photoActionText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Selected Images Preview Strip or Sensible Empty State */}
              {imageUris.length > 0 ? (
                <View style={styles.previewBoxWrapper}>
                  <View style={styles.previewHeaderRow}>
                    <Text style={styles.previewCountText}>
                      Attached ({imageUris.length})
                    </Text>
                    {imageUris.length > 1 && (
                      <TouchableOpacity
                        onPress={() => setImageUris([])}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={styles.clearAllText}>Clear All</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.previewsScrollContainer}
                  >
                    {imageUris.map((uri, index) => (
                      <View key={`${uri}_${index}`} style={styles.previewCard}>
                        <Image
                          source={{ uri }}
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                        {/* Number Index Badge */}
                        <View style={styles.previewIndexBadge}>
                          <Text style={styles.previewIndexBadgeText}>{index + 1}</Text>
                        </View>
                        {/* Dark round remove button */}
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => handleRemoveImage(index)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          accessibilityLabel={`Remove photo ${index + 1}`}
                        >
                          <Text style={styles.removeImageBtnText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                /* Sensible Empty State when no photos are attached */
                <View style={styles.emptyPreviewBox}>
                  <Text style={styles.emptyPreviewIcon}>📷</Text>
                  <Text style={styles.emptyPreviewTitle}>No photos attached yet</Text>
                  <Text style={styles.emptyPreviewSubtitle}>
                    Use the buttons above to capture or select images
                  </Text>
                </View>
              )}

              {imageError && <Text style={styles.errorText}>{imageError}</Text>}
            </View>

            {/* Title Section */}
            <View style={styles.section}>
              <View style={styles.labelCounterRow}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.fieldLabel}>Title</Text>
                  <Text style={styles.requiredStar}> *</Text>
                </View>
                <Text style={styles.charCount}>{title.length}/80</Text>
              </View>
              <TextInput
                style={[styles.textInput, titleError ? styles.inputError : null]}
                placeholder="Mountain View"
                placeholderTextColor={THEME.colors.textPlaceholder}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (titleError) setTitleError(null);
                }}
                maxLength={80}
                returnKeyType="next"
              />
              {titleError && <Text style={styles.errorText}>{titleError}</Text>}
            </View>

            {/* Category Section */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.fieldLabel}>Category</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>

              <View style={styles.categoriesWrap}>
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isSelected = !isCustomCategoryMode && category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catOption,
                        isSelected ? styles.catOptionSelected : styles.catOptionUnselected,
                      ]}
                      onPress={() => {
                        setCategory(cat.id);
                        setIsCustomCategoryMode(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.catOptionIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.catOptionText,
                          isSelected
                            ? styles.catOptionTextSelected
                            : styles.catOptionTextUnselected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Custom Category Button */}
                <TouchableOpacity
                  style={[
                    styles.catOption,
                    isCustomCategoryMode
                      ? styles.catOptionSelected
                      : styles.catOptionUnselected,
                  ]}
                  onPress={() => setIsCustomCategoryMode(true)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.catOptionIcon}>✏️</Text>
                  <Text
                    style={[
                      styles.catOptionText,
                      isCustomCategoryMode
                        ? styles.catOptionTextSelected
                        : styles.catOptionTextUnselected,
                    ]}
                  >
                    Custom...
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Category Text Input */}
              {isCustomCategoryMode && (
                <View style={styles.customCategoryInputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter custom category name..."
                    placeholderTextColor={THEME.colors.textPlaceholder}
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    maxLength={30}
                    autoFocus
                  />
                </View>
              )}
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <View style={styles.labelCounterRow}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <Text style={styles.charCount}>{notes.length}/500</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Visited the hill station with friends. The weather was amazing and the view was beautiful."
                placeholderTextColor={THEME.colors.textPlaceholder}
                value={notes}
                onChangeText={setNotes}
                maxLength={500}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: THEME.colors.background,
  },
  cancelButton: {
    minHeight: 36,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: THEME.colors.primary,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  saveHeaderButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    height: 36,
    borderRadius: 14,
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.textInverse,
  },
  formScroll: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  errorBanner: {
    backgroundColor: THEME.colors.dangerLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.dangerBorder,
  },
  errorBannerText: {
    color: THEME.colors.dangerDark,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  requiredStar: {
    fontSize: 15,
    color: THEME.colors.danger,
    fontWeight: '700',
  },
  sectionSubtext: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
  },
  photoActionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  photoActionButton: {
    flex: 1,
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
    borderRadius: 12,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
  },
  cameraIconTop: {
    width: 8,
    height: 2.5,
    backgroundColor: THEME.colors.primary,
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
  },
  cameraIconBody: {
    width: 20,
    height: 14,
    backgroundColor: THEME.colors.primary,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconLens: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primaryLight,
  },
  galleryIconOuter: {
    width: 20,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryIconInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
  },
  photoActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  previewBoxWrapper: {
    marginTop: 14,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  clearAllText: {
    fontSize: 12,
    color: THEME.colors.danger,
    fontWeight: '600',
  },
  previewsScrollContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 2,
  },
  previewCard: {
    width: 135,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    backgroundColor: '#F1F5F9',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewIndexBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIndexBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  emptyPreviewBox: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPreviewIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  emptyPreviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  emptyPreviewSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
  labelCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  charCount: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  textInput: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: THEME.colors.textPrimary,
  },
  inputError: {
    borderColor: THEME.colors.danger,
    backgroundColor: '#FFF5F5',
  },
  textArea: {
    minHeight: 115,
    height: undefined,
    paddingTop: 12,
    paddingBottom: 12,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: THEME.colors.danger,
    marginTop: 4,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  catOptionUnselected: {
    backgroundColor: THEME.colors.surface,
    borderColor: '#E8ECF4',
  },
  catOptionSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
    ...THEME.shadows.subtle,
  },
  catOptionIcon: {
    fontSize: 13,
  },
  catOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  catOptionTextUnselected: {
    color: THEME.colors.textPrimary,
  },
  catOptionTextSelected: {
    color: THEME.colors.textInverse,
  },
  customCategoryInputBox: {
    marginTop: 10,
  },
});
