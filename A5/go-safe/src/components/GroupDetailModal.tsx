import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Animated,
  Easing,
  ActivityIndicator
} from "react-native";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; 
import { SafeAreaView } from "react-native-safe-area-context";

import UserProfileModal, { UserProfile } from "./UserProfileModal";

interface GroupItem {
  id: string;
  name: string;
  startZone: string;
  startTime: string;
  date: string;
  isJoined?: boolean;
  isOrganizer?: boolean;
}

interface GroupDetailModalProps {
  visible: boolean;
  group: GroupItem | null;
  onClose: () => void;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  isLoading?: boolean;
}

const CURRENT_USER_PROFILE: UserProfile = {
    id: "me",
    name: "Mario Rossi",
    avatarUrl: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
    isVerified: true,
    connections: 50,
    trips: 10,
    rating: 5.0,
    reviews: []
};


const INITIAL_DB = {
    groupA: [
        {
            id: "u1",
            name: "Luigi Verdi",
            avatarUrl: "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg",
            isVerified: true,
            connections: 7,
            trips: 3,
            rating: 5.0,
            reviews: [
                { id: "r1", title: "Viaggio Top!", tags: "@Mario", text: "Luigi è simpaticissimo. Consigliato!", rating: 5 }
            ]
        },
        {
            id: "u2",
            name: "Giulia Neri",
            avatarUrl: "https://img.freepik.com/free-psd/3d-illustration-person-with-pink-hair_23-2149436186.jpg",
            isVerified: false,
            connections: 2,
            trips: 1,
            rating: 0.0,
            reviews: []
        }
    ],
    groupB: [
        {
            id: "u3",
            name: "Marco Bianchi",
            avatarUrl: "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436190.jpg",
            isVerified: true,
            connections: 15,
            trips: 8,
            rating: 5.0,
            reviews: [
                { id: "r4", title: "Organizzatore perfetto", tags: "@Giuseppe", text: "Tutto nei minimi dettagli.", rating: 5 }
            ]
        },
        {
            id: "u4",
            name: "Anna Rosa",
            avatarUrl: "https://img.freepik.com/free-psd/3d-illustration-person-with-pink-hair_23-2149436186.jpg",
            isVerified: true,
            connections: 5,
            trips: 2,
            rating: 0.0,
            reviews: []
        }
    ]
};

export default function GroupDetailModal({ visible, group, onClose, onJoin, onLeave, isLoading = false }: GroupDetailModalProps) {
  const router = useRouter(); 
  
  const [participantsData, setParticipantsData] = useState(INITIAL_DB);

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isProfileVisible, setProfileVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && group && !group.isJoined && !isLoading) {
        startPulseAnimation();
    } else {
        scaleAnim.setValue(1);
    }
  }, [visible, group, isLoading]);

  const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.03, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
  };

  const handleOpenProfile = (user: UserProfile) => {
      setSelectedUser(user);
      setProfileVisible(true);
  };

  const handleOpenChat = (participant: UserProfile) => {
      onClose(); 
      router.push({
          pathname: "/detail",
          params: { id: participant.id, user: participant.name }
      });
  };
  const handleUpdateUser = (updatedUser: UserProfile) => {
      setSelectedUser(updatedUser);

      setParticipantsData((prevData) => {
          const groupKey = (group?.id === '2') ? 'groupB' : 'groupA';
          
          const updatedList = prevData[groupKey].map(u => 
              u.id === updatedUser.id ? updatedUser : u
          );

          return {
              ...prevData,
              [groupKey]: updatedList
          };
      });
  };

  if (!group) return null;

  const currentParticipants = (group.id === '2') ? participantsData.groupB : participantsData.groupA;

  const participantsList = group.isJoined 
      ? [CURRENT_USER_PROFILE, ...currentParticipants] 
      : currentParticipants;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{group.name}</Text>
            <View style={{ width: 26 }} /> 
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <Text style={styles.sectionLabel}>
                Partecipanti ({participantsList.length})
            </Text>
            
            {participantsList.map((participant) => {
                const isMe = participant.id === 'me';
                return (
                    <View key={participant.id} style={[styles.card, isMe && styles.myCard]}>
                      <Image source={{ uri: participant.avatarUrl }} style={styles.avatar} />
                      <View style={{flex: 1, marginLeft: 15}}>
                          <Text style={styles.participantName}>{participant.name} {isMe && "(Tu)"}</Text>
                          {isMe && (
                              <Text style={{fontSize: 12, color: '#6C5CE7', fontWeight: '500'}}>
                                  {group.isOrganizer ? "Organizzatore" : "Partecipante"}
                              </Text>
                          )}
                          { !isMe && (
                              <Text style={{fontSize: 10, color: 'green'}}>Connesso</Text>
                          )}
                      </View>
                      
                      {!isMe && (
                          <TouchableOpacity 
                            style={[styles.iconButton, { marginRight: 10, backgroundColor: '#E3F2FD' }]} 
                            onPress={() => handleOpenChat(participant)}
                          >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2196F3" />
                          </TouchableOpacity>
                      )}

                      <TouchableOpacity 
                        style={[styles.iconButton, { backgroundColor: '#F3E5F5' }]} 
                        onPress={() => handleOpenProfile(participant)}
                      >
                        <MaterialCommunityIcons name="eye-outline" size={20} color="#6C5CE7" />
                      </TouchableOpacity>
                    </View>
                );
            })}

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

            <View style={styles.buttonContainer}>
                {group.isJoined ? (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.leaveButton]}
                        onPress={() => onLeave(group.id)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#D32F2F" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="exit-to-app" size={22} color="#D32F2F" style={{marginRight: 8}}/>
                                <Text style={styles.leaveButtonText}>Abbandona Gruppo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <AnimatedTouchableOpacity 
                        style={[
                            styles.actionButton, 
                            styles.joinButton,
                            { transform: [{ scale: isLoading ? 1 : scaleAnim }] }
                        ]} 
                        onPress={() => onJoin(group.id)}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="account-plus" size={24} color="#FFF" style={{marginRight: 8}}/>
                                <Text style={styles.joinButtonText}>Unisciti al Gruppo</Text>
                            </>
                        )}
                    </AnimatedTouchableOpacity>
                )}
            </View>

          </ScrollView>

          <UserProfileModal 
            visible={isProfileVisible}
            user={selectedUser}
            onClose={() => setProfileVisible(false)}
            onUpdateUser={handleUpdateUser} 
          />

        </View>
      </SafeAreaView>
    </Modal>
  );
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: { textAlign: "center", fontSize: 14, color: "#666", marginTop: 20, marginBottom: 10, fontWeight: "500" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#E0E0E0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
  myCard: { borderColor: "#6C5CE7", backgroundColor: "#F3E5F5" },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: "#EEE" },
  participantName: { fontSize: 16, fontWeight: "600", color: "#333" },
  
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E0E0E0" },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#D1C4E9", justifyContent: "center", alignItems: "center", marginRight: 15 },
  infoText: { fontSize: 16, fontWeight: "600", color: "#333" },
  
  buttonContainer: { marginTop: 30, alignItems: "center", width: "100%" },
  
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },

  joinButton: {
    backgroundColor: "#6C5CE7",
  },
  joinButtonText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 18 
  },

  leaveButton: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2"
  },
  leaveButtonText: { 
    color: "#D32F2F",
    fontWeight: "bold", 
    fontSize: 16 
  },
});