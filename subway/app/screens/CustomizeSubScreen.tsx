import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../../supabaseClient';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from './CartScreen';

type BreadOption = { id: number; name: string; price: number };
type MeatOption = { id: number; name: string; price: number };
type ToppingOption = { id: number; name: string; price: number };

const CustomizeSubScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { addToCart, cart } = useCart();
  
  const [breadOptions, setBreadOptions] = useState<BreadOption[]>([]);
  const [meatOptions, setMeatOptions] = useState<MeatOption[]>([]);
  const [toppingOptions, setToppingOptions] = useState<ToppingOption[]>([]);
  const [selectedBread, setSelectedBread] = useState<BreadOption | null>(null);
  const [selectedMeat, setSelectedMeat] = useState<MeatOption | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: breads, error: breadError } = await supabase.from('breads').select('*');
      const { data: meats, error: meatError } = await supabase.from('meats').select('*');
      const { data: toppings, error: toppingError } = await supabase.from('toppings').select('*');

      if (breadError || meatError || toppingError) {
        console.error('Error fetching options:', breadError || meatError || toppingError);
        return;
      }

      setBreadOptions(breads || []);
      setMeatOptions(meats || []);
      setToppingOptions(toppings || []);
    };

    fetchData();
  }, []);

  const calculateTotalPrice = () => {
    const breadPrice = selectedBread ? selectedBread.price : 0;
    const meatPrice = selectedMeat ? selectedMeat.price : 0;
    const toppingsPrice = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    return breadPrice + meatPrice + toppingsPrice;
  };

  const handleAddToCart = async () => {
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
  
      // Ensure both bread and meat are selected
      if (!selectedBread || !selectedMeat) {
        Alert.alert('Incomplete Selection', 'Please select both bread and meat.');
        return;
      }
  
      const imageSource = require('../assets/sub.jpg');
      const resolvedImage = Image.resolveAssetSource(imageSource);
      console.log(resolvedImage); 

      const newCartItem = {
        name: 'Customized Sandwich',
        price: calculateTotalPrice(),
        image: resolvedImage.uri,
      };
       console.log(newCartItem.image); 
  
      addToCart(newCartItem);
      Alert.alert(
        'Added to Cart',
        'Your customized sandwich has been added to the cart!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding your customized sandwich to the cart.');
    }
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Customize Sub</Text>
        <TouchableOpacity onPress={handleCartPress}>
          <Icon name="cart" size={30} color="#fff" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Image source={require('../assets/sub.jpg')} style={styles.headerImage} />
        
        <Text style={styles.sectionTitle}>Choose Your Bread:</Text>
        <View style={styles.optionsContainer}>
          {breadOptions.map((bread) => (
            <TouchableOpacity
              key={bread.id}
              style={[styles.optionButton, selectedBread?.id === bread.id && styles.selectedOption]}
              onPress={() => setSelectedBread(bread.id === selectedBread?.id ? null : bread)}
            >
              <Text style={styles.optionText}>{bread.name}</Text>
              <Text style={styles.optionPrice}>Rs. {bread.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Choose Your Meat:</Text>
        <View style={styles.optionsContainer}>
          {meatOptions.map((meat) => (
            <TouchableOpacity
              key={meat.id}
              style={[styles.optionButton, selectedMeat?.id === meat.id && styles.selectedOption]}
              onPress={() => setSelectedMeat(meat.id === selectedMeat?.id ? null : meat)}
            >
              <Text style={styles.optionText}>{meat.name}</Text>
              <Text style={styles.optionPrice}>Rs. {meat.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Choose Your Toppings:</Text>
        <View style={styles.optionsContainer}>
          {toppingOptions.map((topping) => (
            <TouchableOpacity
              key={topping.id}
              style={[
                styles.optionButton,
                selectedToppings.some((t) => t.id === topping.id) && styles.selectedOption,
              ]}
              onPress={() =>
                setSelectedToppings((prev) =>
                  prev.some((t) => t.id === topping.id)
                    ? prev.filter((t) => t.id !== topping.id)
                    : [...prev, topping]
                )
              }
            >
              <Text style={styles.optionText}>{topping.name}</Text>
              <Text style={styles.optionPrice}>Rs. {topping.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.totalPrice}>Total Price: Rs. {calculateTotalPrice()}</Text>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#ff',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'ff'
  },
  headerImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#ff',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionButton: {
    width: '48%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  selectedOption: {
    backgroundColor: '#c7efbb',
    borderColor: '#7fda65',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  optionPrice: {
    fontSize: 14,
    color: '#028940',
    marginTop: 4,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    marginVertical: 16,
    textAlign: 'center',
    color: '#015341',
  },
  footer: {
    backgroundColor: '#fff',
    paddingBottom: 5,
    alignItems: 'center',
    marginBottom: 20,  // Adds spacing above the footer
    paddingHorizontal: 10,  // Optional: Adds some padding on the sides for consistency
  },
  
  addToCartButton: {
    backgroundColor: '#028940',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    borderRadius: 10,
    width: 350,
    alignItems: 'center',
    marginBottom: 30, // Adds space at the bottom for the button
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomizeSubScreen;
