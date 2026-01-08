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
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const OSMInput = ({ label, placeholder, value, onSelect, zIndex }: any) => {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [timer, setTimer] = useState<any>(null); 
    const [showList, setShowList] = useState(false);

    const handleSelect = (item: any) => {
        if (timer) clearTimeout(timer);
        const addr = item.address || {};
        let smartName = "";
        const poiName = addr.amenity || addr.shop || addr.tourism || addr.leisure || addr.building || addr.historic || addr.railway;
        if (poiName) {
            smartName = poiName;
        } else if (addr.road || addr.pedestrian || addr.square) {
            smartName = addr.road || addr.pedestrian || addr.square;
            if (addr.house_number) {
                smartName += ` ${addr.house_number}`;
            }
        } else {
            smartName = item.display_name.split(',')[0];
        }
        smartName = smartName.charAt(0).toUpperCase() + smartName.slice(1);
        const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet;
        let finalName = smartName;
        if (cityName && smartName.toLowerCase() !== cityName.toLowerCase()) {
            finalName = `${smartName}, ${cityName}`;
        }
        setQuery(finalName); 
        onSelect(finalName); 
        setResults([]);      
        setShowList(false);  
        Keyboard.dismiss();  
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowList(false);
        }, 200);
    };

    const handleFocus = () => {
        if (results.length > 0 && query.length > 2) {
            setShowList(true);
        }
    };

    const searchOSM = async (text: string) => {
        if (text.length < 3) return;
        
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=4&countrycodes=it`,
                {
                    headers: { 'User-Agent': 'GoSafeApp/1.0' }
                }
            );
            const data = await response.json();
            setResults(data);
            setShowList(true);
        } catch (error) {
            console.log("Errore OSM:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeText = (text: string) => {
        setQuery(text);
        onSelect(text); 

        if (timer) clearTimeout(timer);

        if (text.length === 0) {
            setResults([]);
            setShowList(false);
            return;
        }

        const newTimer = setTimeout(() => {
            searchOSM(text);
        }, 800);
        
        setTimer(newTimer);
    };

    return (
        <View style={[styles.inputWrapper, { zIndex: zIndex }]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    value={query}
                    onChangeText={handleChangeText}
                    onBlur={handleBlur}   
                    onFocus={handleFocus} 
                    placeholderTextColor="#999"
                />
                {loading && <ActivityIndicator size="small" color="#6C5CE7" style={{marginRight: 10}}/>}
            </View>

            {showList && results.length > 0 && (
                <View style={styles.suggestionsBox}>
                    {results.map((item, index) => (
                        <TouchableOpacity 
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleSelect(item)}
                        >
                            <Feather name="map-pin" size={14} color="#666" style={{marginTop: 3}} />
                            <Text style={styles.suggestionText} numberOfLines={1}>
                                {item.display_name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};


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

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };

  const handleCreate = () => {
    if (!startLocation || !endLocation) {
      Alert.alert("Attenzione", "Inserisci luogo di partenza e arrivo");
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                keyboardShouldPersistTaps="handled"
            >
              
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crea il gruppo</Text>
                <View style={{ width: 24 }} /> 
              </View>

              <View style={styles.inputGroup}>
                
                <OSMInput 
                    label="Luogo di partenza"
                    placeholder="Cerca partenza..."
                    value={startLocation}
                    onSelect={(val: string) => setStartLocation(val)}
                    zIndex={2000} 
                />
                
                <View style={{height: 15, zIndex: -1}}/>
                <OSMInput 
                    label="Luogo di arrivo"
                    placeholder="Cerca destinazione..."
                    value={endLocation}
                    onSelect={(val: string) => setEndLocation(val)}
                    zIndex={1000} 
                />
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Seleziona la data della partenza</Text>
                <View style={styles.displayRow}>
                  <Text style={styles.bigText}>{formatDate(date)}</Text>
                  <Feather name="calendar" size={24} color="#333" />
                </View>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
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
                     <TouchableOpacity style={styles.iosConfirmButton} onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.iosConfirmText}>Conferma Data</Text>
                     </TouchableOpacity>
                )}
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Scegli l'orario della partenza</Text>
                <View style={styles.displayRow}>
                   <Text style={styles.bigText}>{formatTime(time)}</Text>
                   <MaterialCommunityIcons name="clock-time-four-outline" size={24} color="#333" />
                </View>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
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
                     <TouchableOpacity style={styles.iosConfirmButton} onPress={() => setShowTimePicker(false)}>
                        <Text style={styles.iosConfirmText}>Conferma Orario</Text>
                     </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createButtonText}>Crea Gruppo</Text>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
  
  inputGroup: {
      marginBottom: 20,
      zIndex: 10, 
  },
  inputWrapper: {
      position: 'relative',
  },
  label: { 
      fontSize: 12, 
      color: "#777", 
      marginBottom: 4,
      marginLeft: 4
  },
  inputContainer: {
    backgroundColor: "#F3E5F5",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textInput: {
      flex: 1,
      fontSize: 16,
      color: "#333",
  },
  
  suggestionsBox: {
      position: 'absolute',
      top: 65, 
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderRadius: 8,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      zIndex: 9999,
  },
  suggestionItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#EEE',
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center'
  },
  suggestionText: {
      fontSize: 14,
      color: '#333',
      flex: 1,
  },

  cardSection: {
    backgroundColor: "#F3E5F5",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    zIndex: -1, 
  },
  sectionTitle: { fontSize: 14, color: "#555", marginBottom: 15, fontWeight: "600" },
  displayRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  bigText: { fontSize: 24, color: "#222" },
  pickerButton: { borderWidth: 2, borderColor: "#6C5CE7", borderRadius: 6, padding: 10, backgroundColor: "#EEE" },
  smallLabel: { fontSize: 10, color: "#6C5CE7", marginBottom: 2, fontWeight: "bold" },
  inputValue: { fontSize: 16, color: "#333" },
  iosConfirmButton: { alignSelf: 'flex-end', marginTop: 10 },
  iosConfirmText: { color: '#6C5CE7', fontWeight: 'bold' },
  createButton: { backgroundColor: "#6C5CE7", padding: 15, borderRadius: 30, alignItems: "center", marginTop: 10, zIndex: -1 },
  createButtonText: { color: "white", fontSize: 18, fontWeight: "bold" }
});