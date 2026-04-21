import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const Sidebar = ({ activePage }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const menuItems = [
        { id: 'available', icon: 'list_alt', label: 'Мои заказы', path: '/customer-dashboard' },
        { id: 'my-orders', icon: 'history', label: 'История', path: '/customer-history' },
        { id: 'profile', icon: 'person', label: 'Профиль', path: '/customer-profile' },
    ];

    return (
        <aside className="flex w-72 flex-col justify-between border-r border-[#e7f3e7] bg-[#f8fcf8] shrink-0 h-screen font-display">
            <div className="p-6">
                {/* Logo Section */}
                <div className="flex flex-col gap-1 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 bg-[#42f042]/10 rounded-xl">
                            <span className="material-symbols-outlined text-[#42f042] text-[32px]"
                                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                                recycling
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-[#0d1b0d] tracking-tighter leading-none">
                            ЭкоСервис
                        </h2>
                    </div>
                    <p className="text-[10px] font-black text-[#4c9a4c] uppercase tracking-[0.2em] ml-14">
                        Вывоз мусора
                    </p>
                </div>


                {/* Navigation */}
                <nav className="flex flex-col gap-1.5">
                    {menuItems.map((item) => {
                        const isActive = activePage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-[#42f042]/15 text-[#0d1b0d]' 
                                        : 'text-[#586458] hover:bg-[#42f042]/10 hover:text-[#0d1b0d]' 
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[22px] transition-colors ${
                                    isActive ? 'text-[#36c936]' : 'group-hover:text-[#36c936]'
                                }`}
                                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "''" }}>
                                    {item.icon}
                                </span>
                                <span className={`text-sm tracking-tight transition-all ${
                                    isActive ? 'font-black' : 'font-bold'
                                }`}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className="ml-auto w-1 h-5 rounded-full bg-[#42f042]"></div>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-[#e7f3e7]">
                <button
                    onClick={() => navigate('/')}
                    className="flex w-full items-center justify-center gap-2 py-3 text-sm font-bold text-[#586458] hover:text-red-600 transition-colors group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                        logout
                    </span>
                    Выйти
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;