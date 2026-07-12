import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getMultipleTafseerTexts } from '../utils/tafseerDb';
import { TAFSEER_LIST } from '../constants/tafseer';
import { moderateScale as ms, scaleFontSize } from '../utils/responsive';
import Colors from '../constants/Colors';
import { useNavigationContext } from './NavigationContext';

export default function InlineTafseer({ surahId, ayahId, activeTafseers, language }) {
  const { colorScheme: scheme } = useNavigationContext();
  const theme = Colors[scheme] || Colors.light;
  const isDarkMode = scheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [tafseerData, setTafseerData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchTafseers = async () => {
      setLoading(true);
      try {
        const results = await getMultipleTafseerTexts(activeTafseers, surahId, ayahId, language);
        if (isMounted) {
          const formatted = results.map(r => {
            const tfInfo = TAFSEER_LIST.find(t => t.key === r.key);
            return {
              key: r.key,
              name: tfInfo ? tfInfo.name : r.key,
              text: r.text
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/gi, ' ')
                .replace(/ـ/g, '')
                .replace(/\s+/g, ' ')
                .trim()
            };
          });
          setTafseerData(formatted);
        }
      } catch (err) {
        console.error('Failed to load inline tafseer', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (activeTafseers && activeTafseers.length > 0) {
      fetchTafseers();
    } else {
      setTafseerData([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [surahId, ayahId, activeTafseers, language]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  if (!activeTafseers || activeTafseers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {tafseerData.map((td, idx) => (
        <View key={td.key} style={[styles.tafseerBlock, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: ms(12), marginTop: ms(12) }]}>
          <Text style={[styles.tafseerTitle, { color: '#3b82f6' }]}>{td.name}</Text>
          <Text style={[styles.tafseerText, { color: theme.text }]}>{td.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: ms(12),
    paddingTop: ms(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  loadingContainer: {
    marginTop: ms(12),
    paddingTop: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tafseerBlock: {
    marginBottom: ms(4),
  },
  tafseerTitle: {
    fontSize: scaleFontSize(14),
    fontWeight: 'bold',
    marginBottom: ms(6),
  },
  tafseerText: {
    fontSize: scaleFontSize(16),
    lineHeight: scaleFontSize(24),
  }
});
