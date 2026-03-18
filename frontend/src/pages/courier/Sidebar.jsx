import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activePage, userName = "Алексей К." }) => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'available', icon: 'format_list_bulleted', label: 'Доступные заказы', path: '/courier-dash' },
        { id: 'my-orders', icon: 'local_shipping', label: 'Мои заказы', path: '/courier-orders' },
        { id: 'wallet', icon: 'account_balance_wallet', label: 'Кошелек', path: '/courier-wallet' },
        { id: 'profile', icon: 'person', label: 'Профиль', path: '/courier-profile' },
    ];

    return (
        <aside className="sidebar-wrapper">
            <div className="p-6">
                <div className="flex flex-col gap-0.5 mb-10">
                    <div className="flex items-center gap-2">
                        <span className="icon-logo text-primary">recycling</span>
                        <h1 className="sidebar-logo-text">ЭкоКурьер</h1>
                    </div>
                    <p className="sidebar-badge">Панель управления</p>
                </div>

                <nav className="flex flex-col gap-1.5">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path, { state: { userName } })}
                            className={`sidebar-nav-item ${
                                activePage === item.id ? 'sidebar-nav-active' : 'sidebar-nav-inactive'
                            }`}
                        >
                            <span className={`icon-base text-[22px] ${activePage === item.id ? 'text-primary' : ''}`}>
                                {item.icon}
                            </span>
                            <span className={`text-sm tracking-tight ${activePage === item.id ? 'font-black' : 'font-bold'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-[#e7f3e7]">
                <div className="sidebar-profile-card">
                    <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border border-black/5">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="avatar" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold truncate">{userName}</span>
                        <span className="sidebar-rating">Рейтинг 5.0 ★</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="sidebar-logout"
                >
                    <span className="icon-base text-[18px]">logout</span>
                    Выйти
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;