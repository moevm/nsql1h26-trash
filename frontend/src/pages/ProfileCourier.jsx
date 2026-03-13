import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const ProfileCourier = () => {
    const location = useLocation();
    const [userName] = useState(location.state?.userName || "Дмитрий К.");

    const [formData, setFormData] = useState({
        firstName: 'Дмитрий',
        lastName: 'Ковалев',
        phone: '+7 (905) 123-45-67',
        email: 'dmitry.k@example.com',
        transport: 'foot'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display">
            <Sidebar activePage="profile" userName={userName} />

            <main className="flex flex-1 flex-col overflow-y-auto">
                <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0 z-10">
                    <h2 className="text-2xl font-bold tracking-tight">Личный профиль</h2>

                    <div className="balance-card h-12">
                        <span className="icon-base text-primary text-xl">account_balance_wallet</span>
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider">Баланс</span>
                            <span className="font-bold text-base">5 420 ₽</span>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 flex-col p-8 max-w-4xl mx-auto w-full">
                    <div className="profile-card">

                        {/* Блок Аватара */}
                        <div className="flex flex-col items-center gap-6 mb-10">
                            <div className="avatar-wrapper"
                                 style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}')` }}>
                                <button className="absolute bottom-1 right-1 flex items-center justify-center rounded-full bg-primary text-text-main p-2 hover:bg-primary-dark shadow-md transition-all hover:scale-110">
                                    <span className="icon-base text-xl">photo_camera</span>
                                </button>
                            </div>
                            <button className="text-sm font-bold bg-white px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                Изменить фотографию
                            </button>
                        </div>

                        {/* Форма */}
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Имя" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ваше имя" />
                                <InputGroup label="Фамилия" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Ваша фамилия" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Телефон" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+7 (999) 000-00-00" />
                                <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@mail.ru" />
                            </div>

                            {/* Выбор транспорта */}
                            <div className="space-y-4 pt-4">
                                <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider">Ваш транспорт</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <TransportOption id="foot" label="Пешком" icon="directions_walk" checked={formData.transport === 'foot'} onChange={handleChange} />
                                    <TransportOption id="car" label="На авто" icon="directions_car" checked={formData.transport === 'car'} onChange={handleChange} />
                                    <TransportOption id="van" label="Газель" icon="local_shipping" checked={formData.transport === 'van'} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Кнопки действий */}
                            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-100 mt-8">
                                <button type="button" className="text-sm font-bold text-text-secondary hover:text-text-main flex items-center gap-2 transition-colors group">
                                    <span className="icon-base text-lg group-hover:rotate-180 transition-transform duration-500">lock_reset</span>
                                    Безопасность и пароль
                                </button>
                                <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-text-main font-black py-3.5 px-10 rounded-xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95">
                                    Сохранить профиль
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

const InputGroup = ({ label, name, type = "text", value, onChange, placeholder }) => (
    <div className="space-y-2">
        <label className="block text-xs font-black text-text-secondary uppercase tracking-widest" htmlFor={name}>{label}</label>
        <input
            className="w-full rounded-xl border border-slate-200 bg-[#f8fcf8] px-4 py-3.5 text-text-main font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-400"
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    </div>
);

const TransportOption = ({ id, label, icon, checked, onChange }) => (
    <label className={`transport-card ${checked ? 'transport-active' : ''}`}>
        <input type="radio" name="transport" value={id} className="sr-only" checked={checked} onChange={onChange} />
        <div className="flex items-center gap-3 w-full">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm transition-colors ${checked ? 'text-primary' : 'text-slate-400'}`}>
                <span className="icon-base text-[20px]">{icon}</span>
            </div>
            <span className={`text-sm font-black ${checked ? 'text-text-main' : 'text-text-secondary'}`}>{label}</span>
        </div>
        {checked && (
            <div className="absolute top-2 right-2 text-primary">
                <span className="icon-base text-lg">check_circle</span>
            </div>
        )}
    </label>
);

export default ProfileCourier;