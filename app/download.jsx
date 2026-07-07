import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { downloadDatabase, isDatabaseReady } from './utils/databaseManager';
import { useRouter } from 'expo-router';

export default function DownloadScreen() {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    startDownload();
  }, []);

  const startDownload = async () => {
    setError(false);
    setProgress(0);
    const ready = await isDatabaseReady();
    if (ready) {
      router.replace('/main/Home');
      return;
    }
    
    const success = await downloadDatabase(setProgress);
    if (success) {
      router.replace('/main/Home');
    } else {
      setError(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Updating Assets...</Text>
      
      {!error ? (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.errorText}>Download failed. Please check your internet connection.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={startDownload}>
            <Text style={styles.retryText}>Retry Download</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1b83de', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  progressContainer: { width: '100%', alignItems: 'center' },
  progressText: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' },
  progressBarBg: { width: '100%', height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#1b83de' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#1b83de', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' }
});
