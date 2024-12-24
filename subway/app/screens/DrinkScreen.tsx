import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../../supabaseClient';

type RootStackParamList = {
  Cart: { items: { name: string; price: number; image: any }[] };
};

type Drink = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number; // Add quantity
};

const DrinkScreen: React.FC = () => {
  const { cart, addToCart } = useCart();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [drinks, setDrinks] = useState<Drink[]>([]);

  useEffect(() => {
    const fetchDrinks = async () => {
      const { data, error } = await supabase.from('drinks').select('*');
      if (error) {
        console.error('Error fetching drinks:', error.message);
      } else {
        const drinksWithQuantity = data?.map(drink => ({
          ...drink,
          quantity: 1, // Initialize quantity as 1
        })) || [];
        setDrinks(drinksWithQuantity);
      }
    };

    fetchDrinks();
  }, []);

  const handleAddToCart = async (drink: Drink) => {
    try {
      // Check if the user is logged in
      const { data: userResponse } = await supabase.auth.getUser();
      const user = userResponse?.user;

      if (!user) {
        Alert.alert('Login Required', 'Please log in to add items to your cart.', [
          { text: 'OK' },
        ]);
        return;
      }

      // Calculate total price
      const totalPrice = drink.price * drink.quantity;

      const drinkItem = {
        name: drink.name,
        price: drink.price,
        image: drink.image_url,
        quantity: drink.quantity,
        total_price: totalPrice, // Include total price
      };

      addToCart(drinkItem);

      Alert.alert('Added to Cart', `${drink.name} added to your cart.`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding the item to your cart.');
    }
  };

  const handleCartPress = () => {
    navigation.navigate('Cart', { items: cart });
  };

  const handleIncrement = (id: number) => {
    setDrinks(prevDrinks =>
      prevDrinks.map(drink =>
        drink.id === id ? { ...drink, quantity: drink.quantity + 1 } : drink
      )
    );
  };

  const handleDecrement = (id: number) => {
    setDrinks(prevDrinks =>
      prevDrinks.map(drink =>
        drink.id === id
          ? { ...drink, quantity: drink.quantity > 1 ? drink.quantity - 1 : 1 }
          : drink
      )
    );
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Drinks</Text>
        <TouchableOpacity onPress={handleCartPress}>
          <Icon name="cart" size={30} color="#fff" />
          {cart.reduce((total, item) => total + (item.quantity || 1), 0) > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cart.reduce((total, item) => total + (item.quantity || 1), 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.cardsContainer}>
          {drinks.map((drink) => (
            <View key={drink.id} style={styles.card}>
              <Image source={{ uri: drink.image_url }} style={styles.drinksImage} />
              <Text style={styles.drinksName}>{drink.name}</Text>
              <Text style={styles.drinksPrice}>Rs. {drink.price}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrement(drink.id)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{drink.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrement(drink.id)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(drink)}
              >
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
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
  drinksImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  drinksName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  drinksPrice: {
    fontSize: 14,
    color: '#028940',
    marginVertical: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  quantityButton: {
    width: 35,
    height: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 5, 
},
  quantityButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: '#FFC20D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DrinkScreen;
