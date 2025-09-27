import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import airplaneImage from '../assets/plane.png';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return setError('Please enter email and password');

        setLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !phone || !email || !password) return setError('Please fill in all fields');

        setLoading(true);
        setError('');

        try {
            const response = await register({ firstName, lastName, phone, email, password });

            if (response.token) {
                // успешная регистрация → авто-логин
                await login(email, password);
                navigate('/');
            } else if (response.message === 'User already exists') {
                setIsLogin(true);
                setPassword('');
                setError('');
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- переключение формы ---
    const switchToLogin = () => {
        setIsLogin(true);
        setPassword('');
        setError('');
    };

    const switchToSignUp = () => {
        setIsLogin(false);
        setPassword('');
        setError('');
    };

    // --- обработка полей ---
    const handleChange = (setter) => (e) => { setter(e.target.value); if (error) setError(''); };

    const clearError = () => { setError(''); setLoading(false); };

    return (
        <div style={containerStyle}>
            <div style={topSectionStyle}>
                <div style={contentWrapperStyle}>
                    <h1 style={welcomeTextStyle}>Welcome to</h1>
                    <h1 style={appNameStyle}>LowFlightZone</h1>
                    <div style={airplaneContainerStyle}>
                        <img src={airplaneImage} alt="Airplane" style={airplaneImageStyle} />
                    </div>
                </div>

                <div style={arcsContainerStyle}>
                    <div style={whiteArc1Style}></div>
                    <div style={blueArc1Style}></div>
                    <div style={whiteArc2Style}></div>
                    <div style={blueArc2Style}></div>
                    <div style={blueArc0Style}></div>
                </div>
            </div>

            <div style={bottomSectionStyle}>
                <div style={bottomContentStyle}>
                    {error && (
                        <div style={errorStyle}>
                            <strong>Error:</strong> {error}
                            <button onClick={clearError} style={clearErrorButtonStyle}>×</button>
                        </div>
                    )}

                    <form onSubmit={isLogin ? handleLogin : handleSignUp} style={formContainerStyle}>
                        {!isLogin && (
                            <>
                                <input type="text" placeholder="First Name" value={firstName} onChange={handleChange(setFirstName)} style={{ ...inputStyle, ...(loading && disabledInputStyle) }} required disabled={loading} />
                                <input type="text" placeholder="Last Name" value={lastName} onChange={handleChange(setLastName)} style={{ ...inputStyle, ...(loading && disabledInputStyle) }} required disabled={loading} />
                                <input type="text" placeholder="Phone" value={phone} onChange={handleChange(setPhone)} style={{ ...inputStyle, ...(loading && disabledInputStyle) }} required disabled={loading} />
                            </>
                        )}
                        <input type="email" placeholder="Email" value={email} onChange={handleChange(setEmail)} autoComplete="username" style={{ ...inputStyle, ...(loading && disabledInputStyle) }} required disabled={loading} />
                        <input type="password" placeholder="Password" value={password} onChange={handleChange(setPassword)} autoComplete={isLogin ? 'current-password' : 'new-password'} style={{ ...inputStyle, ...(loading && disabledInputStyle) }} required disabled={loading} />

                        <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, ...(loading && disabledButtonStyle) }}>
                            {loading ? isLogin ? 'Signing in...' : 'Creating account...' : isLogin ? 'Log in' : 'Sign up'}
                        </button>
                    </form>

                    {isLogin ? (
                        <button onClick={switchToSignUp} disabled={loading} style={secondaryButtonStyle}>Don't have an account? Sign up</button>
                    ) : (
                        <button onClick={switchToLogin} disabled={loading} style={secondaryButtonStyle}>Already have an account? Log in</button>
                    )}

                    <button style={helpLinkStyle}>Not able to login? Try here</button>
                </div>
            </div>
        </div>
    );
};
// Стили
const clearErrorButtonStyle = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#ff4444',
};

const errorStyle = {
    color: '#ff4444',
    backgroundColor: '#ffe6e6',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    position: 'relative',
};

const disabledInputStyle = {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    opacity: 0.7,
};

const disabledButtonStyle = {
    opacity: 0.6,
    cursor: 'not-allowed',
};

const inputStyle = {
    width: '100%',
    padding: '1rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
};

const primaryButtonStyle = {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#7EBFFF',
    color: 'black',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'all 0.3s ease',
};

const secondaryButtonStyle = {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'transparent',
    color: '#7F7F7F',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '2rem',
    transition: 'color 0.3s ease',
};

const helpLinkStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#7EBFFF',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'underline',
};

const airplaneImageStyle = {
    width: '200px',
    height: 'auto',
    maxWidth: '100%',
};

const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const topSectionStyle = {
    flex: '1',
    backgroundColor: '#7EBFFF',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
};

const contentWrapperStyle = {
    textAlign: 'center',
    color: 'white',
    zIndex: 2,
    position: 'relative',
    marginBottom: '60px',
};

const welcomeTextStyle = {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#575757',
    margin: '0',
    marginTop: '3rem',
    opacity: '0.9',
};

const appNameStyle = {
    fontSize: '3.5rem',
    fontWeight: '700',
    color: 'black',
    margin: '0',
    marginBottom: '3rem',
};

const airplaneContainerStyle = {
    marginTop: '2rem',
    position: 'relative',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    overflow: 'hidden',
    zIndex: 10,
};

const arcsContainerStyle = {
    position: 'absolute',
    bottom: '-120px',
    left: 0,
    right: 0,
    height: '200px',
    overflow: 'hidden',
};

const arcStyle = (color, bottom, zIndex) => ({
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: bottom,
    width: '150%',
    height: '300%',
    borderRadius: '200% / 100%',
    backgroundColor: color,
    zIndex,
});

const blueArc1Style = arcStyle('#7EBFFF', -10, 1);
const whiteArc1Style = arcStyle('white', 0, 2);
const blueArc2Style = arcStyle('#7EBFFF', 120, 3);
const whiteArc2Style = arcStyle('white', 130, 4);
const blueArc0Style = arcStyle('#7EBFFF', 140, 5);

const bottomSectionStyle = {
    flex: '1',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
};

const bottomContentStyle = {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
};

const formContainerStyle = {
    marginBottom: '2rem',
};

export default LoginPage;
