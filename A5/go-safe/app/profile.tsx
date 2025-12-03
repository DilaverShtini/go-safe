import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "Mario Rossi",
    bio: "Appassionato di viaggi e sicurezza urbana.",
    email: "mario.rossi@example.com",
    instagram: "mario_rossi_official",
    twitter: "@mariorossi",
    image: null as string | null,
  });

  // GESTIONE FOTOCAMERA
  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        "Permesso Fotocamera Negato",
        "Per scattare una foto profilo, devi abilitare l'accesso alla fotocamera nelle impostazioni.",
        [
          { text: "Annulla", style: "cancel" },
          { text: "Apri Impostazioni", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    // Apri fotocamera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Quadrata per il profilo
      quality: 0.5,
    });

    if (!result.canceled) {
      setUserInfo({ ...userInfo, image: result.assets[0].uri });
    }
  };

  // GESTIONE GALLERIA
  const pickFromGallery = async () => {
    const permissionCheck = await ImagePicker.getMediaLibraryPermissionsAsync();
  
    console.log("Stato permessi galleria:", permissionCheck.status);

    if (permissionCheck.status !== 'granted' && permissionCheck.canAskAgain) {
      const permissionRequest = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionRequest.status !== 'granted') {
        Alert.alert(
          "Permesso Galleria Negato",
          "Per scegliere una foto profilo, devi abilitare l'accesso alla galleria nelle impostazioni.",
          [
            { text: "Annulla", style: "cancel" },
            { text: "Apri Impostazioni", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
    }
    // Nota: Su Android 13+ potrebbe entrare qui anche senza popup espliciti grazie al Photo Picker
    
    // Apri galleria
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUserInfo({ ...userInfo, image: result.assets[0].uri });
    }
  };

  // MENU DI SCELTA
  const handleProfileImagePress = () => {
    if (!isEditing) return;

    Alert.alert(
      "Modifica Foto Profilo",
      "Scegli un'opzione",
      [
        { text: "Scatta Foto", onPress: pickFromCamera },
        { text: "Scegli dalla Galleria", onPress: pickFromGallery },
        { text: "Annulla", style: "cancel" },
      ]
    );
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Profilo Aggiornato", "Le tue informazioni sono state salvate.");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout", 
      "Sei sicuro di voler uscire?", 
      [
        { text: "Annulla", style: "cancel" },
        { 
          text: "Esci", 
          style: "destructive", 
          onPress: () => {
            console.log("Logout effettuato");
            router.replace("/");
          } 
        } 
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Il mio Profilo</Text>
            
            <TouchableOpacity onPress={() => Alert.alert("Impostazioni", "Apre schermata settings...")} style={styles.iconButton}>
                <Ionicons name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* SEZIONE IMMAGINE */}
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={handleProfileImagePress} activeOpacity={isEditing ? 0.7 : 1}>
              {userInfo.image ? (
                <Image source={{ uri: userInfo.image }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage]}>
                  <Ionicons name="person" size={60} color="#ccc" />
                </View>
              )}
              
              {/* Badge fotocamera (appare solo in modifica) */}
              {isEditing && (
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
            
            {/* Tasto Modifica/Salva */}
            <TouchableOpacity 
                style={styles.editActionLink} 
                onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            >
                <Text style={styles.editActionText}>
                    {isEditing ? "Salva Modifiche" : "Modifica Profilo"}
                </Text>
            </TouchableOpacity>
          </View>

          {/* FORM DATI PERSONALI */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informazioni</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                    style={[styles.input, isEditing && styles.inputEditable]}
                    value={userInfo.name}
                    editable={isEditing}
                    onChangeText={(text) => setUserInfo({...userInfo, name: text})}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                    style={[styles.input, isEditing && styles.inputEditable, { height: 60 }]}
                    value={userInfo.bio}
                    editable={isEditing}
                    multiline
                    onChangeText={(text) => setUserInfo({...userInfo, bio: text})}
                />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, isEditing && styles.inputEditable]}
                    value={userInfo.email}
                    editable={isEditing}
                    keyboardType="email-address"
                    onChangeText={(text) => setUserInfo({...userInfo, email: text})}
                />
            </View>
          </View>

          {/* SEZIONE SOCIAL */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Network</Text>
            
            <View style={styles.socialRow}>
                <MaterialCommunityIcons name="instagram" size={28} color="#C13584" />
                <TextInput
                    style={[styles.socialInput, isEditing && styles.inputEditable]}
                    value={userInfo.instagram}
                    editable={isEditing}
                    placeholder="Username Instagram"
                    onChangeText={(text) => setUserInfo({...userInfo, instagram: text})}
                />
            </View>

            <View style={styles.socialRow}>
                <MaterialCommunityIcons name="twitter" size={28} color="#1DA1F2" />
                <TextInput
                    style={[styles.socialInput, isEditing && styles.inputEditable]}
                    value={userInfo.twitter}
                    editable={isEditing}
                    placeholder="Username Twitter/X"
                    onChangeText={(text) => setUserInfo({...userInfo, twitter: text})}
                />
            </View>
          </View>

          {/* TASTO LOGOUT */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
            <Text style={styles.logoutText}>Disconnettiti</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  iconButton: {
    padding: 5,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  
  // Immagine
  imageContainer: {
    alignItems: "center",
    marginBottom: 25,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },

  placeholderImage: {
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
  },

  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6c5ce7",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#f8f9fa",
  },

  editActionLink: {
    marginTop: 15,
    padding: 10,
  },

  editActionText: {
    color: "#6c5ce7",
    fontWeight: "bold",
    fontSize: 16,
  },

  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  
  // Input
  inputGroup: {
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
    fontWeight: "500",
  },

  input: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  // Stile quando in modifica
  inputEditable: {
    borderBottomColor: "#6c5ce7",
    backgroundColor: "#f4f4fa",
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  
  // Social
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 15,
  },

  socialInput: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },

  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff5f5",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fadbd8",
    gap: 10,
    marginTop: 10,
  },

  logoutText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "bold",
  },

});