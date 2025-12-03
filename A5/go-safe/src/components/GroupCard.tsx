import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface GroupCardProps {
  name: string;
  startZone: string;
  startTime: string;
  initial: string;
  color?: string;
  isJoined?: boolean;
  onPressEye?: () => void;
}

export default function GroupCard({ 
  name, 
  startZone, 
  startTime, 
  initial, 
  color = "#E1BEE7",
  isJoined = false,
  onPressEye 
}: GroupCardProps) {
  return (
    <View style={[
      styles.card,
      isJoined && styles.joinedCard 
    ]}>
      <View style={[styles.avatarContainer, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{initial}</Text>
        
        {/* Badge di spunta se partecipi */}
        {isJoined && (
          <View style={styles.joinedBadge}>
            <MaterialCommunityIcons name="check" size={12} color="white" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.groupName}>{name}</Text>
        <Text style={styles.groupDetail}>{startZone}</Text>
        <Text style={styles.groupDetail}>{startTime}</Text>
        {/* Testo aggiuntivo opzionale */}
        {isJoined && <Text style={styles.joinedText}>Partecipi a questo gruppo</Text>}
      </View>

      <TouchableOpacity onPress={onPressEye} style={styles.iconContainer}>
        <MaterialCommunityIcons name="eye-outline" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  joinedCard: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "#F1F8E9",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5E35B1",
  },
  // Badge sopra l'avatar
  joinedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white'
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  groupDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  joinedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 4
  },
  iconContainer: {
    padding: 8,
  },
});