import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

interface SearchBarProps {
  onSearchLocation?: (coords: { latitude: number; longitude: number }) => void;
}

export default function SearchBar({ onSearchLocation }: SearchBarProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const handleSearch = async () => {
    if (!searchText.trim() || !onSearchLocation) return;
    
    Keyboard.dismiss();

    try {
      // Usa il servizio nativo del telefono per trovare le coordinate (Gratis)
      const geocodedLocation = await Location.geocodeAsync(searchText);

      if (geocodedLocation.length > 0) {
        const result = geocodedLocation[0];
        // Passa le coordinate alla schermata della mappa
        onSearchLocation({
          latitude: result.latitude,
          longitude: result.longitude,
        });
      } else {
        Alert.alert("Non trovato", "Impossibile trovare il luogo cercato.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Errore", "Si è verificato un errore durante la ricerca.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Box di Ricerca */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput 
          style={styles.input} 
          placeholder="Cerca destinazione..." 
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch} // Avvia la ricerca quando premi "Invio" sulla tastiera
          returnKeyType="search"
        />
        
        {/* Tasto X per cancellare il testo */}
        {searchText.length > 0 && (
           <TouchableOpacity onPress={() => setSearchText("")}>
             <Ionicons name="close" size={20} color="#ccc" />
           </TouchableOpacity>
        )}
      </View>

      {/* Tasto Profilo */}
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => router.push("/profile")} 
      >
        <Ionicons name="person-circle-outline" size={40} color="#6c5ce7" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    // Ombre
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  profileButton: {
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    // Ombre
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});