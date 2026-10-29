import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { CaptureRecord, RecordFormData } from './src/types/record';
import { THEME } from './src/constants/theme';
import { DEFAULT_CATEGORIES } from './src/constants/categories';
import {
  createRecord,
  deleteRecord,
  loadRecords,
  updateRecord,
} from './src/utils/recordStorage';

// Components
import { Header } from './src/components/Header';
import { SearchBar } from './src/components/SearchBar';
import { CategoryFilter } from './src/components/CategoryFilter';
import { RecordCard } from './src/components/RecordCard';
import { EmptyState } from './src/components/EmptyState';
import { RecordFormModal } from './src/components/RecordFormModal';
import { RecordDetailModal } from './src/components/RecordDetailModal';
import { ConfirmModal } from './src/components/ConfirmModal';
import { BottomNavBar, TabKey } from './src/components/BottomNavBar';
import { SettingsView } from './src/components/SettingsView';

export default function App() {
  const [records, setRecords] = useState<CaptureRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Tab State: 'home' | 'settings'
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals state
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CaptureRecord | null>(null);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<CaptureRecord | null>(null);

  const [recordToDelete, setRecordToDelete] = useState<CaptureRecord | null>(null);

  // Fetch saved records on mount
  const fetchRecords = useCallback(async () => {
    try {
      setStorageError(null);
      const data = await loadRecords();
      setRecords(data);
    } catch (err: any) {
      console.error('Error fetching records:', err);
      setStorageError(err?.message || 'Failed to load saved notes from storage.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRecords();
  }, [fetchRecords]);

  // Aggregate all unique categories
  const availableCategories = useMemo(() => {
    const defaultIds = DEFAULT_CATEGORIES.map((c) => c.label);
    const extraSet = new Set<string>();
    records.forEach((r) => {
      if (r.category && r.category.trim() && !defaultIds.includes(r.category.trim())) {
        extraSet.add(r.category.trim());
      }
    });
    return [...defaultIds, ...Array.from(extraSet)];
  }, [records]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
      if (r.category.toLowerCase() === 'receipt') {
        counts['Receipts'] = (counts['Receipts'] || 0) + 1;
      }
    });
    return counts;
  }, [records]);

  // Filtered and searched records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Category check
      if (selectedCategory !== 'ALL') {
        const selected = selectedCategory.toLowerCase();
        const recordCat = rec.category.toLowerCase();
        if (selected === 'receipt' || selected === 'receipts') {
          if (recordCat !== 'receipt' && recordCat !== 'receipts') return false;
        } else if (recordCat !== selected) {
          return false;
        }
      }
      // Search check
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = rec.title.toLowerCase().includes(query);
        const notesMatch = rec.notes ? rec.notes.toLowerCase().includes(query) : false;
        const categoryMatch = rec.category.toLowerCase().includes(query);
        return titleMatch || notesMatch || categoryMatch;
      }
      return true;
    });
  }, [records, selectedCategory, searchQuery]);

  // Handlers
  const handleAddNew = () => {
    setEditingRecord(null);
    setIsFormModalVisible(true);
  };

  const handleOpenEdit = (rec: CaptureRecord) => {
    setIsDetailModalVisible(false);
    setEditingRecord(rec);
    setIsFormModalVisible(true);
  };

  const handleOpenDetail = (rec: CaptureRecord) => {
    setViewingRecord(rec);
    setIsDetailModalVisible(true);
  };

  const handlePromptDelete = (rec: CaptureRecord) => {
    setRecordToDelete(rec);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      await deleteRecord(recordToDelete.id);
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));

      if (viewingRecord && viewingRecord.id === recordToDelete.id) {
        setIsDetailModalVisible(false);
        setViewingRecord(null);
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setStorageError('Failed to delete note. Please try again.');
    } finally {
      setRecordToDelete(null);
    }
  };

  const handleSaveForm = async (formData: RecordFormData) => {
    if (editingRecord) {
      // Update existing record
      const updated = await updateRecord(editingRecord.id, formData);
      setRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      if (viewingRecord && viewingRecord.id === updated.id) {
        setViewingRecord(updated);
      }
    } else {
      // Create new record
      const created = await createRecord(formData);
      setRecords((prev) => [created, ...prev]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  const isFilterActive = searchQuery.trim().length > 0 || selectedCategory !== 'ALL';

  return (
    <View style={styles.safeArea}>
      <ExpoStatusBar style="dark" />

      {/* Main App Bar Header matching Screen 1 */}
      <Header totalCount={records.length} onAddNew={handleAddNew} />

      {/* Storage Error Warning */}
      {storageError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{storageError}</Text>
          <TouchableOpacity
            onPress={fetchRecords}
            style={styles.retryButton}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab View: Home vs Settings */}
      {activeTab === 'settings' ? (
        <SettingsView
          totalNotes={records.length}
          totalCategories={availableCategories.length}
        />
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <FlatList
            data={filteredRecords}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={THEME.colors.primary}
                colors={[THEME.colors.primary]}
              />
            }
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {/* Search Bar */}
                <View style={styles.searchWrapper}>
                  <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                  />
                </View>

                {/* Horizontally scrollable Category Filter Chips */}
                <View style={styles.categoryFilterWrapper}>
                  <CategoryFilter
                    categories={availableCategories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    categoryCounts={categoryCounts}
                  />
                </View>

                {/* Section Header: "All Notes (2)" matching Screen 1 */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderTitle}>
                    {isFilterActive
                      ? `Found ${filteredRecords.length} Notes`
                      : `All Notes (${records.length})`}
                  </Text>
                  {isFilterActive && (
                    <TouchableOpacity
                      onPress={handleResetFilters}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.clearFilterText}>Reset</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <RecordCard
                record={item}
                onPress={() => handleOpenDetail(item)}
                onEdit={() => handleOpenEdit(item)}
                onDelete={() => handlePromptDelete(item)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                isFiltered={isFilterActive}
                onAction={isFilterActive ? handleResetFilters : handleAddNew}
              />
            }
          />
        </View>
      )}

      {/* Bottom Navigation Bar: Home & Settings matching Screen 1 */}
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Create / Edit Note Modal matching Screen 2 */}
      <RecordFormModal
        visible={isFormModalVisible}
        initialRecord={editingRecord}
        onClose={() => {
          setIsFormModalVisible(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveForm}
      />

      {/* View Note Detail Modal */}
      <RecordDetailModal
        record={viewingRecord}
        visible={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false);
          setViewingRecord(null);
        }}
        onEdit={(rec) => handleOpenEdit(rec)}
        onDelete={(rec) => {
          handlePromptDelete(rec);
        }}
      />

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        visible={!!recordToDelete}
        title="Delete Note"
        message={`Are you sure you want to delete "${recordToDelete?.title || 'this note'}"?\n\nThe attached photos and note details will be permanently removed from device storage.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecordToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.dangerLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.dangerBorder,
  },
  errorBannerText: {
    flex: 1,
    color: THEME.colors.dangerDark,
    fontSize: 13,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 12,
    height: 30,
    backgroundColor: THEME.colors.danger,
    borderRadius: 6,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: THEME.colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  listHeader: {
    paddingTop: 4,
    marginBottom: 4,
  },
  searchWrapper: {
    marginBottom: 10,
  },
  categoryFilterWrapper: {
    marginHorizontal: -20,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
  },
  clearFilterText: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
});
