import React from 'react';
import AdminSidebar from "./AdminSidebar";

const AdminUsers = () => {
    // Пример данных (в реальном приложении придут из API)
    const users = [
        { id: 1, name: "Алексей Петров", phone: "+7 (912) 345-67-89", email: "alex@example.com", role: "client", created: "01.09.2024", updated: "20.10.2024", status: "active" },
        { id: 2, name: "Михаил Волков", phone: "+7 (999) 111-22-33", email: "m.volkov@courier.eco", role: "courier", created: "15.08.2024", updated: "-", status: "active" },
        { id: 3, name: "Иван Иванов", phone: "+7 (900) 000-00-00", email: "ivan.block@mail.ru", role: "client", created: "10.10.2024", updated: "22.10.2024", status: "blocked" },
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="users" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Управление пользователями</h2>
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

                    {/* Фильтры */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#4c9a4c]">filter_alt</span>
                            <h3 className="font-bold">Многокритериальный фильтр</h3>
                        </div>
                        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Поиск (ФИО, Email, Телефон)</label>
                                <input
                                    className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm focus:border-[#42f042] focus:ring-1 focus:ring-[#42f042] outline-none transition-all"
                                    placeholder="Введите подстроку..."
                                    type="text"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Роль в системе</label>
                                <select className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm focus:border-[#42f042] outline-none">
                                    <option value="">Все роли</option>
                                    <option value="client">Клиент</option>
                                    <option value="courier">Курьер</option>
                                    <option value="admin">Администратор</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[#586458]">Статус аккаунта</label>
                                <select className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm focus:border-[#42f042] outline-none">
                                    <option value="">Любой статус</option>
                                    <option value="active">Активен</option>
                                    <option value="blocked">Заблокирован</option>
                                </select>
                            </div>
                            <div className="space-y-1 flex items-end">
                                <button type="button" className="w-full bg-[#f0f7f0] hover:bg-[#42f042]/20 text-[#0d1b0d] font-bold py-2 rounded-lg border border-[#e7f3e7] transition-colors">
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
                                    <th className="px-6 py-4 font-semibold text-right">Действия</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7f3e7]">
                                {users.map((user) => (
                                    <tr key={user.id} className={`hover:bg-[#f8fcf8] transition-colors ${user.status === 'blocked' ? 'opacity-75' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`size-8 rounded-full bg-gray-200 bg-cover bg-center ${user.status === 'blocked' ? 'grayscale' : ''}`}
                                                    style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e7f3e7&color=0d1b0d')` }}
                                                />
                                                <div className="font-medium">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[#586458]">
                                            <div>{user.phone}</div>
                                            <div className="text-xs">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 font-medium ${user.role === 'courier' ? 'text-[#4c9a4c]' : 'text-[#586458]'}`}>
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {user.role === 'courier' ? 'local_shipping' : 'person'}
                                                    </span>
                                                    {user.role === 'courier' ? 'Курьер' : 'Клиент'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#586458]">{user.created}</td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    user.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.status === 'active' ? 'Активен' : 'Заблокирован'}
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
                            <span className="text-sm text-[#586458]">Показано 1-3 из 42 пользователей</span>
                            <div className="flex gap-1">
                                <button className="p-1 rounded bg-[#f8fcf8] text-[#a0aead] border border-[#e7f3e7]" disabled>
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <button className="px-3 py-1 text-sm rounded bg-[#42f042] text-[#0d1b0d] font-bold">1</button>
                                <button className="px-3 py-1 text-sm rounded hover:bg-[#f0f7f0] transition-colors">2</button>
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

export default AdminUsers;