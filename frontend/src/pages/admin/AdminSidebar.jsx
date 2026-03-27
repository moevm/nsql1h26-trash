import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeTab }) => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Дашборд', path: '/admin-dashboard' },
        { id: 'orders', icon: 'local_shipping', label: 'Заказы на вывоз', path: '/admin-orders' },
        { id: 'users', icon: 'group', label: 'Пользователи', path: '/admin-users' },
        { id: 'analytics', icon: 'bar_chart', label: 'Аналитика', path: '/admin-analytics' },
    ];

    return (
        <aside className="flex w-72 flex-col justify-between border-r border-[#e7f3e7] bg-[#f8fcf8] p-6 h-screen sticky top-0">
            <div className="flex flex-col gap-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-full bg-[#42f042]/20 size-10">
                        <span className="material-symbols-outlined text-green-700">admin_panel_settings</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold leading-none text-[#0d1b0d]">ЭкоСервис</h1>
                        <p className="text-sm text-[#4c9a4c]">Панель управления</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                                activeTab === item.id
                                    ? 'bg-[#e7f3e7] text-[#0d1b0d]'
                                    : 'text-[#586458] hover:bg-[#f0f7f0]'
                            }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <button
                onClick={() => navigate('/')}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e7f3e7] py-2.5 text-sm font-bold text-[#0d1b0d] hover:bg-[#f0f7f0] transition-colors"
            >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span>Выйти</span>
            </button>
        </aside>
    );
};

export default AdminSidebar;