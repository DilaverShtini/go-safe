import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const REPORT_TYPES = [
  { id: "danger", label: "Pericolo", icon: "alert-octagon", color: "#e74c3c" },
  { id: "darkness", label: "Buio", icon: "lightbulb-off", color: "#34495e" },
  { id: "desolate", label: "Strada desolata", icon: "road-variant", color: "#e67e22" },
  { id: "stray", label: "Animali randagi", icon: "dog-side", color: "#6c5ce7" },
  { id: "suspicious", label: "Sospetto", icon: "account-alert", color: "#8d6e63" },
  { id: "weather", label: "Allerta meteo", icon: "weather-lightning-rainy", color: "#3498db" },
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (type: string, note: string) => void;
  onUndo?: () => void;
}

export default function ReportModal({ visible, onClose, onSubmit, onUndo }: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!visible) {
      setShowSuccessToast(false);
      setSelectedType(null);
      setNote("");
    }
  }, [visible]);

  const handleSubmit = () => {
    if (selectedType) {
      onSubmit(selectedType, note);

      setShowSuccessToast(true);

      setSelectedType(null);
      setNote("");
      Keyboard.dismiss();

      timerRef.current = setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 3000); 
    }
  };

  const handleUndoPress = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      if (onUndo) onUndo();

      setShowSuccessToast(false);
      onClose(); 
  };

  if (showSuccessToast) {
    return (
      <Modal animationType="fade" transparent={true} visible={true} onRequestClose={() => {}}>
        <View style={styles.toastOverlayContainer}>
            <View style={styles.undoToast}>
                <View style={styles.toastContent}>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
                    <Text style={styles.undoToastText}>Segnalazione inviata</Text>
                </View>

                {onUndo && (
                  <TouchableOpacity onPress={handleUndoPress} style={styles.undoButton}>
                      <Text style={styles.undoButtonText}>ANNULLA</Text>
                  </TouchableOpacity>
                )}
            </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            <View style={styles.handle} />

            <Text style={styles.title}>Nuova Segnalazione</Text>
            <Text style={styles.subtitle}>Cosa sta succedendo?</Text>

            <View style={styles.grid}>
              {REPORT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && styles.typeButtonSelected,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: selectedType === type.id ? type.color : "#f4f4f4" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      // @ts-ignore
                      name={type.icon}
                      size={28}
                      color={selectedType === type.id ? "white" : "#555"}
                    />
                  </View>
                  <Text style={styles.typeLabel} numberOfLines={1}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Dettagli aggiuntivi (opzionale)..."
              value={note}
              onChangeText={setNote}
              multiline
            />

            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitButton, !selectedType && styles.disabledButton]}
                disabled={!selectedType}
              >
                <Text style={styles.submitText}>Invia</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15,
    marginBottom: 20,
  },
  typeButton: {
    alignItems: "center",
    width: "30%",
    marginBottom: 5,
  },
  typeButtonSelected: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 11,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#6c5ce7",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
  },
  toastOverlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
    backgroundColor: 'transparent',
  },
  undoToast: {
    flexDirection: 'row',
    backgroundColor: '#323232',
    width: '90%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  undoToastText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500'
  },
  undoButton: {
    marginLeft: 10,
    padding: 4
  },
  undoButtonText: {
    color: '#BB86FC',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5
  }
});