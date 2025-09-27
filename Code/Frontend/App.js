import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Subscriptions from './pages/Subscriptions';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import './styles/App.css';

// Компонент Layout управляет Header
const Layout = ({ children }) => {
    const location = useLocation();
    const showHeader = location.pathname !== '/login';
    return (
        <div className="App">
            {showHeader && <Header />}
            <main>{children}</main>
        </div>
    );
};

// Защита маршрутов
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* 📌 Главная страница теперь защищена */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Home />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* 📌 Страница логина */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* ✈️ Список рейсов */}
                    <Route
                        path="/flights"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Flights />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* 📬 Подписки */}
                    <Route
                        path="/subscriptions"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Subscriptions />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* 👤 Профиль */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Profile />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* 🌐 Неизвестные маршруты → логин */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
