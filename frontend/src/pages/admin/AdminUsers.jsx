import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminUsers = () => {
    const token = localStorage.getItem('access_token');

    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: '',
        is_active: '',
    });

    const [appliedFilters, setAppliedFilters] = useState(filters);

    const roleLabel = useMemo(() => ({
        admin: 'Администратор',
        courier: 'Курьер',
        customer: 'Заказчик',
    }), []);

    const fetchUsers = async (currentFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    params.set(key, value);
                }
            });

            const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Ошибка загрузки пользователей');
            }

            const data = await res.json();
            setUsers(data.items || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error(e);
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(appliedFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedFilters]);

    const handleApply = (e) => {
        e.preventDefault();
        setAppliedFilters(filters);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="users" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Управление пользователями</h2>
                    <div className="text-sm text-[#586458]">Всего: {total}</div>
                </header>

                <div className="flex flex-1 flex-col p-8 w-full gap-6">

                    {/* Фильтры */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#4c9a4c]">filter_alt</span>
                            <h3 className="font-bold">Многокритериальный фильтр</h3>
                        </div>
                        <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div className="space-y-1 lg:col-span-2">
                                <label className="text-xs font-medium text-[#586458]">ФИО (подстрока)</label>
                                <input
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    placeholder="Иван"
                                    value={filters.full_name}
                                    onChange={(e) => setFilters((p) => ({ ...p, full_name: e.target.value }))}
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Email (подстрока)</label>
                                <input
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    placeholder="trash.local"
                                    value={filters.email}
                                    onChange={(e) => setFilters((p) => ({ ...p, email: e.target.value }))}
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Телефон (подстрока)</label>
                                <input
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    placeholder="+7000"
                                    value={filters.phone}
                                    onChange={(e) => setFilters((p) => ({ ...p, phone: e.target.value }))}
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Роль</label>
                                <select
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    value={filters.role}
                                    onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}
                                >
                                    <option value="">Все роли</option>
                                    <option value="customer">Заказчик</option>
                                    <option value="courier">Курьер</option>
                                    <option value="admin">Администратор</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Статус</label>
                                <select
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none"
                                    value={filters.is_active}
                                    onChange={(e) => setFilters((p) => ({ ...p, is_active: e.target.value }))}
                                >
                                    <option value="">Любой</option>
                                    <option value="true">Активен</option>
                                    <option value="false">Неактивен</option>
                                </select>
                            </div>
                            <div className="space-y-1 flex items-end lg:col-span-1">
                                <button type="submit" className="w-full bg-[#f0f7f0] hover:bg-[#42f042]/20 text-[#0d1b0d] font-bold py-2 rounded-lg border border-[#e7f3e7] transition-colors">
                                    Применить фильтр
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Таблица */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm overflow-hidden flex flex-col flex-1">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#f8fcf8] text-[#586458] border-b border-[#e7f3e7]">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Пользователь</th>
                                        <th className="px-6 py-4 font-semibold">Контакты</th>
                                        <th className="px-6 py-4 font-semibold">Роль</th>
                                        <th className="px-6 py-4 font-semibold">Создан</th>
                                        <th className="px-6 py-4 font-semibold">Статус</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7f3e7]">
                                    {loading ? (
                                        <tr>
                                            <td className="px-6 py-8 text-[#586458]" colSpan={5}>Загрузка...</td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td className="px-6 py-8 text-[#586458]" colSpan={5}>Пользователи не найдены</td>
                                        </tr>
                                    ) : users.map((user) => (
                                        <tr key={user.id} className="hover:bg-[#f8fcf8] transition-colors">
                                            <td className="px-6 py-4 font-medium">{user.full_name}</td>
                                            <td className="px-6 py-4 text-[#586458]">
                                                <div>{user.phone}</div>
                                                <div className="text-xs">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {roleLabel[user.role] || user.role}
                                            </td>
                                            <td className="px-6 py-4 text-[#586458]">
                                                {user.created_at ? new Date(user.created_at).toLocaleString('ru-RU') : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.is_active ? 'Активен' : 'Неактивен'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;