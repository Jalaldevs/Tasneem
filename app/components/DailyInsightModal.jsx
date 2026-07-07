import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import ThemedView from './ThemedView';
import { useNavigationContext } from './NavigationContext';
import useAppTranslation from '../hooks/useAppTranslation';
import { moderateScale, scaleFontSize } from '../utils/responsive';
import { quranArabicMap } from '../constants/quranArabicMap';
import { quranTranslationMap } from '../constants/quranTranslationMap';
import { readOfflineSunnahEdition } from '../utils/offlineContent';
import ReferenceModal, { QuranLanguageSheet, SunnahLanguageSheet } from './ReferenceModal';
import { BOOKS, booksFrontEnd } from '../constants/sunnahBooks';

const ms = (size) => moderateScale(size, 0.35);

const QURAN_LANG_MAP = {
  english: 'english', arabic: 'arabic', spanish: 'spanish', french: 'french',
  german: 'german', turkish: 'turkish', urdu: 'urdu', hindi: 'hindi',
  bengali: 'bengali', indonesian: 'indonesian', russian: 'russian',
  italian: 'italian', portuguese: 'portuguese', persian: 'persian',
  malay: 'malay', somali: 'somali', dutch: 'dutch', swedish: 'swedish',
  albanian: 'albanian', azerbaijani: 'azerbaijani', bosnian: 'bosnian',
  bulgarian: 'bulgarian', chinese: 'chinese', croatian: 'croatian',
  czech: 'czech', danish: 'danish', filipino: 'filipino', finish: 'finish',
  hebrew: 'hebrew', japanese: 'japanese', korean: 'korean',
  macedonian: 'macedonian', nepali: 'nepali', norwegian: 'norwegian',
  polish: 'polish', pushto: 'pushto', romanian: 'romanian', slovak: 'slovak',
  uzbek: 'uzbek', tamil: 'tamil',
};

const SUNNAH_LANG_MAP = {
  english: 'eng', arabic: 'ara', spanish: 'spa', french: 'fra',
  urdu: 'urd', hindi: 'hin', bengali: 'ben', indonesian: 'ind',
  russian: 'rus', turkish: 'tur', german: 'deu', italian: 'ita',
  portuguese: 'por', persian: 'fas', malay: 'msa', somali: 'som',
  dutch: 'nld', swedish: 'swe',
};

const ALL_QURAN_TRANSLATION_KEYS = Object.keys(quranTranslationMap);
const NAWAWI_TOTAL = 42;
const QURAN_NO_TRANS_KEY = 'none';

const DailyInsightModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { colorScheme: scheme, language } = useNavigationContext();
  const isDarkMode = scheme === 'dark';
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { t } = useAppTranslation();

  const accentColor = isDarkMode ? '#60A5FA' : '#1976d2';
  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const mutedColor = isDarkMode ? '#94a3b8' : '#64748b';

  const [dailyAyah, setDailyAyah] = useState(null);
  const [dailyHadith, setDailyHadith] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultQuranKey = QURAN_LANG_MAP[language] || 'english';
  const defaultHadithCode = SUNNAH_LANG_MAP[language] || 'eng';
  const [ayahTransKey, setAyahTransKey] = useState(defaultQuranKey);
  const [hadithLangCode, setHadithLangCode] = useState(defaultHadithCode);

  const [showAyahTransPicker, setShowAyahTransPicker] = useState(false);
  const [showHadithTransPicker, setShowHadithTransPicker] = useState(false);

  const [ayahRefModalVisible, setAyahRefModalVisible] = useState(false);
  const [hadithRefModalVisible, setHadithRefModalVisible] = useState(false);

  const [hadithTranslation, setHadithTranslation] = useState('');
  const [hadithTransLoading, setHadithTransLoading] = useState(false);

  // ── Countdown to midnight ────────────────────────────────────────────────────
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const calcCountdown = () => {
      const now = new Date();
      const target = new Date();
      if (now.getHours() < 12) {
        target.setHours(12, 0, 0, 0);
      } else {
        target.setHours(24, 0, 0, 0);
      }
      const diff = target - now;
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    };
    calcCountdown();
    const timer = setInterval(calcCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const nowDate = new Date();
  const datePart = nowDate.toISOString().split('T')[0];
  const halfPart = nowDate.getHours() < 12 ? 'AM' : 'PM';
  const timeStr = `${datePart}_${halfPart}`;

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const storedPeriod = await AsyncStorage.getItem('dailyInsight_currentPeriod');
        const currentPick = await AsyncStorage.getItem('dailyInsight_currentPick');
        
        if (storedPeriod === timeStr && currentPick) {
          const parsed = JSON.parse(currentPick);
          if (isMounted) {
            setDailyAyah(parsed.ayahObj);
            setDailyHadith(parsed.hadithObj);
            setLoading(false);
          }
          return;
        }

        let seenAyahs = JSON.parse((await AsyncStorage.getItem('dailyInsight_seenAyahs')) || '[]');
        let seenHadiths = JSON.parse((await AsyncStorage.getItem('dailyInsight_seenHadiths')) || '[]');

        let ayahObj = null;
        let ayahKey = '';
        for (let i = 0; i < 50; i++) {
          const randomSurahId = Math.floor(Math.random() * 114) + 1;
          const surahArabicData = quranArabicMap[randomSurahId];
          const verses = surahArabicData?.verses || [];
          const totalVerses = verses.length || 1;
          const randomAyahId = Math.floor(Math.random() * totalVerses) + 1;
          ayahKey = `${randomSurahId}:${randomAyahId}`;
          
          if (!seenAyahs.includes(ayahKey)) {
            const surahName = surahArabicData?.transliteration || surahArabicData?.name || ('Surah ' + randomSurahId);
            ayahObj = { surahId: randomSurahId, ayahId: randomAyahId, surahName, verses };
            break;
          }
        }
        
        if (!ayahObj) {
           ayahObj = { surahId: 1, ayahId: 1, surahName: 'Al-Fatihah', verses: quranArabicMap[1].verses };
           ayahKey = '1:1';
        }

        let hadithObj = null;
        let hadithKey = '';
        for (let i = 0; i < 50; i++) {
          const randomBookIndex = Math.floor(Math.random() * BOOKS.length);
          const bookKey = BOOKS[randomBookIndex];
          const bookName = booksFrontEnd[randomBookIndex];
          
          const arabicEdition = await readOfflineSunnahEdition(`ara-${bookKey}`);
          if (arabicEdition && arabicEdition.hadiths && arabicEdition.hadiths.length > 0) {
            const max = arabicEdition.hadiths.length;
            const randomH = arabicEdition.hadiths[Math.floor(Math.random() * max)];
            hadithKey = `${bookKey}:${randomH.hadithnumber}`;
            
            if (!seenHadiths.includes(hadithKey)) {
              let hadithArabicText = randomH.text || '';
              if (hadithArabicText) {
                hadithArabicText = hadithArabicText
                  .replace(/<br\s*\/?>/gi, '\n')
                  .replace(/<\/p>/gi, '\n')
                  .replace(/<p>/gi, '')
                  .replace(/(<([^>]+)>)/gi, '')
                  .replace(/&nbsp;/gi, ' ')
                  .replace(/ـ/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
              }
              hadithObj = { 
                bookKey, bookName, number: randomH.hadithnumber, 
                arabic: hadithArabicText, hadithnumber: randomH.hadithnumber, grades: randomH.grades || [] 
              };
              break;
            }
          }
        }

        if (!hadithObj) {
           hadithObj = { bookKey: 'nawawi', bookName: 'Forty Hadith Nawawi', number: 1, arabic: '', hadithnumber: 1, grades: [] };
           hadithKey = 'nawawi:1';
        }

        seenAyahs.push(ayahKey);
        if (seenAyahs.length > 500) seenAyahs.shift();
        
        seenHadiths.push(hadithKey);
        if (seenHadiths.length > 500) seenHadiths.shift();
        
        const newPick = { ayahObj, hadithObj };
        await AsyncStorage.setItem('dailyInsight_currentPeriod', timeStr);
        await AsyncStorage.setItem('dailyInsight_currentPick', JSON.stringify(newPick));
        await AsyncStorage.setItem('dailyInsight_seenAyahs', JSON.stringify(seenAyahs));
        await AsyncStorage.setItem('dailyInsight_seenHadiths', JSON.stringify(seenHadiths));

        if (isMounted) {
          setDailyAyah(ayahObj);
          setDailyHadith(hadithObj);
          setLoading(false);
        }
      } catch (e) {
        console.warn('Insight fetch error:', e);
        if (isMounted) setLoading(false);
      }
    };

    fetchInsights();
    return () => { isMounted = false; };
  }, [visible, timeStr]);

  useEffect(() => {
    if (!dailyHadith) return;
    let isMounted = true;
    const fetchHadithTrans = async () => {
      setHadithTransLoading(true);
      let text = '';
      try {
        if (hadithLangCode === 'ara') {
          text = '';
        } else {
          const bKey = dailyHadith.bookKey || 'nawawi';
          const edition = await readOfflineSunnahEdition(hadithLangCode + '-' + bKey);
          if (edition && edition.hadiths) {
            const h = edition.hadiths.find(hd => hd.hadithnumber === dailyHadith.number);
            if (h) text = h.text;
          }
          if (!text) {
            const eng = await readOfflineSunnahEdition('eng-' + bKey);
            if (eng && eng.hadiths) {
              const h = eng.hadiths.find(hd => hd.hadithnumber === dailyHadith.number);
              if (h) text = h.text;
            }
          }
        }
      } catch (e) { console.warn('Hadith translation error:', e); }
      const cleanHtml = (raw) => raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<p>/gi, '')
        .replace(/(<([^>]+)>)/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/ـ/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (isMounted) { setHadithTranslation(text ? cleanHtml(text) : ''); setHadithTransLoading(false); }
    };
    fetchHadithTrans();
    return () => { isMounted = false; };
  }, [dailyHadith, hadithLangCode]);

  const getAyahArabic = () => {
    if (!dailyAyah || !dailyAyah.verses) return '';
    const v = dailyAyah.verses.find(v => v.id === dailyAyah.ayahId);
    return v ? v.text : '';
  };

  const getAyahTranslation = () => {
    if (!dailyAyah || ayahTransKey === QURAN_NO_TRANS_KEY) return '';
    const tMap = quranTranslationMap[ayahTransKey] || quranTranslationMap['english'];
    if (tMap && tMap.quran) {
      const v = tMap.quran.find(v => v.chapter === dailyAyah.surahId && v.verse === dailyAyah.ayahId);
      if (v) return v.text;
    }
    return '';
  };

  const getAyahsList = () => {
    if (!dailyAyah) return [];
    const tMap = ayahTransKey !== QURAN_NO_TRANS_KEY ? (quranTranslationMap[ayahTransKey] || quranTranslationMap['english']) : null;
    return (dailyAyah.verses || []).map(v => {
      const trans = tMap && tMap.quran ? tMap.quran.find(t => t.chapter === dailyAyah.surahId && t.verse === v.id) : null;
      return { id: v.id, arabic: v.text, translation: trans ? trans.text : '' };
    });
  };

  const getAyahRefObject = () => {
    if (!dailyAyah) return null;
    return { id: dailyAyah.ayahId, arabic: getAyahArabic(), translation: getAyahTranslation() };
  };

  const handleShareAyah = async () => {
    const translation = getAyahTranslation();
    if (!dailyAyah || !translation) return;
    const source = t('dailyInsight.quranSource')
      .replace('{surah}', dailyAyah.surahId)
      .replace('{ayah}', dailyAyah.ayahId)
      .replace('{name}', dailyAyah.surahName);
    await Share.share({ message: '"' + translation + '"\n\n— ' + source }).catch(console.error);
  };

  const handleShareHadith = async () => {
    if (!dailyHadith || !hadithTranslation) return;
    const source = `${dailyHadith.bookName || 'Hadith'}, #${dailyHadith.number}`;
    await Share.share({ message: '"' + hadithTranslation + '"\n\n— ' + source }).catch(console.error);
  };

  const getPrevAyahArabic = () => !dailyAyah || dailyAyah.ayahId <= 1 ? null : ((dailyAyah.verses.find(v => v.id === dailyAyah.ayahId - 1) || {}).text || null);
  const getNextAyahArabic = () => !dailyAyah || dailyAyah.ayahId >= dailyAyah.verses.length ? null : ((dailyAyah.verses.find(v => v.id === dailyAyah.ayahId + 1) || {}).text || null);
  const getPrevAyahTrans = () => {
    if (!dailyAyah || dailyAyah.ayahId <= 1 || ayahTransKey === QURAN_NO_TRANS_KEY) return null;
    const tMap = quranTranslationMap[ayahTransKey] || quranTranslationMap['english'];
    if (!tMap || !tMap.quran) return null;
    const v = tMap.quran.find(v => v.chapter === dailyAyah.surahId && v.verse === dailyAyah.ayahId - 1);
    return v ? v.text : null;
  };
  const getNextAyahTrans = () => {
    if (!dailyAyah || dailyAyah.ayahId >= dailyAyah.verses.length || ayahTransKey === QURAN_NO_TRANS_KEY) return null;
    const tMap = quranTranslationMap[ayahTransKey] || quranTranslationMap['english'];
    if (!tMap || !tMap.quran) return null;
    const v = tMap.quran.find(v => v.chapter === dailyAyah.surahId && v.verse === dailyAyah.ayahId + 1);
    return v ? v.text : null;
  };

  const ayahArabic = dailyAyah ? getAyahArabic() : '';
  const ayahTranslation = dailyAyah ? getAyahTranslation() : '';
  const ayahShareDisabled = !ayahTranslation;
  const hadithShareDisabled = !hadithTranslation || hadithTransLoading;

  const quranLangCodeMap = {};
  ALL_QURAN_TRANSLATION_KEYS.forEach(k => { quranLangCodeMap[k] = k.charAt(0).toUpperCase() + k.slice(1); });

  return (
    <>
      <Modal visible={visible && !ayahRefModalVisible && !hadithRefModalVisible} animationType="slide" transparent onRequestClose={onClose}>
        <ThemedView style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContainer, { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, ms(20)) }]}>
            <View style={[styles.header, { borderBottomColor: theme.border + '40' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flash" size={ms(24)} color="#3b82f6" style={{ marginRight: ms(8) }} />
                <Text style={[styles.title, { color: theme.text }]}>{t('dailyInsight.title')}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={ms(28)} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Countdown pill */}
            <View style={[styles.countdownBar, { borderBottomColor: theme.border + '30' }]}>
              <Ionicons name="time-outline" size={ms(13)} color={mutedColor} style={{ marginRight: ms(4) }} />
              <Text style={[styles.countdownText, { color: mutedColor }]}>
                {t('dailyInsight.resetsIn')} {countdown}
              </Text>
            </View>

            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: ms(16) }}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="time-outline" size={ms(32)} color={theme.muted} />
                  <Text style={[styles.loadingText, { color: theme.muted }]}>{t('dailyInsight.loading')}</Text>
                </View>
              ) : (
                <>
                  {dailyAyah && (
                    <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : '#f0f9ff', borderColor: isDarkMode ? '#334155' : '#bae6fd' }]}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.cardTag, { color: '#0ea5e9' }]}>{t('dailyInsight.ayahTag')}</Text>
                        <View style={styles.cardActions}>
                          <TouchableOpacity onPress={() => setShowAyahTransPicker(true)} style={styles.actionBtn}>
                            <Ionicons name="earth-outline" size={ms(20)} color="#0ea5e9" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleShareAyah}
                            style={[styles.actionBtn, ayahShareDisabled && { opacity: 0.3 }]}
                            disabled={ayahShareDisabled}
                          >
                            <Ionicons name="share-social-outline" size={ms(20)} color="#0ea5e9" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {!!ayahArabic && (
                        <Text style={[styles.arabicText, { color: theme.text }]} selectable>{ayahArabic}</Text>
                      )}
                      {!!ayahTranslation && (
                        <Text style={[styles.translationText, { color: isDarkMode ? '#cbd5e1' : '#334155' }]} selectable>"{ayahTranslation}"</Text>
                      )}
                      {!ayahTranslation && !loading && (
                        <Text style={[styles.translationText, { color: theme.muted, fontStyle: 'italic' }]}>{t('dailyInsight.tapToChooseTrans')}</Text>
                      )}

                      <View style={[styles.cardFooter, { borderTopColor: isDarkMode ? '#334155' : 'rgba(0,0,0,0.07)' }]}>
                        <Text style={[styles.sourceText, { color: theme.muted }]}>
                          {t('dailyInsight.quranSource')
                            .replace('{surah}', dailyAyah.surahId)
                            .replace('{ayah}', dailyAyah.ayahId)
                            .replace('{name}', dailyAyah.surahName)}
                        </Text>
                        <TouchableOpacity style={[styles.readBtn, { backgroundColor: '#0ea5e9' }]} onPress={() => setAyahRefModalVisible(true)}>
                          <Text style={styles.readBtnText}>{t('dailyInsight.openReference')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {dailyHadith && (
                    <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : '#f0f9ff', borderColor: isDarkMode ? '#334155' : '#bae6fd' }]}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.cardTag, { color: '#0ea5e9' }]}>{t('dailyInsight.hadithTag')}</Text>
                        <View style={styles.cardActions}>
                          <TouchableOpacity onPress={() => setShowHadithTransPicker(true)} style={styles.actionBtn}>
                            <Ionicons name="earth-outline" size={ms(20)} color="#0ea5e9" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleShareHadith}
                            style={[styles.actionBtn, hadithShareDisabled && { opacity: 0.3 }]}
                            disabled={hadithShareDisabled}
                          >
                            <Ionicons name="share-social-outline" size={ms(20)} color="#0ea5e9" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {dailyHadith.bookKey === 'muslim' && (
                        <View style={[styles.warningBanner, { backgroundColor: isDarkMode ? '#451a03' : '#fef3c7', borderLeftColor: '#f59e0b' }]}>
                          <Ionicons name="warning" size={20} color="#f59e0b" style={{ marginTop: 2 }} />
                          <Text style={[styles.warningText, { color: isDarkMode ? '#fde68a' : '#92400e' }]}>
                            {t('home.warning1')}
                          </Text>
                        </View>
                      )}

                      {!!dailyHadith.arabic && (
                        <Text style={[styles.arabicText, { color: theme.text, fontFamily: 'KFGQPCUthmanTahaNaskh' }]} selectable>{dailyHadith.arabic}</Text>
                      )}
                      {hadithTransLoading ? (
                        <Text style={[styles.translationText, { color: theme.muted }]}>{t('dailyInsight.loadingTranslation')}</Text>
                      ) : !!hadithTranslation ? (
                        <Text style={[styles.translationText, { color: isDarkMode ? '#cbd5e1' : '#334155' }]} selectable>"{hadithTranslation}"</Text>
                      ) : (
                        <Text style={[styles.translationText, { color: theme.muted, fontStyle: 'italic' }]}>{t('dailyInsight.tapToChooseTrans')}</Text>
                      )}

                      <View style={[styles.cardFooter, { borderTopColor: isDarkMode ? '#334155' : 'rgba(0,0,0,0.07)' }]}>
                        <Text style={[styles.sourceText, { color: theme.muted }]}>
                          {dailyHadith.bookName || 'Hadith'}, #{dailyHadith.number}
                        </Text>
                        <TouchableOpacity style={[styles.readBtn, { backgroundColor: '#0ea5e9' }]} onPress={() => setHadithRefModalVisible(true)}>
                          <Text style={styles.readBtnText}>{t('dailyInsight.openReference')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>

          <QuranLanguageSheet
            visible={showAyahTransPicker}
            onClose={() => setShowAyahTransPicker(false)}
            translationsKeys={ALL_QURAN_TRANSLATION_KEYS}
            languageCodeMap={quranLangCodeMap}
            selectedTranslation={ayahTransKey}
            noTranslationKey={QURAN_NO_TRANS_KEY}
            onSelect={(key) => { setAyahTransKey(key); }}
            isDarkMode={isDarkMode}
            accentColor={accentColor}
            textColor={textColor}
            mutedColor={mutedColor}
            t={t}
          />
          <SunnahLanguageSheet
            visible={showHadithTransPicker}
            onClose={() => setShowHadithTransPicker(false)}
            bookKey={dailyHadith?.bookKey || 'nawawi'}
            selectedLang={hadithLangCode}
            onSelect={(code) => { setHadithLangCode(code || 'ara'); }}
            isDarkMode={isDarkMode}
            accentColor={accentColor}
            textColor={textColor}
            mutedColor={mutedColor}
            t={t}
          />
        </ThemedView>
      </Modal>

      {dailyAyah && ayahRefModalVisible && (
        <ReferenceModal
          visible={ayahRefModalVisible}
          onClose={() => setAyahRefModalVisible(false)}
          arabicText={ayahArabic}
          translation={ayahTranslation}
          ayahRef={dailyAyah.surahName + ' ' + dailyAyah.surahId + ':' + dailyAyah.ayahId}
          onShare={handleShareAyah}
          onPrevious={() => { if (dailyAyah && dailyAyah.ayahId > 1) setDailyAyah(prev => ({ ...prev, ayahId: prev.ayahId - 1 })); }}
          onNext={() => { if (dailyAyah && dailyAyah.ayahId < dailyAyah.verses.length) setDailyAyah(prev => ({ ...prev, ayahId: prev.ayahId + 1 })); }}
          prevArabicText={getPrevAyahArabic()}
          prevTranslation={getPrevAyahTrans()}
          nextArabicText={getNextAyahArabic()}
          nextTranslation={getNextAyahTrans()}
          theme={theme}
          isDarkMode={isDarkMode}
          quranSurahName={dailyAyah.surahName}
          quranSurahId={dailyAyah.surahId}
          quranAyah={getAyahRefObject()}
          quranAyahsList={getAyahsList()}
          quranTranslationsKeys={ALL_QURAN_TRANSLATION_KEYS}
          quranLanguageCodeMap={quranLangCodeMap}
          quranSelectedTranslation={ayahTransKey}
          quranNoTranslationKey={QURAN_NO_TRANS_KEY}
          onQuranTranslationChange={(key) => setAyahTransKey(key)}
        />
      )}

      {dailyHadith && hadithRefModalVisible && (
        <ReferenceModal
          visible={hadithRefModalVisible}
          onClose={() => setHadithRefModalVisible(false)}
          arabicText={dailyHadith.arabic}
          translation={hadithTranslation}
          hadithBookKey={dailyHadith.bookKey || 'nawawi'}
          hadithBook={dailyHadith.bookName || 'Forty Hadith Nawawi'}
          hadithNumber={dailyHadith.number}
          grades={dailyHadith.grades || []}
          onShare={handleShareHadith}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), maxHeight: '88%', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: ms(20), paddingVertical: ms(16), borderBottomWidth: 1 },
  title: { fontSize: scaleFontSize(20), fontWeight: '800' },
  closeBtn: { padding: ms(4) },
  scrollArea: { paddingHorizontal: ms(20) },
  loadingContainer: { paddingVertical: ms(60), alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: ms(16), fontSize: scaleFontSize(16), fontWeight: '500' },
  card: { borderRadius: ms(16), padding: ms(20), marginBottom: ms(20), borderWidth: 1, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: ms(16) },
  cardTag: { fontSize: scaleFontSize(12), fontWeight: '800', letterSpacing: 0.5 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: ms(10) },
  actionBtn: { padding: ms(3) },
  arabicText: { fontSize: scaleFontSize(22), lineHeight: scaleFontSize(36), writingDirection: 'rtl', textAlign: 'right', fontFamily: 'UthmanicHafs', marginBottom: ms(16) },
  translationText: { fontSize: scaleFontSize(16), lineHeight: scaleFontSize(26), fontStyle: 'italic', marginBottom: ms(20) },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: ms(16), marginTop: ms(4) },
  sourceText: { flex: 1, fontSize: scaleFontSize(13), fontWeight: '600' },
  readBtn: { paddingHorizontal: ms(14), paddingVertical: ms(8), borderRadius: ms(20) },
  readBtnText: { color: '#fff', fontSize: scaleFontSize(13), fontWeight: '700' },
  countdownBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: ms(7), borderBottomWidth: 1 },
  countdownText: { fontSize: scaleFontSize(12), fontWeight: '500', letterSpacing: 0.3 },
  warningBanner: {
    flexDirection: 'row',
    padding: ms(12),
    marginHorizontal: ms(0),
    marginBottom: ms(12),
    borderRadius: ms(8),
    borderLeftWidth: 4,
    alignItems: 'flex-start',
    gap: ms(10),
  },
  warningText: {
    flex: 1,
    fontSize: scaleFontSize(12),
    fontWeight: '500',
    lineHeight: scaleFontSize(16),
  },
});

export default DailyInsightModal;
