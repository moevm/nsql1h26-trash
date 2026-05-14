import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import React, { useState, useEffect } from 'react';

const CourierOrdersHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const userName = location.state?.userName || "Алексей К.";
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const wasteColors = {
        'Мебель': 'bg-red-400',
        'Строительный': 'bg-amber-500',
        'Бытовой': 'bg-green-500',
        'default': 'bg-blue-400'
    };
    const [totalOrders, setTotalOrders] = useState(0);
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedWasteType, setSelectedWasteType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const fetchOrders = async (params = {}) => {
        const {
            page = currentPage,
            query = searchQuery,
            wasteType = selectedWasteType,
            status = selectedStatus,
            sort = sortOrder
        } = params;

        const token = localStorage.getItem('access_token');
        setLoading(true);

        try {
            const skip = (page - 1) * itemsPerPage;
            const searchParams = new URLSearchParams({
                skip: skip,
                limit: itemsPerPage,
                sort: sort
            });

            if (query) searchParams.append('search', query);
            if (wasteType) searchParams.append('waste_type', wasteType);
            if (status) searchParams.append('status', status);

            const response = await fetch(`/api/v1/courier/my-orders?${searchParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            setOrders(data.orders || []);
            setTotalOrders(data.total || 0);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSort = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);
        setCurrentPage(1);
        fetchOrders({ page: 1, sort: newOrder });
    };


    useEffect(() => {
        setCurrentPage(1);
        fetchOrders({ page: 1 });
    }, [selectedWasteType, selectedStatus]);

    const handleReset = () => {
        setSearchQuery('');
        setSelectedWasteType('');
        setSelectedStatus('');
        setCurrentPage(1);
        fetchOrders({
            page: 1,
            query: '',
            wasteType: '',
            status: ''
        });
    };

    const isFiltered = searchQuery !== '' || selectedWasteType !== '' || selectedStatus !== '';
    return (
        <div className="flex h-screen bg-background-light overflow-hidden text-text-main">
            <Sidebar activePage="my-orders" />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold tracking-tight">История моих заказов</h2>

                        {isFiltered && (
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                                Сбросить фильтры
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                        </span>
                        <input
                            className="search-input"
                            placeholder="Поиск заказа..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                setCurrentPage(1);
                                fetchOrders({ page: 1, query: val });
                            }}
                        />
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
                                        <th
                                            className="table-head-cell cursor-pointer hover:text-primary transition-colors"
                                            onClick={toggleSort}
                                        >
                                            <div className="flex items-center gap-1">
                                                Дата
                                                <span className="material-symbols-outlined text-sm">
                                                    {sortOrder === 'desc' ? 'expand_more' : 'expand_less'}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="table-head-cell">
                                            <div className="flex items-center gap-2">
                                                <span>Тип мусора</span>
                                                <select
                                                    value={selectedWasteType}
                                                    onChange={(e) => setSelectedWasteType(e.target.value)}
                                                    className="bg-transparent border-none text-[10px] font-bold text-primary cursor-pointer focus:ring-0 p-0 w-4"
                                                >
                                                    <option value="">Все</option>
                                                    <option value="Мебель">Мебель</option>
                                                    <option value="Строительный">Строительный</option>
                                                    <option value="Бытовой">Бытовой</option>
                                                </select>
                                            </div>
                                        </th>
                                        <th className="table-head-cell">Адрес</th>
                                        <th className="table-head-cell text-right">Награда</th>
                                        <th className="table-head-cell text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Статус</span>
                                                <select
                                                    value={selectedStatus}
                                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                                    className="bg-transparent border-none text-[10px] font-bold text-primary cursor-pointer focus:ring-0 p-0 w-4"
                                                >
                                                    <option value="">Все</option>
                                                    <option value="active">В работе</option>
                                                    <option value="done">Выполнен</option>
                                                </select>
                                            </div>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="table-row cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => navigate(`/order-details/${order.id}`, { state: { order, userName } })}
                                        >
                                            <td className="table-cell font-medium">#{order.id}</td>
                                            <td className="table-cell text-slate-600">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${wasteColors[order.waste_type] || wasteColors['default']}`}></span>
                                                    <span className="font-medium">{order.waste_type}</span>
                                                </div>
                                            </td>
                                            <td className="table-cell text-slate-600 truncate max-w-xs">{order.address}</td>
                                            <td className="table-cell text-right font-bold">{order.price} ₽</td>
                                            <td className="table-cell text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    order.status === 'done'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.status === 'done' ? 'Выполнен' : 'В работе'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Пагинация */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    Показано <span className="font-bold text-text-main">
                                        {orders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                    </span> - <span className="font-bold text-text-main">
                                        {(currentPage - 1) * itemsPerPage + orders.length}
                                    </span> из <span className="font-bold text-text-main">{totalOrders}</span> заказов
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => {
                                            const newPage = currentPage - 1;
                                            setCurrentPage(newPage);
                                            fetchOrders({ page: newPage });
                                        }}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white transition-colors disabled:opacity-50"
                                    >
                                        Предыдущая
                                    </button>

                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-text-main font-bold text-sm">
                                        {currentPage}
                                    </button>

                                    <button
                                        disabled={currentPage >= Math.ceil(totalOrders / itemsPerPage)}
                                        onClick={() => {
                                            const newPage = currentPage + 1;
                                            setCurrentPage(newPage);
                                            fetchOrders({ page: newPage });
                                        }}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white transition-colors disabled:opacity-50"
                                    >
                                        Следующая
                                    </button>
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