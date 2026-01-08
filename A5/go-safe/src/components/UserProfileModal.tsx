import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  TextInput,
  Alert
} from "react-native";
import { MaterialCommunityIcons, Feather, FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export interface Review {
  id: string;
  title: string;
  tags: string; 
  text: string;
  rating: number;
  isMyReview?: boolean; 
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
  connections: number;
  trips: number;
  rating: number; 
  reviews: Review[];
  amIConnected?: boolean; 
}

interface UserProfileModalProps {
  visible: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export default function UserProfileModal({ visible, user, onClose, onUpdateUser }: UserProfileModalProps) {
  const [displayUser, setDisplayUser] = useState<UserProfile | null>(null);
  
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayUser(user);
      resetForm();
    }
  }, [user]);

  const resetForm = () => {
    setIsWritingReview(false);
    setNewReviewText("");
    setNewRating(0);
    setEditingReviewId(null);
  };

  const calculateAverageRating = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avg = total / reviews.length;
    return parseFloat(avg.toFixed(1));
  };

  const toggleConnection = () => {
      if (!displayUser) return;

      const newConnectionState = !displayUser.amIConnected;
      const newConnectionCount = newConnectionState 
            ? displayUser.connections + 1 
            : displayUser.connections - 1;

      const updatedUser = {
          ...displayUser,
          amIConnected: newConnectionState,
          connections: newConnectionCount
      };

      setDisplayUser(updatedUser);

      onUpdateUser(updatedUser);
  };

  const handleSendReview = () => {
    if (newReviewText.trim() === "") {
        Alert.alert("Attenzione", "Scrivi un commento per la recensione.");
        return;
    }
    if (newRating === 0) {
        Alert.alert("Attenzione", "Seleziona un numero di stelle.");
        return;
    }

    if (!displayUser) return;

    let updatedReviews: Review[];

    if (editingReviewId) {
        updatedReviews = displayUser.reviews.map(r => 
            r.id === editingReviewId 
            ? { ...r, text: newReviewText, rating: newRating } 
            : r
        );
    } else {
        const newReview: Review = {
            id: Date.now().toString(),
            title: "La tua Recensione",
            tags: "@Tu",
            text: newReviewText,
            rating: newRating,
            isMyReview: true, 
        };
        updatedReviews = [newReview, ...displayUser.reviews];
    }

    const newAverage = calculateAverageRating(updatedReviews);

    const updatedUser = {
        ...displayUser,
        reviews: updatedReviews,
        rating: newAverage
    };

    setDisplayUser(updatedUser);
    onUpdateUser(updatedUser);

    resetForm();
  };

  const handleEditReview = (review: Review) => {
      setNewReviewText(review.text);
      setNewRating(review.rating);
      setEditingReviewId(review.id);
      setIsWritingReview(true);
  };

  const handleDeleteReview = (reviewId: string) => {
      Alert.alert(
          "Elimina Recensione",
          "Sei sicuro di voler eliminare definitivamente questa recensione?",
          [
              { 
                  text: "Elimina", 
                  style: "destructive",
                  onPress: () => {
                      if (!displayUser) return;

                      const updatedReviews = displayUser.reviews.filter(r => r.id !== reviewId);
                      const newAverage = calculateAverageRating(updatedReviews);
                      
                      const updatedUser = {
                          ...displayUser,
                          reviews: updatedReviews,
                          rating: newAverage
                      };

                      setDisplayUser(updatedUser);
                      onUpdateUser(updatedUser);

                      if (editingReviewId === reviewId) resetForm();
                  }
              },
              { text: "Annulla", style: "cancel" }
          ]
      );
  };

  if (!displayUser) return null;

  const isOwnProfile = displayUser.id === 'me';

  const renderStaticStars = (count: number, size: number = 20, color: string = "#333") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialCommunityIcons 
          key={i} 
          name={i <= count ? "star" : "star-outline"} 
          size={size} 
          color={color} 
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  const renderInteractiveStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setNewRating(i)}>
          <MaterialCommunityIcons 
            name={i <= newRating ? "star" : "star-outline"} 
            size={32}
            color="#FFD700"
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      );
    }
    return <View style={{ flexDirection: 'row', marginBottom: 10 }}>{stars}</View>;
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profilo utente</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.profileHeader}>
              <Image source={{ uri: displayUser.avatarUrl }} style={styles.avatarLarge} />
              
              <View style={styles.profileInfoRight}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>
                      {displayUser.name} {isOwnProfile && "(Tu)"}
                  </Text>
                  {displayUser.isVerified && (
                    <MaterialCommunityIcons name="check-decagram" size={24} color="#6C5CE7" style={{marginLeft: 6}} />
                  )}
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                       <Text style={styles.statLabel}>Collegamenti</Text>
                       <Text style={styles.statValue}>{displayUser.connections}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.statItem}>
                       <Text style={styles.statLabel}>Viaggi</Text>
                       <Text style={styles.statValue}>{displayUser.trips}</Text>
                    </View>
                </View>

                {!isOwnProfile && (
                    <TouchableOpacity 
                        style={[styles.connectButton, displayUser.amIConnected && styles.connectButtonActive]}
                        onPress={toggleConnection}
                        activeOpacity={0.7}
                    >
                        {displayUser.amIConnected ? (
                            <>
                                <Feather name="user-check" size={18} color="#6C5CE7" style={{marginRight: 6}} />
                                <Text style={styles.connectButtonTextActive}>Collegato</Text>
                            </>
                        ) : (
                            <>
                                <Feather name="user-plus" size={18} color="#FFF" style={{marginRight: 6}} />
                                <Text style={styles.connectButtonText}>Collegati</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

              </View>
            </View>

            <View style={styles.sectionDivider} />

            <View style={styles.ratingSection}>
               {renderStaticStars(Math.round(displayUser.rating), 32, "#FFD700")}
               <Text style={styles.ratingScore}>
                   {displayUser.rating > 0 ? displayUser.rating.toFixed(1) : "N.D."} / 5.0
               </Text>
               <Text style={{fontSize: 12, color: '#999', marginTop: 2}}>
                   ({displayUser.reviews.length} recensioni)
               </Text>
            </View>

            <View style={styles.socialSection}>
                <TouchableOpacity style={styles.socialIcon}>
                    <Feather name="instagram" size={24} color="#C13584" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                    <FontAwesome name="facebook" size={24} color="#353cf9ff" />
                </TouchableOpacity>
            </View>

            <View style={styles.sectionDivider} />

            {!isOwnProfile && (
                <View style={styles.addReviewSection}>
                    {!isWritingReview ? (
                        <TouchableOpacity style={styles.addButton} onPress={() => setIsWritingReview(true)}>
                            <Text style={styles.addButtonText}>Scrivi una recensione</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.inputContainer}>
                            <Text style={styles.writeLabel}>
                                {editingReviewId 
                                    ? "Modifica la tua recensione:" 
                                    : `Valuta la tua esperienza con ${displayUser.name}:`}
                            </Text>
                            
                            <View style={{alignItems: 'center', marginBottom: 10}}>
                                {renderInteractiveStars()}
                                <Text style={{fontSize: 12, color: '#888'}}>
                                    {newRating > 0 ? `${newRating} su 5 stelle` : "Tocca le stelle per votare"}
                                </Text>
                            </View>

                            <TextInput 
                                style={styles.textInput}
                                multiline
                                placeholder="Scrivi qui la tua esperienza..."
                                value={newReviewText}
                                onChangeText={setNewReviewText}
                            />
                            <View style={styles.formButtons}>
                                <TouchableOpacity onPress={resetForm}>
                                    <Text style={styles.cancelText}>Annulla</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.submitButton} onPress={handleSendReview}>
                                    <Text style={styles.submitText}>
                                        {editingReviewId ? "Aggiorna" : "Invia Recensione"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}

            <View style={styles.reviewsList}>
                <Text style={styles.sectionTitle}>
                    Dicono di {isOwnProfile ? "te" : displayUser.name.split(" ")[0]} ({displayUser.reviews.length})
                </Text>

                {displayUser.reviews.length === 0 && (
                    <Text style={{textAlign: 'center', color: '#999', marginTop: 10, fontStyle: 'italic'}}>
                        Nessuna recensione ancora. Sii il primo!
                    </Text>
                )}

                {displayUser.reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                                <Text style={styles.reviewTitle}>{review.title}</Text>
                                {review.isMyReview && (
                                    <Text style={styles.myReviewBadge}>(Tu)</Text>
                                )}
                            </View>
                            
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                {renderStaticStars(review.rating, 14, "#FBC02D")}
                                
                                {review.isMyReview && (
                                    <View style={styles.reviewActions}>
                                        <TouchableOpacity 
                                            onPress={() => handleEditReview(review)} 
                                            style={styles.actionIcon}
                                        >
                                            <Feather name="edit-2" size={16} color="#666" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => handleDeleteReview(review.id)}
                                            style={styles.actionIcon}
                                        >
                                            <Feather name="trash-2" size={16} color="#e74c3c" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                        
                        <Text style={styles.reviewTags}>{review.tags}</Text>
                        <Text style={styles.reviewText}>{review.text}</Text>
                    </View>
                ))}
            </View>

          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  scrollContent: { paddingBottom: 40 },
  
  profileHeader: { flexDirection: "row", paddingHorizontal: 20, marginTop: 20, alignItems: 'center', marginBottom: 10 },
  avatarLarge: { width: 90, height: 90, borderRadius: 45, marginRight: 20, backgroundColor: '#EEE', borderWidth: 2, borderColor: '#FFF', shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3 },
  
  profileInfoRight: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  userName: { fontSize: 20, fontWeight: 'bold', color: "#222", flexShrink: 1 },
  
  statsContainer: { flexDirection: 'row', marginBottom: 12 },
  statItem: { alignItems: 'flex-start', marginRight: 20 },
  statLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 2 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#333' },
  dividerVertical: { width: 1, backgroundColor: '#E0E0E0', marginRight: 20, height: '80%', alignSelf: 'center' },

  connectButton: {
      backgroundColor: '#6C5CE7',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
      elevation: 2,
      shadowColor: "#6C5CE7",
      shadowOpacity: 0.3,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
  },
  connectButtonActive: {
      backgroundColor: '#F3E5F5',
      borderWidth: 1,
      borderColor: '#6C5CE7',
      elevation: 0,
      shadowOpacity: 0,
  },
  connectButtonText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '600',
  },
  connectButtonTextActive: {
      color: '#6C5CE7',
      fontSize: 14,
      fontWeight: '600',
  },

  sectionDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 20, marginVertical: 15 },

  ratingSection: { alignItems: 'center', marginBottom: 10 },
  ratingLabel: { fontSize: 12, color: '#888', marginBottom: 5, textTransform: 'uppercase' },
  ratingScore: { fontSize: 14, color: '#555', fontWeight: '600', marginTop: 5 },

  socialSection: { flexDirection: 'row', justifyContent: 'center', gap: 25, marginBottom: 5 },
  socialIcon: { padding: 8, backgroundColor: '#FAFAFA', borderRadius: 50 },

  reviewsList: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#333' },
  
  reviewCard: { marginBottom: 15, padding: 15, backgroundColor: '#FAFAFA', borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewTitle: { fontSize: 15, color: '#333', fontWeight: '700' },
  reviewTags: { fontSize: 11, color: '#6C5CE7', marginBottom: 6, fontWeight: '600' },
  reviewText: { fontSize: 14, color: '#555', lineHeight: 20 },
  
  addReviewSection: { paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  addButton: { backgroundColor: '#F3E5F5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#DDD', width: '100%', alignItems: 'center' },
  addButtonText: { color: '#5E35B1', fontWeight: 'bold' },
  
  inputContainer: { width: '100%', backgroundColor: '#FFF', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#DDD', shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  writeLabel: { marginBottom: 10, color: '#555', fontWeight: '600', textAlign: 'center' },
  textInput: { backgroundColor: '#FAFAFA', height: 80, borderRadius: 8, padding: 10, textAlignVertical: 'top', marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  formButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelText: { color: '#777', padding: 10 },
  submitButton: { backgroundColor: '#5E35B1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  submitText: { color: 'white', fontWeight: 'bold' },
  
  myReviewBadge: { fontSize: 10, color: '#5E35B1', marginLeft: 6, backgroundColor: '#EDE7F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  reviewActions: { flexDirection: 'row', marginLeft: 10, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#DDD' },
  actionIcon: { marginLeft: 12 }
});