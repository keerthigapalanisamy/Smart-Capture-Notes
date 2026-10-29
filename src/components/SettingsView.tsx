import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

interface SettingsViewProps {
  totalNotes: number;
  totalCategories: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  totalNotes,
  totalCategories,
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>App configuration & local storage</Text>
      </View>

      {/* Storage & Notes Overview */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Local Storage Statistics</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Saved Notes</Text>
          <Text style={styles.statValue}>{totalNotes}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active Categories</Text>
          <Text style={styles.statValue}>{totalCategories}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Storage Mode</Text>
          <Text style={styles.statBadge}>100% Offline</Text>
        </View>
      </View>

      {/* About App */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>About Smart Capture</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Assignment</Text>
          <Text style={styles.infoValue}>DesiCrew Solutions Internship</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0 (Production Build)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Framework</Text>
          <Text style={styles.infoValue}>React Native + Expo SDK 58</Text>
        </View>
      </View>

      {/* Persistence Architecture */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Data Durability</Text>
        <Text style={styles.cardText}>
          Photos captured with camera or chosen from gallery are permanently stored
          in the application document directory sandbox. Metadata is indexed
          locally via AsyncStorage. All data remains accessible offline and
          persists across device reboots.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEFF5',
    ...THEME.shadows.card,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  statBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F4FA',
    marginVertical: 10,
  },
  cardText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
});

