import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ThemedView from '../ThemedView';
import { getNotes, saveNote, deleteNote } from '../../utils/notesStorage';
import { moderateScale, scaleFontSize } from '../../utils/responsive';
import useAppTranslation from '../../hooks/useAppTranslation';

const MODERATE_FACTOR = 0.35;
const ms = (size) => moderateScale(size, MODERATE_FACTOR);

const NotesModal = ({ visible, onClose, theme, isDarkMode }) => {
  const { t } = useAppTranslation();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (visible) {
      loadNotes();
    }
  }, [visible]);

  const loadNotes = async () => {
    setIsLoading(true);
    const loadedNotes = await getNotes();
    setNotes(loadedNotes);
    setIsLoading(false);
  };

  const handleCreateNote = () => {
    setCurrentNoteId(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  };

  const handleEditNote = (note) => {
    setCurrentNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty Note', 'Cannot save an empty note.');
      return;
    }
    
    await saveNote({
      id: currentNoteId,
      title: title.trim() || 'Untitled',
      content: content.trim()
    });
    
    setIsEditing(false);
    loadNotes();
  };

  const handleDeleteNote = (id) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(id);
          loadNotes();
        }
      }
    ]);
  };

  const handleExportPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              h1 { color: #1976d2; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
              .date { color: #888; font-size: 12px; margin-bottom: 20px; }
              p { font-size: 16px; line-height: 1.6; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${title || 'Untitled'}</h1>
            <p class="date">Generated on ${new Date().toLocaleDateString()}</p>
            <p>${content}</p>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing not available', 'PDF generated at: ' + uri);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  const handleInsertReference = () => {
    Alert.prompt(
      'Insert Reference',
      'Enter Ayah (e.g. 2:255) or Hadith reference',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Insert', 
          onPress: (ref) => {
            if (ref) setContent(prev => prev + `\n[Ref: ${ref}]\n`);
          }
        }
      ],
      'plain-text'
    );
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', borderColor: theme?.border || '#e2e8f0' }]}
      onPress={() => handleEditNote(item)}
    >
      <View style={styles.noteItemText}>
        <Text style={[styles.noteTitle, { color: theme?.text || '#000' }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.notePreview, { color: theme?.muted || '#64748b' }]} numberOfLines={2}>{item.content}</Text>
        <Text style={[styles.noteDate, { color: theme?.muted || '#94a3b8' }]}>{formatDate(item.updatedAt)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteNote(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={ms(20)} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={() => isEditing ? setIsEditing(false) : onClose()}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedView style={[styles.container, { backgroundColor: theme?.background || '#fff' }]}>
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme?.border || '#e2e8f0' }]}>
            <TouchableOpacity onPress={() => isEditing ? setIsEditing(false) : onClose()} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={ms(28)} color={isDarkMode ? '#60a5fa' : '#1976d2'} />
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: theme?.text || '#000' }]}>
              {isEditing ? (currentNoteId ? 'Edit Note' : 'New Note') : 'My Notes'}
            </Text>
            
            {isEditing ? (
              <View style={styles.headerRightActions}>
                <TouchableOpacity onPress={handleExportPDF} style={[styles.headerButton, { marginRight: 10 }]}>
                  <Ionicons name="document-text-outline" size={ms(24)} color={isDarkMode ? '#60a5fa' : '#1976d2'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveNote} style={styles.headerButton}>
                  <Text style={[styles.saveText, { color: isDarkMode ? '#60a5fa' : '#1976d2' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.headerRightActions}>
                <TouchableOpacity onPress={handleCreateNote} style={styles.headerButton}>
                  <Ionicons name="add" size={ms(28)} color={isDarkMode ? '#60a5fa' : '#1976d2'} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Body */}
          {isEditing ? (
            <View style={styles.editorContainer}>
              <TextInput
                style={[styles.titleInput, { color: theme?.text || '#000', borderBottomColor: theme?.border || '#e2e8f0' }]}
                placeholder="Note Title"
                placeholderTextColor={theme?.muted || '#94a3b8'}
                value={title}
                onChangeText={setTitle}
              />
              <View style={styles.editorToolbar}>
                <TouchableOpacity onPress={handleInsertReference} style={[styles.toolbarBtn, { backgroundColor: isDarkMode ? '#1e3a8a' : '#e0f2fe' }]}>
                  <Ionicons name="bookmark" size={ms(16)} color={isDarkMode ? '#93c5fd' : '#0284c7'} />
                  <Text style={[styles.toolbarBtnText, { color: isDarkMode ? '#93c5fd' : '#0284c7' }]}>Insert Ayah/Hadith</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.contentInput, { color: theme?.text || '#000' }]}
                placeholder="Write your note here..."
                placeholderTextColor={theme?.muted || '#94a3b8'}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>
          ) : (
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#60a5fa' : '#1976d2'} />
              </View>
            ) : (
              <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                renderItem={renderNoteItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="journal-outline" size={ms(60)} color={theme?.muted || '#cbd5e1'} />
                    <Text style={[styles.emptyText, { color: theme?.muted || '#64748b' }]}>No notes yet. Tap + to create one.</Text>
                  </View>
                }
              />
            )
          )}
          
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    paddingTop: Platform.OS === 'ios' ? ms(50) : ms(20),
    paddingBottom: ms(16),
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: ms(4),
  },
  headerTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: ms(16),
    paddingBottom: ms(40),
  },
  noteItem: {
    flexDirection: 'row',
    padding: ms(16),
    borderRadius: ms(12),
    marginBottom: ms(12),
    borderWidth: 1,
    alignItems: 'center',
  },
  noteItemText: {
    flex: 1,
  },
  noteTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    marginBottom: ms(4),
  },
  notePreview: {
    fontSize: scaleFontSize(14),
    marginBottom: ms(8),
  },
  noteDate: {
    fontSize: scaleFontSize(12),
  },
  deleteButton: {
    padding: ms(8),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: ms(100),
  },
  emptyText: {
    marginTop: ms(16),
    fontSize: scaleFontSize(16),
  },
  editorContainer: {
    flex: 1,
    padding: ms(16),
  },
  titleInput: {
    fontSize: scaleFontSize(22),
    fontWeight: 'bold',
    paddingVertical: ms(12),
    borderBottomWidth: 1,
    marginBottom: ms(12),
  },
  editorToolbar: {
    flexDirection: 'row',
    marginBottom: ms(12),
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(12),
    paddingVertical: ms(6),
    borderRadius: ms(20),
  },
  toolbarBtnText: {
    fontSize: scaleFontSize(12),
    fontWeight: '600',
    marginLeft: ms(4),
  },
  contentInput: {
    flex: 1,
    fontSize: scaleFontSize(16),
    lineHeight: scaleFontSize(24),
  },
});

export default NotesModal;
