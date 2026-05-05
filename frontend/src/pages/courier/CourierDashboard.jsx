import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const CourierDashboard = () => {
    const [activeTab, setActiveTab] = useState('Все заказы');
    const [orders, setOrders] = useState([]);
    const location = useLocation();
    const userName = location.state?.userName || "Алексей К.";
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const fetchBalance = async () => {
        try {
            const response = await fetch('/api/v1/courier/balance', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBalance(data.balance);
            }
        } catch (error) {
            console.error("Ошибка загрузки баланса:", error);
        }
    };


    const fetchOrders = async (tab, page = 1) => {
        const typeMap = {
            'Бытовой': 'Бытовой',
            'Строительный': 'Строительный',
            'Мебель': 'Мебель'
        };
        const wasteType = typeMap[tab];

        const skip = (page - 1) * itemsPerPage;
        let url = `/api/v1/courier/available-orders?skip=${skip}&limit=${itemsPerPage}`;
        if (wasteType) url += `&waste_type=${encodeURIComponent(wasteType)}`;

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            const data = await response.json();
            setOrders(Array.isArray(data.orders) ? data.orders : []);
            setTotalOrders(data.total || 0);
        } catch (error) {
            console.error("Ошибка:", error);
            setOrders([]);
            setTotalOrders(0);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchOrders(activeTab, 1);
        fetchBalance();
    }, [activeTab]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchOrders(activeTab, newPage);
    };

    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    return (
        <div className="flex h-screen bg-background-light overflow-hidden text-text-main">
            <Sidebar activePage="available" userName={userName} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="dash-header">
                    <h2 className="text-[28px] font-black tracking-tight">Доступные заказы</h2>

                    <div className="balance-card">
                        <span className="icon-base text-primary text-2xl">account_balance_wallet</span>
                        <button
                            onClick={() => navigate('/courier-wallet', { state: { userName } })}
                            className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Баланс</span>
                            <span className="font-black text-xl leading-none">{balance.toLocaleString()} ₽</span>
                        </button>
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
                                            <h3 className="text-base font-black uppercase leading-tight">{order.waste_type}</h3>
                                            <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase">
                                                № {order.id} • {order.scheduled_at || "Без времени"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex gap-3 items-start">
                                        <span className="icon-base text-primary mt-0.5">location_on</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate">{order.address}</p>
                                            <p className="text-xs text-slate-400 mt-1 truncate">
                                                {order.address_details?.entrance ? `Подъезд: ${order.address_details.entrance} ` : ''}
                                                {order.address_details?.floor ? `Этаж: ${order.address_details.floor} ` : ''}
                                                {order.address_details?.intercom ? `Домофон: ${order.address_details.intercom}` : ''}
                                            </p>
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
                                        onClick={() => navigate(`/order-details/${order.id}`)}
                                        className="btn-take"
                                    >
                                        Взять
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ПАГИНАЦИЯ */}
                    {totalPages > 1 && (
                        <div className="mt-12 mb-8 flex justify-center items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-text-main disabled:opacity-30"
                            >
                                <span className="icon-base">chevron_left</span>
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={currentPage === pageNumber ? "pagin-btn-active" : "pagin-btn-inactive"}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-text-main disabled:opacity-30"
                            >
                                <span className="icon-base">chevron_right</span>
                            </button>
                        </div>
                    )}
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