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

// Компонент который решает показывать Header или нет
const Layout = ({ children }) => {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
      <div className="App">
        {showHeader && <Header />}
        <main>
          {children}
        </main>
      </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            {/* Страница логина без Header */}
            <Route path="/login" element={<LoginPage />} />

            {/* Защищенные маршруты с Header */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/flights" element={
              <ProtectedRoute>
                <Layout>
                  <Flights />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/subscriptions" element={
              <ProtectedRoute>
                <Layout>
                  <Subscriptions />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;