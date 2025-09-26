import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { currentUser, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    return (
        <header style={headerStyle}>
            <div style={containerStyle}>
                <div style={logoStyle}>
                    <Link to="/" style={logoLinkStyle}>
                        <span style={logoIcon}>✈️</span>
                        LowFlightZone
                    </Link>
                </div>

                {isAuthenticated ? (
                    <nav style={navStyle}>
                        <Link to="/" className={isActive('/')} style={navLinkStyle}>
                            <span style={navIcon}>🏠</span>
                            Главная
                        </Link>
                        <Link to="/flights" className={isActive('/flights')} style={navLinkStyle}>
                            <span style={navIcon}>📊</span>
                            Рейсы
                        </Link>
                        <Link to="/search" className={isActive('/search')} style={navLinkStyle}>
                            <span style={navIcon}>🔍</span>
                            Поиск
                        </Link>
                        <Link to="/subscriptions" className={isActive('/subscriptions')} style={navLinkStyle}>
                            <span style={navIcon}>🔔</span>
                            Подписки
                        </Link>

                        <div style={userSectionStyle}>
                            <span style={userGreeting}>👋 Привет, {currentUser?.email?.split('@')[0]}</span>
                            <button onClick={handleLogout} style={logoutBtnStyle}>
                                Выйти
                            </button>
                        </div>
                    </nav>
                ) : (
                    <div style={authSectionStyle}>
                        <Link to="/login" style={authLinkStyle}>
                            Войти
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

const headerStyle = {
    background: 'var(--secondary-bg)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
};

const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
};

const logoLinkStyle = {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
};

const logoIcon = {
    fontSize: '1.8rem',
};

const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
};

const navLinkStyle = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
};

const navIcon = {
    fontSize: '1.2rem',
};

const userSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
};

const userGreeting = {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
};

const logoutBtnStyle = {
    background: 'var(--accent-red)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
};

const authSectionStyle = {
    display: 'flex',
    gap: '1rem',
};

const authLinkStyle = {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    background: 'var(--gradient-primary)',
};

// CSS classes for active states
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  .nav-link.active {
    background: var(--gradient-primary) !important;
    color: white !important;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .nav-link:hover {
    background: var(--card-bg);
    color: var(--text-primary);
  }
`, styleSheet.cssRules.length);

export default Header;