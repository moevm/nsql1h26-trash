import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyCode = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [seconds, setSeconds] = useState(120);
    const inputRefs = useRef([]);

    // Таймер обратного отсчета
    useEffect(() => {
        const timer = seconds > 0 && setInterval(() => setSeconds(seconds - 1), 1000);
        return () => clearInterval(timer);
    }, [seconds]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Логика ввода OTP (цифры и фокус)
    const handleChange = (element, index) => {
        const value = element.value.replace(/\D/g, ''); // Только цифры
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Переход к следующему полю
        if (index < 5 && value) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            }
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Введенный код:", otp.join(''));
        // Переход на шаг 3 (установка нового пароля)
        // navigate('/reset-password/step-3');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f6f8f6] font-['Public_Sans'] text-[#0d1b0d] antialiased">

            {/* Top Nav */}
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
                        {/* Step indicator */}
                        <div className="flex items-center gap-2 text-sm text-[#4c9a4c]">
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#42f042]/20 text-[#42f042] font-bold text-xs">✓</span>
                            <div className="w-8 h-px bg-[#42f042]"></div>
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#42f042] text-[#0d1b0d] font-bold text-xs">2</span>
                            <div className="w-8 h-px bg-[#e7f3e7]"></div>
                            <span className="flex items-center justify-center size-6 rounded-full bg-[#e7f3e7] text-[#4c9a4c] font-bold text-xs">3</span>
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
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#42f042]/10 border border-[#42f042]/20 mb-4">
                            <span className="material-symbols-outlined text-[#42f042] text-4xl">verified</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-[#0d1b0d] mb-2">Введите код</h2>
                        <p className="text-sm text-[#4c9a4c] max-w-xs mx-auto">
                            Мы отправили 6-значный код на почту <span className="font-semibold text-[#0d1b0d]">example@mail.ru</span>
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white shadow-[0_4px_20px_-2px_rgba(66,240,66,0.12),0_2px_10px_-2px_rgba(0,0,0,0.05)] rounded-xl border border-[#e7f3e7]">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#0d1b0d] mb-4 text-center">
                                        Код подтверждения
                                    </label>
                                    <div className="flex items-center justify-center gap-3">
                                        {otp.map((data, index) => (
                                            <React.Fragment key={index}>
                                                <input
                                                    type="text"
                                                    maxLength="1"
                                                    inputMode="numeric"
                                                    ref={el => inputRefs.current[index] = el}
                                                    value={data}
                                                    onChange={e => handleChange(e.target, index)}
                                                    onKeyDown={e => handleKeyDown(e, index)}
                                                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl bg-[#f6f8f6] text-[#0d1b0d] outline-none transition-all duration-200 focus:border-[#42f042] focus:ring-4 focus:ring-[#42f042]/20 ${data ? 'border-[#42f042] bg-[#f0fff0]' : 'border-[#e7f3e7]'}`}
                                                />
                                                {index === 2 && <div className="w-3 h-0.5 bg-[#e7f3e7]"></div>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                {/* Timer / Resend */}
                                <div className="flex items-center justify-center gap-2 text-sm text-[#4c9a4c]">
                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                    {seconds > 0 ? (
                                        <span>Отправить повторно через <span className="font-bold text-[#0d1b0d]">{formatTime(seconds)}</span></span>
                                    ) : (
                                        <span>Код можно запросить снова</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-[#0d1b0d] bg-[#42f042] hover:bg-[#36d636] transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(66,240,66,0.35)]"
                                >
                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                    Подтвердить код
                                </button>
                            </form>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-[#4c9a4c]">
                        Не пришёл код? Проверьте папку <span className="font-semibold text-[#0d1b0d]">Спам</span> или{' '}
                        <button
                            disabled={seconds > 0}
                            onClick={() => { setSeconds(120); console.log("Код отправлен повторно"); }}
                            className="font-semibold text-[#42f042] hover:text-[#36d636] transition-colors disabled:opacity-40"
                        >
                            отправьте ещё раз
                        </button>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default VerifyCode;