import React, { useState, useRef } from 'react';
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
                        <span className="icon-base text-xl">arrow_back</span>
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
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [showPass, setShowPass] = useState(false);
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        email: '',
        transport: '',
        password: '',
        confirmPassword: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // ОСТАВЛЯЕМ ТОЛЬКО ЭТУ ВЕРСИЮ:
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Пароли не совпадают!");
            return;
        }

        const data = new FormData();
        data.append('full_name', formData.fullName);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('city', formData.city);
        data.append('transport', formData.transport);
        data.append('password', formData.password);
        data.append('confirm_password', formData.confirmPassword);

        if (selectedFile) {
            data.append('passport_photo', selectedFile);
        }

        try {
            const response = await fetch('/api/v1/auth/register/courier', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (response.ok) {
                login({
                    id: result.id,
                    name: result.full_name,
                    email: result.email,
                    phone: result.phone,
                    role: result.role,
                    transport: formData.transport
                });

                navigate('/courier-dash');
            } else {
                console.error("Ошибка:", result);
                alert("Ошибка: " + (result.detail ? JSON.stringify(result.detail) : "Не удалось зарегистрироваться"));
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            alert("Ошибка соединения с сервером");
        }
    };
    return (
        <div className="selection-page-wrapper">
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
                {/* Фон-декор */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-3xl"></div>
                </div>

                <div className="reg-card">
                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-10">
                            <h2 className="selection-title mb-2">Стать курьером</h2>
                            <p className="selection-subtitle">Заполните форму, чтобы начать зарабатывать.</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">ФИО</label>
                                    <div className="reg-input-wrapper">
                                        <span className="reg-input-icon">person</span>
                                        <input name="fullName" value={formData.fullName} onChange={handleChange} className="reg-input-field" placeholder="Иванов Иван Иванович" type="text" required />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <label className="reg-label">Телефон</label>
                                    <div className="reg-input-wrapper">
                                        <span className="reg-input-icon">call</span>
                                        <input name="phone" value={formData.phone} onChange={handleChange} className="reg-input-field" placeholder="+7 (000) 000-00-00" type="tel" required />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="reg-label">Город</label>
                                    <div className="reg-input-wrapper">
                                        <span className="reg-input-icon">location_on</span>
                                        <input name="city" value={formData.city} onChange={handleChange} className="reg-input-field" placeholder="Санкт-Петербург" type="text" required />
                                    </div>
                                </div>

                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">Электронная почта</label>
                                    <div className="reg-input-wrapper">
                                        <span className="reg-input-icon">mail</span>
                                        <input name="email" value={formData.email} onChange={handleChange} className="reg-input-field" placeholder="example@mail.ru" type="email" required />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <label className="reg-label">Пароль</label>
                                    <div className="reg-input-wrapper">
                                        <span className="reg-input-icon">lock</span>
                                        <input
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="reg-input-field"
                                            placeholder="••••••••"
                                            type={showPass ? "text" : "password"}
                                            required
                                        />
                                        <span className="reg-input-icon-right" onClick={() => setShowPass(!showPass)}>
                                            {showPass ? "visibility" : "visibility_off"}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="reg-label">Подтверждение</label>
                                    <div className="reg-input-wrapper">
                                        <span className="reg-input-icon">lock_reset</span>
                                        <input
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="reg-input-field"
                                            placeholder="••••••••"
                                            type={showPass ? "text" : "password"}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 sm:col-span-2">
                                    <label className="reg-label">Транспорт</label>
                                    <div className="reg-input-wrapper">
                                        <span className="reg-input-icon">directions_bike</span>
                                        <select name="transport" value={formData.transport} onChange={handleChange} className="reg-select-field" required>
                                            <option value="">Выберите тип транспорта</option>
                                            <option value="foot">Пешком</option>
                                            <option value="car">Автомобиль</option>
                                            <option value="van">Газель</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="reg-label">Фото паспорта</label>
                                <div className="upload-zone group relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    <div className="space-y-2 relative z-10 text-center">
                                        <div className={`mx-auto h-12 w-12 flex items-center justify-center rounded-full transition-all ${selectedFile ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                                            <span className="icon-base text-3xl">{selectedFile ? 'check' : 'cloud_upload'}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600">{selectedFile ? 'Файл выбран' : 'Нажмите для загрузки'}</p>
                                        {selectedFile && <p className="text-[10px] text-primary font-bold">{selectedFile.name}</p>}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="reg-submit-btn">Зарегистрироваться</button>

                            <div className="reg-footer-container">
                                <p className="reg-footer-text mb-4">
                                    Нажимая на кнопку, вы соглашаетесь с{' '}
                                    <span className="reg-link">Условиями использования</span> и{' '}
                                    <span className="reg-link">Политикой конфиденциальности</span>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourierRegistration;