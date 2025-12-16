import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";

// Assicurati che il percorso sia corretto
import UserProfileModal, { UserProfile } from "./UserProfileModal";

// --- INTERFACCE ---
interface GroupItem {
  id: string;
  name: string;
  startZone: string;
  startTime: string;
  date: string;
  isJoined?: boolean;
}

interface GroupDetailModalProps {
  visible: boolean;
  group: GroupItem | null;
  onClose: () => void;
  onJoin: (groupId: string) => void;
  // --- AGGIUNTO QUI: La prop mancante ---
  onLeave: (groupId: string) => void; 
}

// --- DATI INIZIALI (MOCK) ---
const INITIAL_PARTICIPANTS: UserProfile[] = [
    {
        id: "u1",
        name: "Giulia Rossi",
        avatarUrl: "https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg",
        isVerified: true,
        connections: 15,
        trips: 12,
        rating: 4.8,
        reviews: [
            { id: "r1", title: "Ottima compagnia", tags: "@Marco", text: "Viaggio piacevole e puntuale.", rating: 5 },
            { id: "r2", title: "Consigliata", tags: "@Luca", text: "Molto gentile.", rating: 4 },
        ]
    },
    {
        id: "u2",
        name: "Marco Bianchi",
        avatarUrl: "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg",
        isVerified: false,
        connections: 4,
        trips: 2,
        rating: 4.0,
        reviews: []
    },
    {
        id: "u3",
        name: "Anna Verdi",
        avatarUrl: "https://img.freepik.com/free-photo/portrait-young-woman-with-natural-make-up_23-2149084945.jpg",
        isVerified: true,
        connections: 22,
        trips: 30,
        rating: 5.0,
        reviews: [
             { id: "r3", title: "Super!", tags: "@Elena", text: "La migliore compagna di viaggio.", rating: 5 }
        ]
    }
];

// --- AGGIUNTO onLeave NEGLI ARGOMENTI ---
export default function GroupDetailModal({ visible, group, onClose, onJoin, onLeave }: GroupDetailModalProps) {
  
  const [participants, setParticipants] = useState<UserProfile[]>(INITIAL_PARTICIPANTS);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isProfileVisible, setProfileVisible] = useState(false);

  const handleOpenProfile = (user: UserProfile) => {
      setSelectedUser(user);
      setProfileVisible(true);
  };

  const handleUserUpdate = (updatedUser: UserProfile) => {
      setParticipants(prevParticipants => 
          prevParticipants.map(p => p.id === updatedUser.id ? updatedUser : p)
      );
      setSelectedUser(updatedUser);
  };

  if (!group) return null;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{group.name}</Text>
            <View style={{ width: 26 }} /> 
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Sezione Partecipanti */}
            <Text style={styles.sectionLabel}>Partecipanti</Text>
            
            {participants.map((participant) => (
                <View key={participant.id} style={styles.card}>
                  <Image 
                    source={{ uri: participant.avatarUrl }} 
                    style={styles.avatar} 
                  />
                  <Text style={styles.participantName}>{participant.name}</Text>
                  
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => handleOpenProfile(participant)}
                  >
                    <MaterialCommunityIcons name="eye-outline" size={28} color="black" />
                  </TouchableOpacity>
                </View>
            ))}

            {/* Sezione Dettagli Viaggio */}
            <Text style={styles.sectionLabel}>Dettagli Partenza</Text>

            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="location-sharp" size={20} color="#5E35B1" />
              </View>
              <Text style={styles.infoText}>{group.startZone}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Feather name="calendar" size={20} color="#5E35B1" />
              </View>
              <Text style={styles.infoText}>{group.date}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Feather name="clock" size={20} color="#5E35B1" />
              </View>
              <Text style={styles.infoText}>{group.startTime}</Text>
            </View>

            {/* Bottone Iscrizione / Abbandono */}
            <View style={styles.buttonContainer}>
                {group.isJoined ? (
                    // SE SEI GIÀ ISCRITTO -> Bottone Verde (Clicca per uscire)
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.joinedButton]}
                        onPress={() => onLeave(group.id)} // <--- Chiama la funzione per uscire
                    >
                        <MaterialCommunityIcons name="check" size={20} color="white" style={{marginRight: 8}}/>
                        <Text style={styles.joinedButtonText}>Sei iscritto (Premi per uscire)</Text>
                    </TouchableOpacity>
                ) : (
                    // SE NON SEI ISCRITTO -> Bottone Viola (Partecipa)
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={() => onJoin(group.id)}
                    >
                        <Text style={styles.actionButtonText}>Richiedi di partecipare</Text>
                    </TouchableOpacity>
                )}
            </View>

          </ScrollView>

          <UserProfileModal 
            visible={isProfileVisible}
            user={selectedUser}
            onClose={() => setProfileVisible(false)}
            onUpdateUser={handleUserUpdate} 
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
  joinedButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#388E3C",
  },
  joinedButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }
});