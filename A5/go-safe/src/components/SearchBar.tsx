import React, { useState, useEffect } from "react";
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Keyboard, 
  FlatList, 
  Text,
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SearchBarProps {
  onSearchLocation?: (coords: { latitude: number; longitude: number }) => void;
}

interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

export default function SearchBar({ onSearchLocation }: SearchBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- FUNZIONE DI RICERCA OPENSTREETMAP (NOMINATIM) ---
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
        setSuggestions([]);
        return;
    }

    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GoSafeApp-StudentProject/1.0' 
        }
      });

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.log("Errore OSM:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText) fetchSuggestions(searchText);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSelectPlace = (item: Suggestion) => {
    setSearchText(item.display_name.split(",")[0]); 
    setShowSuggestions(false);
    Keyboard.dismiss();

    if (onSearchLocation) {
      onSearchLocation({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      });
    }
  };

  const handleClear = () => {
      setSearchText("");
      setSuggestions([]);
      setShowSuggestions(false);
  };

  return (
    <View style={[styles.container, { top: insets.top > 0 ? insets.top : 50 }]}>
      
      <View style={styles.inputWrapper}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput 
              style={styles.input} 
              placeholder="Cerca destinazione..." 
              value={searchText}
              onChangeText={(text) => {
                  setSearchText(text);
                  if (text.length === 0) setShowSuggestions(false);
              }}
              returnKeyType="search"
            />
            
            {isLoading && <ActivityIndicator size="small" color="#666" style={{marginRight: 5}}/>}

            {searchText.length > 0 && (
                <TouchableOpacity onPress={handleClear}>
                  <Ionicons name="close" size={20} color="#ccc" />
                </TouchableOpacity>
            )}
          </View>

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id + Math.random()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem} 
                    onPress={() => handleSelectPlace(item)}
                  >
                    <Ionicons name="location-outline" size={18} color="#666" style={{marginRight: 8}} />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                        {item.display_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
      </View>

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
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  inputWrapper: {
      flex: 1,
      zIndex: 1001,
  },
  searchBox: {
    backgroundColor: "#f0f2f5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
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
    backgroundColor: "#f0f2f5",
    width: 65,
    height: 65,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  suggestionsContainer: {
      marginTop: 5,
      backgroundColor: "white",
      borderRadius: 10,
      elevation: 5,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      maxHeight: 200,
  },
  suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
      fontSize: 14,
      color: '#333',
      flex: 1,
  }
});