import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_STORAGE_KEY = '@tasneem_user_notes';

/**
 * Generate a unique ID for a note.
 */
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

/**
 * Retrieve all notes from AsyncStorage.
 */
export const getNotes = async () => {
  try {
    const data = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (data !== null) {
      const notes = JSON.parse(data);
      // Sort by updatedAt descending (newest first)
      return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    return [];
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

/**
 * Save a new note or update an existing one.
 * @param {Object} note - The note to save (should contain title and content, and id if updating)
 */
export const saveNote = async (note) => {
  try {
    const currentNotes = await getNotes();
    let updatedNotes;

    const now = new Date().toISOString();

    if (note.id) {
      // Update existing note
      updatedNotes = currentNotes.map((n) => {
        if (n.id === note.id) {
          return { ...n, ...note, updatedAt: now };
        }
        return n;
      });
    } else {
      // Create new note
      const newNote = {
        ...note,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      updatedNotes = [newNote, ...currentNotes];
    }

    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    return updatedNotes;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

/**
 * Delete a note by its ID.
 * @param {string} noteId - The ID of the note to delete
 */
export const deleteNote = async (noteId) => {
  try {
    const currentNotes = await getNotes();
    const filteredNotes = currentNotes.filter((n) => n.id !== noteId);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
    return filteredNotes;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};
