import React, { useState } from 'react';
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

const CustomerRegistration = () => {
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        email: '',
        address: '',
        password: '',
        confirm_password: '',
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const resp = await fetch('/api/v1/auth/register/customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await resp.json();
            if (resp.ok) {
                navigate('/login');
            } else {
                setError(data.detail || 'Ошибка регистрации');
            }
        } catch {
            setError('Ошибка сети. Проверьте подключение к интернету');
        } finally {
            setLoading(false);
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
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">ФИО</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">person</span>
                                        <input name="full_name" value={form.full_name} onChange={handleChange}
                                            className="reg-input-field" placeholder="Иванов Иван Иванович" type="text" required />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <label className="reg-label">Телефон</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">call</span>
                                        <input name="phone" value={form.phone} onChange={handleChange}
                                            className="reg-input-field" placeholder="+7 (000) 000-00-00" type="tel" required />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <label className="reg-label">Электронная почта</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">mail</span>
                                        <input name="email" value={form.email} onChange={handleChange}
                                            className="reg-input-field" placeholder="example@mail.ru" type="email" required />
                                    </div>
                                </div>

                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">Адрес проживания</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">location_on</span>
                                        <input name="address" value={form.address} onChange={handleChange}
                                            className="reg-input-field" placeholder="г. Санкт-Петербург, ул. Мира, д. 10" type="text" required />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <label className="reg-label">Пароль</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">lock</span>
                                        <input name="password" value={form.password} onChange={handleChange}
                                            className="reg-input-field" placeholder="••••••••"
                                            type={showPass ? "text" : "password"} required />
                                        <span
                                            className="absolute right-4 text-slate-400 material-symbols-outlined cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? "visibility" : "visibility_off"}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <label className="reg-label">Подтвердите пароль</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-primary material-symbols-outlined select-none">lock_reset</span>
                                        <input name="confirm_password" value={form.confirm_password} onChange={handleChange}
                                            className="reg-input-field" placeholder="••••••••"
                                            type={showPass ? "text" : "password"} required />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                            )}

                            <div className="flex items-start gap-3 pt-2">
                                <input type="checkbox" id="terms" required
                                    className="h-5 w-5 rounded border-slate-200 text-primary focus:ring-primary cursor-pointer mt-0.5" />
                                <label htmlFor="terms" className="text-sm text-text-main font-medium leading-relaxed cursor-pointer">
                                    Я согласен с <span className="reg-link">Условиями использования</span> и <span className="reg-link">Политикой конфиденциальности</span>
                                </label>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <button type="submit" disabled={loading} className="reg-submit-btn">
                                    {loading ? 'Регистрация…' : 'Зарегистрироваться'}
                                </button>

                                <div className="reg-footer-container">
                                    <p className="reg-footer-text">
                                        Уже есть аккаунт?{' '}
                                        <button type="button" onClick={() => navigate('/login')}
                                            className="reg-link font-black no-underline">Войти</button>
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
