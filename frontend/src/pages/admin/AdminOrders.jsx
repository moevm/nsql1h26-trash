import React from 'react';
import AdminSidebar from "./AdminSidebar";

const AdminOrders = () => {
    // Пример данных о заказах
    const orders = [
        {
            id: "ORD-1042",
            created: "20.10.2024 14:30",
            updated: "20.10.2024 16:15",
            client: "Алексей П.",
            courier: "Михаил В.",
            status: "done",
            statusLabel: "Выполнен"
        },
        {
            id: "ORD-1043",
            created: "21.10.2024 09:10",
            updated: "-",
            client: "Елена С.",
            courier: "Не назначен",
            status: "pending",
            statusLabel: "Ожидает"
        },
        {
            id: "ORD-1044",
            created: "21.10.2024 11:45",
            updated: "21.10.2024 12:00",
            client: "ИП Смирнов",
            courier: "Михаил В.",
            status: "progress",
            statusLabel: "В процессе"
        }
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="orders" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Управление заказами</h2>
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
                </header>

                <div className="flex flex-1 flex-col p-8 w-full gap-6">

                    {/* Многокритериальный фильтр */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#4c9a4c]">filter_alt</span>
                            <h3 className="font-bold">Многокритериальный фильтр</h3>
                        </div>
                        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">ID Заказа</label>
                                <input
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm focus:border-[#42f042] focus:ring-1 focus:ring-[#42f042] outline-none transition-all"
                                    placeholder="Например: ORD-123"
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Статус</label>
                                <select className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm focus:border-[#42f042] outline-none">
                                    <option value="">Все статусы</option>
                                    <option value="pending">Ожидает курьера</option>
                                    <option value="progress">В процессе</option>
                                    <option value="done">Выполнен</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Тип мусора</label>
                                <select className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm focus:border-[#42f042] outline-none">
                                    <option value="">Все типы</option>
                                    <option value="household">Бытовой</option>
                                    <option value="construction">Строительный</option>
                                    <option value="bulky">Крупногабаритный</option>
                                </select>
                            </div>
                            <div className="space-y-1 flex items-end">
                                <button type="button" className="w-full bg-[#f0f7f0] hover:bg-[#42f042]/20 text-[#0d1b0d] font-bold py-2 rounded-lg border border-[#e7f3e7] transition-colors">
                                    Применить фильтр
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Таблица заказов */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm overflow-hidden flex flex-col flex-1">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#f8fcf8] text-[#586458] border-b border-[#e7f3e7]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">ID</th>
                                    <th className="px-6 py-4 font-semibold">Создан</th>
                                    <th className="px-6 py-4 font-semibold">Клиент</th>
                                    <th className="px-6 py-4 font-semibold">Курьер</th>
                                    <th className="px-6 py-4 font-semibold">Статус</th>
                                    <th className="px-6 py-4 font-semibold text-right">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7f3e7]">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#f8fcf8] transition-colors">
                                        <td className="px-6 py-4 font-bold text-[#4c9a4c]">{order.id}</td>
                                        <td className="px-6 py-4 text-[#586458]">
                                            <div>{order.created.split(' ')[0]}</div>
                                            <div className="text-xs">{order.created.split(' ')[1]}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{order.client}</td>
                                        <td className={`px-6 py-4 ${order.courier === 'Не назначен' ? 'text-[#a0aead] italic' : ''}`}>
                                            {order.courier}
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusStyles(order.status)}`}>
                                                    {order.statusLabel}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[#586458] hover:text-[#42f042] transition-colors" title="Просмотр">
                                                <span className="material-symbols-outlined text-xl">visibility</span>
                                            </button>
                                            <button className="ml-3 text-[#586458] hover:text-[#0d1b0d] transition-colors" title="Редактировать">
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Пагинация */}
                        <div className="px-6 py-4 border-t border-[#e7f3e7] flex items-center justify-between bg-white mt-auto">
                            <span className="text-sm text-[#586458]">Показано 1-3 из 156 заказов</span>
                            <div className="flex gap-1">
                                <button className="p-1 rounded bg-[#f8fcf8] text-[#a0aead] border border-[#e7f3e7]" disabled>
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <button className="px-3 py-1 text-sm rounded bg-[#42f042] text-[#0d1b0d] font-bold">1</button>
                                <button className="px-3 py-1 text-sm rounded hover:bg-[#f0f7f0] transition-colors">2</button>
                                <button className="px-3 py-1 text-sm rounded hover:bg-[#f0f7f0] transition-colors">3</button>
                                <button className="p-1 rounded bg-[#f8fcf8] hover:bg-[#e7f3e7] border border-[#e7f3e7] transition-colors">
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Вспомогательная функция для стилизации статусов
const getStatusStyles = (status) => {
    switch (status) {
        case 'done':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'progress':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default AdminOrders;