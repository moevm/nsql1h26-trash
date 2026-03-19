import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';

const CustomerProfile = () => {
    const navigate = useNavigate();
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
                                <p className="text-sm font-bold text-[#0d1b0d] leading-tight">Алексей П.</p>
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
                                    <InputGroup label="Имя" defaultValue="Алексей" />
                                    <InputGroup label="Фамилия" defaultValue="Петров" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Номер телефона" type="tel" defaultValue="+7 (912) 345-67-89" />
                                    <InputGroup label="Электронная почта" type="email" defaultValue="alex.petrov@example.com" />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[#586458] ml-1">Адрес проживания</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a0aead]">location_on</span>
                                        <input
                                            className="w-full rounded-xl border border-[#e7f3e7] bg-[#f8fcf8] pl-11 pr-4 py-3.5 outline-none focus:border-[#42f042] focus:ring-1 focus:ring-[#42f042] transition-all text-[#0d1b0d]"
                                            defaultValue="ул. Ленина, д. 45, кв. 12"
                                        />
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
const InputGroup = ({ label, type = "text", defaultValue }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-[#586458] ml-1">{label}</label>
        <input
            type={type}
            defaultValue={defaultValue}
            className="w-full rounded-xl border border-[#e7f3e7] bg-[#f8fcf8] px-4 py-3.5 outline-none focus:border-[#42f042] focus:ring-1 focus:ring-[#42f042] transition-all text-[#0d1b0d] placeholder-[#a0aead]"
        />
    </div>
);

export default CustomerProfile;