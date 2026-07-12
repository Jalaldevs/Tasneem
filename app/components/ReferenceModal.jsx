import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Share,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import useAppTranslation from '../hooks/useAppTranslation';
import usePremium from '../hooks/usePremium';
import SearchModal from './search/SearchModal';
import InlineTafseer from './InlineTafseer';
import TafseerSelectionModal from './TafseerSelectionModal';
import { getTafseerText, getMultipleTafseerTexts } from '../utils/tafseerDb';
import {
  getAvailableTranslations,
  getAllTranslations,
  RTL_LANGS,
  BOOK_TRANSLATIONS,
  APP_LANG_TO_SUNNAH,
} from '../constants/sunnahTranslations';
import { readOfflineSunnahEdition } from '../utils/offlineContent';
import { useDatabaseDownload, isDatabaseReady, downloadDatabase } from '../utils/databaseManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ms = (size) => Math.round(size * 0.98);
const scaleFontSize = (size) => Math.round(size * 1.04);



// ─── Sunnah translation cache ─────────────────────────────────────────────────
const _translationCache = {};

async function fetchSunnahTranslation(langCode, bookKey) {
  const cacheKey = `${langCode}-${bookKey}`;
  if (_translationCache[cacheKey]) return _translationCache[cacheKey];
  
  const data = await readOfflineSunnahEdition(cacheKey);
  if (!data) throw new Error(`Translation ${cacheKey} not found`);
  _translationCache[cacheKey] = data;
  return data;
}

function findTranslatedText(editionData, hadithNumber) {
  if (!editionData?.hadiths) return null;
  const target = parseFloat(hadithNumber);
  const found = editionData.hadiths.find((h) => parseFloat(h.hadithnumber) === target);
  if (!found?.text) return null;
  return found.text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/ـ/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>');
}

import {
  TAFSEER_LIST,
  FREE_TAFSEERS_ORDER,
  FREE_TAFSEER_KEYS,
  TAFSEER_LANGUAGES,
  isMatchingLang,
  getLanguageByCode,
} from '../constants/tafseer';

// ─── Sunnah language selector (View overlay, NOT a Modal — safe inside Modal) ──
export function SunnahLanguageSheet({ visible, onClose, bookKey, selectedLang, onSelect, isDarkMode, accentColor, textColor, mutedColor, t }) {
  const translations = getAllTranslations(bookKey);
  const sheetBg = isDarkMode ? '#1e293b' : '#ffffff';
  const handleBg = isDarkMode ? '#475569' : '#cbd5e1';
  const itemActiveBg = isDarkMode ? 'rgba(96,165,250,0.15)' : 'rgba(25,118,210,0.09)';
  const itemBorder = isDarkMode ? 'rgba(96,165,250,0.22)' : 'rgba(25,118,210,0.18)';

  const [rendered, setRendered] = React.useState(visible);
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setRendered(false));
    }
  }, [visible]);

  if (!rendered) return null;

  return (
    <View style={sheetStyles.overlay} pointerEvents="box-none">
      <TouchableOpacity style={sheetStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[sheetStyles.sheet, { backgroundColor: sheetBg, transform: [{ translateY: slideAnim }] }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: ms(8) }}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-outline" size={ms(28)} color={textColor} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={[{ code: 'ar-only', label: 'Arabic', isArabicOnly: true }, ...translations]}
          numColumns={2}
          keyExtractor={(i) => i.code}
          renderItem={({ item }) => {
            if (item.isArabicOnly) {
              return (
                <TouchableOpacity
                  onPress={() => { onSelect(null); onClose(); }}
                  activeOpacity={0.75}
                  style={[
                    sheetStyles.item, 
                    { flex: 1, margin: ms(4), borderColor: !selectedLang ? itemBorder : 'transparent', borderWidth: 1 }, 
                    !selectedLang && { backgroundColor: itemActiveBg }
                  ]}
                >
                  <View style={sheetStyles.itemInner}>
                    <Text style={[sheetStyles.itemLabel, { color: textColor }]}>Arabic</Text>
                  </View>
                </TouchableOpacity>
              );
            }

            const active = item.code === selectedLang;
            const available = item.available;
            return (
              <TouchableOpacity
                onPress={() => { onSelect(item.code); onClose(); }}
                activeOpacity={available ? 0.75 : 1}
                style={[
                  sheetStyles.item,
                  { flex: 1, margin: ms(4), borderColor: active ? itemBorder : 'transparent', borderWidth: 1 },
                  active && { backgroundColor: itemActiveBg },
                  !available && { opacity: 0.45 }
                ]}
              >
                <View style={sheetStyles.itemInner}>
                  <Text style={[sheetStyles.itemLabel, { color: active ? accentColor : (available ? textColor : mutedColor) }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: ms(32) }}
        />
      </Animated.View>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24),
    paddingTop: ms(12), paddingHorizontal: ms(16),
    maxHeight: SCREEN_HEIGHT * 0.85,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: -4 },
  },
  sheetTitle: { fontSize: scaleFontSize(16), fontWeight: '700', textAlign: 'center', marginBottom: ms(14), letterSpacing: 0.3 },
  item: { borderRadius: ms(12), paddingVertical: ms(13), paddingHorizontal: ms(12), marginHorizontal: ms(4), marginBottom: ms(8) },
  itemInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: scaleFontSize(15), fontWeight: '500', textAlign: 'center' },
});

// ─── Quran language picker (View overlay — safe inside Modal) ─────────────────
export function QuranLanguageSheet({ visible, onClose, translationsKeys, languageCodeMap, selectedTranslation, onSelect, isDarkMode, accentColor, textColor, mutedColor, noTranslationKey, t, maxHeight }) {
  const sheetBg = isDarkMode ? '#1e293b' : '#ffffff';
  const handleBg = isDarkMode ? '#475569' : '#cbd5e1';
  const itemActiveBg = isDarkMode ? 'rgba(96,165,250,0.15)' : 'rgba(25,118,210,0.09)';
  const itemBorder = isDarkMode ? 'rgba(96,165,250,0.22)' : 'rgba(25,118,210,0.18)';

  const [rendered, setRendered] = React.useState(visible);
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setRendered(false));
    }
  }, [visible]);

  if (!rendered) return null;

  const allItems = [noTranslationKey, ...translationsKeys];

  return (
    <View style={sheetStyles.overlay} pointerEvents="box-none">
      <TouchableOpacity style={sheetStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[sheetStyles.sheet, { backgroundColor: sheetBg, maxHeight: maxHeight || SCREEN_HEIGHT * 0.7, transform: [{ translateY: slideAnim }] }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: ms(8) }}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-outline" size={ms(28)} color={textColor} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={allItems}
          keyExtractor={(item) => item}
          numColumns={2}
          persistentScrollbar={true}
          contentContainerStyle={{ paddingBottom: ms(32), paddingHorizontal: ms(4) }}
          renderItem={({ item }) => {
            const isNone = item === noTranslationKey;
            const label = isNone ? t('sunnahUI.noTranslation') : (languageCodeMap[item] || item);
            const active = item === selectedTranslation;
            return (
              <TouchableOpacity
                onPress={() => { onSelect(item); onClose(); }}
                activeOpacity={0.75}
                style={[
                  sheetStyles.item,
                  { flex: 1, margin: ms(4), alignItems: 'center', backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' },
                  active && { backgroundColor: itemActiveBg, borderColor: itemBorder, borderWidth: 1 },
                ]}
              >
                <Text style={[sheetStyles.itemLabel, { color: active ? accentColor : textColor, textAlign: 'center', textTransform: 'capitalize' }]} numberOfLines={2}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>
    </View>
  );
}

// ─── Tafseer picker (View overlay — safe inside Modal) ────────────────────────
// Single-select: user picks a tafseer to add to their active list.
function TafseerPickerSheet({ visible, onClose, onOpenSearch, onSelect, isDarkMode, accentColor, textColor, mutedColor, isPremium, requirePremium, t, language }) {
  const sheetBg = isDarkMode ? '#1e293b' : '#ffffff';
  const itemActiveBg = isDarkMode ? 'rgba(96,165,250,0.15)' : 'rgba(25,118,210,0.09)';

  const sortedTafseerList = React.useMemo(() => {
    if (!language) return TAFSEER_LIST;
    return [...TAFSEER_LIST].sort((a, b) => {
      const aFree = FREE_TAFSEER_KEYS.has(a.key);
      const bFree = FREE_TAFSEER_KEYS.has(b.key);
      if (aFree && !bFree) return -1;
      if (!aFree && bFree) return 1;
      if (aFree && bFree) return FREE_TAFSEERS_ORDER.indexOf(a.key) - FREE_TAFSEERS_ORDER.indexOf(b.key);
      
      const aMatch = isMatchingLang(a.key, language);
      const bMatch = isMatchingLang(b.key, language);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      
      if (a.rank !== b.rank) return a.rank - b.rank;
      return 0;
    });
  }, [language]);

  if (!visible) return null;

  return (
    <View style={sheetStyles.overlay} pointerEvents="box-none">
      <TouchableOpacity style={sheetStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[sheetStyles.sheet, { backgroundColor: sheetBg }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ms(12), paddingHorizontal: ms(4) }}>
          <Text style={{ fontSize: scaleFontSize(18), fontWeight: '700', color: textColor }}>
            Tafaseer Collection
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-outline" size={ms(28)} color={textColor} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={sortedTafseerList}
          keyExtractor={(tf) => tf.key}
          numColumns={2}
          persistentScrollbar={true}
          contentContainerStyle={{ paddingBottom: ms(32), paddingHorizontal: ms(4) }}
          renderItem={({ item: tf }) => {
            const isFree = FREE_TAFSEER_KEYS.has(tf.key);
            const isDisabled = !isFree && !isPremium;
            const matchesAppLang = isMatchingLang(tf.key, language);
            return (
              <TouchableOpacity
                style={[
                  sheetStyles.item,
                  {
                    flex: 1, margin: ms(4), alignItems: 'center', justifyContent: 'center',
                    height: ms(60), paddingVertical: 0,
                    backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                  },
                  matchesAppLang && { borderWidth: 1.5, borderColor: '#3b82f6' },
                  isDisabled && { opacity: 0.45 },
                ]}
                onPress={() => {
                  const proceed = () => onSelect(tf.key);
                  if (!isFree && !isPremium) requirePremium(proceed);
                  else proceed();
                }}
              >
                <View style={{ alignItems: 'center', width: '100%', paddingHorizontal: ms(6) }}>
                  <Text style={[sheetStyles.itemLabel, { color: textColor, textAlign: 'center', marginBottom: ms(2) }]} numberOfLines={1}>
                    {tf.name}
                  </Text>
                  <Text style={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: scaleFontSize(11.5), textAlign: 'center', fontWeight: '600' }} numberOfLines={1}>
                    {tf.langNative}
                  </Text>
                  {isDisabled && (
                    <Ionicons name="lock-closed" size={ms(12)} color={isDarkMode ? '#94a3b8' : '#9ca3af'} style={{ position: 'absolute', top: 0, right: 0 }} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}



// ─── Main ReferenceModal ───────────────────────────────────────────────────────
const ReferenceModal = ({
  visible,
  onClose,
  arabicText,
  translation,
  isBookmarked,
  onBookmark,
  onShare,
  theme,
  isDarkMode,
  hadithNumber,
  hadithBook,
  hadithBookKey,
  grades,
  ayahRef,
  onNext,
  onPrevious,
  onListenAyah,
  isPlaying,
  isBuffering,
  hasAudio,
  prevArabicText,
  prevTranslation,
  nextArabicText,
  nextTranslation,
  // Quran-mode props for language picker & tafseer
  quranTranslationsKeys,      // string[] — list of translation keys
  quranLanguageCodeMap,       // { [code]: nativeName }
  quranSelectedTranslation,   // currently selected translation key or 'none'
  quranNoTranslationKey,      // the sentinel value ('none')
  onQuranTranslationChange,   // (key: string) => void
  quranSurahName,             // e.g. 'Al-Baqarah'
  quranSurahId,               // number
  quranAyah,                  // the full ayah object for tafseer { id, isBasmala }
  quranAyahsList,             // full ayahs array for prev/next tafseer navigation
  // Quran-mode Tafseer Sync props
  quranIsTafseerExpanded,
  quranActiveTafseers,
  onQuranSetTafseerExpanded,
  onQuranToggleTafseer,
}) => {
  const { t, language } = useAppTranslation();
  const { requirePremium, isPremium } = usePremium();
  const [fontsLoaded] = useFonts({
    KFGQPCUthmanTahaNaskh: require('../../assets/fonts/kfgqpc_uthman_taha_naskh.ttf'),
  });

  const pagerRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [isSwipingEnabled, setIsSwipingEnabled] = useState(true);


  const { isDownloading, progress } = useDatabaseDownload();
  const [dbReady, setDbReady] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (visible) {
      isDatabaseReady().then(ready => {
        if (mounted) {
          setDbReady(ready);
          if (!ready && !isDownloading) {
            downloadDatabase();
          }
        }
      });
    }
    return () => { mounted = false; };
  }, [visible, isDownloading]);

  useEffect(() => {
    if (isDownloading && dbReady) setDbReady(false);
    if (!isDownloading && progress === 1) setDbReady(true);
  }, [isDownloading, progress, dbReady]);

  // ── Sunnah translation state ────────────────────────────────────────────────
  const [sunnahLangSheetVisible, setSunnahLangSheetVisible] = useState(false);
  const [selectedSunnahLang, setSelectedSunnahLang] = useState(null);
  const [sunnahTransEdition, setSunnahTransEdition] = useState(null);
  const [sunnahTransLoading, setSunnahTransLoading] = useState(false);
  const [sunnahTransError, setSunnahTransError] = useState(null);

  // ── Quran language picker state ─────────────────────────────────────────────
  const [quranLangSheetVisible, setQuranLangSheetVisible] = useState(false);

  // Search Modal state
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  // ── Tafseer state ───────────────────────────────────────────────────────────
  const activeTafseers = quranActiveTafseers || [];
  const isTafseerExpanded = quranIsTafseerExpanded || false;
  const [tafseerSheetVisible, setTafseerSheetVisible] = useState(false);

  // ── Persisted state loading ────────────────────────────────────────────────
  useEffect(() => {
    const mapped = APP_LANG_TO_SUNNAH[language?.toLowerCase()];
    if (mapped && BOOK_TRANSLATIONS[hadithBookKey]?.includes(mapped)) {
      setSelectedSunnahLang(mapped);
    } else {
      setSelectedSunnahLang(null);
    }
  }, [language, hadithBookKey]);

  const isSunnahMode = Boolean(hadithBookKey) && !ayahRef;
  const isQuranMode = Boolean(ayahRef);

  const sunnahTranslatedText = isSunnahMode && selectedSunnahLang && sunnahTransEdition
    ? findTranslatedText(sunnahTransEdition, hadithNumber)
    : (translation ?? null);

  const translatedText = isSunnahMode ? sunnahTranslatedText : (translation ?? null);

  // ── Fetch sunnah translation ────────────────────────────────────────────────
  useEffect(() => {
    if (!isSunnahMode || !selectedSunnahLang || !hadithBookKey) return;

    // Check if the selected translation is supported/available for this book
    const availableCodes = BOOK_TRANSLATIONS[hadithBookKey] ?? [];
    if (!availableCodes.includes(selectedSunnahLang)) {
      setSunnahTransEdition(null);
      setSunnahTransLoading(false);
      setSunnahTransError(null);
      return;
    }

    let cancelled = false;
    setSunnahTransLoading(true);
    setSunnahTransError(null);
    fetchSunnahTranslation(selectedSunnahLang, hadithBookKey)
      .then((data) => { if (!cancelled) { setSunnahTransEdition(data); setSunnahTransLoading(false); } })
      .catch(() => { if (!cancelled) { setSunnahTransError(t('sunnahUI.connectionError')); setSunnahTransLoading(false); } });
    return () => { cancelled = true; };
  }, [selectedSunnahLang, hadithBookKey, isSunnahMode]);

  useEffect(() => { setSunnahTransEdition(null); setSunnahTransError(null); }, [hadithBookKey]);

  // ── Tafseer handlers ─────────────────────────────────────────────────────────
  const handleSetTafseerExpanded = useCallback((expanded) => {
    setIsTafseerExpanded(expanded);
    AsyncStorage.setItem('@is_tafseer_expanded', expanded ? 'true' : 'false').catch(console.error);
  }, []);

  const handleToggleTafseer = useCallback(async (key) => {
    setActiveTafseers(prev => {
      let next;
      if (prev.includes(key)) {
        next = prev.filter(k => k !== key);
      } else {
        next = [...prev, key];
      }
      AsyncStorage.setItem('@reference_tafseer_keys', JSON.stringify(next)).catch(console.error);
      return next;
    });
  }, []);

  // ── Ids / labels ───────────────────────────────────────────────────────────
  const referenceId = ayahRef
    ? ayahRef
    : hadithBook && hadithNumber ? `${hadithBook}_${hadithNumber}` : hadithNumber;

  const arabicFontFamily = isQuranMode ? 'UthmanicHafs' : 'KFGQPCUthmanTahaNaskh';


  let referenceText = '';
  let iconName = 'library-outline';
  if (ayahRef) { referenceText = ayahRef; iconName = 'book-outline'; }
  else if (hadithBook && hadithNumber) { referenceText = `${hadithBook} #${hadithNumber}`; }
  else if (hadithNumber) { referenceText = t('referenceUI.hadithNumber', { number: hadithNumber }); }

  // ── Colours ────────────────────────────────────────────────────────────────
  const accentColor = isDarkMode ? '#60A5FA' : '#1976d2';
  const bgColor = isDarkMode ? '#0f172a' : '#f8faff';
  const headerBg = isDarkMode ? '#1e293b' : '#ffffff';
  const cardBg = isDarkMode ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)';
  const cardBorder = isDarkMode ? 'rgba(96,165,250,0.18)' : 'rgba(25,118,210,0.12)';
  const mutedColor = isDarkMode ? '#94a3b8' : '#64748b';
  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const actionBarBg = isDarkMode ? '#1e293b' : '#ffffff';
  const actionBarBorder = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const transBannerBg = isDarkMode ? 'rgba(96,165,250,0.08)' : 'rgba(25,118,210,0.05)';
  const tafseerBtnBorder = isDarkMode ? '#374151' : '#e5e7eb';



  // ── Share ──────────────────────────────────────────────────────────────────
  const performShare = async () => {
    let text = `${referenceText}\n\n`;
    if (arabicText) text += `${arabicText}\n\n`;
    if (translatedText) text += `${translatedText}\n\n`;
    
    if (grades && grades.length > 0) {
      text += `\n`;
      grades.forEach(g => {
        text += `${g.name}: ${g.grade}\n`;
      });
      text += `\n`;
    }

    try { await Share.share({ message: text.trim() }); } catch (e) { console.error(e); }
  };

  const handleSharePress = () => {
    if (onShare) { onShare(); return; }
    performShare();
  };

  // ── Quran Share ────────────────────────────────────────────────────────────
  const quranHasTranslation = isQuranMode &&
    quranSelectedTranslation &&
    quranSelectedTranslation !== (quranNoTranslationKey || 'none') &&
    Boolean(translation);

  const handleQuranSharePress = async () => {
    if (!quranHasTranslation) return;
    let text = referenceText ? `${referenceText}\n\n` : '';
    if (translation) text += `${translation}`;
    try { await Share.share({ message: text.trim() }); } catch (e) { console.error(e); }
  };

  // ── PagerView sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (pagerRef.current && (onPrevious || onNext)) {
      pagerRef.current.setPageWithoutAnimation(1);
      // Re-enable swiping after the native reset completes
      const timeout = setTimeout(() => setIsSwipingEnabled(true), 150);
      return () => clearTimeout(timeout);
    }
  }, [arabicText, translation, hadithNumber]);

  const onPageSelected = (e) => {
    const pos = e.nativeEvent.position;
    if (pos !== 1) {
      setIsSwipingEnabled(false);
      if (pos === 0 && onPrevious) onPrevious();
      if (pos === 2 && onNext) onNext();
    }
  };

  // ── Translation section ────────────────────────────────────────────────────
  const renderTranslationSection = (overrideTranslation) => {
    const activeQuranTranslation = overrideTranslation !== undefined ? overrideTranslation : translation;
    if (isQuranMode && activeQuranTranslation) {
      return (
        <View style={[styles.translationCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.translationText, { color: isDarkMode ? '#e2e8f0' : '#1e293b' }]}>{activeQuranTranslation}</Text>
        </View>
      );
    }
    if (!isSunnahMode || !selectedSunnahLang) return null;
    if (sunnahTransLoading) {
      return (
        <View style={[styles.translationCard, { backgroundColor: transBannerBg, borderColor: cardBorder, alignItems: 'center', paddingVertical: ms(20) }]}>
          <ActivityIndicator size="small" color={accentColor} />
          <Text style={{ color: mutedColor, marginTop: ms(8), fontSize: scaleFontSize(13) }}>{t('sunnahUI.loadingTranslation')}</Text>
        </View>
      );
    }
    if (sunnahTransError) {
      return (
        <View style={[styles.translationCard, { backgroundColor: transBannerBg, borderColor: cardBorder }]}>
          <Text style={{ color: '#ef4444', fontSize: scaleFontSize(13), textAlign: 'center' }}>{sunnahTransError}</Text>
        </View>
      );
    }
    if (sunnahTranslatedText) {
      const isRtl = RTL_LANGS.has(selectedSunnahLang);
      return (
        <View style={[styles.translationCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={[styles.langBadge, { backgroundColor: isDarkMode ? 'rgba(96,165,250,0.15)' : 'rgba(25,118,210,0.08)' }]}>
            <Ionicons name="language-outline" size={ms(13)} color={accentColor} style={{ marginRight: ms(4) }} />
            <Text style={[styles.langBadgeText, { color: accentColor }]}>{selectedSunnahLang.toUpperCase()}</Text>
          </View>
          <Text style={[styles.translationText, { color: isDarkMode ? '#e2e8f0' : '#1e293b', textAlign: isRtl ? 'right' : 'left', writingDirection: isRtl ? 'rtl' : 'ltr' }]}>
            {sunnahTranslatedText}
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.translationCard, { backgroundColor: transBannerBg, borderColor: cardBorder }]}>
        <Text style={{ color: mutedColor, fontSize: scaleFontSize(13), textAlign: 'center' }}>Translation not available for this specific hadith.</Text>
      </View>
    );
  };

  // ── Page content ───────────────────────────────────────────────────────────
  const renderContent = (currentArabic, currentTranslationOverride, isPreview) => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        ref={isPreview ? null : scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
      >
        {hadithBookKey === 'muslim' && (
          <View style={[styles.warningBanner, { 
            backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb', 
            borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : '#fde68a',
            borderWidth: 1,
            borderRadius: ms(12),
            padding: ms(14),
            marginBottom: ms(16),
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDarkMode ? 0 : 0.1,
            shadowRadius: 8,
            elevation: 2,
          }]}>
            <View style={{
              width: ms(36), height: ms(36), borderRadius: ms(18),
              backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
              alignItems: 'center', justifyContent: 'center', marginRight: ms(12)
            }}>
              <Ionicons name="information" size={22} color="#d97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isDarkMode ? '#fcd34d' : '#92400e', fontSize: scaleFontSize(13), lineHeight: scaleFontSize(19), fontWeight: '500' }}>
                {t('home.warning1')}
              </Text>
            </View>
          </View>
        )}
        {!!currentArabic && (
          <View style={{ backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1, padding: ms(16), paddingLeft: ms(18), borderRadius: ms(12), marginBottom: ms(14), elevation: 2, shadowColor: '#000', shadowOpacity: isDarkMode ? 0.3 : 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
            <Text style={[styles.arabicText, { color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: scaleFontSize(26) * 1.3, lineHeight: scaleFontSize(45) * 1.3, fontFamily: arabicFontFamily }]}>
              {currentArabic}
            </Text>
          </View>
        )}

        {renderTranslationSection(currentTranslationOverride)}

        {!isPreview && isSunnahMode && grades && grades.length > 0 && (
          <View style={{ marginTop: ms(4), marginBottom: ms(14), paddingHorizontal: ms(4) }}>
            {grades.map((g, i) => (
              <Text key={i} style={{ fontSize: scaleFontSize(12), color: mutedColor, marginBottom: ms(2) }}>
                {g.name}: {g.grade}
              </Text>
            ))}
          </View>
        )}

        {/* Tafseer button — Quran mode only, not basmalah */}
        {isQuranMode && quranAyah && !quranAyah.isBasmala && (
          <>
            {isTafseerExpanded && (
              <InlineTafseer
                surahId={quranSurahId}
                ayahId={quranAyah.id}
                activeTafseers={activeTafseers}
                language={language}
                asCard={true}
              />
            )}
            <TouchableOpacity
              style={[styles.tafseerBtn, { borderColor: tafseerBtnBorder }]}
              onPress={() => {
                if (isTafseerExpanded) {
                  onQuranSetTafseerExpanded?.(false);
                } else {
                  setTafseerSheetVisible(true);
                }
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="book-outline" size={ms(17)} color={accentColor} />
              <Text style={[styles.tafseerBtnText, { color: accentColor }]}>
                {isTafseerExpanded ? (t('quranUI.hideTafsir') || 'Hide Tafsir') : t('quranUI.showTafsir')}
              </Text>
              <Ionicons name={isTafseerExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={ms(16)} color={accentColor} />
            </TouchableOpacity>
          </>
        )}


        <View style={{ height: ms(130) }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent={false} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />

      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: actionBarBorder }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-down" size={ms(26)} color={accentColor} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Ionicons name={iconName} size={ms(15)} color={accentColor} style={{ marginRight: ms(6) }} />
            <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>{referenceText}</Text>
          </View>
          <TouchableOpacity onPress={() => setSearchModalVisible(true)} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="search-outline" size={ms(23)} color={accentColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onBookmark} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={ms(23)} color={accentColor} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {(!dbReady || isDownloading) ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '80%', alignItems: 'center' }}>
              <Text style={{ fontSize: scaleFontSize(16), fontWeight: '700', color: accentColor, marginBottom: ms(20) }}>
                {t('common.loading') || 'Downloading Premium Assets...'}
              </Text>
              <View style={{ width: '100%', height: ms(6), backgroundColor: isDarkMode ? 'rgba(59,130,246,0.2)' : 'rgba(27,131,222,0.2)', borderRadius: ms(3), overflow: 'hidden' }}>
                <View 
                  style={{
                    height: '100%',
                    backgroundColor: accentColor,
                    width: `${Math.round(progress * 100)}%`
                  }} 
                />
              </View>
              <Text style={{ marginTop: ms(10), color: mutedColor, fontSize: ms(12) }}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
        ) : (onPrevious || onNext) ? (
          <PagerView 
            ref={pagerRef} 
            style={{ flex: 1 }} 
            initialPage={1} 
            onPageSelected={onPageSelected}
            scrollEnabled={isSwipingEnabled}
          >
            <View key="0" style={{ flex: 1 }}>{renderContent(prevArabicText, prevTranslation, true)}</View>
            <View key="1" style={{ flex: 1 }}>{renderContent(arabicText, translation, false)}</View>
            <View key="2" style={{ flex: 1 }}>{renderContent(nextArabicText, nextTranslation, true)}</View>
          </PagerView>
        ) : (
          renderContent(arabicText, translation, false)
        )}

        {/* Action bar */}
        <View style={[styles.actionBar, { backgroundColor: actionBarBg, borderTopColor: actionBarBorder }]}>
          <TouchableOpacity onPress={onPrevious} disabled={!onPrevious} style={[styles.actionBtn, !onPrevious && styles.actionBtnDisabled]} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Ionicons name="chevron-back" size={ms(28)} color={!onPrevious ? mutedColor : accentColor} />
          </TouchableOpacity>

          {/* Sunnah: language button */}
          {isSunnahMode && (
            <TouchableOpacity
              onPress={() => setSunnahLangSheetVisible(true)}
              style={[styles.actionBtn, selectedSunnahLang && { backgroundColor: isDarkMode ? 'rgba(96,165,250,0.15)' : 'rgba(25,118,210,0.1)' }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="language-outline" size={ms(26)} color={accentColor} />
              {selectedSunnahLang && <View style={[styles.langDot, { backgroundColor: accentColor }]} />}
            </TouchableOpacity>
          )}

          {/* Sunnah: share button */}
          {isSunnahMode && (
            <TouchableOpacity
              onPress={handleSharePress}
              style={styles.actionBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="share-social-outline" size={ms(26)} color={accentColor} />
            </TouchableOpacity>
          )}

          {/* Quran: language button — opens sheet inside this modal */}
          {isQuranMode && quranTranslationsKeys && (
            <TouchableOpacity
              onPress={() => setQuranLangSheetVisible(true)}
              style={styles.actionBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="language-outline" size={ms(26)} color={accentColor} />
            </TouchableOpacity>
          )}

          {/* Quran: share button — disabled when no translation selected */}
          {isQuranMode && (
            <TouchableOpacity
              onPress={handleQuranSharePress}
              disabled={!quranHasTranslation}
              style={[styles.actionBtn, !quranHasTranslation && styles.actionBtnDisabled]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel={t('referenceUI.shareAyah') || 'Share Ayah'}
            >
              <Ionicons
                name="share-social-outline"
                size={ms(26)}
                color={quranHasTranslation ? accentColor : mutedColor}
              />
            </TouchableOpacity>
          )}



          <TouchableOpacity onPress={onNext} disabled={!onNext} style={[styles.actionBtn, !onNext && styles.actionBtnDisabled]} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Ionicons name="chevron-forward" size={ms(28)} color={!onNext ? mutedColor : accentColor} />
          </TouchableOpacity>
        </View>

        {/* ── View-overlay sheets (NOT nested Modals — no freeze risk) ── */}

        {/* Sunnah language sheet */}
        {isSunnahMode && (
          <SunnahLanguageSheet
            visible={sunnahLangSheetVisible}
            onClose={() => setSunnahLangSheetVisible(false)}
            bookKey={hadithBookKey}
            selectedLang={selectedSunnahLang}
            onSelect={(val) => {
              setSelectedSunnahLang(val);
              if (val) {
                AsyncStorage.setItem('@reference_sunnah_lang', val).catch(()=>{});
              } else {
                AsyncStorage.setItem('@reference_sunnah_lang', 'ara').catch(()=>{});
              }
            }}
            isDarkMode={isDarkMode}
            accentColor={accentColor}
            textColor={textColor}
            mutedColor={mutedColor}
            t={t}
          />
        )}

        {/* Quran language sheet */}
        {isQuranMode && quranTranslationsKeys && (
          <QuranLanguageSheet
            visible={quranLangSheetVisible}
            onClose={() => setQuranLangSheetVisible(false)}
            translationsKeys={quranTranslationsKeys}
            languageCodeMap={quranLanguageCodeMap || {}}
            selectedTranslation={quranSelectedTranslation}
            noTranslationKey={quranNoTranslationKey || 'none'}
            onSelect={(key) => {
              if (onQuranTranslationChange) onQuranTranslationChange(key);
            }}
            isDarkMode={isDarkMode}
            accentColor={accentColor}
            textColor={textColor}
            mutedColor={mutedColor}
            t={t}
          />
        )}



        {/* Tafseer Selection Modal */}
        {isQuranMode && (
          <TafseerSelectionModal
            visible={tafseerSheetVisible}
            onClose={() => {
              setTafseerSheetVisible(false);
              // Auto-expand if they selected something
              if (activeTafseers.length > 0) {
                onQuranSetTafseerExpanded?.(true);
              }
            }}
            activeTafseers={activeTafseers}
            onToggleTafseer={onQuranToggleTafseer || (() => {})}
          />
        )}

        {/* Search modal nested inside ReferenceModal so it displays on top */}
        <SearchModal 
          visible={searchModalVisible} 
          onClose={() => setSearchModalVisible(false)} 
          isNested={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: ms(48), paddingBottom: ms(14), paddingHorizontal: ms(16), borderBottomWidth: 0.5, elevation: 2, shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  headerBtn: { width: ms(40), height: ms(40), alignItems: 'center', justifyContent: 'center', borderRadius: ms(20) },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: ms(8) },
  headerTitle: { fontSize: scaleFontSize(15), fontWeight: '700', flexShrink: 1, letterSpacing: 0.2 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: ms(16), paddingTop: ms(20) },
  arabicText: { textAlign: 'right', writingDirection: 'rtl' },
  translationCard: { borderRadius: ms(16), borderWidth: 1, padding: ms(16), marginBottom: ms(14), elevation: 1, shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  translationText: { fontSize: scaleFontSize(15), lineHeight: scaleFontSize(24), textAlign: 'left' },
  langBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: ms(8), paddingVertical: ms(3), borderRadius: ms(6), marginBottom: ms(10) },
  langBadgeText: { fontSize: scaleFontSize(11), fontWeight: '700', letterSpacing: 0.8 },
  tafseerBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: ms(6), marginBottom: ms(14), paddingVertical: ms(8), paddingHorizontal: ms(14), borderRadius: ms(12), borderWidth: 1 },
  tafseerBtnText: { fontSize: scaleFontSize(14), fontWeight: '600' },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: ms(12), paddingBottom: ms(28), borderTopWidth: 0.5, elevation: 8, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  actionBtn: { width: ms(48), height: ms(48), alignItems: 'center', justifyContent: 'center', borderRadius: ms(24) },
  actionBtnDisabled: { opacity: 0.3 },
  langDot: { position: 'absolute', top: ms(8), right: ms(8), width: ms(7), height: ms(7), borderRadius: ms(4) },

});

export default ReferenceModal;