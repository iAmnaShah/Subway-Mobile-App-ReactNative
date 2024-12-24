import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';  // Correct path to your stack navigator

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Menu'>;
const AuthScreen: React.FC = () => {
    const { login } = useAuth();  // Access login from AuthContext
    const navigation = useNavigation<AuthScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            if (isLogin) {
                // Call login from context
                await login(email, password);
                Alert.alert('Login Successful', `Welcome back, ${email}!`);
                navigation.navigate('Menu');  // Navigate to MenuScreen after successful login
            } else {
                // Handle signup (if needed)
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                Alert.alert('Signup Successful', `Welcome, ${email}!`);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Logo */}
            <Image source={require('../assets/logo.png')} style={styles.logo} />

            <View style={styles.card}>
                <Text style={styles.title}>{isLogin ? 'LOGIN' : 'SIGN-UP'}</Text>

                {/* Email Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#ccc"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* Password Input */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Password"
                        placeholderTextColor="#ccc"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.icon}
                    >
                        <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password for Signup */}
                {!isLogin && (
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#ccc"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                )}

                {/* Auth Button */}
                <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
                    <Text style={styles.authButtonText}>
                        {isLogin ? 'Login' : 'Signup'}
                    </Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                {isLogin && (
                    <TouchableOpacity onPress={() => {/* handle forgot password */}}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                )}

                {/* Toggle between Login and Signup */}
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                    <Text style={styles.toggleText}>
                        {isLogin
                            ? 'Don’t have an account? Signup'
                            : 'Already have an account? Login'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#028940',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 50,
    marginBottom: 30,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff',
    marginBottom: 20,
    fontFamily: 'serif',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    elevation: 5,
  },
  icon: {
    marginLeft: 10,
    padding: 10,
  },
  authButton: {
    width: '100%',
    backgroundColor: '#FFC20D',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF',
  },
  forgotText: {
    fontSize: 13,
    color: '#FF',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  toggleText: {
    fontSize: 13,
    color: '#FF',
    textDecorationLine: 'underline',
    marginTop: 15,
  },
});

export default AuthScreen;
