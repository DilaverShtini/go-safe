// src/data/chatData.ts

export interface ChatItem {
  id: string;
  user: string;
  lastMessage: string;
  time: string;
  sortDate: string;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
}

// Lista Globale delle Chat
export let GLOBAL_CHATS: ChatItem[] = [
  { id: 'c1', user: 'Mario Rossi', lastMessage: 'Perfetto, ci vediamo domani.', time: '15:30', sortDate: '2025-11-26T15:30:00Z' },
  { id: 'c2', user: 'Anna Bianchi', lastMessage: 'Hai ricevuto il documento?', time: 'Ieri', sortDate: '2025-11-25T10:00:00Z' },
  { id: 'c3', user: 'Luca Verdi', lastMessage: 'Grazie mille per l\'aiuto!', time: 'Lunedì', sortDate: '2025-11-24T10:00:00Z' },
  { id: 'c4', user: 'Sofia Neri', lastMessage: 'Non dimenticare di chiamarmi.', time: '23/11', sortDate: '2025-11-23T10:00:00Z' },
  { id: 'c5', user: 'Giovanni Gialli', lastMessage: 'Tutto chiaro, procedo.', time: '14:00', sortDate: '2025-11-26T14:00:00Z' },
  { id: 'c6', user: 'Elena Marroni', lastMessage: 'Ti richiamo più tardi.', time: '12:05', sortDate: '2025-11-26T12:05:00Z' },
];

// Messaggi
export const DUMMY_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: '1', text: 'Ciao Mario!', sender: 'me' },
    { id: '2', text: 'Ciao! Riesci a vederci per il progetto?', sender: 'other' },
    { id: '3', text: 'Sì, ti confermo la disponibilità per domani.', sender: 'me' },
    { id: '4', text: 'Ok, il punto di ritrovo rimane quello in piazza?', sender: 'other' },
    { id: '5', text: 'Perfetto, ci vediamo domani alle 10:00.', sender: 'me' },
  ],
  c2: [
    { id: '1', text: 'Ciao Anna, come va la migrazione?', sender: 'me' },
    { id: '2', text: 'Bene, grazie! Quando mi invii i dati finali?', sender: 'other' },
    { id: '3', text: 'Te li mando oggi pomeriggio.', sender: 'me' },
    { id: '4', text: 'Te l\'ho appena inviato via mail.', sender: 'other' },
    { id: '5', text: 'Hai ricevuto il documento?', sender: 'me' },
    { id: '6', text: 'Sì, grazie. Lo guardo subito.', sender: 'other' },
  ],
  c3: [
    { id: '1', text: 'Ciao Luca!', sender: 'me' },
    { id: '2', text: 'Non riesco a caricare i dati.', sender: 'other' },
    { id: '3', text: 'Hai provato a ripulire la cache del server?', sender: 'me' },
    { id: '4', text: 'Sì, ora funziona. Sono riuscito a risolvere il bug seguendo la tua guida.', sender: 'other' },
    { id: '5', text: 'Figurati! Fammi sapere se hai problemi.', sender: 'me' },
    { id: '6', text: 'Grazie mille per l\'aiuto!', sender: 'other' },
  ],
  c4: [
    { id: '1', text: 'Ciao Sofia!', sender: 'me' },
    { id: '2', text: 'Sei a casa per le 20:00?', sender: 'other' },
    { id: '3', text: 'Sì, sono appena arrivata.', sender: 'me' },
    { id: '4', text: 'Certo, ti chiamo dopo cena.', sender: 'other' },
    { id: '5', text: 'Non dimenticare di chiamarmi.', sender: 'me' },
  ],
  c5: [
    { id: '1', text: 'Ciao Giovanni!', sender: 'me' },
    { id: '2', text: 'Confermi che hai ricevuto la lista degli ospiti?', sender: 'other' },
    { id: '3', text: 'Sì, tutto chiaro. Procedo.', sender: 'me' },
    { id: '4', text: 'Quindi usiamo il format standard per il report.', sender: 'other' },
  ],
  c6: [
    { id: '1', text: 'Ciao Elena!', sender: 'me' },
    { id: '2', text: 'Riesci a prendere la documentazione dal sito?', sender: 'other' },
    { id: '3', text: 'Sì, la scarico ora.', sender: 'me' },
    { id: '4', text: 'Aspetto la tua conferma allora.', sender: 'other' },
    { id: '5', text: 'Devo controllare, ti richiamo più tardi.', sender: 'me' },
  ],
  support_team: [
    { id: '1', text: 'Benvenuto nel Centro Assistenza. Come possiamo aiutarti oggi?', sender: 'other' }
  ]
};