import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={headerStyle}>
            {/* Бургер-меню слева */}
            <button style={menuButtonStyle}>
                <div style={menuIconStyle}>
                    <span style={menuBarStyle}></span>
                    <span style={menuBarStyle}></span>
                    <span style={menuBarStyle}></span>
                </div>
            </button>

            {/* Местоположение по центру */}
            <div style={locationStyle}>
                <div style={locationIconStyle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#7EBFFF">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </div>
                <span style={cityTextStyle}>Moscow</span>
            </div>

            {/* Иконка профиля справа */}
            <button style={profileButtonStyle}>
                <div style={profileIconStyle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#7EBFFF">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
            </button>
        </header>
    );
};

const headerStyle = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e0e0e0',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const menuButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem'
};

const menuIconStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
};

const menuBarStyle = {
    width: '20px',
    height: '2px',
    backgroundColor: '#7EBFFF',
    borderRadius: '1px'
};

const locationStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
};

const locationIconStyle = {
    display: 'flex',
    alignItems: 'center'
};

const cityTextStyle = {
    color: 'black',
    fontSize: '1.1rem',
    fontWeight: '600'
};

const profileButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem'
};

const profileIconStyle = {
    display: 'flex',
    alignItems: 'center'
};

export default Header;