import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import airplaneImage from '../assets/plane.png';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Произошла ошибка');
        }
        setLoading(false);
    };

    const handleFormSubmit = (isLoginForm) => {
        setIsLogin(isLoginForm);
        if (email && password) {
            handleSubmit({ preventDefault: () => {} });
        }
    };

    return (
        <div style={containerStyle}>
            {/* Верхняя синяя секция */}
            <div style={topSectionStyle}>
                <div style={contentWrapperStyle}>
                    <h1 style={welcomeTextStyle}>Welcome to</h1>
                    <h1 style={appNameStyle}>LowFlightZone</h1>

                    {/* Место для картинки самолета */}
                    <div style={airplaneContainerStyle}>
                        <div style={airplaneContainerStyle}>
                            <img
                                src={airplaneImage}
                                alt="Airplane"
                                style={airplaneImageStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Множественные дуги: голубая-белая, голубая-белая */}
                <div style={arcsContainerStyle}>
                    <div style={whiteArc1Style}></div>
                    <div style={blueArc1Style}></div>
                    <div style={whiteArc2Style}></div>
                    <div style={blueArc2Style}></div>
                    <div style={blueArc0Style}></div>
                </div>
            </div>

            {/* Нижняя белая секция */}
            <div style={bottomSectionStyle}>
                <div style={bottomContentStyle}>
                    {error && <div style={errorStyle}>{error}</div>}

                    {/* Форма для входа/регистрации */}
                    <div style={formContainerStyle}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Кнопка Log In */}
                    <button
                        onClick={() => handleFormSubmit(true)}
                        disabled={loading}
                        style={loginButtonStyle}
                    >
                        {loading ? 'Loading...' : 'Log in'}
                    </button>

                    {/* Кнопка Sign Up */}
                    <button
                        onClick={() => handleFormSubmit(false)}
                        disabled={loading}
                        style={signupButtonStyle}
                    >
                        Sign up
                    </button>

                    {/* Ссылка внизу */}
                    <button style={helpLinkStyle}>
                        Not able to login? Try here
                    </button>
                </div>
            </div>
        </div>
    );
};

// Стили
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
    marginBottom: '60px', // Отступ для дуг
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

// Контейнер для дуг
const arcsContainerStyle = {
    position: 'absolute',
    bottom: '-120px', // опускаем дуги ниже, чтобы они не заезжали на самолёт
    left: 0,
    right: 0,
    height: '200px', // больше места под плавный переход
    overflow: 'hidden',
};

// Функция для дуги
const arcStyle = (color, bottom, padding, zIndex) => ({
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)', // центрируем
    //right: padding,
    bottom: bottom,
    width: '150%', // шире экрана
    height: '300%', // высота овала
    borderRadius: '200% / 100%',
    backgroundColor: color,
    zIndex,
});

// Дуги (снизу вверх)
const blueArc1Style = arcStyle('#7EBFFF', -10, 0, 1);
const whiteArc1Style = arcStyle('white', 0, 5, 2);
const blueArc2Style = arcStyle('#7EBFFF', 120, 10, 3);
const whiteArc2Style = arcStyle('white', 130, 15, 4); // эта белая сольётся с нижним блоком
const blueArc0Style = arcStyle('#7EBFFF', 140, 10, 5);

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

const inputStyle = {
    width: '100%',
    padding: '1rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
};

const loginButtonStyle = {
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
    transition: 'background-color 0.3s ease',
};

const signupButtonStyle = {
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

const errorStyle = {
    color: '#ff4444',
    backgroundColor: '#ffe6e6',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
};

// Добавляем hover эффекты
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  input:focus {
    border-color: #7EBFFF;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  button:hover {
    opacity: 0.9;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`, styleSheet.cssRules.length);

export default LoginPage;