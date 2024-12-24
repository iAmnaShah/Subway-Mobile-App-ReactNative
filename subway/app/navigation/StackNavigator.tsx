import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AuthScreen from '../screens/AuthScreen';
import MenuScreen from '../screens/MenuScreen';
import { useAuth } from '../contexts/AuthContext';

export type RootStackParamList = {
    Auth: undefined;
    Menu: undefined;
    Home: undefined;
    OrdersHistory: undefined;
    Account: undefined
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
    const { isAuthenticated } = useAuth(); // Access isAuthenticated from AuthContext

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthScreen} />
            ) : (
                <Stack.Screen name="Menu" component={MenuScreen} />
            )}
            <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
    );
};

export default StackNavigator;
