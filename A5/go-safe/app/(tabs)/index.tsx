import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Text, ActivityIndicator, Linking } from "react-native";
import MapView, { Marker, MapPressEvent, Polyline, PROVIDER_DEFAULT, Callout } from "react-native-maps";
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
          Alert.alert("Permesso Negato", "Serve la posizione per navigare.", [{ text: "Apri Impostazioni", onPress: () => Linking.openSettings() }]);
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
        console.log("Errore posizione", error);
      }
    })();
  }, []);

  const handleCenterOnUser = async () => {
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
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
  };

  const pointToSegmentDistance = (
    p: { latitude: number; longitude: number },
    v: { latitude: number; longitude: number },
    w: { latitude: number; longitude: number }
  ) => {
    const l2 = Math.pow(v.latitude - w.latitude, 2) + Math.pow(v.longitude - w.longitude, 2);
    if (l2 === 0) return Math.sqrt(Math.pow(p.latitude - v.latitude, 2) + Math.pow(p.longitude - v.longitude, 2));

    let t = ((p.latitude - v.latitude) * (w.latitude - v.latitude) + (p.longitude - v.longitude) * (w.longitude - v.longitude)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projectionLat = v.latitude + t * (w.latitude - v.latitude);
    const projectionLon = v.longitude + t * (w.longitude - v.longitude);

    return Math.sqrt(Math.pow(p.latitude - projectionLat, 2) + Math.pow(p.longitude - projectionLon, 2));
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
          console.log("Percorsi diretti pericolosi. Calcolo deviazioni...");
          const detours = getDetourPoints(start, end);
          
          const detourPromises = detours.map(wp => 
              fetch(`${baseUrl}/${start.longitude},${start.latitude};${wp.longitude},${wp.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`)
              .then(r => r.json())
              .catch(() => null)
          );

          const detourResults = await Promise.all(detourPromises);
          detourResults.forEach(res => {
              if (res && res.routes && res.routes.length > 0) {
                  candidateRoutes.push(res.routes[0]);
              }
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
      const finalRoute = bestChoice.route;

      if (bestChoice.danger === 0) {
          setRouteStatus('safe');
      } else {
          setRouteStatus('danger');
          Alert.alert("Attenzione", "Tutte le strade possibili passano vicino a una segnalazione.");
      }

      let duration = finalRoute.duration;
      if ((finalRoute.distance / duration) > 1.5) duration = finalRoute.distance / 1.25; 

      setRouteInfo({
          distance: finalRoute.distance,
          duration: duration
      });

      const coords = finalRoute.geometry.coordinates.map((c: number[]) => ({ latitude: c[1], longitude: c[0] }));
      setRouteCoordinates(coords);
      
      setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, {
              edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
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
                Alert.alert("Gestione", "Eliminare segnalazione?", [
                    { text: "Elimina", style: "destructive", onPress: () => setReports(p => p.filter(r => r.id !== report.id)) },
                    { text: "Annulla", style: "cancel" }
                ]);
              }
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
          <Marker coordinate={selectedPoint} title="Punto Selezionato" pinColor="blue" opacity={0.7}
            onPress={(e) => { e.stopPropagation(); setSelectedPoint(null); }}
          >
             <Callout tooltip>
                <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>Nuova posizione</Text>
                    <Text style={styles.calloutDesc}>(Tocca per rimuovere)</Text>
                </View>
             </Callout>
          </Marker>
        )}
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
        style={[styles.myLocationButton, routeInfo ? { bottom: 170 } : { bottom: 110 }]} 
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
  infoTextContainer: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  infoTime: { fontSize: 24, fontWeight: 'bold', color: '#2d3436' },
  infoDistance: { fontSize: 16, color: '#636e72', marginLeft: 3 },
  divider: { width: 1, height: '80%', backgroundColor: '#dfe6e9', marginHorizontal: 15 },
  closeBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  closeBtnText: { color: '#e74c3c', fontSize: 14, fontWeight: '600', marginTop: 4 },
  myReportBadge: {
    position: 'absolute', bottom: -5, right: -5, backgroundColor: '#2ecc71',
    borderRadius: 8, width: 16, height: 16, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: 'white'
  },
  calloutContainer: {
    backgroundColor: "white", padding: 10, borderRadius: 8, width: 160,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 2
  },
  calloutTitle: { fontWeight: "bold", fontSize: 14, marginBottom: 4, color: "#333", textAlign: 'center' },
  calloutDesc: { fontSize: 12, color: "#e74c3c", fontStyle: 'italic', textAlign: 'center' },
});