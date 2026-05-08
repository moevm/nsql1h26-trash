import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.new !== passwords.confirm) {
            setError("Новые пароли не совпадают");
            return;
        }

        if (passwords.new.length < 8) {
            setError("Новый пароль должен быть не менее 8 символов");
            return;
        }

        if (!passwords.old || !passwords.new) return;

        if (passwords.old === passwords.new) {
            setError("Новый пароль должен отличаться от старого");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/v1/courier/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    old_password: passwords.old,
                    new_password: passwords.new
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Пароль успешно изменен!");
                navigate(-1);
            } else {
                setError(data.detail || "Ошибка при смене пароля");
            }
        } catch (err) {
            setError("Ошибка соединения с сервером");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light font-display text-slate-900 min-h-screen">
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">

                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-10 py-3">
                        <div className="flex items-center gap-3">
                            <div className="logo-group" onClick={() => navigate('/')}>
                                <span className="icon-logo">recycling</span>
                                <h1 className="logo-text">ЭкоСервис</h1>
                            </div>
                        </div>
                        <div className="flex flex-1 justify-end gap-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm font-medium leading-normal text-primary hover:underline"
                            >
                                Профиль
                            </button>
                        </div>
                    </header>

                    <main className="flex flex-1 items-center justify-center p-6">
                        <div className="w-full max-w-[480px] bg-white rounded-xl shadow-sm border border-slate-200 p-8">

                            {/* Заголовок карточки */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
                                </div>
                                <h1 className="text-2xl font-bold leading-tight mb-2">Смена пароля</h1>
                                <p className="text-slate-500 text-sm leading-normal">
                                    Для защиты вашего аккаунта используйте сложный пароль, состоящий из букв и цифр.
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {/* Поля ввода */}
                                <PasswordField
                                    label="Старый пароль"
                                    placeholder="Введите старый пароль"
                                    isVisible={showPasswords.old}
                                    onToggle={() => toggleVisibility('old')}
                                    value={passwords.old}
                                    onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                                />

                                <PasswordField
                                    label="Новый пароль"
                                    placeholder="Введите новый пароль"
                                    isVisible={showPasswords.new}
                                    onToggle={() => toggleVisibility('new')}
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                />

                                <PasswordField
                                    label="Подтвердите новый пароль"
                                    placeholder="Повторите новый пароль"
                                    isVisible={showPasswords.confirm}
                                    onToggle={() => toggleVisibility('confirm')}
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                />

                                {/* Подсказка по требованиям к паролю */}
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex gap-2 items-center text-xs text-slate-500">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        <span>Минимум 8 символов, заглавные буквы и цифры</span>
                                    </div>
                                </div>

                                {/* Кнопки действий */}
                                <div className="flex flex-col gap-3 pt-4">
                                    {error && (
                                        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base">error</span>
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full items-center justify-center rounded-lg h-12 bg-primary text-slate-900 font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {loading ? 'Обновление...' : 'Обновить пароль'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="flex w-full items-center justify-center rounded-lg h-12 bg-transparent text-slate-600 font-medium text-base hover:bg-slate-100 transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

const PasswordField = ({ label, placeholder, isVisible, onToggle, value, onChange }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-medium leading-normal text-slate-700">{label}</label>
        <div className="relative flex items-stretch">
            <input
                type={isVisible ? "text" : "password"}
                value={value}
                onChange={onChange}
                className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 focus:ring-primary focus:border-primary border border-slate-300 bg-white h-12 px-4 text-base font-normal placeholder:text-slate-400 outline-none"
                placeholder={placeholder}
                required
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
            >
                <span className="material-symbols-outlined text-xl">
                    {isVisible ? 'visibility_off' : 'visibility'}
                </span>
            </button>
        </div>
    </div>
);

export default ChangePassword;