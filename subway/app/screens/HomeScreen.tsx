import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { Inter_300Light, Inter_600SemiBold, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';

type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  Login: undefined;
  Rewards: undefined;
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();

  // Load the font
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
    Inter_300Light,
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Menu');
    }
  }, [isAuthenticated]);

  // Show loading screen until fonts are loaded
  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo2.jpg')} style={styles.logo} />

      <Text style={styles.title}>Welcome to Subway</Text>
      <Text style={styles.subtitle}>
        Join the NEW <Text style={styles.sub1}>Subway® MVP Rewards</Text> and earn points every time you order to redeem for Subway® Cash!
      </Text>

      {/* Subway Image with Rounded Block */}
      <View style={styles.subwayImageContainer}>
        <Image source={require('../assets/sub4.jpg')} style={styles.subwayImage} />
      </View>

      {/* Join Now Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Rewards')}
      >
        <Text style={styles.buttonText}>JOIN NOW</Text>
      </TouchableOpacity>

      {/* Login / Signup Button */}
      <TouchableOpacity
        style={styles.button2}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText2}>LOGIN / SIGNUP</Text>
      </TouchableOpacity>

      {/* Go to Menu as Underlined Text */}
      <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
        <Text style={styles.linkText}>Continue as Guest</Text>
      </TouchableOpacity>

      {/* Copyright Text at the bottom */}
      <Text style={styles.copyright}>© 2024 Subway Inc. All rights reserved.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  sub1: {
    fontFamily: 'Inter_600SemiBold',
  },
  logo: {
    marginTop: -10,
    width: 250,
    height: 100,
    marginBottom: 30,
    backgroundColor: '#fff',
  },
  title: {
    marginTop: -30,
    fontSize: 35,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Oswald_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Inter_300Light',
    paddingLeft: 40,
    paddingRight: 40,
    textAlign: 'center',
  },
  subwayImageContainer: {
    width: 260,
    height: 160,
    backgroundColor: '#ffc20d',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  subwayImage: {
    width: 250,
    height: 150,
    borderRadius: 15,
  },
  copyright: {
    position: 'absolute',
    bottom: 10,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#028940',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  button2: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    borderColor: '#028940',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  buttonText2: {
    fontSize: 18,
    color: '#028940',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  linkText: {
    fontSize: 16,
    color: '#028940',
    textDecorationLine: 'underline',
    marginTop: 10,
    fontWeight: '600',
    fontFamily: 'Inter_300Light',
  },
});

export default HomeScreen;
