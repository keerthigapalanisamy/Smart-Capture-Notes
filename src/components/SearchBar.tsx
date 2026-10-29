import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { THEME } from '../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onClear }) => {
  return (
    <View style={styles.container}>
      {/* Search Icon */}
      <View style={styles.searchIconBox}>
        <View style={styles.searchCircle} />
        <View style={styles.searchHandle} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Search notes by title or content..."
        placeholderTextColor={THEME.colors.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
        accessibilityLabel="Search notes"
      />

      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Clear search"
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    ...THEME.shadows.subtle,
  },
  searchIconBox: {
    width: 20,
    height: 20,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  searchCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.colors.textPlaceholder,
    position: 'absolute',
    top: 2,
    left: 2,
  },
  searchHandle: {
    width: 6,
    height: 2,
    backgroundColor: THEME.colors.textPlaceholder,
    borderRadius: 1,
    position: 'absolute',
    bottom: 2.5,
    right: 2,
    transform: [{ rotate: '45deg' }],
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    lineHeight: 18,
  },
});
