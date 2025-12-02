import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  SafeAreaView
} from "react-native";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";

import UserProfileModal, { UserProfile } from "./UserProfileModal";

// Definizione del tipo per il Gruppo
interface GroupItem {
  id: string;
  name: string;
  startZone: string;
  startTime: string;
  isJoined?: boolean;
}

// Props che il componente accetta
interface GroupDetailModalProps {
  visible: boolean;
  group: GroupItem | null;
  onClose: () => void;
  onJoin: (groupId: string) => void; 
}

// Dati finti per i partecipanti (Mock)
const MOCK_PARTICIPANTS: UserProfile[] = [
    {
        id: "u1",
        name: "Persona 1",
        avatarUrl: "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg",
        isVerified: true,
        connections: 7,
        trips: 3,
        rating: 4.5,
        reviews: [
            { id: "r1", title: "Viaggio piacevole", tags: "@Persona2", text: "Compagnia ottima, puntuale.", rating: 5 },
            { id: "r2", title: "Tutto ok", tags: "@Persona4", text: "Viaggio tranquillo.", rating: 4 },
        ]
    },
    {
        id: "u2",
        name: "Persona 2",
        avatarUrl: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
        isVerified: false,
        connections: 2,
        trips: 1,
        rating: 4,
        reviews: []
    },
    {
        id: "u3",
        name: "Persona 3",
        avatarUrl: "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671122.jpg",
        isVerified: true,
        connections: 12,
        trips: 8,
        rating: 5,
        reviews: []
    }
];

export default function GroupDetailModal({ visible, group, onClose, onJoin }: GroupDetailModalProps) {
  // Stati per gestire l'apertura del profilo utente
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isProfileVisible, setProfileVisible] = useState(false);

  // Funzione per aprire il profilo di un partecipante
  const handleOpenProfile = (user: UserProfile) => {
      setSelectedUser(user);
      setProfileVisible(true);
  };

  // Se non c'è un gruppo selezionato, non mostrare nulla
  if (!group) return null;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* --- HEADER --- */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{group.name}</Text>
            <View style={{ width: 26 }} /> 
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* --- SEZIONE PARTECIPANTI --- */}
            <Text style={styles.sectionLabel}>Partecipanti</Text>
            
            {MOCK_PARTICIPANTS.map((participant) => (
                <View key={participant.id} style={styles.card}>
                  <Image 
                    source={{ uri: participant.avatarUrl }} 
                    style={styles.avatar} 
                  />
                  <Text style={styles.participantName}>{participant.name}</Text>
                  
                  {/* Icona Occhio per aprire il profilo */}
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => handleOpenProfile(participant)}
                  >
                    <MaterialCommunityIcons name="eye-outline" size={28} color="black" />
                  </TouchableOpacity>
                </View>
            ))}

            {/* --- SEZIONE PARTENZA --- */}
            <Text style={styles.sectionLabel}>Partenza</Text>

            {/* Luogo */}
            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="location-sharp" size={20} color="#5E35B1" />
              </View>
              <Text style={styles.infoText}>{group.startZone}</Text>
            </View>

            {/* Orario */}
            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Feather name="clock" size={20} color="#5E35B1" />
              </View>
              <Text style={styles.infoText}>{group.startTime}</Text>
            </View>

            {/* --- BOTTONE ISCRIZIONE (Cambia stato se partecipi) --- */}
            <View style={styles.buttonContainer}>
                {group.isJoined ? (
                    // Cso: Utente partecipa già (Verde)
                    <View style={[styles.actionButton, styles.joinedButton]}>
                        <MaterialCommunityIcons name="check" size={20} color="white" style={{marginRight: 8}}/>
                        <Text style={styles.joinedButtonText}>Fai parte del gruppo</Text>
                    </View>
                ) : (
                    // Caso: Utente NON partecipa (Grigio/Viola)
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => onJoin(group.id)} // Chiama la funzione per iscriversi
                    >
                        <Text style={styles.actionButtonText}>Richiedi di partecipare</Text>
                    </TouchableOpacity>
                )}
            </View>

          </ScrollView>

          {/* --- MODALE PROFILO UTENTE (Nidificato) --- */}
          <UserProfileModal 
            visible={isProfileVisible}
            user={selectedUser}
            onClose={() => setProfileVisible(false)}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "500",
  },
  // Card Partecipante
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#EEE",
  },
  participantName: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  eyeIcon: {
    padding: 5,
  },
  // Card Info (Luogo/Orario)
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1C4E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  // Stili Bottone
  buttonContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#F3E5F5",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  actionButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Stile Bottone "Partecipi"
  joinedButton: {
    backgroundColor: "#4CAF50", // Verde Successo
    borderColor: "#388E3C",
  },
  joinedButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }
});