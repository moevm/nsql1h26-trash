import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Логика перехода на шаг 2
        console.log("Код отправлен");
        // navigate('/reset-password/step-2');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f6f8f6] font-['Public_Sans'] text-[#0d1b0d] antialiased">

            {/* TOP NAV (из референса) */}
            <header className="w-full bg-white border-b border-[#e7f3e7] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 group transition-colors"
                            >
                                <div className="p-1 rounded-full group-hover:bg-[#e7f3e7] transition-colors">
                                    <span className="material-symbols-outlined text-[#4c9a4c] group-hover:text-[#42f042]">arrow_back</span>
                                </div>
                                <span className="text-sm font-medium text-[#0d1b0d] group-hover:text-[#42f042]">Назад</span>
                            </button>

                            <div className="h-6 w-px bg-[#e7f3e7] hidden sm:block"></div>

                            <div className="hidden sm:flex items-center gap-2">
                                <span className="material-symbols-outlined text-2xl text-[#42f042]">recycling</span>
                                <h1 className="text-lg font-bold tracking-tight text-[#0d1b0d]">ЭкоКурьер</h1>
                            </div>
                        </div>

                        {/* Step indicator */}
                        <div className="flex items-center gap-2 text-sm text-[#4c9a4c]">
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#42f042] text-[#0d1b0d] font-bold text-xs">1</span>
                            <div className="w-8 h-px bg-[#e7f3e7]"></div>
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#e7f3e7] text-[#4c9a4c] font-bold text-xs">2</span>
                            <div className="w-8 h-px bg-[#e7f3e7]"></div>
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#e7f3e7] text-[#4c9a4c] font-bold text-xs">3</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#42f042]/5 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-[#42f042]/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="w-full max-w-md z-10">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#42f042]/10 border border-[#42f042]/20 mb-4">
                            <span className="material-symbols-outlined text-[#42f042] text-4xl">mail_lock</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-[#0d1b0d] mb-2">Смена пароля</h2>
                        <p className="text-sm text-[#4c9a4c] max-w-xs mx-auto">
                            Укажите email, привязанный к вашему аккаунту — мы отправим код подтверждения
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white shadow-[0_4px_20px_-2px_rgba(66,240,66,0.12),0_2px_10px_-2px_rgba(0,0,0,0.05)] rounded-xl border border-[#e7f3e7]">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#0d1b0d] mb-2" htmlFor="email">
                                        Электронная почта
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a4c] text-xl">alternate_email</span>
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            placeholder="example@mail.ru"
                                            className="block w-full pl-10 pr-3 py-3 border border-[#e7f3e7] rounded-lg bg-[#f6f8f6] text-[#0d1b0d] placeholder-[#4c9a4c]/60 focus:outline-none focus:ring-2 focus:ring-[#42f042] focus:border-[#42f042] text-sm transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-[#0d1b0d] bg-[#42f042] hover:bg-[#36d636] transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(66,240,66,0.35)]"
                                >
                                    <span className="material-symbols-outlined text-xl">send</span>
                                    Отправить код
                                </button>
                            </form>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-[#4c9a4c]">
                        Вспомнили пароль?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="font-semibold text-[#42f042] hover:text-[#36d636] transition-colors"
                        >
                            Войти в аккаунт
                        </button>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;