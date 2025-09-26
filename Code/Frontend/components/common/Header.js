import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const { currentUser, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={headerStyle}>
            <nav style={navStyle}>
                <div style={logoStyle}>
                    <Link to="/" style={linkStyle}>LowFlightZone</Link>
                </div>

                {isAuthenticated ? (
                    <div style={navLinksStyle}>
                        <Link to="/" style={linkStyle}>Главная</Link>
                        <Link to="/flights" style={linkStyle}>Рейсы</Link>
                        <Link to="/subscriptions" style={linkStyle}>Подписки</Link>
                        <Link to="/profile" style={linkStyle}>Профиль</Link>
                        <span style={userStyle}>Привет, {currentUser?.email}</span>
                        <button onClick={handleLogout} style={buttonStyle}>Выйти</button>
                    </div>
                ) : (
                    <div style={navLinksStyle}>
                        <Link to="/login" style={linkStyle}>Войти</Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

const headerStyle = {
    backgroundColor: '#2c3e50',
    padding: '1rem 0',
    color: 'white'
};

const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem'
};

const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold'
};

const navLinksStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
};

const userStyle = {
    margin: '0 1rem',
    color: '#ecf0f1'
};

const buttonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
};

export default Header;