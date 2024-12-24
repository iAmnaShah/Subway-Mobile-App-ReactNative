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
import { supabase } from '../../supabaseClient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../contexts/CartContext';

type RootStackParamList = {
  Cart: undefined;
};

type Dessert = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity:number
};


const DessertScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Cart'>>();
  const { addToCart, cart } = useCart();
  const [desserts, setDesserts] = useState<Dessert[]>([]);

  useEffect(() => {
    const fetchDesserts = async () => {
      const { data, error } = await supabase
        .from('desserts')
        .select('*');
      if (error) {
        console.error('Error fetching desserts:', error);
      } else {
        // Add a quantity field for each dessert
        const dessertsWithQuantity = data?.map(dessert => ({
          ...dessert,
          quantity: 1,
        })) || [];
        setDesserts(dessertsWithQuantity);
      }
    };
    fetchDesserts();
  }, []);
  
  const handleAddToCart = async (dessert: Dessert) => {
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
  
      // Calculate the total price based on quantity and price
      const totalPrice = dessert.price * dessert.quantity;
  
      const dessertItem = {
        name: dessert.name,
        price: dessert.price,
        image: dessert.image,
        quantity: dessert.quantity,
        total_price: totalPrice, // Include total_price here
      };
  
      addToCart(dessertItem);
  
      Alert.alert('Added to Cart', `${dessert.name} added to your cart.`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding the item to your cart.');
    }
  };
  
  

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const handleIncrement = (id: number) => {
    setDesserts(prevDesserts =>
      prevDesserts.map(dessert =>
        dessert.id === id
          ? { ...dessert, quantity: (dessert.quantity || 1) + 1 }
          : dessert
      )
    );
  };

  const handleDecrement = (id: number) => {
    setDesserts(prevDesserts =>
      prevDesserts.map(dessert =>
        dessert.id === id
          ? {
              ...dessert,
              quantity: dessert.quantity && dessert.quantity > 1 ? dessert.quantity - 1 : 1,
            }
          : dessert
      )
    );
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Desserts</Text>
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

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }} // Add bottom padding
      >
        <View style={styles.cardsContainer}>
          {desserts.map((dessert, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri:dessert.image}}
                style={styles.dessertImage}
              />
              <Text style={styles.dessertName}>{dessert.name}</Text>
              <Text style={styles.dessertPrice}>Rs. {dessert.price}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrement(dessert.id)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{dessert.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrement(dessert.id)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleAddToCart(dessert)}
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
  dessertImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  dessertName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  dessertPrice: {
    fontSize: 14,
    color: '#028940',
    marginVertical: 5,
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

export default DessertScreen;
