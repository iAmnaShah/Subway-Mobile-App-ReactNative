import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useCart } from '../contexts/CartContext';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import AppLoading from 'expo-app-loading';

type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  Sandwiches: undefined;
  CustomizeSub: undefined;
  Cart: { items: { name: string; price: number; image: any }[] };
  Desserts: undefined;
  Drinks: undefined;
  Salads: undefined;
  Deals: undefined;
  Account: undefined;
  OrdersHistory: undefined;
};

type MenuScreenProps = NativeStackScreenProps<RootStackParamList, 'Menu'>;

const { width } = Dimensions.get('window');

const CARD_WIDTH_SINGLE = width - 40;
const CARD_WIDTH_MULTI = width / 2 - 30;

const menuItems = [
  { id: '1', name: 'Sandwiches', image: require('../assets/sandwich.jpg') },
  { id: '2', name: 'Desserts', image: require('../assets/cookies.jpg') },
  { id: '3', name: 'Drinks', image: require('../assets/drinks.png') },
  { id: '4', name: 'Salads & Sauces', image: require('../assets/salad.jpg') },
  { id: '5', name: 'Customize Your Own Sub', image: require('../assets/customize.jpg') },
];

const MenuScreen: React.FC<MenuScreenProps> = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
  });

  const handleAccountPress = () => {
    navigation.navigate('Account');
  };

  const [numColumns, setNumColumns] = useState(1);

  const handleMenuItemPress = (itemName: string) => {
    if (itemName === 'Customize Your Own Sub') {
      navigation.navigate('CustomizeSub');
    } else if (itemName === 'Sandwiches') {
      navigation.navigate('Sandwiches');
    } else if (itemName === 'Desserts') {
      navigation.navigate('Desserts');
    } else if (itemName === 'Drinks') {
      navigation.navigate('Drinks');
    } else if (itemName === 'Salads & Sauces') {
      navigation.navigate('Salads');
    } else {
      alert(`${itemName} coming soon!`);
    }
  };

  const handleCartPress = () => {
    navigation.navigate('Cart', { items: [] });
  };

  const handleDealPress = () => {
    navigation.navigate('Deals');
  };

  const { cart } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAccountPress} style={styles.accountButton}>
          <Icon name="user-circle" size={30} color="#fff" />
        </TouchableOpacity>
        <Image source={require('../assets/logo.png')} style={styles.headerLogo} />
        <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
          <Icon name="shopping-cart" size={30} color="#fff" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Welcome! Hungry today?</Text>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        key={numColumns.toString()}
        numColumns={numColumns}
        ListHeaderComponent={
          <TouchableOpacity onPress={handleDealPress}>
            <Image source={require('../assets/dealedit.png')} style={styles.dealImage} />
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleMenuItemPress(item.name)}
            style={[styles.card, { width: numColumns === 1 ? CARD_WIDTH_SINGLE : CARD_WIDTH_MULTI }]}
          >
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    marginTop: 20,
    marginLeft: 39,
    fontSize: 24,
    color: '#333',
    marginBottom: 10,
    paddingLeft: 40,
    paddingRight: 50,
    fontFamily: 'Oswald_600SemiBold', // Apply the custom font
  },
  header: {
    width: '100%',
    height: 60,
    backgroundColor: '#028940',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 0,
    zIndex: 10,
  },
  headerLogo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  accountButton: {
    position: 'absolute',
    left: 15,
    top: 15,
  },
  cartButton: {
    position: 'absolute',
    right: 15,
    top: 15,
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
  dealImage: {
    width: '100%',
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  flatListContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    height: 250,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    elevation: 5,
    paddingVertical: 10,
  },
  cardImage: {
    width: '100%',
    height: '90%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default MenuScreen;
