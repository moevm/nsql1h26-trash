import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

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

const CustomerRegistration = () => {
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }

        if (!formData.acceptedTerms) {
            alert('Необходимо принять условия использования и политику конфиденциальности');
            return;
        }

        try {
            const response = await fetch('/api/v1/auth/register/customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                    address: formData.address,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                login({
                    id: result.id,
                    name: result.full_name,
                    email: result.email,
                    phone: result.phone,
                    role: result.role,
                });

                navigate('/customer-dashboard');
            } else {
                alert('Ошибка: ' + (result.detail ? JSON.stringify(result.detail) : 'Не удалось зарегистрироваться'));
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Ошибка соединения с сервером');
        }
    };

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
                            <h2 className="selection-title mb-2">Регистрация</h2>
                            <p className="selection-subtitle">Создайте аккаунт для управления вывозом мусора</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* ФИО */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">ФИО</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">person</span>
                                        <input
                                            className="reg-input-field"
                                            placeholder="Иванов Иван Иванович"
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Телефон */}
                                <div className="col-span-1">
                                    <label className="reg-label">Телефон</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">call</span>
                                        <input
                                            className="reg-input-field"
                                            placeholder="+7 (000) 000-00-00"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Почта */}
                                <div className="col-span-1">
                                    <label className="reg-label">Электронная почта</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">mail</span>
                                        <input
                                            className="reg-input-field"
                                            placeholder="example@mail.ru"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Адрес */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">Адрес проживания</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">location_on</span>
                                        <input
                                            className="reg-input-field"
                                            placeholder="г. Санкт-Петербург, ул. Мира, д. 10"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Пароль */}
                                <div className="col-span-1">
                                    <label className="reg-label">Пароль</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">lock</span>
                                        <input
                                            className="reg-input-field"
                                            placeholder="••••••••"
                                            type={showPass ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <span
                                            className="absolute right-4 text-slate-400 material-symbols-outlined cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? "visibility" : "visibility_off"}
                                        </span>
                                    </div>
                                </div>

                                {/* Подтверждение */}
                                <div className="col-span-1">
                                    <label className="reg-label">Подтвердите пароль</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">lock_reset</span>
                                        <input
                                            className="reg-input-field"
                                            placeholder="••••••••"
                                            type={showPass ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Согласие */}
                            <div className="flex items-start gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="acceptedTerms"
                                    checked={formData.acceptedTerms}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded border-slate-200 text-primary focus:ring-primary cursor-pointer mt-0.5"
                                />
                                <label htmlFor="terms" className="text-sm text-text-main font-medium leading-relaxed cursor-pointer">
                                    Я согласен с <span className="reg-link">Условиями использования</span> и <span className="reg-link">Политикой конфиденциальности</span>
                                </label>
                            </div>

                            {/* Кнопка */}
                            <div className="pt-6 border-t border-slate-50">
                                <button type="submit" className="reg-submit-btn">
                                    Зарегистрироваться
                                </button>

                                <div className="reg-footer-container">
                                    <p className="reg-footer-text">
                                        Уже есть аккаунт?{' '}
                                        <button type="button" className="reg-link font-black no-underline">Войти</button>
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

export default CustomerRegistration;