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

export let GLOBAL_CHATS: ChatItem[] = [
  { 
    id: 'c1', 
    user: 'Giulia Bianchi', 
    lastMessage: 'Perfetto, ti aspetto vicino all\'edicola.', 
    time: '18:45', 
    sortDate: '2025-12-17T18:45:00Z' 
  },
  { 
    id: 'c2', 
    user: 'Marco Rossi', 
    lastMessage: 'Sto uscendo ora dalla biblioteca.', 
    time: '18:30', 
    sortDate: '2025-12-17T18:30:00Z' 
  },
  { 
    id: 'c3', 
    user: 'Sara Verdi', 
    lastMessage: 'Siamo in 3, ci vediamo al punto di ritrovo.', 
    time: 'Ieri', 
    sortDate: '2025-12-16T22:15:00Z' 
  },
  { 
    id: 'c4', 
    user: 'Alessandro Rosa', 
    lastMessage: 'Grazie per la compagnia, a domani!', 
    time: 'Ieri', 
    sortDate: '2025-12-16T21:00:00Z' 
  },
  { 
    id: 'c5', 
    user: 'Francesca Neri', 
    lastMessage: 'Ok, passo per Via Roma che è più illuminata.', 
    time: '15/12', 
    sortDate: '2025-12-15T19:30:00Z' 
  },
  { 
    id: 'support_team', 
    user: 'Supporto Clienti', 
    lastMessage: 'Benvenuto nel Centro Assistenza.', 
    time: '01/12', 
    sortDate: '2025-12-01T09:00:00Z' 
  },
];

export const DUMMY_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: '1', text: 'Ciao Giulia, ho visto che fai anche tu la strada dalla stazione verso il centro.', sender: 'me' },
    { id: '2', text: 'Ciao! Sì, scendo dal treno delle 18:50.', sender: 'other' },
    { id: '3', text: 'Ottimo, anche io. Ti va se facciamo il pezzo a piedi insieme? C\'è quel sottopassaggio poco illuminato...', sender: 'me' },
    { id: '4', text: 'Volentieri! Non mi piace mai farlo da sola.', sender: 'other' },
    { id: '5', text: 'D\'accordo allora. Io ho una giacca rossa.', sender: 'me' },
    { id: '6', text: 'Perfetto, ti aspetto vicino all\'edicola.', sender: 'other' },
  ],

  c2: [
    { id: '1', text: 'Ehi Marco, sei ancora in aula studio?', sender: 'me' },
    { id: '2', text: 'Sì, stavo finendo un capitolo. Tu?', sender: 'other' },
    { id: '3', text: 'Io ho finito ora. Volevo andare al parcheggio multipiano ma a quest\'ora è deserto.', sender: 'me' },
    { id: '4', text: 'Capisco, neanche a me fa impazzire. Aspettami 5 minuti che scendo.', sender: 'other' },
    { id: '5', text: 'Ok, ti aspetto nell\'atrio.', sender: 'me' },
    { id: '6', text: 'Sto uscendo ora dalla biblioteca.', sender: 'other' },
  ],

  c3: [
    { id: '1', text: 'Ciao Sara, sei l\'organizzatrice del gruppo "Zona Stadio"?', sender: 'me' },
    { id: '2', text: 'Ciao! Sì esatto, partiamo tra 20 minuti.', sender: 'other' },
    { id: '3', text: 'Posso unirmi? Sono a piedi.', sender: 'me' },
    { id: '4', text: 'Certamente! Più siamo meglio è.', sender: 'other' },
    { id: '5', text: 'Dove vi trovo di preciso?', sender: 'me' },
    { id: '6', text: 'Siamo in 3, ci vediamo al punto di ritrovo, proprio sotto il lampione all\'ingresso.', sender: 'other' },
  ],

  c4: [
    { id: '1', text: 'Ale, stasera prendi il bus delle 20:30?', sender: 'me' },
    { id: '2', text: 'Sì, confermato. Solita fermata?', sender: 'other' },
    { id: '3', text: 'Sì. Hanno segnalato dei cani randagi vicino al parco, preferisco non essere solo.', sender: 'me' },
    { id: '4', text: 'Tranquillo, facciamo il giro largo insieme.', sender: 'other' },
    { id: '5', text: 'Arrivato a casa ora. Tutto ok.', sender: 'me' },
    { id: '6', text: 'Anche io. Grazie per la compagnia, a domani!', sender: 'other' },
  ],

  c5: [
    { id: '1', text: 'Ciao, ho visto il tuo gruppo per arrivare in Via Verdi.', sender: 'other' },
    { id: '2', text: 'Ciao! Sì, devo portare fuori il cane ma c\'è troppa nebbia stasera.', sender: 'me' },
    { id: '3', text: 'Io sto passando di lì tra 10 minuti. Se vuoi ci incrociamo.', sender: 'other' },
    { id: '4', text: 'Va bene. Facciamo la strada del parco o quella principale?', sender: 'me' },
    { id: '5', text: 'Meglio evitare il parco col buio.', sender: 'other' },
    { id: '6', text: 'Ok, passo per Via Roma che è più illuminata.', sender: 'me' },
  ],

  support_team: [
    { id: '1', text: 'Benvenuto nel Centro Assistenza. Come possiamo aiutarti oggi?', sender: 'other' }
  ]
};