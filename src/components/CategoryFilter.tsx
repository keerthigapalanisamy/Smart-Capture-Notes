import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';
import { getCategoryConfig } from '../constants/categories';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string; // 'ALL' or specific category name
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const allCount = Object.values(categoryCounts).reduce((acc, count) => acc + count, 0);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "All (count)" Chip */}
        <TouchableOpacity
          style={[
            styles.chip,
            selectedCategory === 'ALL' ? styles.chipSelected : styles.chipUnselected,
          ]}
          onPress={() => onSelectCategory('ALL')}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.chipText,
              selectedCategory === 'ALL' ? styles.chipTextSelected : styles.chipTextUnselected,
            ]}
          >
            {`All (${allCount})`}
          </Text>
        </TouchableOpacity>

        {/* Category Chips: Personal, Work, Ideas, Receipt, Tasks */}
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          const config = getCategoryConfig(cat);

          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={styles.chipIcon}>{config.icon}</Text>
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {cat === 'Receipts' ? 'Receipt' : cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipUnselected: {
    backgroundColor: THEME.colors.surface,
    borderColor: '#E8ECF4',
  },
  chipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
    ...THEME.shadows.subtle,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: THEME.colors.textPrimary,
  },
  chipTextSelected: {
    color: THEME.colors.textInverse,
  },
});
