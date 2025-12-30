import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';

interface User {
    playerId: string;
    username: string;
    email: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.getMe();
            if (response.success) {
                setUser(response.data);
                if (token) {
                    socket.connect(token);
                }
            } else {
                localStorage.removeItem('token');
                socket.disconnect();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            socket.disconnect();
        } finally {
            console.log('Auth check finished, setting loading false');
            setIsLoading(false);
        }
    };

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        setUser(userData);
        socket.connect(token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        socket.disconnect();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
