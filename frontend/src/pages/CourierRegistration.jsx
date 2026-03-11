import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="selection-header">
            <div className="header-container">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 group text-sm font-bold text-text-secondary hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        Назад
                    </button>
                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                    <div className="logo-group" onClick={() => navigate('/')}>
                        <span className="icon-logo">recycling</span>
                        <h1 className="logo-text">ЭкоСервис</h1>
                    </div>
                </div>
            </div>
        </header>
    );
};

const CourierRegistration = () => {
    return (
        <div className="selection-page-wrapper">
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-3xl"></div>
                </div>

                <div className="reg-card">
                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-10">
                            <h2 className="selection-title mb-2">Стать курьером</h2>
                            <p className="selection-subtitle">Заполните форму, чтобы начать зарабатывать на выносе мусора в удобное для вас время.</p>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* ФИО */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">ФИО</label>
                                    <div className="reg-input-wrapper">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">person</span>
                                        <input className="reg-input-field" placeholder="Иванов Иван Иванович" type="text" />
                                    </div>
                                </div>

                                {/* Телефон */}
                                <div className="col-span-1">
                                    <label className="reg-label">Телефон</label>
                                    <div className="reg-input-wrapper">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">call</span>
                                        <input className="reg-input-field" placeholder="+7 (000) 000-00-00" type="tel" />
                                    </div>
                                </div>

                                {/* Город */}
                                <div className="col-span-1">
                                    <label className="reg-label">Город</label>
                                    <div className="reg-input-wrapper">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">location_on</span>
                                        <input className="reg-input-field" placeholder="Санкт-Петербург" type="text" />
                                    </div>
                                </div>

                                {/* ПОЧТА*/}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">Электронная почта</label>
                                    <div className="reg-input-wrapper">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">mail</span>
                                        <input className="reg-input-field" placeholder="example@mail.ru" type="email" />
                                    </div>
                                </div>

                                {/* Транспорт */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">Транспорт</label>
                                    <div className="reg-input-wrapper">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">directions_bike</span>
                                        <select className="reg-select-field">
                                            <option value="">Выберите тип транспорта</option>
                                            <option value="foot">Пешком</option>
                                            <option value="bicycle">Велосипед</option>
                                            <option value="car">Автомобиль</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Загрузка паспорта */}
                            <div>
                                <label className="reg-label">Фото паспорта</label>
                                <div className="upload-zone group">
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                    <div className="space-y-2 relative z-10">
                                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600">Нажмите для загрузки</p>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопка и Политика */}
                            <div className="pt-6 border-t border-slate-50">
                                <button type="submit" className="reg-submit-btn">
                                    Зарегистрироваться
                                </button>

                                <div className="reg-footer-container">
                                    <p className="reg-footer-text">
                                        Нажимая кнопку, вы соглашаетесь с{' '}
                                        <span className="reg-link">условиями оферты</span>
                                        {' '}и{' '}
                                        <span className="reg-link">политикой конфиденциальности</span>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourierRegistration;