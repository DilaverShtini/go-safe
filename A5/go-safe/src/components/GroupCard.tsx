import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

interface GroupCardProps {
  name: string;
  startZone: string;
  startTime: string;
  date: string;
  initial: string;
  color?: string;
  isJoined?: boolean;
  onPressEye?: () => void;
}

export default function GroupCard({ 
  name, 
  startZone, 
  startTime,
  date,
  initial,
  isJoined = false, 
  onPressEye 
}: GroupCardProps) {
  return (
    <View style={[styles.card, isJoined && styles.joinedCard]}>
      
      <View style={[styles.avatarContainer]}>
        <Text style={styles.avatarText}>{initial}</Text>
        {isJoined && (
          <View style={styles.joinedBadge}>
            <MaterialCommunityIcons name="check" size={12} color="white" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.groupName} numberOfLines={1}>{name}</Text>
        
        <Text style={styles.groupDetail} numberOfLines={1}>
            {startZone}
        </Text>

        <View style={styles.dateTimeRow}>
            <View style={styles.iconTextParams}>
                <Feather name="calendar" size={14} color="#666" />
                <Text style={styles.dateTimeText}>{date}</Text>
            </View>
            
            <View style={[styles.iconTextParams, {marginLeft: 12}]}>
                <Feather name="clock" size={14} color="#666" />
                <Text style={styles.dateTimeText}>{startTime}</Text>
            </View>
        </View>

        {isJoined && <Text style={styles.joinedText}>Partecipi a questo gruppo</Text>}
      </View>

      <TouchableOpacity onPress={onPressEye} style={styles.iconContainer}>
      <MaterialCommunityIcons name="eye-outline" size={25} color="#6c5ce7" />
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
    backgroundColor : "#F3E5F5",
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
    marginBottom: 6,
  },
  dateTimeRow: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  iconTextParams: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
  },
  dateTimeText: {
      fontSize: 13,
      color: '#555',
      fontWeight: '500'
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