import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  TextInput
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from 'expo-audio';
import { SafeAreaView } from "react-native-safe-area-context";

interface Contact {
  id: string;
  name: string;
  relation: string;
  phoneNumber: string;
}

const MOCK_CONTACTS: Contact[] = [
  { id: "1", name: "Mario", relation: "Genitore", phoneNumber: "+390000000000" },
  { id: "2", name: "Maria", relation: "Genitore", phoneNumber: "+390000000000" },
  { id: "3", name: "Numero Emergenza", relation: "Servizi", phoneNumber: "11" },
  { id: "4", name: "Superman", relation: "Supereroe", phoneNumber: "+390000000000" },
];

export default function SosScreen() {
  const player = useAudioPlayer(require('../../assets/sirena_emergenza.mp3'));

  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = MOCK_CONTACTS.filter((contact) => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  const handleCall = (phoneNumber: string) => {
    const number = phoneNumber.replace(/\s/g, ''); 
    const phoneUrl = Platform.OS === 'android' ? `tel:${number}` : `telprompt:${number}`;

    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Errore", "Impossibile chiamare");
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch((err) => console.error("Errore:", err));
  };

  const toggleAlarm = () => {
    if (player.playing) {
      player.pause();
      player.seekTo(0); 
    } else {
      player.loop = true; 
      player.play();
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <View style={styles.avatarContainer}>
           <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.relation}>{item.relation}</Text>
            <Text style={styles.number}>{item.phoneNumber}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.callButton} 
        onPress={() => handleCall(item.phoneNumber)}
      >
        <Ionicons name="call" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOS e chiamate di emergenza</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca contatto o numero..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
               <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? "Nessun contatto trovato." : "Nessun contatto configurato."}
            </Text>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, player.playing ? styles.fabActive : null]} 
        onPress={toggleAlarm}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons 
            name={player.playing ? "bell-off" : "bell-ring"} 
            size={32} 
            color="white" 
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  header: { 
    padding: 20, 
    backgroundColor: "#fff", 
    borderBottomWidth: 1, 
    borderColor: "#eee"
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#e74c3c",
    paddingVertical: 4
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginTop: 5,
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7f8c8d"
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50"
  },
  relation: {
    fontSize: 13,
    color: "#95a5a6"
  },
  number: {
    fontSize: 14,
    color: "#34495e",
    fontWeight: "500"
  },
  callButton: {
    backgroundColor: "#2ecc71",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#aaa",
    fontSize: 16
  },
  fab: { 
    position: "absolute", 
    bottom: 30, 
    right: 20, 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: "#e74c3c", 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 6, 
    shadowColor: "#000", 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 3 }, 
    zIndex: 999,
    borderWidth: 3, 
    borderColor: "transparent", 
  },
  fabActive: { 
    backgroundColor: "#c0392b", 
    borderColor: "#fff", 
  },
});