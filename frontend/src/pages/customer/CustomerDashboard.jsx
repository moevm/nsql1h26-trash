import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './SidebarCustomer.jsx';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f8f6] font-display">
            <Sidebar activePage="orders" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-white sticky top-0 z-10 shrink-0">
                    <h2 className="text-3xl font-bold text-[#0d1b0d]">Мои заказы</h2>

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

                {/* Content */}
                <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">

                    <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-[#e7f3e7] to-white rounded-2xl p-8 border border-[#d4ebd4] shadow-sm">
                        <div className="flex flex-col gap-2 max-w-xl">
                            <h2 className="text-3xl font-black tracking-tight text-[#0d1b0d]">Управление вывозом</h2>
                            <p className="text-[#4c9a4c] font-medium text-lg">Создавайте заявки на вывоз мусора в пару кликов.</p>
                        </div>
                        <button className="group flex items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 text-[#0d1b0d] shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                onClick={() => navigate('/create-order')}>
                            <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">add_circle</span>
                            <span className="text-base font-black">Создать новый заказ</span>
                        </button>
                    </section>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon="local_shipping" label="В пути" value="1 заказ" color="blue" />
                        <StatCard icon="check_circle" label="Выполнено" value="12" color="green" />
                        <StatCard icon="payments" label="Потрачено" value="4 200 ₽" color="purple" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-sm font-black uppercase tracking-widest text-[#586458]">Текущий вывоз</h4>
                            <button className="text-xs font-bold text-primary-hover hover:underline">Вся история</button>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#e7f3e7] shadow-sm overflow-hidden">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8">
                                <div className="space-y-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                            Машина в пути
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-[#0d1b0d]">Заказ #4832</span>
                                            {/* Добавленная фраза */}
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-[#586458] bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                <span className="material-symbols-outlined text-[14px] text-[#4c9a4c]">schedule</span>
                                                прибудет через: <span className="text-[#0d1b0d]">15 минут</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="courier" />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#0d1b0d]">Курьер: Михаил</p>
                                            <p className="text-xs font-bold text-[#586458]">⭐ 4.9 • ГАЗель (А123БВ)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-3 md:border-l border-[#e7f3e7] md:pl-8 min-w-[200px]">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#586458] font-bold">Тип:</span>
                                        <span className="font-black">Крупногабарит</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#586458] font-bold">Объем:</span>
                                        <span className="font-black">~ 2 м³</span>
                                    </div>
                                    <div className="pt-3 mt-1 border-t border-[#e7f3e7] flex justify-between items-center">
                                        <span className="text-xs font-black uppercase text-[#586458]">К оплате:</span>
                                        <span className="text-2xl font-black text-green-600">1 200 ₽</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-[#f8fcf8] border-t border-[#e7f3e7] flex justify-end">
                                <button className="flex items-center gap-2 text-sm font-black text-[#4c9a4c] hover:text-[#0d1b0d] transition-colors">
                                    <span className="material-symbols-outlined">my_location</span>
                                    Отследить на карте
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600'
    };
    return (
        <div className="bg-white p-6 rounded-2xl border border-[#e7f3e7] shadow-sm flex items-center gap-4">
            <div className={`flex items-center justify-center size-12 rounded-xl ${colors[color]}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-[10px] font-black text-[#586458] uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-[#0d1b0d]">{value}</p>
            </div>
        </div>
    );
};

export default CustomerDashboard;