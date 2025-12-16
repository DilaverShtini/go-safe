import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

const MOCK_CONTACTS = [
  { id: 'u1', name: 'Luigi Verdi' },
  { id: 'u2', name: 'Giulia Neri' },
  { id: 'u3', name: 'Marco Gialli' },
  { id: 'u4', name: 'Mario Rossi' },
  { id: 'u5', name: 'Anna Bianchi' },
  { id: 'u6', name: 'Team Tech' },
  { id: 'u7', name: 'Supporto Clienti' },
];

interface CreateChatModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectContact: (contactName: string) => void;
}

export default function CreateChatModal({ visible, onClose, onSelectContact }: CreateChatModalProps) {
  const [searchText, setSearchText] = useState("");

  // Filtra i contatti in base alla ricerca
  const filteredContacts = MOCK_CONTACTS.filter(contact => 
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Header del Modal */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nuova Chat</Text>
            <View style={{ width: 26 }} /> 
          </View>

          {/* Barra di Ricerca */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Cerca un contatto..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Lista Contatti */}
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.contactRow} 
                onPress={() => onSelectContact(item.name)}
              >
                {/* Avatar Finto con Iniziale */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactStatus}>Toccal per chattare</Text>
                </View>
                
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#6C5CE7" />
              </TouchableOpacity>
            )}
          />

        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EADDFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6C5CE7",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  contactStatus: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});