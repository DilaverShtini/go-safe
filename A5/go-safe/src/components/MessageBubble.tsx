import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageBubbleProps {
  text: string;
  sender: string;
}

export default function MessageBubble({ text, sender }: MessageBubbleProps) {
  const isMe = sender === 'me';
  return (
    <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    marginVertical: 4, 
    padding: 10, 
    borderRadius: 15,
    maxWidth: '80%',
  },
  myBubble: {
    alignSelf: 'flex-end', 
    backgroundColor: '#DCF8C6', 
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    alignSelf: 'flex-start', 
    backgroundColor: '#eee', 
    borderBottomLeftRadius: 2,
  },
  text: {
    fontSize: 16,
    color: '#000',
  }
});