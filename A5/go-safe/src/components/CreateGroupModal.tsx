import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (groupData: any) => void;
}

export default function CreateGroupModal({ visible, onClose, onSubmit }: CreateGroupModalProps) {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const defaultTime = new Date();
  defaultTime.setHours(20, 0, 0, 0);
  const [time, setTime] = useState(defaultTime);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  const handleCreate = () => {
    if (!startLocation || !endLocation) {
      Alert.alert("Manca qualcosa", "Inserisci luogo di partenza e arrivo");
      return;
    }

    const newGroup = {
      name: endLocation, 
      startZone: startLocation,
      startTime: formatTime(time),
      date: formatDate(date),
      initial: endLocation.charAt(0).toUpperCase(),
    };

    onSubmit(newGroup);
    
    setStartLocation("");
    setEndLocation("");
    setDate(new Date());
    
    const resetTime = new Date();
    resetTime.setHours(20, 0, 0, 0);
    setTime(resetTime);
    
    onClose();
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Crea il gruppo</Text>
            <View style={{ width: 24 }} /> 
          </View>

          {/* Inputs Luoghi */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Luogo di partenza</Text>
              <View style={styles.inputRow}>
                <TextInput 
                  style={styles.textInput} 
                  placeholder="Es. Stazione Centrale" 
                  value={startLocation}
                  onChangeText={setStartLocation}
                />
                {startLocation.length > 0 && (
                  <TouchableOpacity onPress={() => setStartLocation("")}>
                    <Feather name="x-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={{ height: 10 }} />
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Luogo di arrivo</Text>
              <View style={styles.inputRow}>
                <TextInput 
                  style={styles.textInput} 
                  placeholder="Es. Piazza Duomo" 
                  value={endLocation}
                  onChangeText={setEndLocation}
                />
                {endLocation.length > 0 && (
                  <TouchableOpacity onPress={() => setEndLocation("")}>
                    <Feather name="x-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* --- SEZIONE DATA --- */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Seleziona la data della partenza</Text>
            
            <View style={styles.displayRow}>
              <Text style={styles.bigText}>{formatDate(date)}</Text>
              <Feather name="calendar" size={24} color="#333" />
            </View>

            <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.smallLabel}>Date (DD/MM/YYYY)</Text>
              <Text style={styles.inputValue}>{formatDate(date)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                accentColor="#6C5CE7"
                textColor="#333"
              />
            )}
            
            {Platform.OS === 'ios' && showDatePicker && (
                 <TouchableOpacity 
                    style={styles.iosConfirmButton} 
                    onPress={() => setShowDatePicker(false)}
                 >
                    <Text style={styles.iosConfirmText}>Conferma Data</Text>
                 </TouchableOpacity>
            )}
          </View>

          {/* --- SEZIONE ORARIO (NATIVA) --- */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Scegli l'orario della partenza</Text>
            
            <View style={styles.displayRow}>
               <Text style={styles.bigText}>{formatTime(time)}</Text>
               <MaterialCommunityIcons name="clock-time-four-outline" size={24} color="#333" />
            </View>

            <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.smallLabel}>Time (HH:MM)</Text>
              <Text style={styles.inputValue}>{formatTime(time)}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                accentColor="#6C5CE7"
                textColor="#333"
              />
            )}

            {Platform.OS === 'ios' && showTimePicker && (
                 <TouchableOpacity 
                    style={styles.iosConfirmButton} 
                    onPress={() => setShowTimePicker(false)}
                 >
                    <Text style={styles.iosConfirmText}>Conferma Orario</Text>
                 </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Crea Gruppo</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "white",
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  inputGroup: { marginBottom: 20 },
  inputContainer: {
    backgroundColor: "#F3E5F5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  label: { fontSize: 12, color: "#777", marginBottom: 4 },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textInput: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    padding: 0,
  },
  cardSection: {
    backgroundColor: "#F3E5F5",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    fontWeight: "600",
  },
  displayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  bigText: { fontSize: 24, color: "#222" },
  
  pickerButton: {
    borderWidth: 2,
    borderColor: "#6C5CE7",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#EEE",
  },
  smallLabel: {
    fontSize: 10,
    color: "#6C5CE7",
    marginBottom: 2,
    fontWeight: "bold",
  },
  inputValue: {
    fontSize: 16,
    color: "#333",
  },
  
  iosConfirmButton: {
      alignSelf: 'flex-end', 
      marginTop: 10
  },
  iosConfirmText: {
      color: '#6C5CE7', 
      fontWeight: 'bold'
  },

  createButton: {
    backgroundColor: "#6C5CE7",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  }
});