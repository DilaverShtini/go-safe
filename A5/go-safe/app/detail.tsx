import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet,
  Platform, 
  KeyboardAvoidingView, 
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';

import { GLOBAL_CHATS, DUMMY_MESSAGES, Message, ChatItem } from '../src/data/chatData';
import MessageBubble from '../src/components/MessageBubble';
import ChatInput from '../src/components/ChatInput';

export default function ChatDetailScreen() {
  const { user, id } = useLocalSearchParams<{ user: string; id: string }>();
  const chatId = Array.isArray(id) ? id[0] : id;

  const [messages, setMessages] = useState<Message[]>(() => {
    const rawMessages = (chatId && chatId in DUMMY_MESSAGES) ? DUMMY_MESSAGES[chatId] : [];
    return [...rawMessages].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  });
  
  const [input, setInput] = useState('');

  const updateGlobalChatList = (messageText: string) => {
      if (!chatId) return;
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const existingChatIndex = GLOBAL_CHATS.findIndex(c => c.id === chatId);

      if (existingChatIndex >= 0) {
          GLOBAL_CHATS[existingChatIndex].lastMessage = messageText;
          GLOBAL_CHATS[existingChatIndex].time = timeString;
          GLOBAL_CHATS[existingChatIndex].sortDate = now.toISOString();
      } else {
          const newChatEntry: ChatItem = {
              id: chatId,
              user: user || "Utente",
              lastMessage: messageText,
              time: timeString,
              sortDate: now.toISOString()
          };
          GLOBAL_CHATS.push(newChatEntry);
      }
  };

  const handleSend = () => {
    if (input.trim() && chatId) {
      const newId = Date.now().toString();
      const newMessage: Message = { id: newId, text: input, sender: 'me' };
      
      setMessages(prev => [newMessage, ...prev]); 
      
      if (!DUMMY_MESSAGES[chatId]) DUMMY_MESSAGES[chatId] = [];
      DUMMY_MESSAGES[chatId].push(newMessage);

      updateGlobalChatList(input);
      setInput('');
      
      if (chatId === 'support_team') {
          setTimeout(() => {
              const replyText = "Grazie per il messaggio. Un operatore ti risponderà a breve.";
              const botReply: Message = { id: (Date.now() + 1).toString(), text: replyText, sender: 'other' };
              
              setMessages(prev => [botReply, ...prev]);
              DUMMY_MESSAGES[chatId].push(botReply);
              updateGlobalChatList(replyText);
          }, 2000); 
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
           <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user || 'Chat'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} 
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          inverted 
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <MessageBubble text={item.text} sender={item.sender} />
          )}
        />
        
        <ChatInput 
            value={input} 
            onChangeText={setInput} 
            onSend={handleSend} 
        />
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  keyboardAvoidingContainer: { flex: 1, paddingHorizontal: 10 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#f7f7f7', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  headerButton: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },
});
