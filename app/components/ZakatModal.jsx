import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Colors from '../constants/Colors';
import { useNavigationContext } from './NavigationContext';
import useAppTranslation from '../hooks/useAppTranslation';
import { moderateScale, scaleFontSize } from '../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import hc from 'hijri-converter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MODERATE_FACTOR = 0.35;
const ms = (size) => moderateScale(size, MODERATE_FACTOR);

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
  'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

const ZakatModal = ({ visible, onClose }) => {
  const { colorScheme: scheme } = useNavigationContext();
  const theme = { ...(scheme === 'dark' ? Colors.dark : Colors.light), primary: Colors.primary };
  const { t } = useAppTranslation();

  const [wealth, setWealth] = useState('');
  const [hijriDate, setHijriDate] = useState({ hd: 1, hm: 1, hy: 1445 });
  const [showPicker, setShowPicker] = useState(false);
  const [hasSetReminder, setHasSetReminder] = useState(false);

  const setDefaultHijriDate = () => {
    const today = new Date();
    const currentHijri = hc.toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setHijriDate({ hd: currentHijri.hd, hm: currentHijri.hm, hy: currentHijri.hy + 1 });
  };

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem('@zakat_hijri_date').then(val => {
        if (val) {
          try {
            setHijriDate(JSON.parse(val));
          } catch(e) {
            setDefaultHijriDate();
          }
        } else {
          setDefaultHijriDate();
        }
      }).catch(() => setDefaultHijriDate());
    } else {
      setWealth('');
      setShowPicker(false);
      setHasSetReminder(false);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && hijriDate) {
      AsyncStorage.setItem('@zakat_hijri_date', JSON.stringify(hijriDate)).catch(() => {});
    }
  }, [hijriDate, visible]);

  const calculateZakat = () => {
    const amount = parseFloat(wealth);
    if (isNaN(amount) || amount <= 0) return '0.00';
    return (amount * 0.025).toFixed(2);
  };

  const handleSetReminder = async () => {
    if (hasSetReminder) {
      Alert.alert(
        t('zakat.changeDateTitle') || 'Change Date?',
        t('zakat.changeDateMsg') || 'You already have a reminder set. Do you want to change it?',
        [
          { text: t('common.cancel') || 'Cancel', style: 'cancel' },
          { text: t('common.confirm') || 'Confirm', onPress: scheduleReminder }
        ]
      );
    } else {
      await scheduleReminder();
    }
  };

  const scheduleReminder = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('home.permissionRequired') || 'Permission Required',
        t('home.notificationNeeded') || 'Please enable notifications.'
      );
      return;
    }

    try {
      // Convert Hijri back to Gregorian for the notification
      const gregorian = hc.toGregorian(hijriDate.hy, hijriDate.hm, hijriDate.hd);
      const reminderDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd, 10, 0, 0); // 10:00 AM

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('zakat.title') || 'Zakat Reminder',
          body: t('zakat.reminderBody') || 'It is time to check your Zakat.',
          sound: true,
        },
        trigger: {
          type: 'date',
          date: reminderDate,
        },
      });

      setHasSetReminder(true);
      setShowPicker(false);

      Alert.alert(
        t('common.success') || 'Success',
        t('zakat.reminderSuccess') || 'Reminder set successfully!'
      );
    } catch (err) {
      console.error('Zakat reminder scheduling failed:', err);
      Alert.alert(
        t('common.error') || 'Error',
        'Failed to schedule reminder. Please try again.'
      );
    }
  };

  const zakatDue = calculateZakat();

  const adjustHijriDate = (field, amount) => {
    setHijriDate(prev => {
      let newDate = { ...prev };
      if (field === 'hd') {
        newDate.hd += amount;
        if (newDate.hd > 30) newDate.hd = 1;
        if (newDate.hd < 1) newDate.hd = 30;
      } else if (field === 'hm') {
        newDate.hm += amount;
        if (newDate.hm > 12) newDate.hm = 1;
        if (newDate.hm < 1) newDate.hm = 12;
      } else if (field === 'hy') {
        newDate.hy += amount;
        if (newDate.hy < 1440) newDate.hy = 1440;
        if (newDate.hy > 1500) newDate.hy = 1500;
      }
      return newDate;
    });
  };

  const renderHijriSelector = () => {
    return (
      <View style={[styles.hijriSelector, { backgroundColor: scheme === 'dark' ? '#374151' : '#ffffff', borderColor: scheme === 'dark' ? '#4b5563' : '#d1d5db' }]}>
        
        {/* Day */}
        <View style={styles.pickerColumn}>
          <TouchableOpacity onPress={() => adjustHijriDate('hd', 1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-up" size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pickerText, { color: theme.text }]}>{hijriDate.hd}</Text>
          <TouchableOpacity onPress={() => adjustHijriDate('hd', -1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-down" size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pickerLabel, { color: theme.muted }]}>Day</Text>
        </View>

        {/* Month */}
        <View style={[styles.pickerColumn, { flex: 1.5 }]}>
          <TouchableOpacity onPress={() => adjustHijriDate('hm', 1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-up" size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pickerText, { color: theme.text, fontSize: scaleFontSize(16) }]} numberOfLines={1}>
            {HIJRI_MONTHS[hijriDate.hm - 1]}
          </Text>
          <TouchableOpacity onPress={() => adjustHijriDate('hm', -1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-down" size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pickerLabel, { color: theme.muted }]}>Month</Text>
        </View>

        {/* Year */}
        <View style={styles.pickerColumn}>
          <TouchableOpacity onPress={() => adjustHijriDate('hy', 1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-up" size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pickerText, { color: theme.text }]}>{hijriDate.hy}</Text>
          <TouchableOpacity onPress={() => adjustHijriDate('hy', -1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-down" size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pickerLabel, { color: theme.muted }]}>Year</Text>
        </View>

      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: scheme === 'dark' ? '#0f172a' : '#f8faff' }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#0f172a' : '#f8faff' }]}>
            {/* HEADER */}
            <View style={[styles.header, { backgroundColor: scheme === 'dark' ? '#1e293b' : '#ffffff', borderBottomColor: scheme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}>
              <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                <Ionicons name="chevron-down" size={ms(26)} color={theme.primary} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: theme.text }]}>
                {t('zakat.title') || 'Zakat Calculator'}
              </Text>
              <View style={styles.backBtn} />
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* HERO DASHBOARD */}
              <LinearGradient
                colors={[theme.primary, theme.primary + 'CC']}
                style={styles.heroCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="wallet-outline" size={ms(32)} color="#fff" style={styles.heroIcon} />
                <Text style={styles.heroLabel}>{t('zakat.zakatDue') || 'Zakat Due (2.5%)'}</Text>
                <Text style={styles.heroAmount}>{zakatDue}</Text>
              </LinearGradient>

              {/* WEALTH INPUT */}
              <View style={[styles.card, { backgroundColor: scheme === 'dark' ? '#1f2937' : '#f9fafb' }]}>
                <View style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: scheme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: wealth ? theme.primary : (scheme === 'dark' ? '#4b5563' : '#d1d5db')
                  }
                ]}>
                  <Text style={[styles.currencySymbol, { color: theme.muted }]}>$</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.muted}
                    value={wealth}
                    onChangeText={setWealth}
                  />
                  {wealth.length > 0 && (
                    <TouchableOpacity onPress={() => setWealth('')}>
                      <Ionicons name="close-circle" size={ms(20)} color={theme.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* REMINDER SECTION */}
              <View style={[styles.card, { backgroundColor: scheme === 'dark' ? '#1f2937' : '#f9fafb' }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {t('zakat.setReminder') || 'Set Hijri Reminder'}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.inputWrapper, 
                    { paddingVertical: ms(16), marginBottom: showPicker ? ms(10) : ms(16), backgroundColor: scheme === 'dark' ? '#374151' : '#ffffff', borderColor: scheme === 'dark' ? '#4b5563' : '#d1d5db' }
                  ]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowPicker(!showPicker);
                  }}
                >
                  <Ionicons name="moon-outline" size={ms(20)} color={theme.primary} style={{ marginRight: ms(8) }} />
                  <Text style={{ color: theme.text, fontSize: scaleFontSize(16), fontWeight: '600' }}>
                    {`${hijriDate.hd} ${HIJRI_MONTHS[hijriDate.hm - 1]} ${hijriDate.hy}`}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Ionicons name={showPicker ? "chevron-up" : "chevron-down"} size={ms(20)} color={theme.muted} />
                </TouchableOpacity>

                {showPicker && renderHijriSelector()}

                <TouchableOpacity
                  style={[styles.reminderButton, { backgroundColor: theme.primary, borderColor: theme.primary, marginBottom: 0 }]}
                  onPress={handleSetReminder}
                  activeOpacity={0.8}
                >
                  <Ionicons name="notifications" size={ms(20)} color="#fff" style={{ marginRight: ms(8) }} />
                  <Text style={[styles.reminderText, { color: '#fff', textAlign: 'center' }]}>
                    {t('common.save') || 'Save Reminder'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SAVED DATE SECTION */}
              {hasSetReminder && (
                <View style={[styles.card, { backgroundColor: scheme === 'dark' ? '#1f2937' : '#f9fafb', marginBottom: ms(40) }]}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {t('zakat.selectedDate') || 'Saved Reminder Date'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="moon" size={ms(24)} color={theme.primary} style={{ marginRight: ms(10) }} />
                    <Text style={{ color: theme.text, fontSize: scaleFontSize(18), fontWeight: '600' }}>
                      {`${hijriDate.hd} ${HIJRI_MONTHS[hijriDate.hm - 1]} ${hijriDate.hy}`}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    paddingVertical: ms(14),
    borderBottomWidth: 0.5,
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn: {
    width: ms(40),
    height: ms(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(20),
  },
  title: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  content: { flex: 1 },
  contentContainer: {
    padding: ms(20),
    paddingBottom: ms(40),
  },
  heroCard: {
    borderRadius: ms(20),
    padding: ms(24),
    alignItems: 'center',
    marginBottom: ms(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroIcon: { marginBottom: ms(8), opacity: 0.9 },
  heroLabel: {
    color: '#fff',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: ms(4),
  },
  heroAmount: {
    color: '#fff',
    fontSize: scaleFontSize(42),
    fontWeight: '800',
    letterSpacing: -1,
  },
  card: {
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: ms(20),
  },
  cardTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginBottom: ms(12),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ms(12),
    paddingHorizontal: ms(16),
    borderWidth: 1.5,
  },
  currencySymbol: {
    fontSize: scaleFontSize(22),
    fontWeight: '600',
    marginRight: ms(8),
  },
  input: {
    flex: 1,
    fontSize: scaleFontSize(24),
    paddingVertical: ms(16),
    fontWeight: '700',
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ms(14),
    borderRadius: ms(16),
    borderWidth: 1.5,
    marginTop: ms(16),
    justifyContent: 'center',
  },
  reminderText: {
    flex: 1,
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  hijriSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: ms(12),
    borderRadius: ms(12),
    borderWidth: 1.5,
    marginBottom: ms(16),
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  arrowBtn: {
    padding: ms(6),
  },
  pickerText: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
    marginVertical: ms(4),
  },
  pickerLabel: {
    fontSize: scaleFontSize(12),
    marginTop: ms(2),
  }
});

export default ZakatModal;
