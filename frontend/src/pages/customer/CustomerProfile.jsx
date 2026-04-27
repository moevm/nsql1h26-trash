import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';
import { useAuth } from '../../AuthContext.jsx';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    console.log("Данные пользователя из контекста:", user);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('/api/v1/client/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                setFormData({
                    firstName: data.full_name?.split(' ')[0] || '',
                    lastName: data.full_name?.split(' ')[1] || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    address: data.address || ''
                });

                updateUser(data);
            } catch (error) {
                console.error("Ошибка загрузки профиля:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const dataToSave = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address
        };

        try {
            const res = await fetch('/api/v1/client/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(dataToSave)
            });

            if (res.ok) {
                updateUser({
                    full_name: `${formData.firstName} ${formData.lastName}`,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address
                });
                alert("Профиль успешно обновлен!");
            } else {
                const err = await res.json();
                alert(err.detail || "Ошибка при сохранении");
            }
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            alert("Произошла ошибка при сохранении профиля");
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="flex min-h-screen w-full bg-[#f8fcf8] font-display text-[#0d1b0d] antialiased">
            <SidebarCustomer activePage="customer-profile" />

            <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto">
                {/* Header*/}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-white sticky top-0 z-10 shrink-0">
                    <h2 className="text-3xl font-bold text-[#0d1b0d]">Мой профиль</h2>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 rounded-full bg-[#f8fcf8] border border-[#e7f3e7] px-4 py-1.5 shadow-sm">
                            <span className="text-[10px] font-black uppercase text-[#4c9a4c] tracking-widest">Баланс</span>
                            <span className="text-sm font-bold text-[#0d1b0d]">1 250 ₽</span>
                            <button className="ml-2 flex size-5 items-center justify-center rounded-full bg-primary text-[#0d1b0d] hover:scale-110 transition-transform"
                                    onClick={() => navigate('/top-up-balance')}>
                                <span className="material-symbols-outlined text-[16px] font-bold">add</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-[#0d1b0d] leading-tight">{user?.full_name || "Пользователь"}</p>
                                <p className="text-[10px] font-bold text-[#586458] uppercase tracking-tighter">Частный клиент</p>
                            </div>
                            <div className="size-10 rounded-full bg-slate-200 border-2 border-white shadow-sm"
                                 style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=Aleksey')`, backgroundSize: 'cover' }}>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Основной контент */}
                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl border border-[#e7f3e7] shadow-sm p-8 sm:p-12">

                            {/* Секция редактирования фото */}
                            <div className="flex flex-col items-center gap-6 mb-10">
                                <div className="relative group">
                                    <div className="size-32 rounded-full ring-4 ring-[#e7f3e7] overflow-hidden bg-slate-50">
                                        <img src="https://ui-avatars.com/api/?name=Alex+P&size=128&background=42f042&color=0d1b0d" alt="Large Avatar" />
                                    </div>
                                    <button className="absolute bottom-1 right-1 flex items-center justify-center rounded-full bg-[#42f042] text-[#0d1b0d] p-2 hover:bg-[#36c936] shadow-md transition-all hover:scale-110">
                                        <span className="material-symbols-outlined text-xl font-bold">photo_camera</span>
                                    </button>
                                </div>
                                <button className="text-sm font-bold bg-[#f0f7f0] px-4 py-2 rounded-lg border border-[#e7f3e7] hover:bg-[#e7f3e7] transition-colors">
                                    Изменить фото
                                </button>
                            </div>

                            {/* Форма личных данных */}
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup
                                        label="Имя"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    />
                                    <InputGroup
                                        label="Фамилия"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup
                                        label="Номер телефона"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                    <InputGroup
                                        label="Электронная почта"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a0aead]">location_on</span>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a0aead]">location_on</span>
                                            <InputGroup
                                                label="Адрес проживания"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Футер формы */}
                                <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-[#e7f3e7] mt-8">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/change-password')} // Обработчик клика
                                        className="text-sm font-bold text-text-secondary hover:text-text-main flex items-center gap-2 transition-colors group"
                                    >
                                        <span className="icon-base text-lg group-hover:rotate-180 transition-transform duration-500">lock_reset</span>
                                        Сменить пароль
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleSave}
                                        className="w-full sm:w-auto bg-[#42f042] hover:bg-[#36c936] text-[#0d1b0d] font-bold py-3.5 px-10 rounded-xl shadow-lg shadow-[#42f042]/20 transition-all hover:-translate-y-0.5"
                                    >
                                        Сохранить изменения
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Компонент поля ввода
const InputGroup = ({ label, type = "text", value, onChange, icon }) => (
    <div className="space-y-2 relative">
        <label className="block text-sm font-medium text-[#586458] ml-1">
            {label}
        </label>

        <div className="relative">
            {icon && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a0aead] z-10">
                    {icon}
                </span>
            )}

            <input
                type={type}
                value={value}
                onChange={onChange}
                className={`w-full rounded-xl border border-[#e7f3e7] bg-[#f8fcf8] py-3.5 outline-none focus:border-[#42f042] transition-all 
                           ${icon ? 'pl-12 pr-4' : 'px-4'}`} // Динамический отступ: pl-12 если есть иконка
            />
        </div>
    </div>
);

export default CustomerProfile;