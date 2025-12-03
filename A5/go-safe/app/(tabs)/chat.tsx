import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// DATI STATICI
const DUMMY_CHATS = [
  { id: 'c1', user: 'Mario Rossi', lastMessage: 'Perfetto, ci vediamo domani.', time: '15:30', sortDate: '2025-11-26T15:30:00Z' },
  { id: 'c2', user: 'Anna Bianchi', lastMessage: 'Hai ricevuto il documento?', time: 'Ieri', sortDate: '2025-11-25T10:00:00Z' },
  { id: 'c3', user: 'Luca Verdi', lastMessage: 'Grazie mille per l\'aiuto!', time: 'Lunedì', sortDate: '2025-11-24T10:00:00Z' },
  { id: 'c4', user: 'Sofia Neri', lastMessage: 'Non dimenticare di chiamarmi.', time: '23/11', sortDate: '2025-11-23T10:00:00Z' },
  { id: 'c5', user: 'Giovanni Gialli', lastMessage: 'Tutto chiaro, procedo.', time: '14:00', sortDate: '2025-11-26T14:00:00Z' },
  { id: 'c6', user: 'Elena Marroni', lastMessage: 'Ti richiamo più tardi.', time: '12:05', sortDate: '2025-11-26T12:05:00Z' },
];

const MOCK_CONTACTS = [
  { id: 'u1', name: 'Luigi Verdi' },
  { id: 'u2', name: 'Giulia Neri' },
  { id: 'u3', name: 'Marco Gialli' },
  { id: 'u4', name: 'Mario Rossi' }, 
  { id: 'u5', name: 'Anna Bianchi' },
  { id: 'u6', name: 'Team Tech' },
  { id: 'u7', name: 'Supporto Clienti' },
];

// COMPONENTE MODALE
const CreateChatModal = ({ visible, onClose, onSelectContact }: any) => {
  const [searchText, setSearchText] = useState("");

  const filteredContacts = MOCK_CONTACTS.filter(contact => 
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalContainer}>
          
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuova Chat</Text>
            <View style={{ width: 26 }} /> 
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Cerca un contatto..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalListContent}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.contactRow} 
                onPress={() => onSelectContact(item.name)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactStatus}>Tocca per chattare</Text>
                </View>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#6C5CE7" />
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// SCHERMATA PRINCIPALE
export default function ChatScreen() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  
  const sortedChats = DUMMY_CHATS.slice().sort((a, b) => {
    return new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime();
  });

  const goToChat = (id: string, user: string) => {
    router.push({ pathname: '/detail', params: { user, id } });
  };

  const handleCreateNewChat = (contactName: string) => {
    setModalVisible(false);
    const existingChat = DUMMY_CHATS.find(c => c.user === contactName);
    const chatId = existingChat ? existingChat.id : `temp_${Date.now()}`;
    goToChat(chatId, contactName);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
         <Text style={styles.screenTitle}>Messaggi</Text>
      </View>

      <FlatList
        data={sortedChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
            <TouchableOpacity
             style={styles.chatContainer}
             activeOpacity={0.7}
             onPress={() => goToChat(item.id, item.user)}
           >
             <View style={styles.avatarContainer}>
                <Text style={{color: '#5E35B1', fontWeight: 'bold', fontSize: 18}}>
                    {item.user.charAt(0).toUpperCase()}
                </Text>
             </View>
             
             <View style={styles.textContainer}>
               <View style={styles.rowHeader}>
                 <Text style={styles.userName} numberOfLines={1}>{item.user}</Text>
                 <Text style={styles.time}>{item.time}</Text>
               </View>
               <Text style={styles.lastMessage} numberOfLines={1}>
                 {item.lastMessage}
               </Text>
             </View>
           </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#333" />
      </TouchableOpacity>

      <CreateChatModal 
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSelectContact={handleCreateNewChat}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff'},
  screenHeader: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  screenTitle: { fontSize: 28, fontWeight: "bold", color: "#333" },
  listContent: { paddingBottom: 100 },
  
  // Riga Chat
  chatContainer: { flexDirection: 'row', padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc', alignItems: 'center' },
  
  avatarContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#F3E5F5',
    marginRight: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  textContainer: { flex: 1, justifyContent: 'center' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  lastMessage: { fontSize: 14, color: '#777' },
  time: { fontSize: 12, color: '#999' },
  fab: { position: "absolute", bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: "#DDD", justifyContent: "center", alignItems: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  
  // Modale
  modalSafeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  modalContainer: { flex: 1, backgroundColor: "#F8F9FA" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  backButton: { padding: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 20, paddingHorizontal: 15, borderRadius: 12, height: 50, borderWidth: 1, borderColor: "#E0E0E0" },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  modalListContent: { paddingHorizontal: 20, paddingBottom: 40 },
  contactRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0" },
  

  contactAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F3E5F5", justifyContent: "center", alignItems: "center", marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: "bold", color: "#5E35B1" }, 
  
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: "600", color: "#333" },
  contactStatus: { fontSize: 12, color: "#888", marginTop: 2 },
});