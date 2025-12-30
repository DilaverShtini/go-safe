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
    setSuggestions([]);
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
      Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, { top: insets.top > 0 ? insets.top : 50 }]}>
      
      <View style={styles.inputWrapper}>
          <View style={[styles.searchBox, showSuggestions && suggestions.length > 0 && styles.searchBoxActive]}>
            <Ionicons name="search" size={20} color="#555" style={{ marginRight: 8 }} />
            <TextInput 
              style={styles.input} 
              placeholder="Cerca destinazione..." 
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={(text) => {
                  setSearchText(text);
                  if (text.length === 0) setShowSuggestions(false);
              }}
              returnKeyType="search"
            />
            
            {isLoading ? (
                <ActivityIndicator size="small" color="#6c5ce7" style={{marginRight: 5}}/>
            ) : searchText.length > 0 ? (
                <TouchableOpacity onPress={handleClear} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Ionicons name="close-circle" size={20} color="#ccc" />
                </TouchableOpacity>
            ) : null}
          </View>

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id + Math.random()}
                keyboardShouldPersistTaps="always" 
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem} 
                    onPress={() => handleSelectPlace(item)}
                  >
                    <View style={styles.iconCircle}>
                        <Ionicons name="location" size={16} color="#6c5ce7" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.mainText} numberOfLines={1}>
                            {item.display_name.split(",")[0]}
                        </Text>
                        <Text style={styles.subText} numberOfLines={1}>
                            {item.display_name.split(",").slice(1).join(",").trim()}
                        </Text>
                    </View>
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
    backgroundColor: "#ffffffff",
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchBoxActive: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomWidth: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  profileButton: {
    backgroundColor: "#ffffffff",
    width: 58,
    height: 58,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  suggestionsContainer: {
      backgroundColor: "white",
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      elevation: 5,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 4 },
      maxHeight: 220,
      marginTop: -2,
      paddingTop: 5,
      zIndex: 998,
  },
  suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
  },
  iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#ffffffff",
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  mainText: {
      fontSize: 15,
      fontWeight: "500",
      color: '#333',
  },
  subText: {
      fontSize: 12,
      color: '#888',
      marginTop: 2,
  },
  separator: {
      height: 1,
      backgroundColor: "#f0f0f0",
      marginLeft: 50,
      marginRight: 15,
  }
});