import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

interface User {
    email: string | null | '';
    name?: string | null; // Add other user fields if needed
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const login = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            setUser({ email: data.user?.email || null, name: data.user?.user_metadata?.name || null });
            setIsAuthenticated(true); // User is authenticated
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setIsAuthenticated(false); // Reset authentication state
        } catch (error: any) {
            console.error('Error logging out:', error.message);
        }
    };

    // Automatically check if the user is logged in on component mount
    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session?.user) {
                setUser({ email: data.session.user.email || null, name: data.session.user.user_metadata?.name || null });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        };

        getSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
