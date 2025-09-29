import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';
import api from '../services/api'; // ✅ чтобы автоматически подставлять токен

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 📌 Восстанавливаем пользователя при запуске приложения
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const email = localStorage.getItem('userEmail');

        if (token && email) {
            setCurrentUser({ token, email });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        setLoading(false);
    }, []);

    // 📌 Логин
    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);

            localStorage.setItem('authToken', response.token);

            // ✅ Сохраняем весь объект пользователя, а не только email
            setCurrentUser({
                id: response.id,
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                phoneNumber: response.phoneNumber,
                password: response.password,
                token: response.token
            });

            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async ({ email, password, firstName, lastName, phoneNumber }) => {
        try {
            const response = await authService.register({ email, password, firstName, lastName, phoneNumber });

            localStorage.setItem('authToken', response.token);

            setCurrentUser({
                id: response.id,
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                phoneNumber: response.phoneNumber,
                password: response.password,
                token: response.token
            });

            return response;
        } catch (error) {
            throw error;
        }
    };

    // 📌 Логаут
    const logout = () => {
        authService.logout();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        delete api.defaults.headers.common['Authorization'];
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
