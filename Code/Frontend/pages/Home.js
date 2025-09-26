import React from 'react';

const Home = () => {
    return (
        <div style={containerStyle}>
            <h1>Добро пожаловать в LowFlightZone!</h1>
            <p>Система отслеживания рейсов и уведомлений о статусе полетов.</p>

            <div style={featuresStyle}>
                <div style={featureCardStyle}>
                    <h3>📊 Отслеживание рейсов</h3>
                    <p>Реальная информация о статусе рейсов</p>
                </div>

                <div style={featureCardStyle}>
                    <h3>🔔 Уведомления</h3>
                    <p>Получайте уведомления об изменениях</p>
                </div>

                <div style={featureCardStyle}>
                    <h3>✈️ Аэропорты</h3>
                    <p>Информация о терминалах и задержках</p>
                </div>
            </div>
        </div>
    );
};

const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    textAlign: 'center'
};

const featuresStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '3rem'
};

const featureCardStyle = {
    backgroundColor: '#f8f9fa',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

export default Home;