import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';

const OrderHistory = () => {
    const navigate = useNavigate();
    const orders = [
        {
            id: '12345',
            date: '10 Окт',
            time: '14:30',
            type: 'Строительный',
            address: 'ул. Ленина 10, кв. 45',
            courier: 'Алексей',
            amount: '5 000 ₽',
            statusColor: 'amber'
        },
        {
            id: '12344',
            date: '08 Окт',
            time: '09:15',
            type: 'Бытовой',
            address: 'ул. Пушкина 5',
            courier: 'Сергей',
            amount: '1 500 ₽',
            statusColor: 'green'
        },
    ];

    return (
        <div className="flex min-h-screen w-full flex-col md:flex-row bg-[#f6f8f6] font-display text-[#111811] antialiased">
            <SidebarCustomer activePage="/customer-history" />

            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background-light">
                <div className="container mx-auto px-6 py-8 max-w-7xl">

                    {/* Header */}
                    <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">История заказов</h2>
                            <p className="text-slate-500 mt-1">Отслеживайте статус и историю ваших заявок</p>
                        </div>
                        <button className="bg-[#13ec13] hover:bg-[#0eb50e] text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">add</span>
                            Новый заказ
                        </button>
                    </header>

                    {/* Filters + Controls */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            {['calendar_month', 'recycling', 'filter_list'].map((icon, idx) => (
                                <button key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200">
                                    <span className="material-symbols-outlined text-[20px] text-slate-500">{icon}</span>
                                    {idx === 0 ? 'За все время' : idx === 1 ? 'Тип мусора' : 'Статус'}
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                            </span>
                            <input
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Поиск по ID или адресу..." type="text"
                            />
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <th className="px-6 py-4">ID Заказа</th>
                                    <th className="px-6 py-4">Дата и время</th>
                                    <th className="px-6 py-4">Тип мусора</th>
                                    <th className="px-6 py-4">Адрес</th>
                                    <th className="px-6 py-4">Курьер</th>
                                    <th className="px-6 py-4 text-right">Стоимость</th>
                                    <th className="px-6 py-4 text-center">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => navigate(`/order/${order.id}`)} // Используйте react-router-dom
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-medium">{order.date}</span>
                                                <span className="text-xs text-slate-500">{order.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge type={order.type} color={order.statusColor} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={order.address}>
                                            {order.address}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-200"></div>
                                                <span className="text-sm font-medium text-slate-700">{order.courier}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{order.amount}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-slate-400 hover:text-primary transition-colors p-1">
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Показано <span className="font-medium text-slate-900">1</span> - <span className="font-medium text-slate-900">10</span> из <span className="font-medium text-slate-900">97</span> результатов
                            </p>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button className="px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 flex items-center">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    <span className="ml-1">Назад</span>
                                </button>
                                {[1, 2, 3, '...', 10].map((p, i) => (
                                    <button key={i} className={`px-4 py-2 border text-sm font-medium ${p === 1 ? 'z-10 bg-primary/10 border-primary text-primary-dark font-bold' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                                        {p}
                                    </button>
                                ))}
                                <button className="px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 flex items-center">
                                    <span className="mr-1">Вперед</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatusBadge = ({ type, color }) => {
    const styles = {
        amber: 'bg-amber-100 text-amber-800 border-amber-200',
        green: 'bg-green-100 text-green-800 border-green-200',
        red: 'bg-red-100 text-red-800 border-red-200',
        purple: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[color] || styles.green}`}>
            {type}
        </span>
    );
};

export default OrderHistory;