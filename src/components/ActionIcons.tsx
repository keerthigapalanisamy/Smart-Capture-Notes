import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Pixel-precise Blue Pencil icon matching the reference design.
 * Tilted at 45 degrees, colored in primary blue #2160E8.
 */
export const EditPencilIcon: React.FC<{ color?: string }> = ({ color = '#2160E8' }) => {
  return (
    <View style={styles.pencilWrapper}>
      <View style={styles.pencilRotator}>
        <View style={[styles.pencilEraser, { backgroundColor: color }]} />
        <View style={[styles.pencilShaft, { backgroundColor: color }]} />
        <View style={[styles.pencilPoint, { borderTopColor: color }]} />
      </View>
    </View>
  );
};

/**
 * Pixel-precise Red Trash Can icon matching the reference design.
 * Features a top handle, lid rim, and can body in solid red #EF4444.
 */
export const DeleteTrashIcon: React.FC<{ color?: string; bodyLineColor?: string }> = ({
  color = '#EF4444',
  bodyLineColor = '#FFF0F2',
}) => {
  return (
    <View style={styles.trashWrapper}>
      {/* Lid handle */}
      <View style={[styles.trashHandle, { backgroundColor: color }]} />
      {/* Lid rim */}
      <View style={[styles.trashLid, { backgroundColor: color }]} />
      {/* Can body */}
      <View style={[styles.trashCanBody, { backgroundColor: color }]}>
        <View style={[styles.trashRib, { backgroundColor: bodyLineColor }]} />
        <View style={[styles.trashRib, { backgroundColor: bodyLineColor }]} />
      </View>
    </View>
  );
};

/**
 * Pixel-precise Calendar vector icon matching the reference design.
 * Features 2 top binder hooks, outline body with rounded corners, and inner grid line.
 */
export const CalendarIcon: React.FC<{ color?: string }> = ({ color = '#64748B' }) => {
  return (
    <View style={styles.calendarWrapper}>
      {/* Top 2 binder hooks */}
      <View style={styles.calendarPinsRow}>
        <View style={[styles.calendarPin, { backgroundColor: color }]} />
        <View style={[styles.calendarPin, { backgroundColor: color }]} />
      </View>
      {/* Calendar body outline */}
      <View style={[styles.calendarBody, { borderColor: color }]}>
        {/* Header divider line */}
        <View style={[styles.calendarDivider, { backgroundColor: color }]} />
        {/* Grid dots */}
        <View style={styles.calendarGrid}>
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Pencil styles
  pencilWrapper: {
    width: 13,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pencilRotator: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  pencilEraser: {
    width: 3.2,
    height: 2,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    marginBottom: 0.5,
  },
  pencilShaft: {
    width: 3.2,
    height: 5.5,
    marginBottom: 0.5,
  },
  pencilPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderTopWidth: 2.6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  // Trash can styles
  trashWrapper: {
    width: 12,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashHandle: {
    width: 4,
    height: 1.6,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    marginBottom: 0.6,
  },
  trashLid: {
    width: 11,
    height: 1.6,
    borderRadius: 0.8,
    marginBottom: 0.8,
  },
  trashCanBody: {
    width: 8.5,
    height: 8.5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 1,
  },
  trashRib: {
    width: 1,
    height: 5.5,
    borderRadius: 0.5,
  },

  // Calendar icon styles matching reference
  calendarWrapper: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarPinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 7,
    marginBottom: -1,
    zIndex: 1,
  },
  calendarPin: {
    width: 1.4,
    height: 2,
    borderRadius: 0.5,
  },
  calendarBody: {
    width: 11,
    height: 9.5,
    borderRadius: 2,
    borderWidth: 1.1,
    alignItems: 'center',
    paddingTop: 1.5,
  },
  calendarDivider: {
    width: '100%',
    height: 0.8,
    marginBottom: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDot: {
    width: 1.4,
    height: 1.4,
    borderRadius: 0.3,
  },
});

