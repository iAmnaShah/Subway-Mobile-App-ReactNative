import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location'; // For Expo Location API
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../(tabs)';

const AccountScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [location, setLocation] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Request location permission and fetch current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use the map');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 1,
        routes: [{ name: 'Login' }, { name: 'Home' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    Alert.alert('Location Selected', `Lat: ${latitude}, Lng: ${longitude}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>
      <Text style={styles.infoLabel}>Email:</Text>
      <Text style={styles.info}>{user?.email || 'No email available'}</Text>

      <TouchableOpacity style={styles.ordersButton} onPress={() => navigation.navigate('OrdersHistory')}>
        <Text style={styles.ordersButtonText}>View Orders History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Map Section */}
      <Text style={styles.mapLabel}>Select Delivery Location:</Text>
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={location}
            onPress={handleMapPress}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title="Selected Location"
                description="This is where your food will be delivered."
              />
            )}
          </MapView>
        ) : (
          <Text style={styles.loadingText}>Loading map...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
  },
  info: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ordersButton: {
    backgroundColor: '#028940',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  ordersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FFC20D',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default AccountScreen;
