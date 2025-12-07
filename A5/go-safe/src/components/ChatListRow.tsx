import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface ChatListRowProps {
  item: { user: string; time: string; lastMessage: string };
  onPress: () => void;
}

export default function ChatListRow({ item, onPress }: ChatListRowProps) {
  return (
    <TouchableOpacity style={styles.chatContainer} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
            {item.user.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.textContainer}>
        <View style={styles.rowHeader}>
          <Text style={styles.userName} numberOfLines={1}>{item.user}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatContainer: { 
    flexDirection: 'row', 
    padding: 15, 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: '#ccc', 
    alignItems: 'center', 
    backgroundColor: '#fff' 
  },
  avatarContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#F3E5F5', 
    marginRight: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    color: '#5E35B1', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  textContainer: { flex: 1, justifyContent: 'center' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  lastMessage: { fontSize: 14, color: '#777' },
  time: { fontSize: 12, color: '#999' },
});