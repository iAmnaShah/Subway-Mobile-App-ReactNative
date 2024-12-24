import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useCart } from '../contexts/CartContext';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location'; // For Expo Location API
import { supabase } from '@/supabaseClient'; // Import Supabase client

const PaymentScreen: React.FC = ({ route, navigation }: any) => {
  const { total,items } = route.params;
  const { clearCart } = useCart(); // Import clearCart
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'cod' | null>(
    null
  );
  const [discountCode, setDiscountCode] = useState('');
  const [discountedTotal, setDiscountedTotal] = useState(total);
  const [tip, setTip] = useState(0);

  const [location, setLocation] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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

  const validDiscountCode = 'SAVE10';

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a discount code.');
      return;
    }
    if (discountCode === validDiscountCode) {
      const newTotal = total - total * 0.1; // 10% discount
      setDiscountedTotal(newTotal);
      Alert.alert('Discount Applied', `New total is Rs. ${newTotal.toFixed(2)}`);
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid discount code.');
    }
  };
  
  

  const handleConfirmPayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method.');
      return;
    }
  
    const finalTotal = discountedTotal + tip;
  
    try {
      // Fetch the logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError) {
        console.error('Error fetching user:', userError);
        Alert.alert('Error', 'Failed to fetch user.');
        return;
      }
  
      if (!user) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }
  
      console.log(items);
  
      // Ensure items are serialized to JSON before inserting
      const itemsJson = JSON.stringify(items);
  
      // Insert the order into the 'orders' table
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id, // Access user ID correctly
          total_price: finalTotal,
          items: itemsJson, // Save serialized items
        });
  
      if (error) {
        console.error('Error inserting order:', error);
        Alert.alert('Error', 'Failed to place the order.');
        return;
      }
  
      // Success: Clear the cart and navigate
      Alert.alert(
        'Order Placed',
        `Your order of Rs. ${finalTotal.toFixed(2)} has been placed successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart(); // Clear the cart after confirming the payment
              navigation.navigate('Home'); // Navigate to Home or any screen
            },
          },
        ]
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };
  
  const handleMapPress = (e: any) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setSelectedLocation({ latitude, longitude });
      Alert.alert('Location Selected', `Lat: ${latitude}, Lng: ${longitude}`);
    };

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Select Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'credit' && styles.selectedButton,
              ]}
              onPress={() => setPaymentMethod('credit')}
            >
              <Text style={styles.paymentText}>Credit Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'cod' && styles.selectedButton,
              ]}
              onPress={() => setPaymentMethod('cod')}
            >
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>
    
          {paymentMethod === 'credit' && (
            <View style={styles.creditCardForm}>
              <TextInput style={styles.input} placeholder="Card Number" />
              <TextInput style={styles.input} placeholder="Expiry Date" />
              <TextInput style={styles.input} placeholder="CVV" />
            </View>
          )}
    
          {paymentMethod === 'cod' && (
            <View style={styles.codSection}>
              <Text style={styles.tipTitle}>Tip Your Rider (Optional)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter tip amount"
                onChangeText={(value) => setTip(Number(value) || 0)}
              />
            </View>
          )}
    
          <View style={styles.discountSection}>
            <TextInput
              style={styles.input}
              placeholder="Enter Discount Code"
              value={discountCode}
              onChangeText={(value) => setDiscountCode(value)}
            />
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyDiscount}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
    
          <Text style={styles.total}>Total: Rs. {(discountedTotal + tip).toFixed(2)}</Text>
    
          <Text style={styles.mapLabel}>Select Delivery Location:</Text>
          <View style={styles.mapContainer}>
            {location ? (
              <MapView
                style={styles.map}
                initialRegion={location}
                onPress={handleMapPress}
                showsUserLocation={true}
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
    
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
            <Text style={styles.confirmButtonText}>Confirm Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#028940',
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  paymentButton: {
    backgroundColor: '#ddd',
    padding: 15,
    borderRadius: 8,
  },
  selectedButton: {
    backgroundColor: '#028940',
  },
  paymentText: {
    fontSize: 16,
    color: '#fff',
  },
  creditCardForm: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  codSection: {
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: '#028940',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    marginBottom: 10,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
    color: '#028940',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#028940',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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

export default PaymentScreen;
