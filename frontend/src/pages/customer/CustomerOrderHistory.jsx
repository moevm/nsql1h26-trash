import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 7;

    const [statusFilter, setStatusFilter] = useState('all');
    const [wasteTypeFilter, setWasteTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');


    const fetchOrders = async () => {
        try {
            const skip = currentPage * itemsPerPage;
            let url = `/api/v1/orders/my?skip=${skip}&limit=${itemsPerPage}&sort_by=${sortBy}&sort_order=${sortOrder}`;

            if (statusFilter !== 'all') {
                url += `&status_m=${statusFilter}`;
            }

            if (wasteTypeFilter !== 'all') {
                url += `&waste_type=${wasteTypeFilter}`;
            }

            const response = await fetch(url, {
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

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter, wasteTypeFilter, sortBy, sortOrder]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(0);
    };

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

                            <div className="relative flex items-center bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined text-[20px] text-slate-500 ml-3">filter_list</span>
                                <select
                                    className="bg-transparent py-2 pl-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none cursor-pointer appearance-none"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="searching">В поиске</option>
                                    <option value="active">Активные</option>
                                    <option value="done">Выполненные</option>
                                </select>
                                <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-2 pointer-events-none">expand_more</span>
                            </div>

                            <div className="relative flex items-center bg-slate-50 rounded-lg border border-slate-200">
                                <span className="material-symbols-outlined text-[20px] text-slate-500 ml-3">recycling</span>
                                <select
                                    className="bg-transparent py-2 pl-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none cursor-pointer appearance-none"
                                    value={wasteTypeFilter}
                                    onChange={(e) => { setWasteTypeFilter(e.target.value); setCurrentPage(0); }}
                                >
                                    <option value="all">Любой тип мусора</option>
                                    <option value="Бытовой">Бытовой</option>
                                    <option value="Строительный">Строительный</option>
                                    <option value="Мебель">Мебель</option>
                                </select>
                                <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-2 pointer-events-none">expand_more</span>
                            </div>

                            <div className="relative flex items-center bg-slate-50 rounded-lg border border-slate-200">
                                <span className="material-symbols-outlined text-[20px] text-slate-500 ml-3">sort</span>
                                <select
                                    className="bg-transparent py-2 pl-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none cursor-pointer appearance-none"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="created_at">По дате</option>
                                    <option value="price">По цене</option>
                                    <option value="waste_type">По типу</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="px-2 text-slate-500 hover:text-primary transition-colors"
                                    title="Сменить направление сортировки"
                                >
                                <span className="material-symbols-outlined text-[20px]">
                                    {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                                </button>
                            </div>
                            <div className="group relative flex items-center">
                                <span className="material-symbols-outlined text-[18px] text-slate-400 cursor-help hover:text-slate-600 transition-colors">
                                    help
                                </span>
                                <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-center text-[11px] font-medium text-white opacity-0 shadow-xl transition-all group-hover:opacity-100 pointer-events-none z-20">
                                    Вы можете нажать на кнопку "По дате" и там появиться список полей, по которым можно произвести сортировку
                                    <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                </div>
                            </div>
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
                                    <th className="px-6 py-4">Статус заказа</th>
                                    <th className="px-6 py-4">Тип мусора</th>
                                    <th className="px-6 py-4">Адрес</th>
                                    <th className="px-6 py-4 text-right">Стоимость</th>
                                    <th className="px-6 py-4 text-center">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => (
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
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.waste_type} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px]">
                                            {order.address || "—"}
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
                                Страница <span className="font-medium text-slate-900">{currentPage + 1}</span>
                            </p>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    disabled={currentPage === 0}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Назад
                                </button>

                                <span className="px-4 py-2 border border-slate-300 bg-slate-50 text-sm font-bold text-primary">
                                    {currentPage + 1}
                                </span>

                                <button
                                    disabled={orders.length < itemsPerPage}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Вперед
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
        done: { text: 'Выполнено', color: 'bg-green-100 text-green-800' },
        'Мебель': { text: 'Мебель', color: 'bg-red-100 text-red-700 border border-red-200' },
        'Строительный': { text: 'Строительный', color: 'bg-orange-100 text-orange-700 border border-orange-200' },
        'Бытовой': { text: 'Бытовой', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' }
    };
    const c = config[status] || { text: status, color: 'bg-gray-100' };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
            {c.text}
        </span>
    );
};

export default OrderHistory;