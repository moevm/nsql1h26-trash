import React from 'react';
import { useNavigate } from 'react-router-dom';
import RoleCard from './RoleCard.jsx';

const Header = () => {
    const navigate = useNavigate();
    const avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAV6ljq5z3-nQXLLf2NKMwpl84tuY5vDviTFhpL3TNkPpglKEkojKabP1NZtOzP4Kv2IAMEnxFPT5wRkfJFqqr_hVOi44WVkGBOu48ipkxxDdj8_nVRWir83WwRHHAMFYWxIgNlzOTkCdJ4wgUBpujhQSuspXjv-_gjeEIT5yEOKrBfQPyimzzVVcfmHnIEgeYG7iefiEgtgCD63eIotZZtcbdWQUbrPfSjDzRTmYD7MZkh7n0nX-r-MsfMEif3sMPwqR0vtHx224vf";

    return (
        <header className="selection-header">
            <div className="header-container">
                <div className="logo-group" onClick={() => navigate('/')}>
                    <span className="icon-logo">recycling</span>
                    <h1 className="logo-text">ЭкоСервис</h1>
                </div>

                <div className="flex items-center gap-6">
                    <button className="logout-btn">
                        <span className="truncate">Выйти</span>
                    </button>

                    <div className="user-avatar-ring">
                        <img
                            src={avatarUrl}
                            alt="User profile avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://ui-avatars.com/api/?name=User&background=13ec13&color=fff";
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

function RoleSelection() {
    const navigate = useNavigate();

    return (
        <div className="selection-page-wrapper">
            <Header />

            <main className="selection-main">
                <div className="w-full max-w-5xl flex flex-col items-center">

                    <div className="text-center mb-12 space-y-4">
                        <h2 className="selection-title">
                            Выберите вашу роль
                        </h2>
                        <p className="selection-subtitle">
                            Пожалуйста, укажите, как вы хотите использовать сервис, чтобы мы могли настроить интерфейс под ваши нужды.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        <RoleCard
                            title="Заказчик"
                            icon="home_work"
                            image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                            desc="Быстрый и удобный сервис для вывоза бытовых отходов прямо от вашей двери. Идеально для жильцов квартир и частных домов."
                            features={["Заказ в один клик", "Отслеживание курьера"]}
                            isPrimary={true}
                            buttonText="Продолжить как заказчик"
                            onSelect={() => navigate('/customer')}
                        />
                        <RoleCard
                            title="Курьер"
                            icon="local_shipping"
                            image="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=800&q=80"
                            desc="Станьте нашим партнером, выполняйте заказы в удобное время и получайте доход. Гибкий график и еженедельные выплаты."
                            features={["Свободный график", "Быстрый старт"]}
                            isPrimary={false}
                            buttonText="Продолжить как курьер"
                            onSelect={() => navigate('/courier')}
                        />
                    </div>

                    <p className="selection-footer-text">
                        Вы сможете изменить роль позже в настройках профиля.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default RoleSelection;