import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

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
        // ⚠️ Удаляем старый токен перед логином
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];

        try {
            const response = await authService.login(email, password);

            localStorage.setItem('authToken', response.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

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
        // 🧹 очищаем старый токен, если был
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];

        try {
            const response = await authService.register({ email, password, firstName, lastName, phoneNumber });

            // ✅ сохраняем токен и пользователя
            localStorage.setItem('authToken', response.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

            setCurrentUser({
                id: response.id,
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                phoneNumber: response.phoneNumber,
                token: response.token
            });

            return response;

        } catch (error) {
            console.error("Ошибка регистрации:", error);

            // 📌 1. Если бэкенд вернул валидированную ошибку
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }

            // 📌 2. Если Spring вернул стандартное поле `message`
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }

            // 📌 3. Если HTTP-код 409 (уже зарегистрирован)
            if (error.response?.status === 409) {
                throw new Error("Пользователь с таким email уже существует");
            }

            // 📌 4. Если ошибка сети
            if (error.message === "Network Error") {
                throw new Error("Сервер недоступен. Проверьте подключение к интернету.");
            }

            // 📌 5. Фолбэк — если ничего из вышеперечисленного не подошло
            throw new Error("Ошибка регистрации. Попробуйте снова позже.");
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
