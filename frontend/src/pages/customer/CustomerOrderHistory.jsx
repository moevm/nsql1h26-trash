import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/v1/orders/my', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (e) {
                console.error("Ошибка загрузки:", e);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);


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
                        <button className="group flex items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 text-[#0d1b0d] shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                onClick={() => navigate('/create-order')}>
                            <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">add_circle</span>
                            <span className="text-base font-black">Создать новый заказ</span>
                        </button>
                    </header>

                    {/* Filters + Controls */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Кнопка "За все время" */}
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200">
                                <span className="material-symbols-outlined text-[20px] text-slate-500">calendar_month</span>
                                За все время
                                <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                            </button>

                            {/* Кнопка "Тип мусора" */}
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200">
                                <span className="material-symbols-outlined text-[20px] text-slate-500">recycling</span>
                                Тип мусора
                                <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                            </button>

                            <div className="relative flex items-center bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-[20px] text-slate-500 ml-3">filter_list</span>
                                <select
                                    className="bg-transparent py-2 pl-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none cursor-pointer appearance-none"
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="searching">В поиске</option>
                                    <option value="active">Активные</option>
                                    <option value="done">Выполненные</option>
                                </select>
                                <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-2 pointer-events-none">expand_more</span>
                            </div>
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
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order._key}
                                        onClick={() => navigate(`/order/${order._key}`)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">#{order._key?.substring(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm">
                <span className="text-slate-900 font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px]">
                                            {order.address || "—"}
                                        </td>

                                        <td className="px-6 py-4">
                                            {order.status === 'searching' ? (
                                                <span className="text-slate-400 font-medium italic">—</span>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-full border border-slate-200 overflow-hidden bg-slate-100`}>
                                                        <img src={`https://ui-avatars.com/api/?name=${order.client_name || 'Courier'}&background=42f042`} alt="courier" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">
                            {order.client_name || "Курьер"}
                        </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right font-bold text-slate-900">{order.price} ₽</td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined">chevron_right</span>
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

const StatusBadge = ({ status }) => {
    const config = {
        searching: { text: 'Поиск', color: 'bg-amber-100 text-amber-800' },
        active: { text: 'В работе', color: 'bg-blue-100 text-blue-800' },
        done: { text: 'Выполнено', color: 'bg-green-100 text-green-800' }
    };
    const c = config[status] || { text: status, color: 'bg-gray-100' };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
            {c.text}
        </span>
    );
};

export default OrderHistory;