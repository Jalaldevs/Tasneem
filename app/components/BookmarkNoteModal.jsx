import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useNavigationContext } from './NavigationContext';
import { moderateScale, scaleFontSize } from '../utils/responsive';
import useAppTranslation from '../hooks/useAppTranslation';

const MODERATE_FACTOR = 0.35;
const ms = (size) => moderateScale(size, MODERATE_FACTOR);

const BookmarkNoteModal = ({
  visible,
  onClose,
  onSave,
  noteValue,
  onChangeNote,
  title,
  subtitle,
}) => {
  const { colorScheme: scheme } = useNavigationContext();
  const { t } = useAppTranslation();
  
  const activeTheme = scheme === 'dark' ? Colors.dark : Colors.light;
  const textColor = activeTheme?.text ?? '#000000';
  const surfaceColor = activeTheme?.surface ?? '#FFFFFF';
  const cardColor = activeTheme?.card ?? activeTheme?.surface ?? '#F5F5F5';
  const borderColor = activeTheme?.border ? `${activeTheme.border}40` : '#CCCCCC';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity 
          style={styles.modalBackground} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={[styles.modalContent, { backgroundColor: surfaceColor, borderColor }]}> 
          <View style={[styles.header, { borderBottomColor: borderColor }]}> 
            <View style={{ flex: 1, paddingRight: ms(10) }}>
              <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{title}</Text>
              {!!subtitle && <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={2}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={ms(24)} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.body}>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: textColor, 
                  backgroundColor: cardColor,
                  borderColor: borderColor
                }
              ]}
              value={noteValue}
              onChangeText={onChangeNote}
              placeholder={t('bookmarks.notePlaceholder', 'Enter note...')}
              placeholderTextColor={activeTheme?.muted ?? '#888888'}
              multiline
              textAlignVertical="top"
            />
            
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: textColor }]}>{t('common.cancel', 'Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: scheme === 'dark' ? '#1E3A8A' : '#2F6FED' }]}
                onPress={() => {
                  onSave();
                  onClose();
                }}
              >
                <Text style={styles.saveButtonText}>{t('common.save', 'Save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: ms(16),
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ms(16),
    borderBottomWidth: 1,
  },
  title: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: scaleFontSize(14),
    marginTop: ms(4),
    opacity: 0.8,
  },
  closeButton: {
    padding: ms(4),
  },
  body: {
    padding: ms(16),
  },
  textInput: {
    height: ms(120),
    borderWidth: 1,
    borderRadius: ms(8),
    padding: ms(12),
    fontSize: scaleFontSize(16),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: ms(16),
    gap: ms(12),
  },
  button: {
    paddingVertical: ms(10),
    paddingHorizontal: ms(20),
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: ms(8),
  },
  saveButton: {
  },
  buttonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
});

export default BookmarkNoteModal;
