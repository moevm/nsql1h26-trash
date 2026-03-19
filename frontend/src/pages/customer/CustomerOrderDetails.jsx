import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';

const CustomerOrderDetails = () => {
    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen w-full bg-[#f8fcf8] font-display text-[#0d1b0d] antialiased">
            <SidebarCustomer activePage="/customer-history" />

            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-white sticky top-0 z-10 shrink-0">
                    <h2 className="text-s text-[#0d1b0d]">Главная/История/Заказ №12345</h2>

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
                <div className="container mx-auto px-6 py-8 max-w-6xl">

                    <nav className="mb-6">
                        <button className="flex items-center gap-2 text-[#586458] hover:text-[#0d1b0d] transition-colors font-bold text-sm"
                                onClick={() => navigate(`/customer-history`)} >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Назад к списку заказов
                        </button>
                    </nav>

                    {/* Заголовок заказа */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight">Заказ №12345</h1>
                                <span className="bg-[#42f042]/20 text-[#2da32d] border border-[#42f042]/30 px-3 py-1 rounded-full text-xs font-black uppercase">
                                    Выполнено
                                </span>
                            </div>
                            <p className="text-[#586458] mt-1 font-medium">Создан 10 октября 2024, 14:30</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Основная информация */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Инфо-карточка */}
                            <section className="bg-white rounded-xl border border-[#e7f3e7] p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#42f042]">info</span>
                                    Информация о вывозе
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                    <InfoField label="Тип мусора" value="Строительный" />
                                    <InfoField label="Объем" value="5 м³ (~450 кг)" />
                                    <InfoField label="Адрес" value="ул. Ленина 10, кв. 45" />
                                    <InfoField label="Тип услуги" value="С погрузкой" />
                                </div>
                            </section>

                        </div>

                        {/* Курьер и Деньги */}
                        <div className="space-y-6">

                            {/* Карточка курьера */}
                            <section className="bg-white rounded-xl border border-[#e7f3e7] p-6 shadow-sm text-center">
                                <h2 className="text-sm font-black uppercase tracking-widest text-[#586458] mb-6 text-left">Ваш курьер</h2>
                                <div className="size-24 rounded-full bg-slate-100 mx-auto mb-4 border-4 border-[#f8fcf8] shadow-sm overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=Alexey+Petrov&background=42f042&color=0d1b0d" alt="courier" />
                                </div>
                                <h3 className="text-xl font-bold mb-1">Алексей Петров</h3>
                                <p className="text-sm text-[#586458] mb-4">Газель (А 777 ББ 177)</p>
                                <div className="flex items-center justify-center gap-1.5 py-2 px-4 bg-[#f8fcf8] rounded-full w-fit mx-auto">
                                    <span className="material-symbols-outlined text-amber-500 filled text-lg">star</span>
                                    <span className="font-bold text-[#0d1b0d]">4.9</span>
                                    <span className="text-[#a0aead] text-xs font-medium">(124 заказа)</span>
                                </div>
                            </section>

                            {/* Финансовый отчет */}
                            <section className="bg-white rounded-xl border border-[#e7f3e7] p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#42f042]">receipt_long</span>
                                    Финансовый отчёт
                                </h2>
                                <div className="h-px bg-[#e7f3e7] my-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold">Стоимость услуги</span>
                                    <span className="text-2xl font-black text-[#42f042]">5 000 ₽</span>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-xs font-bold text-[#586458] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-bold text-[#0d1b0d]">{value}</p>
    </div>
);

const TimelineStep = ({ title, desc, time, active = false }) => (
    <div className="flex gap-4 relative z-10">
        <div className={`size-[24px] rounded-full border-4 border-white flex items-center justify-center shadow-sm ${active ? 'bg-[#42f042]' : 'bg-[#e7f3e7]'}`}>
            {active && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <p className={`font-bold ${active ? 'text-[#0d1b0d]' : 'text-[#586458]'}`}>{title}</p>
                <span className="text-xs font-bold text-[#a0aead]">{time}</span>
            </div>
            <p className="text-sm text-[#586458] mt-0.5">{desc}</p>
        </div>
    </div>
);

export default CustomerOrderDetails;