import React from "react";
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback 
} from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean; 
}

export default function ConfirmationModal({ 
  visible, 
  title, 
  message, 
  confirmText = "Conferma", 
  cancelText = "Annulla", 
  onConfirm, 
  onCancel,
  isDestructive = false 
}: ConfirmationModalProps) {
  
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertBox}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.confirmButton, isDestructive && styles.destructiveButton]} 
                    onPress={onConfirm}
                >
                  <Text style={[styles.confirmText, isDestructive && styles.destructiveText]}>
                      {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 10
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#6C5CE7", 
    borderRadius: 10,
    alignItems: "center",
  },
  destructiveButton: {
    backgroundColor: "#FFEBEE", 
    borderWidth: 1,
    borderColor: "#FFCDD2"
  },
  cancelText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "600"
  },
  confirmText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold"
  },
  destructiveText: {
      color: "#D32F2F" 
  }
});