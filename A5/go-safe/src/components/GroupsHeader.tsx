import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Definiamo le props che il componente si aspetta
interface GroupsHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

export default function GroupsHeader({ searchQuery, onSearchChange }: GroupsHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca gruppo"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={onSearchChange} // Chiama la funzione del genitore
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Profile Button */}
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => router.push("/profile")}
      >
        <Ionicons name="person-circle-outline" size={36} color="#7E57C2" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  iconButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    marginRight: 8,
  },
});