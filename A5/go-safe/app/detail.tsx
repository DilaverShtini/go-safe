import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet,
  Platform, 
  KeyboardAvoidingView, 
  TouchableOpacity,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';

// Dati Fittizi Messaggi
const DUMMY_MESSAGES = {
  c1: [
    { id: '1', text: 'Ciao Mario!', sender: 'me' },
    { id: '2', text: 'Ciao! Riesci a vederci per il progetto?', sender: 'other' },
    { id: '3', text: 'Sì, ti confermo la disponibilità per domani.', sender: 'me' },
    { id: '4', text: 'Ok, il punto di ritrovo rimane quello in piazza?', sender: 'other' },
    { id: '5', text: 'Perfetto, ci vediamo domani alle 10:00.', sender: 'me' },
  ],
  c2: [
    { id: '1', text: 'Ciao Anna, come va la migrazione?', sender: 'me' },
    { id: '2', text: 'Bene, grazie! Quando mi invii i dati finali?', sender: 'other' },
    { id: '3', text: 'Te li mando oggi pomeriggio.', sender: 'me' },
    { id: '4', text: 'Te l\'ho appena inviato via mail.', sender: 'other' },
    { id: '5', text: 'Hai ricevuto il documento?', sender: 'me' },
    { id: '6', text: 'Sì, grazie. Lo guardo subito.', sender: 'other' },
  ],
  c3: [
    { id: '1', text: 'Ciao Luca!', sender: 'me' },
    { id: '2', text: 'Non riesco a caricare i dati.', sender: 'other' },
    { id: '3', text: 'Hai provato a ripulire la cache del server?', sender: 'me' },
    { id: '4', text: 'Sì, ora funziona. Sono riuscito a risolvere il bug seguendo la tua guida.', sender: 'other' },
    { id: '5', text: 'Figurati! Fammi sapere se hai problemi.', sender: 'me' },
    { id: '6', text: 'Grazie mille per l\'aiuto!', sender: 'other' },
  ],
  c4: [
    { id: '1', text: 'Ciao Sofia!', sender: 'me' },
    { id: '2', text: 'Sei a casa per le 20:00?', sender: 'other' },
    { id: '3', text: 'Sì, sono appena arrivata.', sender: 'me' },
    { id: '4', text: 'Certo, ti chiamo dopo cena.', sender: 'other' },
    { id: '5', text: 'Non dimenticare di chiamarmi.', sender: 'me' },
  ],
  c5: [
    { id: '1', text: 'Ciao Giovanni!', sender: 'me' },
    { id: '2', text: 'Confermi che hai ricevuto la lista degli ospiti?', sender: 'other' },
    { id: '3', text: 'Sì, tutto chiaro. Procedo.', sender: 'me' },
    { id: '4', text: 'Quindi usiamo il format standard per il report.', sender: 'other' },
  ],
  c6: [
    { id: '1', text: 'Ciao Elena!', sender: 'me' },
    { id: '2', text: 'Riesci a prendere la documentazione dal sito?', sender: 'other' },
    { id: '3', text: 'Sì, la scarico ora.', sender: 'me' },
    { id: '4', text: 'Aspetto la tua conferma allora.', sender: 'other' },
    { id: '5', text: 'Devo controllare, ti richiamo più tardi.', sender: 'me' },
  ],
};

// Definiamo esplicitamente il tipo per evitare errori nello StyleSheet
const BASE_BUBBLE_STYLE: ViewStyle = {
    marginVertical: 4, 
    padding: 10, 
    borderRadius: 15,
    maxWidth: '80%', 
};

export default function ChatDetailScreen() {
  const { user, id } = useLocalSearchParams<{ user: string; id: string }>();

  const chatId = Array.isArray(id) ? id[0] : id;

  const [messages, setMessages] = useState(() => {
    const rawMessages = (chatId && chatId in DUMMY_MESSAGES)
      ? DUMMY_MESSAGES[chatId as keyof typeof DUMMY_MESSAGES] 
      : [];
    return rawMessages.slice().sort((a, b) => parseInt(b.id) - parseInt(a.id));
  });
  
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      const newId = Date.now().toString();
      const newMessage = { id: newId, text: input, sender: 'me' };
      setMessages([newMessage, ...messages]); 
      setInput('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
           <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{user || 'Chat'}</Text>

        <View style={styles.headerButton} />
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
          renderItem={({ item }) => (
            <View style={item.sender === 'me' ? styles.myBubble : styles.otherBubble}>
              <Text style={styles.messageText}>
                {item.text}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
        
        {/* Barra di Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Scrivi un messaggio..."
            multiline 
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: input.trim() ? '#6C5CE7' : '#b3d1ff' }
            ]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendButtonText}>Invia</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  } as ViewStyle,

  keyboardAvoidingContainer: {
    flex: 1,
    paddingHorizontal: 10,
  } as ViewStyle,

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7', 
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  } as ViewStyle,

  headerButton: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  } as ViewStyle,

  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
    flex: 1,
  } as TextStyle,

  listContent: {
    paddingBottom: 10, 
    paddingTop: 10, 
  } as ViewStyle,

  myBubble: { 
    ...BASE_BUBBLE_STYLE, 
    alignSelf: 'flex-end', 
    backgroundColor: '#DCF8C6', 
    borderBottomRightRadius: 2, 
  } as ViewStyle,

  otherBubble: { 
    ...BASE_BUBBLE_STYLE, 
    alignSelf: 'flex-start', 
    backgroundColor: '#eee', 
    borderBottomLeftRadius: 2, 
  } as ViewStyle,

  messageText: {
    fontSize: 16,
    color: '#000',
  } as TextStyle,

  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  } as ViewStyle,

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
  } as TextStyle,

  sendButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  } as ViewStyle,

  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  } as TextStyle,
});