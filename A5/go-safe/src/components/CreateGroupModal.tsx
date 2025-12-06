import React, { useState, useRef } from "react";
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
  
  const [hour, setHour] = useState("20");
  const [minute, setMinute] = useState("00");
  const [isAm, setIsAm] = useState(false);

  const minuteInputRef = useRef<TextInput>(null);

  const handleHourChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length > 0 && parseInt(numericText) > 12) {
       if (numericText.length === 2) return; 
    }
    setHour(numericText);
    if (numericText.length === 2) {
      minuteInputRef.current?.focus();
    }
  };

  const handleMinuteChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length > 0 && parseInt(numericText) > 59) return; 
    setMinute(numericText);
  };

  const handleBlurHour = () => {
      let val = parseInt(hour);
      if (isNaN(val) || val === 0) setHour("12");
      else if (val < 10) setHour(`0${val}`);
  };

  const handleBlurMinute = () => {
      let val = parseInt(minute);
      if (isNaN(val)) setMinute("00");
      else if (val < 10) setMinute(`0${val}`);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mesi partono da 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCreate = () => {
    if (!startLocation || !endLocation) {
      Alert.alert("Manca qualcosa", "Inserisci luogo di partenza e arrivo");
      return;
    }

    const newGroup = {
      name: endLocation, 
      startZone: startLocation,
      startTime: `${hour}:${minute} ${isAm ? 'AM' : 'PM'}`,
      date: formatDate(date),
      initial: endLocation.charAt(0).toUpperCase(),
    };

    onSubmit(newGroup);
    
    // Reset
    setStartLocation("");
    setEndLocation("");
    setDate(new Date());
    setHour("20");
    setMinute("00");
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

          {/* --- SEZIONE DATA CON CALENDARIO --- */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Seleziona la data della partenza</Text>
            
            <View style={styles.dateDisplayRow}>
              <Text style={styles.bigDateText}>
                {formatDate(date)}
              </Text>
              <Feather name="calendar" size={24} color="#333" />
            </View>

            {/* Invece di un TextInput, usiamo un bottone che apre il calendario */}
            <TouchableOpacity 
                style={styles.dateInputBox} 
                onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.smallLabel}>Date (DD/MM/YYYY)</Text>
              <Text style={styles.dateInputValue}>{formatDate(date)}</Text>
            </TouchableOpacity>

            {/* Il Componente Calendario (Visibile solo quando showDatePicker è true o su iOS inline) */}
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                accentColor="#6C5CE7"
                textColor="#333"
              />
            )}
            
            {/* Per iOS */}
            {Platform.OS === 'ios' && showDatePicker && (
                 <TouchableOpacity 
                    style={{alignSelf: 'flex-end', marginTop: 10}} 
                    onPress={() => setShowDatePicker(false)}
                 >
                    <Text style={{color: '#6C5CE7', fontWeight: 'bold'}}>Conferma Data</Text>
                 </TouchableOpacity>
            )}

          </View>

          {/* Sezione Orario (Invariata) */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Scegli l'orario della partenza</Text>
            <View style={styles.timeContainer}>
              <View>
                <View style={[styles.timeBox, styles.activeTimeBox]}>
                  <TextInput 
                    style={styles.timeText} 
                    value={hour} 
                    onChangeText={handleHourChange}
                    onBlur={handleBlurHour}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                  />
                </View>
                <Text style={styles.timeLabel}>Hour</Text>
              </View>
              <Text style={styles.colon}>:</Text>
              <View>
                <View style={styles.timeBox}>
                  <TextInput 
                    ref={minuteInputRef}
                    style={styles.timeText} 
                    value={minute} 
                    onChangeText={handleMinuteChange} 
                    onBlur={handleBlurMinute}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                  />
                </View>
                <Text style={styles.timeLabel}>Minute</Text>
              </View>
              <View style={styles.amPmContainer}>
                <TouchableOpacity 
                  style={[styles.amPmButton, isAm && styles.amPmActive]}
                  onPress={() => setIsAm(true)}
                >
                  <Text style={styles.amPmText}>AM</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={[styles.amPmButton, !isAm && styles.amPmActive]}
                  onPress={() => setIsAm(false)}
                >
                  <Text style={styles.amPmText}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.clockFooter}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={24} color="#555" />
                <Text style={{color: '#666', fontSize: 12}}>
                    {hour}:{minute} {isAm ? 'AM' : 'PM'}
                </Text>
            </View>
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
  dateDisplayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  bigDateText: { fontSize: 24, color: "#222" },
  dateInputBox: {
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
  dateInputValue: {
    fontSize: 16,
    color: "#333",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  timeBox: {
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    width: 80,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row',
  },
  activeTimeBox: {
    backgroundColor: "#EADDFF",
    borderWidth: 1,
    borderColor: "#6C5CE7",
  },
  timeText: {
    fontSize: 32,
    color: "#333",
    textAlign: 'center',
    width: '100%',
  },
  timeLabel: { fontSize: 12, color: "#777", marginTop: 5, textAlign: 'center' },
  colon: { fontSize: 40, fontWeight: "bold", marginBottom: 20 },
  amPmContainer: {
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#AAA",
    overflow: "hidden",
  },
  amPmButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  amPmActive: { backgroundColor: "#FFCDD2" },
  amPmText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  divider: { height: 1, backgroundColor: "#AAA" },
  clockFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
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