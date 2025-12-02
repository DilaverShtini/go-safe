import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  SafeAreaView,
  TextInput,
  Alert
} from "react-native";
import { MaterialCommunityIcons, Feather, FontAwesome } from "@expo/vector-icons";

// --- Tipi di Dati ---
export interface Review {
  id: string;
  title: string;
  tags: string; 
  text: string;
  rating: number;
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
}

interface UserProfileModalProps {
  visible: boolean;
  user: UserProfile | null;
  onClose: () => void;
}

export default function UserProfileModal({ visible, user, onClose }: UserProfileModalProps) {
  // Stato locale per visualizzare l'utente e aggiornarlo quando aggiungi recensioni
  const [displayUser, setDisplayUser] = useState<UserProfile | null>(null);
  
  // Stati per il form della nuova recensione
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(0); // Voto selezionato dall'utente

  // Ogni volta che cambia l'utente (o si apre il modale), resetto lo stato locale
  useEffect(() => {
    if (user) {
      setDisplayUser(user);
      setIsWritingReview(false);
      setNewReviewText("");
      setNewRating(0);
    }
  }, [user, visible]);

  if (!displayUser) return null;

  // --- Funzione per renderizzare stelle statiche (sola lettura) ---
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

  // --- Funzione per renderizzare stelle CLICCABILI (input) ---
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

  // --- Gestione Invio Recensione ---
  const handleSendReview = () => {
    if (newReviewText.trim() === "") {
        Alert.alert("Attenzione", "Scrivi un commento per la recensione.");
        return;
    }
    if (newRating === 0) {
        Alert.alert("Attenzione", "Seleziona un numero di stelle.");
        return;
    }

    // 1. Creiamo il nuovo oggetto recensione
    const newReview: Review = {
        id: Date.now().toString(), // ID temporaneo univoco
        title: "La tua Recensione", // Titolo fisso o dinamico
        tags: "@Tu", // Simuliamo il tag dell'utente corrente
        text: newReviewText,
        rating: newRating,
    };

    // 2. Aggiorniamo lo stato locale aggiungendo la recensione in cima alla lista
    setDisplayUser(prev => {
        if (!prev) return null;
        return {
            ...prev,
            reviews: [newReview, ...prev.reviews] // Aggiunge in testa
        };
    });

    // 3. Reset del form
    setNewReviewText("");
    setNewRating(0);
    setIsWritingReview(false);
    
    // In un'app reale qui chiamata API per salvare nel DB
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profilo utente</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Profilo Top Section */}
            <View style={styles.profileHeader}>
              <Image source={{ uri: displayUser.avatarUrl }} style={styles.avatarLarge} />
              
              <View style={styles.profileInfoRight}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{displayUser.name}</Text>
                  {displayUser.isVerified && (
                    <MaterialCommunityIcons name="check-decagram-outline" size={28} color="#333" style={{marginLeft: 8}} />
                  )}
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                   <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Collegamenti</Text>
                      <Text style={styles.statValue}>{displayUser.connections}</Text>
                   </View>
                   <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Num. viaggi</Text>
                      <Text style={styles.statValue}>{displayUser.trips}</Text>
                   </View>
                </View>
                <View style={styles.divider} />
              </View>
            </View>

            {/* Rating Generale */}
            <View style={styles.ratingSection}>
               {renderStaticStars(Math.round(displayUser.rating), 36, "#111")}
            </View>

            {/* Social Icons */}
            <View style={styles.socialSection}>
                <TouchableOpacity style={styles.socialIcon}>
                    <Feather name="instagram" size={30} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                    <FontAwesome name="facebook-square" size={30} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.sectionDivider} />

            {/* Sezione Aggiungi Recensione */}
            <View style={styles.addReviewSection}>
                {!isWritingReview ? (
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsWritingReview(true)}>
                        <Text style={styles.addButtonText}>Scrivi una recensione</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.inputContainer}>
                        <Text style={styles.writeLabel}>Valuta la tua esperienza con {displayUser.name}:</Text>
                        
                        {/* Selettore Stelle Interattivo */}
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
                            <TouchableOpacity onPress={() => setIsWritingReview(false)}>
                                <Text style={styles.cancelText}>Annulla</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSendReview}>
                                <Text style={styles.submitText}>Invia Recensione</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* Lista Esperienze / Recensioni */}
            <View style={styles.reviewsList}>
                {displayUser.reviews.length === 0 && (
                    <Text style={{textAlign: 'center', color: '#999', marginTop: 20}}>
                        Nessuna recensione ancora. Sii il primo!
                    </Text>
                )}

                {displayUser.reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewTitle}>{review.title}</Text>
                            {/* Qui usiamo le stelle statiche piccole per mostrare il voto salvato */}
                            {renderStaticStars(review.rating, 16, "#555")}
                        </View>
                        <Text style={styles.reviewTags}>{review.tags}</Text>
                        <Text style={styles.reviewText}>{review.text}</Text>
                        <View style={styles.reviewDivider} />
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
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF", 
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
    fontWeight: "500",
    color: "#333",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Profilo
  profileHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center'
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    backgroundColor: '#DDD'
  },
  profileInfoRight: {
    flex: 1,
    justifyContent: 'center'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
    width: '100%'
  },
  ratingSection: {
    alignItems: 'center',
    marginVertical: 20
  },
  socialSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20
  },
  socialIcon: {
    padding: 5
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 20,
    marginBottom: 20
  },
  // Lista Recensioni
  reviewsList: {
    paddingHorizontal: 20,
  },
  reviewCard: {
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  reviewTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  reviewTags: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5
  },
  reviewText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginTop: 15
  },
  // Aggiungi Recensione
  addReviewSection: {
      paddingHorizontal: 20,
      marginBottom: 20,
      alignItems: 'center'
  },
  addButton: {
      backgroundColor: '#F3E5F5',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: '#DDD',
      width: '100%',
      alignItems: 'center'
  },
  addButtonText: {
      color: '#5E35B1',
      fontWeight: 'bold'
  },
  inputContainer: {
      width: '100%',
      backgroundColor: '#FAFAFA',
      padding: 15,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#DDD',
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
  },
  writeLabel: {
      marginBottom: 10,
      color: '#555',
      fontWeight: '600',
      textAlign: 'center'
  },
  textInput: {
      backgroundColor: 'white',
      height: 80,
      borderRadius: 8,
      padding: 10,
      textAlignVertical: 'top',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#EEE'
  },
  formButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  cancelText: {
      color: '#777',
      padding: 10
  },
  submitButton: {
      backgroundColor: '#5E35B1',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20
  },
  submitText: {
      color: 'white',
      fontWeight: 'bold'
  }
});