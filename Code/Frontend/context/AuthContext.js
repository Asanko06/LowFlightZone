import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setCurrentUser({ token });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            if (!response.token) {
                throw new Error(response.message || 'Login failed');
            }
            localStorage.setItem('authToken', response.token);
            setCurrentUser({ token: response.token, email: response.email });
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async ({ firstName, lastName, phone, email, password }) => {
        try {
            const response = await authService.register({ firstName, lastName, phone, email, password });

            if (response.token) {
                // успешная регистрация
                localStorage.setItem('authToken', response.token);
                setCurrentUser({ token: response.token, email: response.email });
            }

            // возвращаем ответ сервера независимо от токена
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
