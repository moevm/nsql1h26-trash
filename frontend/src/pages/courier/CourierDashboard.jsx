import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const CourierDashboard = () => {
    const [activeTab, setActiveTab] = useState('Все заказы');
    const location = useLocation();
    const userName = location.state?.userName || "Алексей К.";
    const navigate = useNavigate();

    const orders = [
        {
            id: '4829',
            type: 'Бытовой мусор',
            address: 'ул. Ленина, 45, под. 3',
            note: 'Вход со двора, код 1234',
            price: '350',
            time: '5 мин назад',
            distance: '1.2 км',
            icon: 'delete_forever',
            color: 'text-red-500',
            bg: 'bg-red-50',
            isNew: true
        },
        {
            id: '4831',
            type: 'Строительный',
            address: 'пр. Мира, 12',
            note: 'Новостройка, есть лифт',
            price: '1 200',
            time: '12 мин назад',
            distance: '5.0 км',
            icon: 'construction',
            color: 'text-yellow-600',
            bg: 'bg-yellow-50'
        }
    ];

    return (
        <div className="flex h-screen bg-background-light overflow-hidden text-text-main">
            <Sidebar activePage="available" userName={userName} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="dash-header">
                    <h2 className="text-[28px] font-black tracking-tight">Доступные заказы</h2>

                    <div className="balance-card">
                        <span className="icon-base text-primary text-2xl">account_balance_wallet</span>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Баланс</span>
                            <span className="font-black text-xl leading-none">12 500 ₽</span>
                        </div>
                    </div>
                </header>

                {/* Фильтры */}
                <div className="filter-bar">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        <FilterTab label="Все заказы" active={activeTab === 'Все заказы'} onClick={() => setActiveTab('Все заказы')} />
                        <FilterTab label="Бытовой" icon="delete" active={activeTab === 'Бытовой'} onClick={() => setActiveTab('Бытовой')} />
                        <FilterTab label="Строительный" icon="construction" active={activeTab === 'Строительный'} onClick={() => setActiveTab('Строительный')} />
                        <FilterTab label="Мебель" icon="chair" active={activeTab === 'Мебель'} onClick={() => setActiveTab('Мебель')} />
                    </div>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e7f3e7] rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shrink-0">
                        <span className="icon-base text-[20px] text-slate-400">sort</span>
                        Сортировка: Ближайшие
                    </button>
                </div>

                {/* Список заказов */}
                <div className="flex-1 overflow-y-auto px-10 py-6">
                    <div className="flex flex-col gap-4 max-w-6xl">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                {order.isNew && <div className="absolute left-0 top-0 h-full w-1.5 bg-primary"></div>}

                                <div className="p-5 flex-1 flex items-center gap-8">
                                    <div className="flex items-center gap-4 w-64 shrink-0">
                                        <div className={`order-icon-box ${order.bg} ${order.color}`}>
                                            <span className="icon-base text-3xl">{order.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black uppercase leading-tight">{order.type}</h3>
                                            <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase">№ {order.id} • {order.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex gap-3 items-start">
                                        <span className="icon-base text-primary mt-0.5">location_on</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate">{order.address}</p>
                                            <p className="text-xs text-slate-400 mt-1 truncate">{order.note}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 shrink-0 px-6">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="icon-base text-primary text-xl">near_me</span>
                                            <span className="text-xs font-black">{order.distance}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-action-zone">
                                    <div className="text-right flex-1">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Оплата</span>
                                        <p className="text-2xl font-black mt-1">{order.price} ₽</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/order-details', { state: { order, userName } })}
                                        className="btn-take"
                                    >
                                        Взять
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Пагинация */}
                    <div className="mt-12 mb-8 flex justify-center items-center gap-2">
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-text-main">
                            <span className="icon-base">chevron_left</span>
                        </button>
                        <button className="pagin-btn-active">1</button>
                        <button className="pagin-btn-inactive">2</button>
                        <button className="pagin-btn-inactive">3</button>
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-text-main">
                            <span className="icon-base">chevron_right</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

const FilterTab = ({ label, icon, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap ${
        active
            ? 'bg-text-main border-text-main text-white shadow-lg shadow-black/10'
            : 'bg-white border-[#e7f3e7] text-slate-500 hover:border-primary hover:text-text-main'
    }`}>
        {icon && <span className={`icon-base text-[18px] ${active ? 'text-white' : 'text-slate-300'}`}>{icon}</span>}
        {label}
    </button>
);

export default CourierDashboard;