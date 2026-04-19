import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: formData.login, password: formData.password }),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('access_token', result.access_token);
                if (result.role === 'admin') navigate('/admin-dashboard');
                else if (result.role === 'courier') navigate('/courier-dash');
                else navigate('/customer-dashboard');
            } else {
                alert(result.detail ? "Ошибка входа" : "Неверные данные");
            }
        } catch (error) {
            alert("Ошибка сети");
        }
    };
    const openModal = (e) => {

        e.preventDefault();

        setIsModalOpen(true);

    };

    const closeModal = () => setIsModalOpen(false);



    return (

        <div className="bg-background-light text-text-main font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-black">



            <header className="w-full bg-white border-b border-[#e7f3e7] sticky top-0 z-50">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-center justify-between h-20">

                        <div className="flex items-center gap-6">

                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7f3e7] hover:border-primary hover:bg-green-50 text-text-main transition-all duration-200 group"

                                    onClick={() => navigate('/')}>

                                <span className="material-symbols-outlined text-[#4c9a4c] group-hover:text-primary transition-colors">arrow_back</span>

                                <span className="text-sm font-bold">На главную</span>

                            </button>



                            <div className="h-8 w-px bg-[#e7f3e7] mx-2 hidden sm:block"></div>



                            <div className="hidden sm:flex items-center gap-2">

                                <span className="material-symbols-outlined text-3xl text-primary">recycling</span>

                                <h1 className="text-lg font-bold tracking-tight text-text-main">ЭкоСервис</h1>

                            </div>

                        </div>



                        {/* Right side — Registration Button */}

                        <div className="flex items-center gap-4">

                            <span className="hidden md:block text-sm text-[#4c9a4c] font-medium">Ещё нет аккаунта?</span>

                            <button className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-black text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"

                                    onClick={() => navigate('/register')}>

                                Зарегистрироваться

                            </button>

                        </div>

                    </div>

                </div>

            </header>



            <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">

                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl"></div>

                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-primary/5 rounded-full blur-3xl"></div>

                </div>



                <div className="w-full max-w-md z-10">

                    {/* Header */}

                    <div className="text-center mb-10">

                        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 border border-primary/20 mb-4">

                            <span className="material-symbols-outlined text-primary text-4xl">lock_open</span>

                        </div>

                        <h2 className="text-4xl font-black tracking-tight text-text-main mb-3">Добро пожаловать</h2>

                        <p className="text-base text-[#4c9a4c]">Войдите в свой аккаунт, чтобы продолжить</p>

                    </div>



                    {/* Login Card */}

                    <div className="bg-white shadow-[0_4px_20px_-2px_rgba(19,236,19,0.1)] rounded-2xl overflow-hidden border border-[#e7f3e7]">

                        <div className="p-8 sm:p-10">

                            <form onSubmit={handleLogin} className="space-y-6">

                                {/* Email field */}

                                <div>

                                    <label className="block text-sm font-semibold text-text-main mb-2" htmlFor="email">

                                        Email или телефон

                                    </label>

                                    <div className="relative">

                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                                            <span className="material-symbols-outlined text-[#4c9a4c] text-xl">alternate_email</span>

                                        </div>

                                        <input
                                            id="login"
                                            value={formData.login}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-3 border border-[#e7f3e7] rounded-lg bg-[#f6f8f6] text-text-main placeholder-[#4c9a4c]/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-shadow duration-200"
                                            type="text"
                                            placeholder="example@mail.ru"
                                            required
                                        />

                                    </div>

                                </div>



                                {/* Password field */}

                                <div>

                                    <div className="flex items-center justify-between mb-2">

                                        <label className="block text-sm font-semibold text-text-main" htmlFor="password">

                                            Пароль

                                        </label>

                                        <button onClick={openModal} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors hover:underline">

                                            Забыли пароль?

                                        </button>

                                    </div>

                                    <div className="relative">

                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                                            <span className="material-symbols-outlined text-[#4c9a4c] text-xl">lock</span>

                                        </div>

                                        <input
                                            id="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-12 py-3 border border-[#e7f3e7] rounded-lg bg-[#f6f8f6] text-text-main placeholder-[#4c9a4c]/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-shadow duration-200"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                        />

                                        <button

                                            type="button"

                                            onClick={() => setShowPassword(!showPassword)}

                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4c9a4c] hover:text-primary transition-colors"

                                        >

                                            <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>

                                        </button>

                                    </div>

                                </div>



                                {/* Remember me */}

                                <div className="flex items-center gap-3">

                                    <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-[#e7f3e7] text-primary focus:ring-primary cursor-pointer accent-primary" />

                                    <label htmlFor="remember-me" className="text-sm text-[#4c9a4c] cursor-pointer select-none">

                                        Запомнить меня на этом устройстве

                                    </label>

                                </div>



                                {/* Submit Button */}

                                <div className="pt-2">

                                    <button

                                        className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-black bg-primary hover:bg-primary-hover transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(19,236,19,0.39)]"

                                        type="submit"

                                    >

                                        <span className="material-symbols-outlined text-xl">login</span>

                                        Войти в аккаунт

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>



                    <p className="mt-6 text-center text-sm text-[#4c9a4c]">

                        Нет аккаунта? <button className="font-bold text-primary hover:text-primary-dark transition-colors">Зарегистрироваться бесплатно</button>

                    </p>

                </div>

            </main>



            {/* Forgot Password Modal */}

            {isModalOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>



                    <div className="relative bg-white rounded-2xl border border-[#e7f3e7] shadow-2xl w-full max-w-md p-8 z-10 animate-in fade-in zoom-in duration-200">

                        <button onClick={closeModal} className="absolute top-4 right-4 text-[#4c9a4c] hover:text-text-main transition-colors">

                            <span className="material-symbols-outlined text-xl">close</span>

                        </button>

                        <div className="flex flex-col items-center text-center mb-6">

                            <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 border border-primary/20 mb-4">

                                <span className="material-symbols-outlined text-primary text-3xl">key</span>

                            </div>

                            <h3 className="text-2xl font-black text-text-main">Восстановление пароля</h3>

                            <p className="text-sm text-[#4c9a4c] mt-2">

                                Укажите email — мы отправим ссылку для сброса пароля

                            </p>

                        </div>

                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">

                            <div>

                                <label className="block text-sm font-semibold text-text-main mb-2" htmlFor="reset-email">Email</label>

                                <div className="relative">

                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                                        <span className="material-symbols-outlined text-[#4c9a4c] text-xl">alternate_email</span>

                                    </div>

                                    <input

                                        className="block w-full pl-10 pr-3 py-3 border border-[#e7f3e7] rounded-lg bg-[#f6f8f6] text-text-main placeholder-[#4c9a4c]/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"

                                        id="reset-email" type="email" placeholder="example@mail.ru" required

                                    />

                                </div>

                            </div>

                            <button

                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-black bg-primary hover:bg-primary-hover transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(19,236,19,0.39)]"

                                type="submit"

                            >

                                <span className="material-symbols-outlined text-xl">send</span>

                                Отправить ссылку

                            </button>

                        </form>

                        <p className="mt-4 text-center text-xs text-[#4c9a4c]">
                            Вспомнили пароль? <button onClick={closeModal} className="font-medium text-primary hover:text-primary-dark transition-colors">Войти</button>
                        </p>

                    </div>

                </div>

            )}

        </div>

    );

};



export default LoginPage;