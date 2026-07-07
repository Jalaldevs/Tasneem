import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale as ms } from '../utils/responsive';
import appTranslations from '../constants/appTranslations';
import { useNavigationContext } from './NavigationContext';
import Colors from '../constants/Colors';

const SPOKEN_ORDER = [
  'english', 'chinese', 'hindi', 'spanish', 'french', 'arabic', 'bengali', 
  'russian', 'portuguese', 'urdu', 'malay', 'japanese', 'german', 'persian', 
  'turkish', 'korean', 'tamil', 'filipino', 'italian', 'polish', 'uzbek', 
  'kurdish', 'romanian', 'dutch', 'nepali', 'somali', 'swedish', 'slovak', 
  'norwegian', 'finnish', 'macedonian', 'maltese'
];

const AVAILABLE_LANGUAGES = Object.keys(appTranslations).sort((a, b) => {
  const indexA = SPOKEN_ORDER.indexOf(a);
  const indexB = SPOKEN_ORDER.indexOf(b);
  if (indexA === -1 && indexB === -1) return a.localeCompare(b);
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;
  return indexA - indexB;
});

export default function LanguageModal({ visible, onClose }) {
  const { language, setLanguage, colorScheme: scheme } = useNavigationContext();
  const theme = Colors[scheme] || Colors.light;

  const handleSelect = (lang) => {
    setLanguage(lang);
    onClose();
  };

  const titleText = appTranslations[language]?.settings?.options?.language?.title || 
                    appTranslations['english']?.settings?.options?.language?.title || 
                    'App Language';

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
            data={AVAILABLE_LANGUAGES}
            keyExtractor={item => item}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.item, language === item && styles.itemActive]} onPress={() => handleSelect(item)}>
                <Text style={[styles.itemText, language === item && { color: '#3b82f6', fontWeight: 'bold' }]} numberOfLines={1}>
                  {item}
                </Text>
                {language === item && <Ionicons name="checkmark" size={ms(18)} color="#3b82f6" />}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
