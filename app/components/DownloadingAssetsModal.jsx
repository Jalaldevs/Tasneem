import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ms = (size) => Math.round(size * 0.98);
const scaleFontSize = (size) => Math.round(size * 1.04);

export default function DownloadingAssetsModal({ visible, progress, t, theme, onClose }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card || theme.background }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={ms(24)} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text }]}>
            {t('premium.downloadingTitle', 'Downloading Data')}
          </Text>
          
          <Text style={[styles.message, { color: theme.muted }]}>
            {t('premium.downloadingMsg', 'The Sunnah database is currently downloading. Please wait.')}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
                    backgroundColor: theme.primary || '#3b82f6'
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.text }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>

          <ActivityIndicator size="small" color={theme.primary || '#3b82f6'} style={{ marginTop: ms(16) }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(24),
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: ms(20),
    padding: ms(24),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  closeButton: {
    position: 'absolute',
    top: ms(12),
    right: ms(12),
    zIndex: 10,
    padding: ms(4),
  },
  title: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    marginBottom: ms(12),
    textAlign: 'center',
  },
  message: {
    fontSize: scaleFontSize(15),
    textAlign: 'center',
    marginBottom: ms(24),
    lineHeight: scaleFontSize(22),
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: ms(8),
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: ms(4),
    overflow: 'hidden',
    marginBottom: ms(8),
  },
  progressBarFill: {
    height: '100%',
    borderRadius: ms(4),
  },
  progressText: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
  },
});
