import React, { useState } from 'react';
import AdminSidebar from "./AdminSidebar";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,    // Добавлено
    LineElement,     // Добавлено
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Регистрация ВСЕХ необходимых компонентов
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const X_OPTIONS = [
    { label: 'Тип мусора',     value: 'waste_type' },
    { label: 'Дата (Месяцы)', value: 'month' },
    { label: 'Курьер',         value: 'courier' },
];
const Y_OPTIONS = [
    { label: 'Общий объем (м³)',       value: 'volume' },
    { label: 'Количество заказов (шт)', value: 'count' },
    { label: 'Сумма оплат (₽)',         value: 'price' },
];
const PERIOD_OPTIONS = [
    { label: 'За всё время', value: 'all' },
    { label: 'За месяц',     value: 'month' },
    { label: 'За год',       value: 'year' },
];
const WASTE_OPTIONS = ['Любой', 'Бытовой', 'Строительный', 'Крупногабаритный'];
const STATUS_OPTIONS = [
    { label: 'Все',                value: 'all' },
    { label: 'Только выполненные', value: 'done' },
];

const AdminAnalytics = () => {
    const [xAxis,     setXAxis]     = useState('waste_type');
    const [yAxis,     setYAxis]     = useState('volume');
    const [period,    setPeriod]    = useState('all');
    const [wasteType, setWasteType] = useState('Любой');
    const [status,    setStatus]    = useState('all');
    const [loading,   setLoading]   = useState(false);
    const [total,     setTotal]     = useState(null);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: '',
            data: [],
            backgroundColor: 'rgba(66, 240, 66, 0.8)',
            borderColor: '#36c936',
            borderWidth: 1,
            borderRadius: 8,
        }],
    });

    const yLabel = Y_OPTIONS.find(o => o.value === yAxis)?.label ?? '';

    const handleUpdateChart = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                x_axis: xAxis,
                y_axis: yAxis,
                period,
                ...(wasteType !== 'Любой' && { waste_type: wasteType }),
                ...(status === 'done' && { status: 'done' }),
            });
            const resp = await fetch(`/api/v1/admin/analytics?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            const data = await resp.json();
            setTotal(data.total);
            setChartData({
                labels: data.labels,
                datasets: [{
                    label: yLabel,
                    data: data.values,
                    backgroundColor: 'rgba(66, 240, 66, 0.8)',
                    borderColor: '#36c936',
                    borderWidth: 1,
                    borderRadius: 8,
                }],
            });
        } finally {
            setLoading(false);
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { family: "'Public Sans', sans-serif", weight: '600' } }
            },
            tooltip: {
                backgroundColor: '#0d1b0d',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#e7f3e7' },
            },
            x: {
                grid: { display: false },
            }
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="analytics" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Аналитика</h2>
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

                    {/* Конструктор отчета */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-[#e7f3e7] pb-4">
                            <span className="material-symbols-outlined text-[#4c9a4c]">tune</span>
                            <h3 className="font-bold text-lg">Конструктор отчета</h3>
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* Шаг 1 */}
                            <div>
                                <h4 className="text-xs font-bold text-[#586458] mb-4 uppercase tracking-wider">1. Выбор подмножества данных</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-[#586458] ml-1 uppercase">Период</label>
                                        <select value={period} onChange={e => setPeriod(e.target.value)}
                                            className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none focus:border-[#42f042] transition-colors">
                                            {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-[#586458] ml-1 uppercase">Тип мусора</label>
                                        <select value={wasteType} onChange={e => setWasteType(e.target.value)}
                                            className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none focus:border-[#42f042] transition-colors">
                                            {WASTE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-[#586458] ml-1 uppercase">Статус</label>
                                        <select value={status} onChange={e => setStatus(e.target.value)}
                                            className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none focus:border-[#42f042] transition-colors">
                                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Шаг 2 */}
                            <div className="bg-[#f8fcf8] p-5 rounded-xl border border-[#e7f3e7]">
                                <h4 className="text-xs font-bold text-[#586458] mb-4 uppercase tracking-wider">2. Настройка осей графика</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#4c9a4c] text-sm">arrow_right_alt</span> Ось X (Группировка)
                                        </label>
                                        <select value={xAxis} onChange={e => setXAxis(e.target.value)}
                                            className="w-full rounded-lg border border-[#e7f3e7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#42f042] shadow-sm transition-all">
                                            {X_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#4c9a4c] text-sm -rotate-90">arrow_right_alt</span> Ось Y (Значение)
                                        </label>
                                        <select value={yAxis} onChange={e => setYAxis(e.target.value)}
                                            className="w-full rounded-lg border border-[#e7f3e7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#42f042] shadow-sm transition-all">
                                            {Y_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleUpdateChart}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-[#42f042] hover:bg-[#36c936] disabled:opacity-60 text-[#0d1b0d] font-bold py-3 px-8 rounded-lg shadow-md shadow-[#42f042]/20 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined">insert_chart</span>
                                    {loading ? 'Загрузка...' : 'Построить диаграмму'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Результат анализа */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm p-6 flex flex-col flex-1 min-h-[450px]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-lg">Результат анализа</h3>
                            {total !== null && (
                                <div className="text-sm font-bold text-[#4c9a4c] bg-[#e7f3e7] px-4 py-1.5 rounded-full">
                                    Всего: {total} {yAxis === 'volume' ? 'м³' : yAxis === 'price' ? '₽' : 'шт'}
                                </div>
                            )}
                        </div>

                        <div className="relative flex-1 w-full h-full">
                            <Bar data={chartData} options={options} />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AdminAnalytics;