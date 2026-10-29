import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';

interface EmptyStateProps {
  isFiltered: boolean;
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isFiltered, onAction }) => {
  return (
    <View style={styles.container}>
      {/* Icon Frame */}
      <View style={styles.iconCircle}>
        {isFiltered ? (
          <View style={styles.searchGraphic}>
            <View style={styles.searchGraphicCircle} />
            <View style={styles.searchGraphicHandle} />
          </View>
        ) : (
          <View style={styles.noteGraphic}>
            <View style={styles.noteGraphicLine1} />
            <View style={styles.noteGraphicLine2} />
            <View style={styles.noteGraphicDot} />
          </View>
        )}
      </View>

      <Text style={styles.title}>
        {isFiltered ? 'No Matching Notes' : 'Capture Your First Note'}
      </Text>

      <Text style={styles.description}>
        {isFiltered
          ? 'No notes match your current search or category filter. Try clearing your filters or searching with different keywords.'
          : 'Snap a photo with your camera or pick an image from your gallery, then attach notes and categories to keep everything organized.'}
      </Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onAction}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.actionButtonText}>
          {isFiltered ? 'Reset Filters' : '+ Create First Note'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: 56,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  searchGraphic: {
    width: 26,
    height: 26,
    position: 'relative',
  },
  searchGraphicCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 2.2,
    borderColor: THEME.colors.primary,
  },
  searchGraphicHandle: {
    width: 8,
    height: 2.2,
    backgroundColor: THEME.colors.primary,
    borderRadius: 1,
    position: 'absolute',
    bottom: 3,
    right: 3,
    transform: [{ rotate: '45deg' }],
  },
  noteGraphic: {
    width: 24,
    height: 28,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    padding: 3,
    justifyContent: 'center',
    gap: 3,
  },
  noteGraphicLine1: {
    width: 12,
    height: 2,
    backgroundColor: THEME.colors.primary,
    borderRadius: 1,
  },
  noteGraphicLine2: {
    width: 8,
    height: 2,
    backgroundColor: THEME.colors.primary,
    borderRadius: 1,
  },
  noteGraphicDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: THEME.colors.primary,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.xs + 2,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: THEME.spacing.xl,
    maxWidth: 300,
  },
  actionButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.xl,
    height: 42,
    borderRadius: THEME.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  actionButtonText: {
    color: THEME.colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
