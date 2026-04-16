import React from 'react';
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="dashboard" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Сводка системы</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-tight">Администратор</p>
                                <p className="text-xs text-[#586458]">Система</p>
                            </div>
                            <div
                                className="size-10 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-[#42f042]/50"
                                style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=Admin&background=42f042&color=0d1b0d')" }}
                            />
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 flex-col p-8 w-full gap-6">

                    {/* ArangoDB Control Panel (Light Accent) */}
                    <div className="bg-[#e7f3e7] rounded-xl border border-[#42f042]/30 shadow-sm p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 text-[#42f042]/20 rotate-12 pointer-events-none">
                            <span className="material-symbols-outlined" style={{ fontSize: '150px' }}>database</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-[#0d1b0d] text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-700">storage</span> Управление данными (ArangoDB)
                            </h3>
                            <p className="text-sm text-[#586458] mt-1">Массовый экспорт и импорт всех коллекций приложения (JSON)</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto relative z-10">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#0d1b0d] font-bold py-2.5 px-5 rounded-lg border border-[#e7f3e7] transition-colors">
                                <span className="material-symbols-outlined text-sm">download</span> Дамп
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#42f042] hover:bg-[#36c936] text-[#0d1b0d] font-bold py-2.5 px-5 rounded-lg shadow-sm shadow-[#42f042]/20 transition-all">
                                <span className="material-symbols-outlined text-sm">upload</span> Загрузить
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon="receipt_long" label="Заказов сегодня" value="24" colorClass="bg-blue-100 text-blue-600" />
                        <StatCard icon="directions_car" label="Курьеров на линии" value="8 / 12" colorClass="bg-green-100 text-green-600" />
                        <StatCard icon="delete" label="Вывезено сегодня" value="145 м³" colorClass="bg-orange-100 text-orange-600" />
                    </div>

                    {/* Activity Feed */}
                    <div className="flex-1 min-h-[400px]">
                        <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm flex flex-col h-full">
                            <div className="p-5 border-b border-[#e7f3e7]">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#4c9a4c]">history</span> Лента событий
                                </h3>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="relative border-l-2 border-[#e7f3e7] ml-4 space-y-8">
                                    <TimelineItem icon="check" title="Заказ ORD-1042 выполнен" desc="Курьер: Михаил В. • 10 минут назад" iconColor="bg-green-100 text-green-600" />
                                    <TimelineItem icon="add" title="Новая заявка на вывоз" desc="Клиент: Елена С. • Строительный мусор • 25 минут назад" iconColor="bg-blue-100 text-blue-600" />
                                    <TimelineItem icon="person_add" title="Регистрация нового клиента" desc="ИП Смирнов А.А. • 1 час назад" iconColor="bg-orange-100 text-orange-600" />
                                </div>
                            </div>
                            <div className="p-4 border-t border-[#e7f3e7] text-center bg-[#f8fcf8] rounded-b-xl">
                                <button className="text-sm font-bold text-[#4c9a4c] hover:text-green-700 transition-colors">Загрузить предыдущие события</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, colorClass }) => (
    <div className="bg-white rounded-xl border border-[#e7f3e7] p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`flex items-center justify-center rounded-lg size-12 ${colorClass}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
            <p className="text-sm font-medium text-[#586458]">{label}</p>
            <p className="text-2xl font-bold text-[#0d1b0d]">{value}</p>
        </div>
    </div>
);

const TimelineItem = ({ icon, title, desc, iconColor }) => (
    <div className="relative pl-8">
        <span className={`absolute -left-[17px] top-0 flex size-8 items-center justify-center rounded-full ring-4 ring-white ${iconColor}`}>
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </span>
        <p className="text-base font-bold text-[#0d1b0d]">{title}</p>
        <p className="text-sm text-[#586458] mt-1">{desc}</p>
    </div>
);

export default AdminDashboard;