import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Subscriptions from './pages/Subscriptions';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/flights" element={<ProtectedRoute><Flights /></ProtectedRoute>} />
                <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;