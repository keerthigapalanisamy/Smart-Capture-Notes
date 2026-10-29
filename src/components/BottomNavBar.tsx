import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';

export type TabKey = 'home' | 'settings';

interface BottomNavBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      {/* Home Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onSelectTab('home')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Home tab"
      >
        <View style={styles.iconBox}>
          {/* Stylized Home Icon */}
          <View
            style={[
              styles.homeRoof,
              activeTab === 'home' ? styles.activeRoof : styles.inactiveRoof,
            ]}
          />
          <View
            style={[
              styles.homeBody,
              activeTab === 'home' ? styles.activeBody : styles.inactiveBody,
            ]}
          >
            <View style={styles.homeDoor} />
          </View>
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'home' ? styles.activeLabel : styles.inactiveLabel,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Settings Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onSelectTab('settings')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Settings tab"
      >
        <View style={styles.iconBox}>
          {/* Stylized Gear/Settings Icon */}
          <Text
            style={[
              styles.settingsIconGlyph,
              activeTab === 'settings' ? styles.activeGear : styles.inactiveGear,
            ]}
          >
            ⚙
          </Text>
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'settings' ? styles.activeLabel : styles.inactiveLabel,
          ]}
        >
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 58,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#EAEFF5',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    gap: 3,
  },
  iconBox: {
    width: 24,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#64748B',
  },
  activeRoof: {
    borderBottomColor: THEME.colors.primary,
  },
  inactiveRoof: {
    borderBottomColor: '#64748B',
  },
  homeBody: {
    width: 14,
    height: 10,
    backgroundColor: '#64748B',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  activeBody: {
    backgroundColor: THEME.colors.primary,
  },
  inactiveBody: {
    backgroundColor: '#64748B',
  },
  homeDoor: {
    width: 4,
    height: 5,
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  settingsIconGlyph: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  activeGear: {
    color: THEME.colors.primary,
  },
  inactiveGear: {
    color: '#64748B',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeLabel: {
    color: THEME.colors.primary,
  },
  inactiveLabel: {
    color: '#64748B',
  },
});

