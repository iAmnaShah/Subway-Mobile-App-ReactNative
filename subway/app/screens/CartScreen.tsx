import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CartItem, useCart } from '../contexts/CartContext';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation types
export type RootStackParamList = {
  Cart: undefined;
  Payment: { total: number, items:CartItem[]};
};

// Type the navigation prop
type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

const CartScreen: React.FC = () => {
  const { cart, clearCart } = useCart();

  // Use properly typed navigation hook
  const navigation = useNavigation<CartScreenNavigationProp>();

  const total = cart.reduce((sum, item) => sum + item.total_price, 0); // Use total_price instead of recalculating from price and quantity

  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      alert('Your cart is empty! Please add items to the cart before proceeding.');
      return;
    }
  
    navigation.navigate('Payment', { total, items: cart }); // Navigate to PaymentScreen with the total amount
  };
  

  const handleClearCart = () => {
    clearCart(); // Clear the cart when the button is pressed
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Your Order</Text>
        {cart.map((item, index) => (
  <Text key={index} style={styles.detail}>
    {item.quantity}x {item.name} - Rs. {item.total_price}
  </Text> 
))}





        <Text style={styles.total}>Total Price: Rs. {total}</Text>
      </View>

      {/* Confirm Order Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
        <Text style={styles.confirmButtonText}>Confirm Order</Text>
      </TouchableOpacity>

      {/* Clear Cart Button */}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#028940',
  },
  detail: {
    fontSize: 18,
    marginVertical: 5,
    color: '#333',
    fontWeight: "bold",
  },
  detail2: {
    fontSize: 18,
    marginVertical: 5,
    color: '#333',
    fontWeight: "light",
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    color: '#028940',
  },
  confirmButton: {
    backgroundColor: '#ffc20d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#d4d4d4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CartScreen;
