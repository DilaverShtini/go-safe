import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { GLOBAL_CHATS, ChatItem } from '../../src/data/chatData';
import ChatListRow from '../../src/components/ChatListRow';
import CreateChatModal from '../../src/components/CreateChatModal';

export default function ChatScreen() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [chatList, setChatList] = useState<ChatItem[]>(GLOBAL_CHATS);
  
  // Ricarica la lista ordinata dei messaggi
  useFocusEffect(
    useCallback(() => {
      const sorted = [...GLOBAL_CHATS].sort((a, b) => {
        const dateA = a.sortDate ? new Date(a.sortDate).getTime() : 0;
        const dateB = b.sortDate ? new Date(b.sortDate).getTime() : 0;
        return dateB - dateA;
      });
      setChatList(sorted);
    }, [])
  );

  const goToChat = (id: string, user: string) => {
    router.push({ pathname: '/detail', params: { user, id } });
  };

  const handleCreateNewChat = (contactName: string) => {
    setModalVisible(false);
    const existingChat = GLOBAL_CHATS.find(c => c.user === contactName);
    if (existingChat) {
      goToChat(existingChat.id, contactName);
    } else {
      const tempId = `new_${Date.now()}`;
      goToChat(tempId, contactName);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
         <Text style={styles.screenTitle}>Messaggi</Text>
      </View>

      <FlatList
        data={chatList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
           <ChatListRow 
              item={item} 
              onPress={() => goToChat(item.id, item.user)} 
           />
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
  screenHeader: { 
      paddingHorizontal: 20, 
      paddingVertical: 15, 
      backgroundColor: "#fff", 
      borderBottomWidth: 1, 
      borderBottomColor: '#f0f0f0' 
  },
  screenTitle: { fontSize: 28, fontWeight: "bold", color: "#333" },
  listContent: { paddingBottom: 100 },
  fab: { 
      position: "absolute", 
      bottom: 20, 
      right: 20, 
      width: 60, 
      height: 60, 
      borderRadius: 30, 
      backgroundColor: "#DDD", 
      justifyContent: "center", 
      alignItems: "center", 
      elevation: 5, 
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.25, 
      shadowRadius: 3.84 
  },
});