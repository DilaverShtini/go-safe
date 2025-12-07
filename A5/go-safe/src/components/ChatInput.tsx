import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export default function ChatInput({ value, onChangeText, onSend }: ChatInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Scrivi un messaggio..."
        multiline
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: value.trim() ? '#6C5CE7' : '#b3d1ff' }
        ]}
        onPress={onSend}
        disabled={!value.trim()}
      >
        <Text style={styles.sendButtonText}>Invia</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1, 
    minHeight: 40, 
    maxHeight: 100, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});