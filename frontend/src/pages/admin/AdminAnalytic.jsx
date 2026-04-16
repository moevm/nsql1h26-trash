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

const AdminAnalytics = () => {
    // Состояние для имитации данных графика
    const [chartData, setChartData] = useState({
        labels: ['Бытовой', 'Строительный', 'Крупногабаритный'],
        datasets: [
            {
                label: 'Общий объем вывезенного мусора (м³)',
                data: [450, 850, 150],
                backgroundColor: 'rgba(66, 240, 66, 0.8)',
                borderColor: '#36c936',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    });

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

    const handleUpdateChart = () => {
        // Имитация обновления данных (как в твоем updateChart)
        const newData = [
            Math.floor(Math.random() * 600) + 100,
            Math.floor(Math.random() * 900) + 200,
            Math.floor(Math.random() * 400) + 50
        ];
        setChartData({
            ...chartData,
            datasets: [{ ...chartData.datasets[0], data: newData }]
        });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="analytics" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Управление заказами</h2>
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
                                    <SelectGroup label="Период" options={['За всё время', 'За месяц', 'За год']} />
                                    <SelectGroup label="Тип мусора" options={['Любой', 'Бытовой', 'Строительный']} />
                                    <SelectGroup label="Статус" options={['Все', 'Только выполненные']} />
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
                                        <select className="w-full rounded-lg border border-[#e7f3e7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#42f042] shadow-sm transition-all">
                                            <option>Тип мусора</option>
                                            <option>Дата (Месяцы)</option>
                                            <option>Курьер</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#4c9a4c] text-sm -rotate-90">arrow_right_alt</span> Ось Y (Значение)
                                        </label>
                                        <select className="w-full rounded-lg border border-[#e7f3e7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#42f042] shadow-sm transition-all">
                                            <option>Общий объем (м³)</option>
                                            <option>Количество заказов (шт)</option>
                                            <option>Сумма оплат (₽)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleUpdateChart}
                                    className="flex items-center gap-2 bg-[#42f042] hover:bg-[#36c936] text-[#0d1b0d] font-bold py-3 px-8 rounded-lg shadow-md shadow-[#42f042]/20 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined">insert_chart</span>
                                    Построить диаграмму
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Результат анализа */}
                    <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm p-6 flex flex-col flex-1 min-h-[450px]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-lg">Результат анализа</h3>
                            <div className="text-sm font-bold text-[#4c9a4c] bg-[#e7f3e7] px-4 py-1.5 rounded-full">
                                Всего: 1 450 м³
                            </div>
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

// Вспомогательный компонент для селектов
const SelectGroup = ({ label, options }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#586458] ml-1 uppercase">{label}</label>
        <select className="w-full rounded-lg border border-[#e7f3e7] bg-[#f8fcf8] px-3 py-2 text-sm outline-none focus:border-[#42f042] transition-colors">
            {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default AdminAnalytics;