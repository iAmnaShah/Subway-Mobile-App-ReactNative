import React, { useEffect, useState } from 'react';
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
  Cart: undefined;
};

type Salad = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

const SaladScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Cart'>>();
  const { addToCart, cart } = useCart();
  const [salads, setSalads] = useState<Salad[]>([]);

  useEffect(() => {
    const fetchSalads = async () => {
      const { data, error } = await supabase.from('salads').select('*');
      if (error) {
        console.error('Error fetching salads:', error.message);
      } else {
        const saladsWithQuantity = data?.map(salad => ({
          ...salad,
          quantity: 1, // Set default quantity to 1
        })) || [];
        setSalads(saladsWithQuantity);
      }
    };
    fetchSalads();
  }, []);

  const handleAddToCart = async (salad: Salad) => {
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

      const saladItem = {
        name: salad.name,
        price: salad.price,
        image: salad.image,
        quantity: salad.quantity,
        total_price: salad.price * salad.quantity, // Include total price
      };

      addToCart(saladItem);

      Alert.alert('Added to Cart', `${salad.name} added to your cart.`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding the item to your cart.');
    }
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const handleIncrement = (id: number) => {
    setSalads(prevSalads =>
      prevSalads.map(salad =>
        salad.id === id
          ? { ...salad, quantity: salad.quantity + 1 }
          : salad
      )
    );
  };

  const handleDecrement = (id: number) => {
    setSalads(prevSalads =>
      prevSalads.map(salad =>
        salad.id === id
          ? {
              ...salad,
              quantity: salad.quantity > 1 ? salad.quantity - 1 : 1,
            }
          : salad
      )
    );
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Salads & Sauces</Text>
        <TouchableOpacity onPress={handleCartPress}>
          <Icon name="cart" size={30} color="#fff" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.cardsContainer}>
          {salads.map((salad) => (
            <View key={salad.id} style={styles.card}>
              <Image
                source={{ uri: salad.image }}
                style={styles.saladsImage}
              />
              <Text style={styles.saladsName}>{salad.name}</Text>
              <Text style={styles.saladsPrice}>Rs. {salad.price}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrement(salad.id)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{salad.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrement(salad.id)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(salad)}
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
  saladsImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  saladsName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  saladsPrice: {
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

export default SaladScreen;
