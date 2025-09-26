import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Здесь можно декодировать JWT токен чтобы получить email
            setCurrentUser({ token });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            localStorage.setItem('authToken', response.token);
            setCurrentUser({ token: response.token, email: response.email });
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (email, password) => {
        try {
            const response = await authService.register(email, password);
            localStorage.setItem('authToken', response.token);
            setCurrentUser({ token: response.token, email: response.email });
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        isAuthenticated: !!currentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};