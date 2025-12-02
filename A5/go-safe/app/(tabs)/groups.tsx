import React, { useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import GroupCard from "../../src/components/GroupCard";
import GroupsHeader from "../../src/components/GroupsHeader";
import CreateGroupModal from "../../src/components/CreateGroupModal";
import GroupDetailModal from "../../src/components/GroupDetailModal";

interface GroupItem {
  id: string;
  name: string;
  startZone: string;
  startTime: string;
  initial: string;
  color?: string;
  isJoined?: boolean; 
}

// Inizializziamo con isJoined false
const INITIAL_GROUPS: GroupItem[] = [
  { id: "1", name: "Destinazione 1", startZone: "Milano Centrale", startTime: "20:30", initial: "A", color: "#E1BEE7", isJoined: false },
  { id: "2", name: "Destinazione 2", startZone: "Piazza del Popolo", startTime: "23:00", initial: "B", color: "#E1BEE7", isJoined: false },
];

export default function GroupsScreen() {
  const [groups, setGroups] = useState<GroupItem[]>(INITIAL_GROUPS);
  
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  // --- FUNZIONE PER PARTECIPARE AL GRUPPO ---
  const handleJoinGroup = (groupId: string) => {
    // 1. Aggiorniamo la lista principale
    const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
            return { ...group, isJoined: true };
        }
        return group;
    });
    setGroups(updatedGroups);

    // 2. Aggiorniamo anche il gruppo correntemente selezionato (per vedere il tasto cambiare subito)
    if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup({ ...selectedGroup, isJoined: true });
    }
  };

  const handleCreateGroup = (newGroupData: any) => {
    const newGroup: GroupItem = {
      id: Date.now().toString(),
      name: newGroupData.name,
      startZone: newGroupData.startZone,
      startTime: newGroupData.startTime,
      initial: newGroupData.initial,
      color: "#E1BEE7",
      isJoined: true,
    };
    setGroups(prev => [...prev, newGroup]);
    setCreateModalVisible(false);
  };

  const handleOpenDetail = (group: GroupItem) => {
    setSelectedGroup(group);
    setDetailModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <GroupsHeader />

        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleOpenDetail(item)} activeOpacity={0.9}>
                <GroupCard
                  name={item.name}
                  startZone={item.startZone}
                  startTime={item.startTime}
                  initial={item.initial}
                  color={item.color}
                  isJoined={item.isJoined}
                  onPressEye={() => handleOpenDetail(item)} 
                />
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity 
            style={styles.fab} 
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={32} color="#333" />
        </TouchableOpacity>

        <CreateGroupModal 
          visible={isCreateModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onSubmit={handleCreateGroup}
        />

        {/* Passiamo la funzione onJoin al Modal */}
        <GroupDetailModal 
          visible={isDetailModalVisible}
          group={selectedGroup}
          onClose={() => setDetailModalVisible(false)}
          onJoin={handleJoinGroup} //Collegamento azione
        />
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});