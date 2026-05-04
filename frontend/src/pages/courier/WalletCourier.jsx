import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const WalletCourier = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userName = location.state?.userName || "Дмитрий К.";
    const [filter, setFilter] = useState('За неделю');
    const [balance, setBalance] = useState(0);
    const itemsPerPage = 4;
    const [stats, setStats] = useState({
        total_orders: 0,
        month_earnings: 0,
        month_orders_count: 0,
        prev_month_earnings: 0,
        prev_month_orders_count: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const earningsDiff = stats.month_earnings - stats.prev_month_earnings;
    const trendText = earningsDiff >= 0
        ? `+${earningsDiff.toLocaleString()} ₽`
        : `${earningsDiff.toLocaleString()} ₽`;

    const [transactions, setTransactions] = useState([]);
    const fetchData = async (page = 1, period = filter) => {
        setIsLoading(true);

        const token = localStorage.getItem('access_token')?.trim();
        const headers = { 'Authorization': `Bearer ${token}` };
        const skip = (page - 1) * itemsPerPage;

        try {
            const url = `/api/v1/courier/transactions?skip=${skip}&limit=${itemsPerPage}&period=${encodeURIComponent(period)}`;
            const [balanceRes, statsRes, transRes] = await Promise.all([
                fetch('/api/v1/courier/balance', { headers }),
                fetch('/api/v1/courier/stats', { headers }),
                fetch(url, { headers })
            ]);
            if (balanceRes.ok) {
                const balanceData = await balanceRes.json();
                setBalance(balanceData.balance);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (transRes.ok) {
                const transData = await transRes.json();
                console.log("Response:", transData);

                if (transData.transactions) {
                    setTransactions(transData.transactions);
                    setTotalTransactions(transData.total);
                } else {
                    setTransactions(transData);
                    setTotalTransactions(transData.length);
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, filter);
    }, [currentPage, filter]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalTransactions / itemsPerPage);

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar activePage="wallet" userName={userName} />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0 z-10">
                    <h2 className="text-2xl font-bold tracking-tight text-text-main">Кошелек и статистика</h2>
                </header>

                <div className="flex flex-1 flex-col p-8 max-w-5xl mx-auto w-full gap-8">
                    {/* Сетка статистики */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="wallet-stat-card border-l-4 border-l-primary">
                            <div className="flex items-center gap-2 text-text-secondary mb-4">
                                <span className="icon-base">account_balance_wallet</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Текущий баланс</span>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-black text-text-main">{balance.toLocaleString()} ₽</span>
                            </div>
                            <button
                                onClick={() => navigate('/courier-withdraw', { state: { userName } })}
                                className="btn-withdraw-main group"
                            >
                                <span className="icon-base text-[20px] group-hover:translate-x-1 transition-transform">payments</span>
                                Вывести средства
                            </button>
                        </div>

                        <StatCard
                            label="За месяц"
                            value={`${stats.month_earnings.toLocaleString()} ₽`}
                            subValue={`В прошлом: ${stats.prev_month_earnings.toLocaleString()} ₽`}
                            trend={trendText}
                            icon="trending_up"
                        />

                        <StatCard
                            label="Всего заказов"
                            value={stats.total_orders.toString()}
                            subValue={`В прошлом: ${stats.prev_month_orders_count.toLocaleString()}`}
                            icon="check_circle"
                        />
                    </div>

                    <div className="table-wrapper">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                            <h3 className="text-lg font-bold text-text-main">История операций</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                {['За неделю', 'За месяц', 'За год'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => handleFilterChange(item)} // Используем новую функцию
                                        className={`wallet-filter-btn ${filter === item ? 'active' : 'inactive'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr>
                                    <th className="table-head-cell">Дата</th>
                                    <th className="table-head-cell">Описание</th>
                                    <th className="table-head-cell text-right">Сумма</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                {transactions.map((tx, idx) => {
                                    const dateFormatted = new Date(tx.date).toLocaleString('ru-RU', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });

                                    return (
                                        <tr key={idx} className="table-row">
                                            <td className="table-cell whitespace-nowrap font-medium text-slate-500">
                                                {dateFormatted}
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className={`transaction-icon-box ${tx.isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        <span className="icon-base text-[18px]">
                                                            {tx.isIncome ? 'local_shipping' : 'payments'}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-text-main">{tx.type}</span>
                                                </div>
                                            </td>
                                            <td className={`table-cell text-right font-black ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {tx.amount > 0 ? '+ ' : ''}{tx.amount.toLocaleString()} ₽
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-text-main disabled:opacity-30 transition-colors"
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
                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-text-main disabled:opacity-30 transition-colors"
                                >
                                    <span className="icon-base">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ label, value, icon, trend, subValue }) => (
    <div className="wallet-stat-card">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-text-secondary">
                <span className="icon-base text-xl">{icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            {trend && (
                <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-1 rounded-md">
                    {trend}
                </span>
            )}
        </div>
        <div className="mb-2">
            <span className="text-3xl font-black text-text-main">{value}</span>
        </div>
        <div className="mt-auto text-xs font-bold text-slate-400">
            {subValue}
        </div>
    </div>
);

export default WalletCourier;