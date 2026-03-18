import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const CompletedOrderDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const orderData = location.state?.order || {};
    const userName = location.state?.userName || "Алексей К.";

    const order = {
        id: orderData.id || "#4829",
        date: orderData.date || "12.10.2023",
        time: orderData.time || "14:30",
        type: orderData.type || "Бытовой мусор",
        address: "ул. Ленина, 45",
        reward: orderData.reward || "350 ₽",
    };

    return (
        <div className="flex h-screen bg-[#f6f8f6] text-[#0d1b0d] font-display overflow-hidden text-sm">
            <Sidebar activePage="my-orders" userName={userName} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f6f8f6]">
                <header className="h-20 flex items-center px-8 bg-white border-b border-slate-100 shrink-0 z-10">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-[#0d1b0d] transition-colors">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <h2 className="text-[22px] font-bold ml-2">Детали заказа {order.id}</h2>
                </header>

                <div className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-[900px] mx-auto">

                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-[#7cae7c] hover:text-[#13ec13] transition-colors mb-10 font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            <span>Назад к истории</span>
                        </button>

                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] p-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-[24px] font-bold mb-2">Заказ {order.id}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                        <span>{order.date} {order.time}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#e8f8e8] text-[#2d8a2d] rounded-full text-xs font-bold border border-[#d1edd1]">
                                    <span className="w-2 h-2 rounded-full bg-[#13ec13]"></span>
                                    Выполнен
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">

                                {/* Тип мусора */}
                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 pb-3">
                                        Тип мусора
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#f0f4ff] rounded-xl flex items-center justify-center text-[#407bff]">
                                            <span className="material-symbols-outlined text-2xl">delete</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[17px] mb-0.5">{order.type}</p>
                                            <p className="text-slate-400 font-medium">Стандартный пакет, ~5кг</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Финансовый отчет */}
                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 pb-3">
                                        Финансовый отчет
                                    </h4>
                                    <div className="flex items-center justify-between p-5 bg-[#f5faf5] rounded-xl border border-[#e8f3e8]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#13ec13] shadow-sm">
                                                <span className="material-symbols-outlined text-xl">payments</span>
                                            </div>
                                            <span className="font-bold text-slate-600">Выплата курьеру</span>
                                        </div>
                                        <span className="text-[22px] font-black">{order.reward}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-6">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 pb-3">
                                        Местоположение
                                    </h4>
                                    <div className="p-8 bg-[#f8fafc]/50 rounded-[20px] border border-slate-100">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="text-red-500 mt-1">
                                                <span className="material-symbols-outlined text-2xl">location_on</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-[20px] mb-1">{order.address}</p>
                                                <p className="text-slate-500 font-medium text-base">Подъезд 3, Этаж 4</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-10">
                                            <span className="px-3 py-1 bg-[#eef2f6] text-slate-600 rounded-md text-[11px] font-bold border border-slate-200/60">
                                                Домофон: 45
                                            </span>
                                            <span className="px-3 py-1 bg-[#eef2f6] text-slate-600 rounded-md text-[11px] font-bold border border-slate-200/60">
                                                Лифт есть
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompletedOrderDetails;