import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Text, ActivityIndicator, Linking } from "react-native";
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
  distance: number; // Metri
  duration: number; // Secondi
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

// Raggio di sicurezza per considerare un pericolo vicino (circa 90 metri)
const SAFE_DISTANCE_THRESHOLD = 0.0009; 

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isRouting, setIsRouting] = useState(false);
  const [routeStatus, setRouteStatus] = useState<'safe' | 'danger'>('safe');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const [selectedPoint, setSelectedPoint] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [lastReportId, setLastReportId] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
           const request = await Location.requestForegroundPermissionsAsync();
           status = request.status;
        }

        if (status !== 'granted') {
          Alert.alert(
            "Permesso Negato",
            "Per visualizzare la tua posizione sulla mappa e calcolare i percorsi, devi abilitare l'accesso alla localizzazione nelle impostazioni.",
            [
              { text: "Annulla", style: "cancel" },
              { text: "Apri Impostazioni", onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);

        mapRef.current?.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000); 

      } catch (error) {
        console.log("Errore recupero posizione", error);
      }
    })();
  }, []);

  const handleCenterOnUser = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert("Errore", "Permesso di localizzazione non concesso.");
        return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
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
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const generateOffsetWaypoints = (start: { latitude: number, longitude: number }, end: { latitude: number, longitude: number }) => {
    const midLat = (start.latitude + end.latitude) / 2;
    const midLon = (start.longitude + end.longitude) / 2;
    
    const dLat = end.latitude - start.latitude;
    const dLon = end.longitude - start.longitude;
    
    // 150m è sufficiente per prendere la "via parallela" in una città standard.
    const offsetAmount = 0.0015; 

    const wp1 = {
        latitude: midLat - (dLon * 0.5), 
        longitude: midLon + (dLat * 0.5)
    };
    
    const dist1 = Math.sqrt(Math.pow(wp1.latitude - midLat, 2) + Math.pow(wp1.longitude - midLon, 2));
    const ratio1 = offsetAmount / (dist1 || 1);
    
    const alt1 = {
        latitude: midLat + (wp1.latitude - midLat) * ratio1,
        longitude: midLon + (wp1.longitude - midLon) * ratio1
    };

    const alt2 = {
        latitude: midLat - (alt1.latitude - midLat),
        longitude: midLon - (alt1.longitude - midLon)
    };

    return [alt1, alt2];
  };

  const fetchRoute = async (start: { latitude: number, longitude: number }, end: { latitude: number, longitude: number }) => {
    setIsRouting(true);
    setRouteStatus('safe'); 
    setRouteInfo(null);
    setRouteCoordinates([]);

    try {
      const baseUrl = "https://routing.openstreetmap.de/routed-foot/route/v1/foot";
      
      const urlDirect = `${baseUrl}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&alternatives=true`;

      const [wp1, wp2] = generateOffsetWaypoints(start, end);
      
      const urlAlt1 = `${baseUrl}/${start.longitude},${start.latitude};${wp1.longitude},${wp1.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      const urlAlt2 = `${baseUrl}/${start.longitude},${start.latitude};${wp2.longitude},${wp2.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

      const results = await Promise.all([
          fetch(urlDirect).then(r => r.json()).catch(e => null),
          fetch(urlAlt1).then(r => r.json()).catch(e => null),
          fetch(urlAlt2).then(r => r.json()).catch(e => null)
      ]);

      let allRoutes: any[] = [];

      results.forEach((json, index) => {
          if (json && json.code === 'Ok' && json.routes) {
              json.routes.forEach((r: any) => {
                   r._sourceIndex = index; 
                   allRoutes.push(r);
              });
          }
      });

      if (allRoutes.length === 0) {
        Alert.alert("Errore", "Impossibile trovare percorsi validi.");
        return;
      }

      let bestRoute = null;
      let lowestDangerCount = Infinity;
      let bestRouteDistance = Infinity; 
      let isAlternativeSelected = false;

      for (const route of allRoutes) {
          const pathPoints = route.geometry.coordinates.map((c: number[]) => ({ lat: c[1], lon: c[0] }));
          let currentRouteDangerCount = 0;

          for (let i = 0; i < pathPoints.length; i += 2) { 
              const point = pathPoints[i];
              const pointObj = {latitude: point.lat, longitude: point.lon};
              
              const hit = reports.some(report => 
                  getDistanceScore(pointObj, report) < SAFE_DISTANCE_THRESHOLD
              );
              
              if (hit) {
                  currentRouteDangerCount++;
                  i += 10;
              }
          }

          console.log(`Rotta trovata: Distanza ${route.distance}m, Pericoli: ${currentRouteDangerCount}`);

          if (currentRouteDangerCount < lowestDangerCount) {
              lowestDangerCount = currentRouteDangerCount;
              bestRoute = route;
              bestRouteDistance = route.distance;
              isAlternativeSelected = (route !== allRoutes[0]);
          } 
          else if (currentRouteDangerCount === lowestDangerCount) {
              if (route.distance < bestRouteDistance) {
                  bestRoute = route;
                  bestRouteDistance = route.distance;
                  isAlternativeSelected = (route !== allRoutes[0]);
              }
          }
      }

      // Fallback
      if (!bestRoute) bestRoute = allRoutes[0];

      // Feedback Utente
      if (lowestDangerCount === 0) {
          setRouteStatus('safe');
          if (isAlternativeSelected && reports.length > 0) {
             Alert.alert("Percorso Ottimizzato", "Percorso deviato per evitare zone a rischio.");
          }
      } else {
          setRouteStatus('danger');
          Alert.alert("Attenzione", "Tutte le strade alternative attraversano zone segnalate.");
      }

      let finalDuration = bestRoute.duration;
      const speedKmh = (bestRoute.distance / 1000) / (bestRoute.duration / 3600);
      if (speedKmh > 6) {
          finalDuration = bestRoute.distance / 1.25; // 1.25 m/s = 4.5 km/h
      }

      setRouteInfo({
          distance: bestRoute.distance,
          duration: finalDuration
      });

      const coordinates = bestRoute.geometry.coordinates.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));

      setRouteCoordinates(coordinates);
      
      setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
              edgePadding: { top: 80, right: 50, bottom: 250, left: 50 },
              animated: true,
          });
      }, 100);

    } catch (error) {
      console.error(error);
      Alert.alert("Errore", "Errore di connessione mappe.");
    } finally {
      setIsRouting(false);
    }
  };

  const handleDestinationSearch = (coords: { latitude: number; longitude: number }) => {
    setDestination(coords);
    setSelectedPoint(null);
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
    if (!destination) {
        setSelectedPoint(e.nativeEvent.coordinate);
    }
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

    setReports((prev) => [...prev, newReport]);
    setLastReportId(newId);
    setSelectedPoint(null);
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
            title={!report.isMyReport ? TYPE_LABELS[report.type] : undefined}
            description={!report.isMyReport ? report.note : undefined}
            
            onPress={() => {
              if (report.isMyReport) {
                const noteText = report.note && report.note.trim() !== "" 
                    ? `Nota: "${report.note}"` 
                    : "Nessuna nota aggiuntiva.";

                Alert.alert(
                  `Tipo segnalazione: ${TYPE_LABELS[report.type]}`,
                  `${noteText}\n\nCosa vuoi fare?`,
                  [
                    { 
                      text: "Elimina", 
                      style: "destructive",
                      onPress: () => {
                        Alert.alert(
                          "Sei sicuro?",
                          "L'eliminazione è definitiva e non può essere annullata.",
                          [
                            { 
                              text: "Elimina definitivamente", 
                              style: "destructive", 
                              onPress: () => {
                                setReports((prev) => prev.filter((r) => r.id !== report.id));
                              }
                            },
                            { text: "Annulla", style: "cancel" }
                          ]
                        );
                      }
                    },
                    { 
                      text: "Chiudi", 
                      style: "cancel"
                    } 
                  ]
                );
              }
            }}
          >
            <View style={[styles.markerBg, { backgroundColor: TYPE_COLORS[report.type] }]}>
              <MaterialCommunityIcons 
                name={TYPE_ICONS[report.type]} 
                size={20} 
                color="white" 
              />
              {report.isMyReport && (
                <View style={styles.myReportBadge}>
                  <MaterialCommunityIcons name="account" size={10} color="white" />
                </View>
              )}
            </View>
          </Marker>
        ))}

        {selectedPoint && <Marker coordinate={selectedPoint} title="Punto Selezionato" pinColor="blue" opacity={0.7} />}
      </MapView>

      <SearchBar onSearchLocation={handleDestinationSearch} />
      
      {isRouting && (
        <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#6c5ce7" /></View>
      )}
      
      {routeInfo && (
          <View style={styles.infoCard}>
              <View style={styles.infoTextContainer}>
                  <View style={styles.infoRow}>
                    <FontAwesome5 name="walking" size={20} color="#333" style={{marginRight: 10}} />
                    <Text style={styles.infoTime}>{formatDuration(routeInfo.duration)}</Text>
                  </View>
                  <Text style={styles.infoDistance}>Distanza: {formatDistance(routeInfo.distance)}</Text>
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
            routeInfo 
                ? { bottom: 170 } 
                : { bottom: 110 } 
        ]} 
        onPress={handleCenterOnUser}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={28} color="#333" />
      </TouchableOpacity>

      {!destination && <FloatingReportButton onPress={handleFloatingButtonPress} />}

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
  infoTextContainer: {
      flex: 1,
  },
  infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
  },
  infoTime: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2d3436',
  },
  infoDistance: {
      fontSize: 16,
      color: '#636e72',
      marginLeft: 3, 
  },
  divider: {
      width: 1,
      height: '80%',
      backgroundColor: '#dfe6e9',
      marginHorizontal: 15,
  },
  closeBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
  },
  closeBtnText: {
      color: '#e74c3c',
      fontSize: 14,
      fontWeight: '600',
      marginTop: 4,
  },
  myReportBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white'
  },
});