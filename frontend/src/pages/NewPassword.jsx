import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NewPassword = () => {
    const navigate = useNavigate();

    // Состояния для формы
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [matchError, setMatchError] = useState(null);

    // Проверка совпадения паролей при вводе
    useEffect(() => {
        if (!confirmPassword) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMatchError(null);
            return;
        }
        if (password === confirmPassword) {
            setMatchError(false);
        } else {
            setMatchError(true);
        }
    }, [password, confirmPassword]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.length >= 8 && password === confirmPassword) {
            console.log("Пароль успешно изменен");
            setIsSubmitted(true);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f6f8f6] font-['Public_Sans'] text-[#0d1b0d] antialiased">

            {/* Top Nav (из референса) */}
            <header className="w-full bg-white border-b border-[#e7f3e7] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-2 group transition-colors">
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
                        {/* Step indicator: все шаги выполнены */}
                        <div className="flex items-center gap-2 text-sm text-[#4c9a4c]">
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#42f042]/20 text-[#42f042] font-bold text-xs">✓</span>
                            <div className="w-8 h-px bg-[#42f042]"></div>
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#42f042]/20 text-[#42f042] font-bold text-xs">✓</span>
                            <div className="w-8 h-px bg-[#42f042]"></div>
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#42f042] text-[#0d1b0d] font-bold text-xs">3</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#42f042]/5 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-[#42f042]/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="w-full max-w-md z-10">
                    {!isSubmitted ? (
                        <>
                            {/* Header Section */}
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#42f042]/10 border border-[#42f042]/20 mb-4">
                                    <span className="material-symbols-outlined text-[#42f042] text-4xl">lock_reset</span>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-[#0d1b0d] mb-2">Новый пароль</h2>
                                <p className="text-sm text-[#4c9a4c] max-w-xs mx-auto">
                                    Придумайте надёжный пароль. Минимум 8 символов, буквы и цифры
                                </p>
                            </div>

                            {/* Form Card */}
                            <div className="bg-white shadow-[0_4px_20px_-2px_rgba(66,240,66,0.12),0_2px_10px_-2px_rgba(0,0,0,0.05)] rounded-xl border border-[#e7f3e7]">
                                <div className="p-8">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#0d1b0d] mb-2">Новый пароль</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="material-symbols-outlined text-[#4c9a4c] text-xl">lock</span>
                                                </div>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Минимум 8 символов"
                                                    className="block w-full pl-10 pr-12 py-3 border border-[#e7f3e7] rounded-lg bg-[#f6f8f6] text-[#0d1b0d] focus:outline-none focus:ring-2 focus:ring-[#42f042] text-sm transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4c9a4c] hover:text-[#42f042]"
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        {showPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#0d1b0d] mb-2">Повторите пароль</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="material-symbols-outlined text-[#4c9a4c] text-xl">lock_open</span>
                                                </div>
                                                <input
                                                    type={showConfirm ? "text" : "password"}
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Повторите новый пароль"
                                                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg bg-[#f6f8f6] text-[#0d1b0d] focus:outline-none focus:ring-2 text-sm transition-all ${
                                                        matchError === false ? 'border-[#42f042] focus:ring-[#42f042]' :
                                                            matchError === true ? 'border-red-500 focus:ring-red-500' : 'border-[#e7f3e7] focus:ring-[#42f042]'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm(!showConfirm)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4c9a4c] hover:text-[#42f042]"
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        {showConfirm ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                            {matchError !== null && (
                                                <p className={`mt-1.5 text-xs font-medium ${matchError ? 'text-red-500' : 'text-[#42f042]'}`}>
                                                    {matchError ? '✗ Пароли не совпадают' : '✓ Пароли совпадают'}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={password.length < 8 || password !== confirmPassword}
                                            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-[#0d1b0d] bg-[#42f042] hover:bg-[#36d636] transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(66,240,66,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        >
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                            Сохранить пароль
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Success State Section */
                        <div className="bg-white shadow-[0_4px_20px_-2px_rgba(66,240,66,0.12)] rounded-xl border border-[#e7f3e7] p-10 flex flex-col items-center text-center gap-4">
                            <div className="size-20 rounded-full bg-[#42f042]/10 border-2 border-[#42f042] flex items-center justify-center animate-bounce">
                                <span className="material-symbols-outlined text-[#42f042] text-5xl">check_circle</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#0d1b0d]">Пароль изменён!</h3>
                            <p className="text-sm text-[#4c9a4c]">
                                Используйте новый пароль для входа в аккаунт
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="mt-2 w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-[#0d1b0d] bg-[#42f042] hover:bg-[#36d636] transition-all shadow-[0_4px_14px_0_rgba(66,240,66,0.35)]"
                            >
                                <span className="material-symbols-outlined text-xl">login</span>
                                Войти в аккаунт
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default NewPassword;