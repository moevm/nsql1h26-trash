import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminOrders = () => {
    const token = localStorage.getItem('access_token');

    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [limit] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        order_id: '',
        status: '',
        waste_type: '',
        address: '',
        client_name: '',
    });

    const [appliedFilters, setAppliedFilters] = useState(filters);

    const fetchOrders = async (currentFilters, page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            const offset = (page - 1) * limit;
            params.set('offset', offset);
            params.set('limit', limit);

            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    params.set(key, value);
                }
            });

            const res = await fetch(`/api/v1/admin/orders?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Ошибка загрузки заказов');
            }

            const data = await res.json();
            setOrders(data.items || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error(e);
            setOrders([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(appliedFilters, currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedFilters, currentPage]);

    const handleApply = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        const emptyFilters = {
            order_id: '',
            status: '',
            waste_type: '',
            address: '',
            client_name: '',
        };
        setFilters(emptyFilters);
        setCurrentPage(1);
        setAppliedFilters(emptyFilters);
    };
    const hasInputs = Object.values(filters).some(val => val !== '');
    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="orders" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Управление заказами</h2>
                    <div className="text-sm text-[#586458]">Всего: {total}</div>
                </header>

                <div className="flex flex-1 flex-col p-8 w-full gap-6">

                    {/* Многокритериальный фильтр */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#4c9a4c]">filter_alt</span>
                            <h3 className="font-bold">Многокритериальный фильтр</h3>
                        </div>
                        <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">ID Заказа</label>
                                <input
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    placeholder="Подстрока ID"
                                    value={filters.order_id}
                                    onChange={(e) => setFilters((p) => ({ ...p, order_id: e.target.value }))}
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Статус</label>
                                <select
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    value={filters.status}
                                    onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                                >
                                    <option value="">Все статусы</option>
                                    <option value="searching">Поиск курьера</option>
                                    <option value="active">В работе</option>
                                    <option value="done">Выполнен</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Тип мусора</label>
                                <select
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    value={filters.waste_type}
                                    onChange={(e) => setFilters((p) => ({ ...p, waste_type: e.target.value }))}
                                >
                                    <option value="">Все типы</option>
                                    <option value="Бытовой">Бытовой</option>
                                    <option value="Строительный">Строительный</option>
                                    <option value="Мебель">Мебель</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Адрес (подстрока)</label>
                                <input
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    value={filters.address}
                                    onChange={(e) => setFilters((p) => ({ ...p, address: e.target.value }))}
                                    placeholder="Невский"
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Клиент (подстрока)</label>
                                <input
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    value={filters.client_name}
                                    onChange={(e) => setFilters((p) => ({ ...p, client_name: e.target.value }))}
                                    placeholder="Иван"
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1 flex items-end gap-2">
                                {/* Кнопка сброса */}
                                {hasInputs && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="flex-1 bg-white hover:bg-red-50 text-red-500 font-bold py-2 rounded-lg border border-[#e7f3e7] transition-colors flex items-center justify-center"
                                        title="Очистить все поля"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="flex-[3] bg-[#f0f7f0] hover:bg-[#42f042]/20 text-[#0d1b0d] font-bold py-2 rounded-lg border border-[#e7f3e7] transition-colors"
                                >
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7f3e7]">
                                    {loading ? (
                                        <tr>
                                            <td className="px-6 py-8 text-[#586458]" colSpan={5}>Загрузка...</td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td className="px-6 py-8 text-[#586458]" colSpan={5}>Заказы не найдены</td>
                                        </tr>
                                    ) : orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-[#f8fcf8] transition-colors">
                                            <td className="px-6 py-4 font-bold text-[#4c9a4c]">{order.id}</td>
                                            <td className="px-6 py-4 text-[#586458]">
                                                {order.created_at ? new Date(order.created_at).toLocaleString('ru-RU') : '-'}
                                            </td>
                                            <td className="px-6 py-4 font-medium">{order.client_name || '—'}</td>
                                            <td className={`px-6 py-4 ${!order.courier_name ? 'text-[#a0aead] italic' : ''}`}>
                                                {order.courier_name || 'Не назначен'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusStyles(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e7f3e7] bg-[#f8fcf8]">
                                <div className="text-xs text-[#586458]">
                                    Страница <b>{currentPage}</b> из <b>{totalPages}</b>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        disabled={currentPage === 1 || loading}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#e7f3e7] bg-white disabled:opacity-30 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages || loading}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#e7f3e7] bg-white disabled:opacity-30 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
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
        case 'searching':
            return 'bg-yellow-100 text-yellow-800';
        case 'active':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'done':
            return 'Выполнен';
        case 'active':
            return 'В работе';
        case 'searching':
            return 'Поиск курьера';
        default:
            return status;
    }
};

export default AdminOrders;