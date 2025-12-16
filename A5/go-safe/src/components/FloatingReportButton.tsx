import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FloatingReportButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function FloatingReportButton({ onPress, style }: FloatingReportButtonProps) {
  return (
    <TouchableOpacity style={[styles.reportButton, style]} onPress={onPress}>
      <Ionicons name="warning" size={36} color="black" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  reportButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#b2f200",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 999,
  },
});