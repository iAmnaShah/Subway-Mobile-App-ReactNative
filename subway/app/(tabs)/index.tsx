import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/MenuScreen';
import AuthScreen from '../screens/AuthScreen';
import CustomizeSubScreen from '../screens/CustomizeSubScreen';
import CartScreen from '../screens/CartScreen';
import SandwichScreen from '../screens/SandwichScreen';
import DessertScreen from '../screens/DessertScreen';
import DrinkScreen from '../screens/DrinkScreen';
import SaladScreen from '../screens/SaladScreen';
import DealsScreen from '../screens/DealsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import AccountScreen from '../screens/AccountScreen';
import OrdersHistoryScreen from '../screens/OrdersHistoryScreen';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import RewardsScreen from '../screens/RewardsScreen';

export type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  Login: undefined;
  CustomizeSub: undefined;
  Cart: undefined;
  Sandwiches: undefined;
  Desserts: undefined;
  Drinks: undefined;
  Salads: undefined;
  Payment: undefined;
  Deals: undefined;
  OrdersHistory: undefined;
  Account: undefined;
  Rewards: undefined;
};


const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <AuthProvider>
    <CartProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Login" component={AuthScreen} />
        <Stack.Screen name="CustomizeSub" component={CustomizeSubScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Sandwiches" component={SandwichScreen} />
        <Stack.Screen name="Desserts" component={DessertScreen} />
        <Stack.Screen name="Drinks" component={DrinkScreen} />
        <Stack.Screen name="Salads" component={SaladScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Deals" component={DealsScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="OrdersHistory" component={OrdersHistoryScreen} />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
      </Stack.Navigator>
      </CartProvider>
      </AuthProvider>
  );
};

export default App;
