import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';

interface HeaderProps {
  totalCount: number;
  onAddNew: () => void;
}

export const Header: React.FC<HeaderProps> = ({ totalCount, onAddNew }) => {
  return (
    <View style={styles.container}>
      {/* Left side: Blue camera icon badge + Title stack */}
      <View style={styles.leftGroup}>
        <View style={styles.cameraIconBox}>
          {/* Stylized camera glyph */}
          <View style={styles.cameraGlyphTop} />
          <View style={styles.cameraGlyphBody}>
            <View style={styles.cameraGlyphLens} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.appName}>Smart Capture</Text>
          <Text style={styles.subtitle}>
            {totalCount === 1
              ? '1 note saved locally'
              : `${totalCount} notes saved locally`}
          </Text>
        </View>
      </View>

      {/* Right side: + New Note button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddNew}
        activeOpacity={0.85}
        accessibilityLabel="Create new note"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.addButtonText}>+ New Note</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: THEME.colors.background,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cameraIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  cameraGlyphTop: {
    width: 10,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  cameraGlyphBody: {
    width: 22,
    height: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraGlyphLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
  },
  textContainer: {
    justifyContent: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textInverse,
    letterSpacing: -0.2,
  },
});
