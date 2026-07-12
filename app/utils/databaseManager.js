import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------
export const REMOTE_DB_URL = 'https://github.com/Jalaldevs/TasneemData/releases/download/v1.0/tasneem_data.db';

// expo-sqlite expects databases to be inside the "SQLite" folder in document directory
export const SQLITE_DIR = FileSystem.documentDirectory + 'SQLite/';
export const LOCAL_DB_PATH = SQLITE_DIR + 'tasneem_data.db';
export const DB_READY_KEY = '@app:isPremiumDataReady';

let dbInstance = null;

// ----------------------------------------------------------------------
// GLOBAL DOWNLOAD STATE & PUB/SUB
// ----------------------------------------------------------------------
let isDownloadingGlobal = false;
let downloadProgressGlobal = 0;
const downloadListeners = new Set();

const notifyDownloadListeners = () => {
  downloadListeners.forEach(listener => listener({ 
    isDownloading: isDownloadingGlobal, 
    progress: downloadProgressGlobal 
  }));
};

export const useDatabaseDownload = () => {
  const [state, setState] = useState({ 
    isDownloading: isDownloadingGlobal, 
    progress: downloadProgressGlobal 
  });

  useEffect(() => {
    downloadListeners.add(setState);
    return () => downloadListeners.delete(setState);
  }, []);

  return state;
};

// ----------------------------------------------------------------------
// CORE METHODS
// ----------------------------------------------------------------------

/**
 * Checks if the database is fully downloaded and available locally.
 */
export const isDatabaseReady = async () => {
  try {
    const isReady = await AsyncStorage.getItem(DB_READY_KEY);
    if (isReady === 'true') {
      const fileInfo = await FileSystem.getInfoAsync(LOCAL_DB_PATH);
      if (fileInfo.exists && fileInfo.size > 0) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking database status:', error);
    return false;
  }
};

/**
 * Downloads the database from the CDN to the local device storage.
 */
export const downloadDatabase = async () => {
  if (isDownloadingGlobal) return false; // Prevent concurrent downloads

  try {
    isDownloadingGlobal = true;
    downloadProgressGlobal = 0;
    notifyDownloadListeners();
    // Ensure SQLite directory exists
    const dirInfo = await FileSystem.getInfoAsync(SQLITE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(SQLITE_DIR, { intermediates: true });
    }

    // 1. Delete any existing corrupted file first
    const fileInfo = await FileSystem.getInfoAsync(LOCAL_DB_PATH);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(LOCAL_DB_PATH);
    }

    // 2. Create resumable download
    const downloadResumable = FileSystem.createDownloadResumable(
      REMOTE_DB_URL,
      LOCAL_DB_PATH,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        downloadProgressGlobal = progress;
        notifyDownloadListeners();
      }
    );

    // 3. Start download
    const result = await downloadResumable.downloadAsync();
    
    if (result && result.status === 200) {
      await AsyncStorage.setItem(DB_READY_KEY, 'true');
      return true;
    } else {
      throw new Error(`Download failed with status: ${result?.status}`);
    }
  } catch (error) {
    console.error('Database download failed:', error);
    const fileInfo = await FileSystem.getInfoAsync(LOCAL_DB_PATH);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(LOCAL_DB_PATH, { idempotent: true });
    }
    await AsyncStorage.removeItem(DB_READY_KEY);
    return false;
  } finally {
    isDownloadingGlobal = false;
    notifyDownloadListeners();
  }
};

/**
 * Deletes the local database
 */
export const resetDatabase = async () => {
  try {
    await FileSystem.deleteAsync(LOCAL_DB_PATH, { idempotent: true });
    await AsyncStorage.removeItem(DB_READY_KEY);
    dbInstance = null;
  } catch (error) {
    console.error('Failed to delete database:', error);
  }
};

let dbInstancePromise = null;

/**
 * Retrieves a singleton SQLite connection to the downloaded database
 */
export const getDBConnection = async () => {
  if (dbInstance) return dbInstance;
  if (dbInstancePromise) return dbInstancePromise;
  
  dbInstancePromise = (async () => {
    try {
      const ready = await isDatabaseReady();
      if (!ready) {
        console.warn('Cannot open DB connection: Database is not ready.');
        return null;
      }
      
      // openDatabaseAsync opens the file in the default SQLite directory
      dbInstance = await SQLite.openDatabaseAsync('tasneem_data.db');
      return dbInstance;
    } catch (error) {
      console.error('Failed to open database connection:', error);
      return null;
    } finally {
      dbInstancePromise = null;
    }
  })();

  return dbInstancePromise;
};
