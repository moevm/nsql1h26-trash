import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const CourierOrdersHistory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userName = location.state?.userName || "Алексей К.";

    const orders = [
        { id: '#4829', date: '12.10.2023', time: '14:30', type: 'Бытовой мусор', typeColor: 'bg-blue-400', address: 'ул. Ленина, 45, п. 3, эт. 4', reward: '350 ₽', status: 'Выполнен' },
        { id: '#4825', date: '12.10.2023', time: '10:15', type: 'Пластик', typeColor: 'bg-yellow-400', address: 'пр. Мира, 12, кв. 89', reward: '200 ₽', status: 'Выполнен' },
        { id: '#4818', date: '11.10.2023', time: '18:45', type: 'Стекло', typeColor: 'bg-red-400', address: 'ул. Гагарина, 5, п. 1', reward: '450 ₽', status: 'Выполнен' },
        { id: '#4812', date: '11.10.2023', time: '16:20', type: 'Бытовой мусор', typeColor: 'bg-blue-400', address: 'бул. Победы, 33, кв. 12', reward: '300 ₽', status: 'Выполнен' },
    ];

    return (
        <div className="flex h-screen bg-background-light overflow-hidden text-text-main">
            <Sidebar activePage="my-orders" userName={userName} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0 z-10">
                    <h2 className="text-2xl font-bold tracking-tight">История моих заказов</h2>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                        </span>
                        <input className="search-input" placeholder="Поиск заказа..." type="text" />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="table-wrapper">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr>
                                        <th className="table-head-cell">ID заказа</th>
                                        <th className="table-head-cell">Дата</th>
                                        <th className="table-head-cell">Тип мусора</th>
                                        <th className="table-head-cell">Адрес</th>
                                        <th className="table-head-cell text-right">Награда</th>
                                        <th className="table-head-cell text-center">Статус</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="table-row cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => navigate(`/order-history/${order.id.replace('#', '')}`, { state: { order, userName } })}
                                        >
                                            <td className="table-cell font-medium group-hover:text-primary transition-colors">
                                                {order.id}
                                            </td>
                                            <td className="table-cell text-slate-600">
                                                {order.date} <span className="text-slate-400 ml-1">{order.time}</span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${order.typeColor}`}></span>
                                                    <span className="font-medium">{order.type}</span>
                                                </div>
                                            </td>
                                            <td className="table-cell text-slate-600 truncate max-w-xs">{order.address}</td>
                                            <td className="table-cell text-right font-bold">{order.reward}</td>
                                            <td className="table-cell text-center">
                                                <span className="status-badge-success">{order.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Пагинация */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    Показано <span className="font-bold text-text-main">10</span> из <span className="font-bold text-text-main">45</span> заказов
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white transition-colors">Предыдущая</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-text-main font-bold text-sm">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors text-sm font-medium">2</button>
                                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white transition-colors">Следующая</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourierOrdersHistory;