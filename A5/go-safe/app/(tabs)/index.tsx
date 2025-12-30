import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  Linking, 
  Platform 
} from "react-native";
import MapView, { Marker, MapPressEvent, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import SearchBar from "../../src/components/SearchBar";
import FloatingReportButton from "../../src/components/FloatingReportButton";
import ReportModal from "../../src/components/ReportModal";

interface Report {
  id: number;
  latitude: number;
  longitude: number;
  type: string;
  note: string;
  isMyReport?: boolean;
}

interface RouteInfo {
  distance: number;
  duration: number;
}

const TYPE_ICONS: Record<string, any> = {
  danger: "alert-octagon", darkness: "lightbulb-off", desolate: "road-variant",
  stray: "dog-side", suspicious: "account-alert", weather: "weather-lightning-rainy",
};

const TYPE_COLORS: Record<string, string> = {
  danger: "#e74c3c", darkness: "#34495e", desolate: "#e67e22",
  stray: "#6c5ce7", suspicious: "#8d6e63", weather: "#3498db",
};

const TYPE_LABELS: Record<string, string> = {
  danger: "Pericolo", darkness: "Buio", desolate: "Strada desolata",
  stray: "Animali randagi", suspicious: "Individuo Sospetto", weather: "Allerta meteo",
};

const DEFAULT_REGION = {
  latitude: 44.1396, 
  longitude: 12.2432,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const SAFE_DISTANCE_THRESHOLD = 0.0012; 

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);

  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isRouting, setIsRouting] = useState(false);
  const [routeStatus, setRouteStatus] = useState<'safe' | 'danger'>('safe');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const [selectedPoint, setSelectedPoint] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastReportId, setLastReportId] = useState<number | null>(null);

  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [reports]);

  useEffect(() => {
    (async () => {
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          Alert.alert("GPS Disattivato", "Attiva la geolocalizzazione per usare la mappa.", [{ text: "OK" }]);
          return;
        }

        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
           const request = await Location.requestForegroundPermissionsAsync();
           status = request.status;
        }

        if (status !== 'granted') {
          Alert.alert("Permesso Negato", "L'app necessita della posizione per funzionare.", [
            { text: "Impostazioni", onPress: () => Linking.openSettings() },
            { text: "Annulla", style: "cancel" }
          ]);
          return;
        }

        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation(location.coords);
        
        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000); 

      } catch (error) {
        console.log("Errore inizializzazione mappa:", error);
      }
    })();
  }, []);

  const handleCenterOnUser = async () => {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
        
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
        mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    } catch (e) {
        console.log("Errore center user:", e);
    }
  };

  const getDistanceScore = (pt1: {latitude: number, longitude: number}, pt2: {latitude: number, longitude: number}) => {
    return Math.sqrt(Math.pow(pt1.latitude - pt2.latitude, 2) + Math.pow(pt1.longitude - pt2.longitude, 2));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60); 
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours} h ${mins} min`;
    }
    return `${minutes} min`;
  };

  const formatDistance = (meters: number) => {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
  };

  const calculateRouteDanger = (routeGeoJson: any) => {
      const pathPoints = routeGeoJson.geometry.coordinates.map((c: number[]) => ({ latitude: c[1], longitude: c[0] }));
      let dangerCount = 0;
      for (const report of reports) {
          for (let i = 0; i < pathPoints.length; i++) {
              const point = pathPoints[i];
              if (getDistanceScore(point, report) < SAFE_DISTANCE_THRESHOLD) {
                  dangerCount++;
                  break; 
              }
          }
      }
      return dangerCount;
  };

  const getDetourPoints = (start: any, end: any) => {
      const midLat = (start.latitude + end.latitude) / 2;
      const midLon = (start.longitude + end.longitude) / 2;
      const offset = 0.00150;
      return [
          { latitude: midLat + offset, longitude: midLon },
          { latitude: midLat - offset, longitude: midLon },
          { latitude: midLat, longitude: midLon + offset },
          { latitude: midLat, longitude: midLon - offset },
      ];
  };

  const fetchRoute = async (start: { latitude: number, longitude: number }, end: { latitude: number, longitude: number }) => {
    setIsRouting(true);
    setRouteStatus('safe'); 
    setRouteInfo(null);
    setRouteCoordinates([]);

    const baseUrl = "https://router.project-osrm.org/route/v1/foot"; 

    try {
      let candidateRoutes: any[] = [];
      const urlDirect = `${baseUrl}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&alternatives=true`;
      const respDirect = await fetch(urlDirect).then(r => r.json()).catch(() => null);
      if (respDirect && respDirect.routes) {
          candidateRoutes = [...candidateRoutes, ...respDirect.routes];
      }

      let bestStandardDanger = Infinity;
      if (candidateRoutes.length > 0) {
          bestStandardDanger = Math.min(...candidateRoutes.map(r => calculateRouteDanger(r)));
      }

      if (bestStandardDanger > 0) {
          const detours = getDetourPoints(start, end);
          const detourPromises = detours.map(wp => 
              fetch(`${baseUrl}/${start.longitude},${start.latitude};${wp.longitude},${wp.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`)
              .then(r => r.json())
              .catch(() => null)
          );
          const detourResults = await Promise.all(detourPromises);
          detourResults.forEach(res => {
              if (res && res.routes && res.routes.length > 0) candidateRoutes.push(res.routes[0]);
          });
      }

      if (candidateRoutes.length === 0) {
        Alert.alert("Errore", "Nessun percorso trovato.");
        return;
      }

      const scoredRoutes = candidateRoutes.map(route => ({
          route,
          danger: calculateRouteDanger(route),
          distance: route.distance
      }));

      scoredRoutes.sort((a, b) => {
          if (a.danger !== b.danger) return a.danger - b.danger; 
          return a.distance - b.distance; 
      });

      const bestChoice = scoredRoutes[0];
      
      if (bestChoice.danger > 0) {
          setRouteStatus('danger');
          setTimeout(() => {
            Alert.alert("Attenzione", "Tutte le strade possibili passano vicino a una segnalazione.");
          }, 100);
      } else {
          setRouteStatus('safe');
      }

      let duration = bestChoice.route.duration;
      if ((bestChoice.route.distance / duration) > 1.5) duration = bestChoice.route.distance / 1.25; 

      setRouteInfo({ distance: bestChoice.route.distance, duration: duration });

      const coords = bestChoice.route.geometry.coordinates.map((c: number[]) => ({ latitude: c[1], longitude: c[0] }));
      setRouteCoordinates(coords);

      setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
              animated: true,
          });
      }, 100);

    } catch (error) {
      console.error(error);
      setTimeout(() => { Alert.alert("Errore", "Errore di connessione mappe."); }, 100);
    } finally {
      setIsRouting(false);
    }
  };

  const handleDestinationSearch = (coords: { latitude: number; longitude: number }) => {
    setDestination(coords);
    setSelectedPoint(null);
    setSelectedReport(null);
    if (userLocation) {
        fetchRoute(userLocation, coords);
    } else {
        mapRef.current?.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        });
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    if (modalVisible) return;
    if (selectedReport) {
        setSelectedReport(null);
        return;
    }
    setSelectedPoint(e.nativeEvent.coordinate);
  };

  const handleFloatingButtonPress = () => {
    if (!selectedPoint) {
      Alert.alert("Attenzione", "Seleziona un punto sulla mappa per creare una segnalazione.");
      return;
    }
    setModalVisible(true);
  };

  const handleCreateReport = (type: string, note: string) => {
    if (!selectedPoint) return;
    const newId = Date.now();
    const newReport: Report = {
      id: newId,
      latitude: selectedPoint.latitude,
      longitude: selectedPoint.longitude,
      type: type,
      note: note,
      isMyReport: true,
    };
    
    setTracksViewChanges(true);
    setReports((prev) => [...prev, newReport]);
    setLastReportId(newId);
    setSelectedPoint(null);
    setModalVisible(false);
  };

  const handleUndoReport = () => {
      if (lastReportId) {
          setReports((prev) => prev.filter((r) => r.id !== lastReportId));
          setLastReportId(null);
      }
  };

  const clearNavigation = () => {
      setDestination(null);
      setRouteCoordinates([]);
      setRouteInfo(null);
      setRouteStatus('safe');
      if (userLocation) {
        mapRef.current?.animateToRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });
      }
  };

  const handleDeleteReport = () => {
      if (!selectedReport) return;
      
      Alert.alert(
          "Elimina segnalazione",
          "Sei sicuro di voler eliminare questa segnalazione?",
          [
              { text: "Annulla", style: "cancel" },
              {
                  text: "Elimina",
                  style: "destructive",
                  onPress: () => {
                      setReports((prev) => prev.filter((r) => r.id !== selectedReport.id));
                      setSelectedReport(null);
                  }
              }
          ]
      );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={DEFAULT_REGION} 
        onPress={handleMapPress}
      >
        {routeCoordinates.length > 0 && (
            <Polyline 
              coordinates={routeCoordinates} 
              strokeColor={routeStatus === 'danger' ? "#e74c3c" : "#6c5ce7"} 
              strokeWidth={5} 
              lineDashPattern={[1]} 
            />
        )}
        
        {destination && <Marker coordinate={destination} title="Arrivo" pinColor="red" />}

        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{ latitude: report.latitude, longitude: report.longitude }}
            zIndex={report.id}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracksViewChanges}
            onPress={(e) => {
                e.stopPropagation();
                requestAnimationFrame(() => {
                    setSelectedReport(report);
                    setSelectedPoint(null);
                });
            }}
          >
            <View style={[styles.markerBg, { backgroundColor: TYPE_COLORS[report.type] }]}>
              <MaterialCommunityIcons name={TYPE_ICONS[report.type]} size={20} color="white" />
              {report.isMyReport && (
                <View style={styles.myReportBadge}>
                  <MaterialCommunityIcons name="account" size={10} color="white" />
                </View>
              )}
            </View>
          </Marker>
        ))}

        {selectedPoint && (
          <Marker 
            coordinate={selectedPoint} 
            title="Punto Selezionato" 
            pinColor="red"
            opacity={1.0}
            tracksViewChanges={false}
            onPress={(e) => { e.stopPropagation(); setSelectedPoint(null); }}
          />
        )}
      </MapView>

      <SearchBar onSearchLocation={handleDestinationSearch} />

      {isRouting && (
        <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#6c5ce7" /></View>
      )}

      {/* --- SCHEDA INFO SEGNALAZIONE --- */}
      {selectedReport && (
          <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                  <View style={[styles.iconBox, { backgroundColor: TYPE_COLORS[selectedReport.type] }]}>
                      <MaterialCommunityIcons name={TYPE_ICONS[selectedReport.type]} size={24} color="white" />
                  </View>
                  <View style={{flex: 1, marginLeft: 10}}>
                      <Text style={styles.reportTitle}>{TYPE_LABELS[selectedReport.type]}</Text>
                      <Text style={styles.reportNote} numberOfLines={2}>
                          {selectedReport.note ? selectedReport.note : "Nessuna descrizione disponibile"}
                      </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedReport(null)} style={{padding: 5}}>
                      <Ionicons name="close" size={24} color="#999" />
                  </TouchableOpacity>
              </View>

              {selectedReport.isMyReport && (
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteReport}>
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color="white" />
                      <Text style={styles.deleteButtonText}>Elimina Segnalazione</Text>
                  </TouchableOpacity>
              )}
          </View>
      )}

      {routeInfo && !selectedReport && (
          <View style={styles.infoCard}>
              <View style={styles.infoTextContainer}>
                  <View style={styles.infoRow}>
                    <FontAwesome5 name="walking" size={20} color="#333" style={{marginRight: 10}} />
                    <Text style={styles.infoTime}>{formatDuration(routeInfo.duration)}</Text>
                  </View>
                  <Text style={styles.infoDistance}>
                      A piedi • {formatDistance(routeInfo.distance)}
                  </Text>
              </View>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.closeBtn} onPress={clearNavigation}>
                  <Ionicons name="close" size={24} color="#e74c3c" />
                  <Text style={styles.closeBtnText}>Esci</Text>
              </TouchableOpacity>
          </View>
      )}

      <TouchableOpacity 
        style={[
            styles.myLocationButton, 
            (routeInfo || selectedReport) ? { bottom: 220 } : { bottom: 100 }
        ]} 
        onPress={handleCenterOnUser}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={28} color="#333" />
      </TouchableOpacity>

      {!selectedReport && (
          <FloatingReportButton 
              onPress={handleFloatingButtonPress} 
              style={ routeInfo ? { bottom: 140 } : undefined }
          />
      )}

      <ReportModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateReport}
        onUndo={handleUndoReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  
  markerBg: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
    minHeight: 36,
    backgroundColor: 'white' 
  },
  myReportBadge: {
    position: 'absolute', bottom: -5, right: -5, backgroundColor: '#2ecc71',
    borderRadius: 8, width: 16, height: 16, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: 'white'
  },

  loaderContainer: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    elevation: 5,
  },
  myLocationButton: {
    position: "absolute", right: 20, width: 50, height: 50, borderRadius: 25,
    backgroundColor: "white", justifyContent: "center", alignItems: "center",
    elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84, zIndex: 1000,
  },
  
  infoCard: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      right: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      zIndex: 900,
  },
  infoTextContainer: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  infoTime: { fontSize: 24, fontWeight: 'bold', color: '#2d3436' },
  infoDistance: { fontSize: 16, color: '#636e72', marginLeft: 3 },
  divider: { width: 1, height: '80%', backgroundColor: '#dfe6e9', marginHorizontal: 15 },
  closeBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  closeBtnText: { color: '#e74c3c', fontSize: 14, fontWeight: '600', marginTop: 4 },

  reportCard: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      right: 20,
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 16,
      elevation: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      zIndex: 999,
  },
  reportHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 15
  },
  iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
  },
  reportTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4
  },
  reportNote: {
      fontSize: 14,
      color: '#666',
      lineHeight: 20
  },
  deleteButton: {
      backgroundColor: '#e74c3c',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
  },
  deleteButtonText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 8,
      fontSize: 15
  }
});