import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const WalletCourier = () => {
    const location = useLocation();
    const userName = location.state?.userName || "Дмитрий К.";
    const [filter, setFilter] = useState('За неделю');

    const transactions = [
        { date: 'Сегодня, 14:30', type: 'Оплата за заказ #10234', amount: '+ 850 ₽', icon: 'local_shipping', isIncome: true, color: 'bg-green-100 text-green-600' },
        { date: 'Вчера, 18:15', type: 'Вывод средств на карту', amount: '- 10 000 ₽', icon: 'payments', isIncome: false, color: 'bg-red-100 text-red-600' },
        { date: 'Вчера, 12:40', type: 'Оплата за заказ #10233', amount: '+ 1 200 ₽', icon: 'local_shipping', isIncome: true, color: 'bg-green-100 text-green-600' },
        { date: '24 фев, 09:20', type: 'Оплата за заказ #10230', amount: '+ 650 ₽', icon: 'local_shipping', isIncome: true, color: 'bg-green-100 text-green-600' },
        { date: '23 фев, 15:00', type: 'Вывод средств на карту', amount: '- 5 000 ₽', icon: 'payments', isIncome: false, color: 'bg-yellow-100 text-yellow-600' },
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display">
            <Sidebar activePage="wallet" userName={userName} />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header с балансом */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-[#e7f3e7] bg-white shrink-0 z-10">
                    <h2 className="text-2xl font-bold tracking-tight">Кошелек и статистика</h2>

                    <div className="balance-card h-12">
                        <span className="icon-base text-primary text-xl">account_balance_wallet</span>
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[10px] text-text-secondary font-black uppercase tracking-wider">Баланс</span>
                            <span className="font-bold text-base">5 420 ₽</span>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 flex-col p-8 max-w-5xl mx-auto w-full gap-8">
                    {/* Сетка статистики */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Карточка основного баланса */}
                        <div className="stat-card border-l-4 border-l-primary">
                            <div className="flex items-center gap-2 text-text-secondary mb-4">
                                <span className="icon-base">account_balance_wallet</span>
                                <span className="text-sm font-bold uppercase tracking-tight">Текущий баланс</span>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-black">5 420 ₽</span>
                            </div>
                            <button className="btn-withdraw">
                                <span className="icon-base text-[20px]">payments</span>
                                Вывести
                            </button>
                        </div>

                        <StatCard
                            label="За месяц"
                            value="45 200 ₽"
                            icon="trending_up"
                            trend="+12%"
                            subValue="Ранее: 40 350 ₽"
                        />

                        <StatCard
                            label="Всего заказов"
                            value="124"
                            icon="check_circle"
                            subValue="За все время: 842"
                        />
                    </div>

                    {/* История операций */}
                    <div className="table-wrapper">
                        <div className="p-6 border-b border-[#e7f3e7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                            <h3 className="text-lg font-bold">История операций</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                {['За неделю', 'За месяц', 'За год'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setFilter(item)}
                                        className={`filter-btn ${filter === item ? 'active' : 'inactive'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-[#f8fcf8]">
                                    <th className="table-head-cell">Дата</th>
                                    <th className="table-head-cell">Описание</th>
                                    <th className="table-head-cell text-right">Сумма</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7f3e7]">
                                {transactions.map((tx, idx) => (
                                    <tr key={idx} className="table-row bg-white">
                                        <td className="table-cell whitespace-nowrap font-medium text-slate-500">{tx.date}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.color}`}>
                                                    <span className="icon-base text-[20px]">{tx.icon}</span>
                                                </div>
                                                <span className="font-bold">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className={`table-cell text-right font-black ${tx.isIncome ? 'text-primary-dark' : 'text-text-main'}`}>
                                            {tx.amount}
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

const StatCard = ({ label, value, icon, trend, subValue }) => (
    <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-text-secondary">
                <span className="icon-base text-xl">{icon}</span>
                <span className="text-xs font-black uppercase tracking-wider">{label}</span>
            </div>
            {trend && (
                <span className="text-[10px] font-black text-primary-dark bg-primary/10 px-2 py-1 rounded-md">{trend}</span>
            )}
        </div>
        <div className="mb-2">
            <span className="text-3xl font-black">{value}</span>
        </div>
        <div className="text-xs font-bold text-slate-400">
            {subValue}
        </div>
    </div>
);

export default WalletCourier;