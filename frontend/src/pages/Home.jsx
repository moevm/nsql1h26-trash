import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, title, description }) => (
    <div className="feature-item">
        <span className="icon-feature material-symbols-outlined">{icon}</span>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-text">{description}</p>
    </div>
);

const Header = () => {
    const navigate = useNavigate();
    return (
        <header className="main-header">
            <div className="logo-group" onClick={() => navigate('/')}>
                <span className="icon-logo material-symbols-outlined">recycling</span>
                <h2 className="logo-text">ЭкоСервис</h2>
            </div>
            <button
                onClick={() => navigate('/courier')}
                className="nav-button">
                <span className="icon-nav material-symbols-outlined">local_shipping</span>
                <span>Для курьеров</span>
            </button>
        </header>
    );
};

function Home() {
    const navigate = useNavigate();

    return (
        <div className="page-wrapper">
            <Header />
            <main className="page-main">
                <div className="content-grid">
                    <div className="hero-info">
                        <div>
                            <span className="hero-badge">Сервис №1 в городе</span>
                            <h1 className="hero-title">Чистый город <br /><span className="text-primary-dark">начинается с вас</span></h1>
                            <p className="hero-desc">Быстрый и удобный сервис по вывозу бытовых отходов.
                                Закажите вывоз мусора в пару кликов и внесите свой вклад в экологию</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FeatureCard icon="eco" title="Эко" description="Заботимся о переработке" />
                            <FeatureCard icon="schedule" title="Быстро" description="Вывоз в день заявки" />
                            <FeatureCard icon="verified_user" title="Надежно" description="Проверенные исполнители" />
                        </div>
                    </div>

                    <div className="auth-card-container">
                        <div className="auth-card">
                            <div className="card-decor-circle"></div>
                            <div className="auth-header">
                                <div className="auth-icon-circle">
                                    <span className="icon-auth-header material-symbols-outlined">recycling</span>
                                </div>
                                <h2 className="font-bold text-2xl">Добро пожаловать</h2>
                                <p className="text-text-secondary text-sm">Войдите или создайте аккаунт, чтобы начать пользоваться сервисом.</p>
                            </div>

                            <div className="auth-form">
                                <button className="btn-primary"
                                        onClick={() => navigate('/login')}>
                                    <span>Войти в аккаунт</span>
                                    <span className="icon-anim material-symbols-outlined">login</span>
                                </button>
                                <div className="divider-box">
                                    <div className="divider-line"></div>
                                    <span className="mx-4 text-gray-400 text-sm">или</span>
                                    <div className="divider-line"></div>
                                </div>
                                <button className="btn-secondary" onClick={() => navigate('/register')}>
                                    <span>Создать аккаунт</span>
                                    <span className="icon-anim material-symbols-outlined">person_add</span>
                                </button>
                            </div>
                            <div className="text-center mt-6">
                                <a href="#" className="link-forgot">Забыли пароль?</a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;