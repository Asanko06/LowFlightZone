import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/Header.css';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBurgerOpen, setIsBurgerOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const burgerMenuRef = useRef(null);

    // Закрытие выпадающих меню при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (burgerMenuRef.current && !burgerMenuRef.current.contains(event.target)) {
                setIsBurgerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMenuOpen(false);
    };

    const handleMyFlightsClick = () => {
        navigate('/my-flights');
        setIsMenuOpen(false);
    };

    const handleHomeClick = () => {
        navigate('/');
        setIsBurgerOpen(false);
    };

    return (
        <header style={headerStyle}>
            {/* 🍔 Бургер-меню */}
            <div style={{ position: 'relative' }} ref={burgerMenuRef}>
                <button style={menuButtonStyle} onClick={() => setIsBurgerOpen(!isBurgerOpen)}>
                    <div style={burgerIconStyle}>
                        <span style={menuBarStyle}></span>
                        <span style={menuBarStyle}></span>
                        <span style={menuBarStyle}></span>
                    </div>
                </button>

                {isBurgerOpen && (
                    <div style={burgerDropdownStyle}>
                        <button onClick={handleHomeClick} style={burgerItemStyle}>
                            Главная
                        </button>
                        <div style={menuDividerStyle}></div>
                        <button onClick={handleMyFlightsClick} style={burgerItemStyle}>
                            Мои рейсы
                        </button>
                    </div>
                )}
            </div>

            {/* 📍 Местоположение */}
            <div style={locationStyle}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#7EBFFF">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span style={cityTextStyle}>Moscow</span>
            </div>

            {/* 👤 Профиль */}
            <div style={profileContainerStyle} ref={profileMenuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={profileButtonStyle}
                    aria-label="Меню профиля"
                >
                    <div style={profileCircleStyle}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="#7EBFFF">
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
                            Данные
                        </button>

                        <div style={menuDividerStyle}></div>

                        <button onClick={handleLogout} style={logoutButtonStyle}>
                            Выход
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

// 📦 Стили
const headerStyle = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e0e0e0',
    padding: '0.6rem 1rem', // 🔹 уменьшено
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
    padding: '0.6rem 0.5rem', // 🔼 увеличили верх/низ
    height: '48px',           // 🔼 кнопка чуть выше
    display: 'flex',
    alignItems: 'center',     // выравниваем по вертикали
    justifyContent: 'center'
};

const burgerIconStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
};

const menuBarStyle = {
    width: '18px',
    height: '2px',
    backgroundColor: '#7EBFFF',
    borderRadius: '0px',
    transition: 'background-color 0.2s ease'
};

const burgerDropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '160px',
    zIndex: 1001,
    marginTop: '0.4rem',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
};

const burgerItemStyle = {
    background: 'none',
    border: 'none',
    padding: '0.6rem 1rem',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    color: '#333',
    transition: 'background 0.2s ease',
};

const locationStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
};

const cityTextStyle = {
    color: 'black',
    fontSize: '1.4rem', // 🔹 уменьшено
    fontWeight: '600',
    marginBottom: '0.2rem'
};

const profileContainerStyle = {
    position: 'relative',
    display: 'inline-block'
};

const profileButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.3rem',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
};

const profileCircleStyle = {
    width: '36px', // 🔹 уменьшено
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #7EBFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
};

const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '180px',
    zIndex: 1001,
    marginTop: '0.4rem',
    overflow: 'hidden'
};

const menuHeaderStyle = {
    padding: '0.8rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0'
};

const userEmailStyle = {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.2rem'
};

const userStatusStyle = {
    fontSize: '0.75rem',
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
    padding: '0.6rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
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
