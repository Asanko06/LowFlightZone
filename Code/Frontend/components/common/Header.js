import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/Header.css'; // вынесем ховеры и анимации в отдельный CSS

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Закрытие меню при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const handleProfileClick = () => {
        alert('Раздел "Данные" в разработке');
        setIsMenuOpen(false);
    };

    const handleMyFlightsClick = () => {
        alert('Раздел "Мои рейсы" в разработке');
        setIsMenuOpen(false);
    };

    return (
        <header style={headerStyle}>
            {/* Бургер-меню слева */}
            <button style={menuButtonStyle}>
                <div style={burgerIconStyle}>
                    <span style={menuBarStyle}></span>
                    <span style={menuBarStyle}></span>
                    <span style={menuBarStyle}></span>
                </div>
            </button>

            {/* Местоположение */}
            <div style={locationStyle}>
                <div>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#7EBFFF">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </div>
                <span style={cityTextStyle}>Moscow</span>
            </div>

            {/* Профиль */}
            <div style={profileContainerStyle} ref={menuRef}>
                <button
                    onClick={toggleMenu}
                    style={profileButtonStyle}
                    aria-label="Меню профиля"
                    aria-expanded={isMenuOpen}
                >
                    <div style={profileCircleStyle}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="#7EBFFF">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                </button>

                {isMenuOpen && (
                    <div style={dropdownMenuStyle} className="dropdown-menu">
                        <div style={menuHeaderStyle}>
                            <div style={userEmailStyle}>{currentUser?.email || 'Пользователь'}</div>
                            <div style={userStatusStyle}>Активный</div>
                        </div>

                        <div style={menuDividerStyle}></div>

                        <button onClick={handleProfileClick} style={menuItemStyle}>
                            <span>Данные</span>
                        </button>

                        <button onClick={handleMyFlightsClick} style={menuItemStyle}>
                            <span>Мои рейсы</span>
                        </button>

                        <div style={menuDividerStyle}></div>

                        <button onClick={handleLogout} style={logoutButtonStyle}>
                            <span>Выход</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

// Стили (оставлены только основные, без hover)
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

const burgerIconStyle = {
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

const cityTextStyle = {
    color: 'black',
    fontSize: '2rem',
    fontWeight: '600'
};

const profileContainerStyle = {
    position: 'relative',
    display: 'inline-block'
};

const profileButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
};

const profileCircleStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #7EBFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
};

const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '200px',
    zIndex: 1001,
    marginTop: '0.5rem',
    overflow: 'hidden'
};

const menuHeaderStyle = {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0'
};

const userEmailStyle = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.25rem'
};

const userStatusStyle = {
    fontSize: '0.8rem',
    color: '#10b981',
    fontWeight: '500'
};

const menuDividerStyle = {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '0.25rem 0'
};

const menuItemStyle = {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    color: '#333',
    transition: 'all 0.2s ease',
    textAlign: 'left'
};

const logoutButtonStyle = {
    ...menuItemStyle,
    color: '#ef4444'
};

export default Header;
