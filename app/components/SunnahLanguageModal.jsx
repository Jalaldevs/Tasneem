import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale as ms } from '../utils/responsive';
import useAppTranslation from '../hooks/useAppTranslation';
import { useNavigationContext } from './NavigationContext';
import Colors from '../constants/Colors';
import { getAllTranslations } from '../constants/sunnahTranslations';

export default function SunnahLanguageModal({ visible, onClose, selectedBook, selectedLanguage, onSelectLanguage }) {
  const { colorScheme: scheme } = useNavigationContext();
  const { t } = useAppTranslation();
  const theme = Colors[scheme] || Colors.light;

  const handleSelect = (lang, available) => {
    if (available === false) {
      Alert.alert(t('sunnahUI.notAvailable') || "Not Available", t('sunnahUI.notAvailableDesc') || "This translation is not available for this specific book yet.");
      return;
    }
    onSelectLanguage(lang);
    onClose();
  };

  const titleText = t('sunnahUI.showTranslations') || 'Translations';
  
  // Get ALL translations for the selected book to show what we have and don't have
  const translations = selectedBook ? getAllTranslations(selectedBook) : [];
  
  // Add Arabic (default) to the beginning
  const options = [
    { code: 'none', label: 'Arabic', available: true },
    ...translations
  ];

  const styles = StyleSheet.create({
    overlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      justifyContent: 'flex-end', 
    },
    container: { 
      backgroundColor: theme.surface, 
      borderTopLeftRadius: ms(20), 
      borderTopRightRadius: ms(20), 
      maxHeight: '83%', 
      padding: ms(20),
      paddingBottom: ms(40)
    },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: ms(15) 
    },
    title: { 
      color: theme.title, 
      fontSize: ms(18), 
      fontWeight: 'bold' 
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
    item: { 
      flex: 1,
      margin: ms(5),
      paddingVertical: ms(12), 
      paddingHorizontal: ms(10),
      borderWidth: 1, 
      borderColor: theme.border, 
      borderRadius: ms(10),
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor: theme.background
    },
    itemActive: {
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f615'
    },
    itemText: { 
      color: theme.text, 
      fontSize: ms(14), 
      textTransform: 'capitalize' 
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{titleText}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={ms(24)} color={theme.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={item => item.code || 'default'}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => {
              const isActive = selectedLanguage === item.code;
              const isAvailable = item.available !== false;
              return (
                <TouchableOpacity 
                  style={[styles.item, isActive && styles.itemActive, !isAvailable && { opacity: 0.45 }]} 
                  onPress={() => handleSelect(item.code, isAvailable)}
                  activeOpacity={isAvailable ? 0.5 : 1}
                >
                  <Text style={[styles.itemText, isActive && { color: '#3b82f6', fontWeight: 'bold' }, !isAvailable && { color: theme.text }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={ms(18)} color="#3b82f6" />}
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
