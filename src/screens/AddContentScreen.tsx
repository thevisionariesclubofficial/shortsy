import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { addContent } from '../services/contentService';
import { COLORS } from '../constants/colors';

export default function AddContentScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('short-film');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [mood, setMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = { title, description, type, genre, language, mood };
      await addContent(payload);
      Alert.alert('Success', 'Content uploaded successfully!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add New Content</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Type (short-film/vertical-series)" value={type} onChangeText={setType} />
      <TextInput style={styles.input} placeholder="Genre" value={genre} onChangeText={setGenre} />
      <TextInput style={styles.input} placeholder="Language" value={language} onChangeText={setLanguage} />
      <TextInput style={styles.input} placeholder="Mood" value={mood} onChangeText={setMood} />
      <Button title={isLoading ? 'Uploading...' : 'Add Content'} onPress={handleSubmit} disabled={isLoading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: COLORS.text.primary,
    flexGrow: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.receipt.textLight,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});
