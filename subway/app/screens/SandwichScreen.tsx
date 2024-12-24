import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../contexts/CartContext';


type RootStackParamList = {
  Cart: { items: { name: string; price: number; image: any }[] };
};

type Sandwich = {
  name: string;
  price: number;
  image: string; // Updated to use a URL for images from the database
};

const SandwichScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Cart'>>();
  const [sandwiches, setSandwiches] = useState<Sandwich[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSandwich, setSelectedSandwich] = useState<Sandwich | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFries, setSelectedFries] = useState<string>('None');
  const [selectedDrink, setSelectedDrink] = useState<string>('None');
  const { cart, addToCart } = useCart();

  // Fetch sandwiches from Supabase
  useEffect(() => {
    const fetchSandwiches = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('sandwiches').select('name, price, image');
      if (error) {
        console.error('Error fetching sandwiches:', error);
        Alert.alert('Error', 'Failed to load sandwiches.');
      } else {
        setSandwiches(data || []);
      }
      setLoading(false);
    };

    fetchSandwiches();
  }, []);

   // Fries and drink options
  const friesOptions = [
    { name: 'None', price: 0 },
    { name: 'Regular', price: 50 },
    { name: 'Masala', price: 100 },
    { name: 'Garlic Mayo', price: 200 },
  ];

  const drinkOptions = [
    { name: 'None', price: 0 },
    { name: 'Cola', price: 90 },
    { name: 'Fizz Up', price: 90 },
    { name: 'Lemon Up', price: 90 },
  ];


  const handleCartPress = () => {
    navigation.navigate('Cart', { items: cart });
  };

  const handleSelectSandwich = (sandwich: Sandwich) => {
    setSelectedSandwich(sandwich);
    setModalVisible(true);
  };

  const handleAddToCart = async (isDeal: boolean) => {
    if (!selectedSandwich) return;
  
    try {
      // Check if the user is logged in
      const { data: userResponse } = await supabase.auth.getUser();
      const user = userResponse?.user;
  
      if (!user) {
        Alert.alert(
          'Login Required',
          'Please log in to add items to your cart.',
          [{ text: 'OK' }]
        );
        return;
      }
  
      let totalPrice = selectedSandwich.price;
  
      // Add fries price if selected
      if (selectedFries && selectedFries !== 'None') {
        const fries = friesOptions.find(f => f.name === selectedFries);
        if (fries) totalPrice += fries.price;
      }
  
      // Add drink price if selected
      if (selectedDrink && selectedDrink !== 'None') {
        const drink = drinkOptions.find(d => d.name === selectedDrink);
        if (drink) totalPrice += drink.price;
      }
  
      addToCart({
        name: isDeal ? `${selectedSandwich.name} - Deal` : selectedSandwich.name,
        price: totalPrice,
        image: selectedSandwich.image,
        total_price: totalPrice,  // Add total_price here
      });
  
      setModalVisible(false);
  
      Alert.alert(
        'Added to Cart',
        isDeal
          ? `${selectedSandwich.name} - Deal added to your cart.`
          : `${selectedSandwich.name} added to your cart.`
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding the item to your cart.');
    }
  };
  
  

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#028940" />
        <Text>Loading Sandwiches...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Sandwiches</Text>
        <TouchableOpacity onPress={handleCartPress}>
          <Icon name="cart" size={30} color="#fff" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.cardsContainer}>
          {sandwiches.map((sandwich, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri: sandwich.image }}
                style={styles.sandwichImage}
              />
              <Text style={styles.sandwichName}>{sandwich.name}</Text>
              <Text style={styles.sandwichPrice}>Rs. {sandwich.price}</Text>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleSelectSandwich(sandwich)}
              >
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      {/* Modal for "Make it a Deal" */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Icon name="close" size={20} color="#333" />
      </TouchableOpacity>
            <Text style={styles.modalTitle}>Make it a Deal?</Text>
            <Text style={styles.modalText}>Customize your Fries and Drink:</Text>

            <Text style={styles.modalSubtitle}>Choose Fries:</Text>
            {friesOptions.map(fries => (
              <TouchableOpacity
                key={fries.name}
                style={[
                  styles.optionButton,
                  selectedFries === fries.name && styles.selectedOption,
                ]}
                onPress={() => setSelectedFries(fries.name)}
              >
                <Text style={styles.optionText}>{fries.name} - Rs. {fries.price}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.modalSubtitle}>Choose Drink:</Text>
            {drinkOptions.map(drink => (
              <TouchableOpacity
                key={drink.name}
                style={[
                  styles.optionButton,
                  selectedDrink === drink.name && styles.selectedOption,
                ]}
                onPress={() => setSelectedDrink(drink.name)}
              >
                <Text style={styles.optionText}>{drink.name} - Rs. {drink.price}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleAddToCart(true)}
              >
                <Text style={styles.modalButtonText}>Yes, Make it a Deal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => handleAddToCart(false)}
              >
                <Text style={styles.modalButtonText}>No, Just the Sandwich</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#028940',
    padding: 16,
  },
  header: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FFC20D',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f4f4f4',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },  
  cartBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
    alignItems: 'center',
  },
  sandwichImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  sandwichName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sandwichPrice: {
    fontSize: 14,
    color: '#028940',
    marginVertical: 4,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#FFC20D',
    padding: 8,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loaderContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#FFC20D',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: '#028940',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#bfbfbf',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SandwichScreen;
