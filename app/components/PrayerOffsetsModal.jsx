import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleFontSize, moderateScale } from '../utils/responsive';
import useAppTranslation from '../hooks/useAppTranslation';

const MODERATE_FACTOR = 0.35;
const ms = (size) => moderateScale(size, MODERATE_FACTOR);

const PrayerOffsetsModal = ({ visible, onClose, theme, offsets, onSave }) => {
  const { t } = useAppTranslation();
  const [localOffsets, setLocalOffsets] = useState(offsets);

  useEffect(() => {
    if (visible) {
      setLocalOffsets(offsets);
    }
  }, [visible, offsets]);

  const handleIncrement = (prayer) => {
    setLocalOffsets((prev) => ({ ...prev, [prayer]: (prev[prayer] || 0) + 1 }));
  };

  const handleDecrement = (prayer) => {
    setLocalOffsets((prev) => ({ ...prev, [prayer]: (prev[prayer] || 0) - 1 }));
  };

  const handleReset = () => {
    setLocalOffsets({});
  };

  const handleSave = () => {
    onSave(localOffsets);
    onClose();
  };

  const isDark = theme?.background === '#192132' || theme?.background === '#000000';
  const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="timer-outline" size={28} color={theme.dontKnow || '#4568dd'} />
              <Text style={[styles.headerTitle, { color: theme.title }]}>
                {t('prayerOffsets.title', 'Adjust Prayer Times')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: isDark ? '#2C3A4D' : '#F1F5F9' }]}>
              <Ionicons name="close" size={22} color={theme.muted} />
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <View style={styles.infoSection}>
            <Text style={[styles.infoText, { color: theme.text }]}>
              {t('prayerOffsets.infoText', 'Manually adjust the calculated prayer times in minutes to match your local mosque or preferred calendar.')}
            </Text>
          </View>

          {/* Sliders / Buttons */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            {PRAYERS.map((prayer) => {
              const val = localOffsets[prayer] || 0;
              return (
                <View key={prayer} style={[styles.row, { borderBottomColor: isDark ? '#374151' : '#e5e7eb' }]}>
                  <Text style={[styles.prayerName, { color: theme.text }]}>
                    {t(`home.prayers.${prayer.toLowerCase()}`, prayer)}
                  </Text>

                  <View style={styles.controls}>
                    <TouchableOpacity
                      onPress={() => handleDecrement(prayer)}
                      style={[styles.btn, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
                    >
                      <Ionicons name="remove" size={20} color={theme.text} />
                    </TouchableOpacity>

                    <Text style={[styles.valText, { color: theme.title, width: ms(45) }]}>
                      {val > 0 ? `+${val}` : val} m
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleIncrement(prayer)}
                      style={[styles.btn, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
                    >
                      <Ionicons name="add" size={20} color={theme.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Save & Reset Buttons */}
          <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }]}>
            <TouchableOpacity style={[styles.resetButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]} onPress={handleReset}>
              <Text style={[styles.resetButtonText, { color: theme.text }]}>{t('prayerOffsets.reset', 'Reset')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{t('prayerOffsets.save', 'Save Changes')}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingVertical: ms(16),
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
  },
  headerTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
  },
  closeButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(8),
  },
  infoText: {
    fontSize: scaleFontSize(14),
    lineHeight: scaleFontSize(20),
    opacity: 0.8,
  },
  scrollView: {
    paddingHorizontal: ms(20),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ms(16),
    borderBottomWidth: 1,
  },
  prayerName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  valText: {
    fontSize: scaleFontSize(15),
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: ms(20),
    paddingVertical: ms(16),
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: ms(12),
  },
  resetButton: {
    borderRadius: ms(12),
    paddingVertical: ms(14),
    paddingHorizontal: ms(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1b83de',
    borderRadius: ms(12),
    paddingVertical: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: scaleFontSize(16),
    fontWeight: '700',
  },
});

export default PrayerOffsetsModal;
