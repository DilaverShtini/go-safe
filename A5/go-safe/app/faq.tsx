import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Abilita le animazioni layout su Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  {
    id: 1,
    question: "Come creo un gruppo di viaggio?",
    answer: "Vai nella scheda 'Gruppi' e premi il pulsante '+' in basso a destra. Inserisci punto di partenza, destinazione e orario. Diventerai automaticamente l'organizzatore."
  },
  {
    id: 2,
    question: "Le segnalazioni sono anonime?",
    answer: "Sì, le segnalazioni di pericolo (buio, animali, ecc.) sono visibili a tutti sulla mappa ma non mostrano il tuo nome utente per garantire la tua privacy."
  },
  {
    id: 3,
    question: "Cosa succede se premo il tasto SOS?",
    answer: "Il tasto SOS attiva una sirena ad alto volume per attirare l'attenzione e mostra la lista dei tuoi contatti di emergenza per una chiamata rapida."
  },
  {
    id: 4,
    question: "Posso uscire da un gruppo?",
    answer: "Certamente. Apri il dettaglio del gruppo e tocca il pulsante verde 'Fai parte del gruppo'. Se sei l'organizzatore, uscendo il gruppo rimarrà comunque attivo per gli altri."
  },
  {
    id: 5,
    question: "Come viene calcolato il percorso sicuro?",
    answer: "L'app analizza le strade disponibili ed evita le zone dove sono state inserite segnalazioni recenti di pericolo o scarsa illuminazione."
  }
];

export default function FaqScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  // Funzione per aprire la chat di supporto
  const handleOpenSupportChat = () => {
      router.push({
          pathname: "/detail",
          params: { id: "support_team", user: "Supporto Clienti" }
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistenza & FAQ</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Intro Box */}
        <View style={styles.introBox}>
            <MaterialCommunityIcons name="lifebuoy" size={40} color="#6C5CE7" style={{marginBottom: 10}}/>
            <Text style={styles.introTitle}>Come possiamo aiutarti?</Text>
            <Text style={styles.introText}>
                Trova risposte rapide alle domande più comuni sull'utilizzo dell'app e sulla tua sicurezza.
            </Text>
        </View>

        {/* Lista FAQ (Accordion) */}
        <Text style={styles.sectionTitle}>Domande Frequenti</Text>
        
        {FAQ_DATA.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
                <TouchableOpacity 
                    key={item.id} 
                    style={[styles.faqItem, isExpanded && styles.faqItemActive]} 
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.8}
                >
                    <View style={styles.questionRow}>
                        <Text style={[styles.questionText, isExpanded && styles.questionTextActive]}>
                            {item.question}
                        </Text>
                        <Ionicons 
                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={isExpanded ? "#6C5CE7" : "#999"} 
                        />
                    </View>
                    
                    {isExpanded && (
                        <View style={styles.answerContainer}>
                            <Text style={styles.answerText}>{item.answer}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            );
        })}

        {/* Footer Contatto Chat */}
        <View style={styles.contactFooter}>
            <Text style={styles.footerText}>Hai ancora bisogno di aiuto?</Text>
            
            <TouchableOpacity style={styles.contactButton} onPress={handleOpenSupportChat}>
                <Ionicons name="chatbubbles-outline" size={20} color="white" style={{marginRight: 8}}/>
                <Text style={styles.contactButtonText}>Chatta con il Supporto</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { 
      flexDirection: "row", 
      alignItems: "center", 
      justifyContent: "space-between", 
      paddingHorizontal: 20, 
      paddingVertical: 15, 
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderColor: "#eee"
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  
  content: { padding: 20, paddingBottom: 40 },

  introBox: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      marginBottom: 30,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2
  },
  introTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8 },
  introText: { textAlign: "center", color: "#666", lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15, marginLeft: 5 },

  faqItem: {
      backgroundColor: "#fff",
      borderRadius: 12,
      marginBottom: 10,
      padding: 15,
      borderWidth: 1,
      borderColor: "#eee",
      overflow: "hidden" 
  },
  faqItemActive: {
      borderColor: "#6C5CE7",
      backgroundColor: "#F3E5F5"
  },
  questionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
  },
  questionText: {
      fontSize: 16,
      fontWeight: "500",
      color: "#333",
      flex: 1,
      marginRight: 10
  },
  questionTextActive: {
      color: "#6C5CE7",
      fontWeight: "bold"
  },
  answerContainer: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "rgba(0,0,0,0.05)"
  },
  answerText: {
      fontSize: 14,
      color: "#555",
      lineHeight: 22
  },

  contactFooter: {
      marginTop: 30,
      alignItems: "center"
  },
  footerText: { color: "#888", marginBottom: 10 },
  contactButton: {
      paddingVertical: 12,
      paddingHorizontal: 30,
      backgroundColor: "#333",
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center'
  },
  contactButtonText: { color: "#fff", fontWeight: "bold" }
});