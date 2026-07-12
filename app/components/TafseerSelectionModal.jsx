import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale as ms, scaleFontSize } from '../utils/responsive';
import useAppTranslation from '../hooks/useAppTranslation';
import { useNavigationContext } from './NavigationContext';
import Colors from '../constants/Colors';
import usePremium from '../hooks/usePremium';
import {
  TAFSEER_LIST,
  FREE_TAFSEER_KEYS,
  isMatchingLang,
} from '../constants/tafseer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TafseerSelectionModal({ visible, onClose, activeTafseers, onToggleTafseer }) {
  const { colorScheme: scheme } = useNavigationContext();
  const { t, language } = useAppTranslation();
  const { requirePremium, isPremium } = usePremium();
  const isDarkMode = scheme === 'dark';
  const theme = Colors[scheme] || Colors.light;

  const titleText = t('quranUI.selectTafsir') || 'Select Tafseer';

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
      maxHeight: SCREEN_HEIGHT * 0.8,
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
      width: '48%',
      marginBottom: ms(10),
      paddingVertical: ms(12),
      paddingHorizontal: ms(10),
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: ms(10),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background
    },
    itemActive: {
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f615'
    },
    itemLabel: {
      color: theme.text,
      fontSize: ms(13),
      textAlign: 'center',
      marginBottom: ms(4),
      fontWeight: '500'
    },
    itemNative: {
      color: isDarkMode ? '#9ca3af' : '#64748b',
      fontSize: ms(11),
      textAlign: 'center',
      fontWeight: '600'
    }
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{titleText}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={ms(24)} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={TAFSEER_LIST}
            keyExtractor={item => item.key}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: tf }) => {
              const isActive = (activeTafseers || []).includes(tf.key);
              const isFree = FREE_TAFSEER_KEYS.has(tf.key);
              const isDisabled = !isFree && !isPremium;
              const matchesAppLang = isMatchingLang(tf.key, language);

              return (
                <TouchableOpacity
                  style={[
                    styles.item,
                    isActive && styles.itemActive,
                    matchesAppLang && !isActive && { borderColor: '#3b82f6', borderWidth: 1.5 },
                    isDisabled && { opacity: 0.45 },
                  ]}
                  onPress={() => {
                    const proceed = () => {
                      onToggleTafseer(tf.key);
                    };
                    if (!isFree && !isPremium) requirePremium(proceed);
                    else proceed();
                  }}
                >
                  <Text style={[styles.itemLabel, isActive && { color: '#3b82f6', fontWeight: 'bold' }]} numberOfLines={1}>
                    {tf.name}
                  </Text>
                  <Text style={styles.itemNative} numberOfLines={1}>
                    {tf.langNative}
                  </Text>
                  {isDisabled && (
                    <Ionicons name="lock-closed" size={ms(12)} color={theme.text} style={{ position: 'absolute', top: ms(6), right: ms(6), opacity: 0.5 }} />
                  )}
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={ms(16)} color="#3b82f6" style={{ position: 'absolute', top: ms(6), right: ms(6) }} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
