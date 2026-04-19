import React, { useEffect, useRef, useState } from 'react';
import AdminSidebar from "./AdminSidebar";

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function authHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Маппинг типов событий → иконка и цвет
const EVENT_STYLE = {
    customer_registered: { icon: 'person_add',     color: 'bg-orange-100 text-orange-600' },
    courier_registered:  { icon: 'local_shipping',  color: 'bg-blue-100 text-blue-600'   },
    order_created:       { icon: 'add',             color: 'bg-blue-100 text-blue-600'   },
    order_taken:         { icon: 'directions_car',  color: 'bg-yellow-100 text-yellow-600'},
    order_done:          { icon: 'check',           color: 'bg-green-100 text-green-600' },
    order_cancelled:     { icon: 'close',           color: 'bg-red-100 text-red-600'     },
};

function formatRelativeTime(isoString) {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60)   return `${diff} сек назад`;
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return new Date(isoString).toLocaleDateString('ru-RU');
}

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventsPage, setEventsPage] = useState(1);
    const [eventsTotal, setEventsTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const importInputRef = useRef(null);

    // Загрузка статистики
    useEffect(() => {
        fetch(`${API}/admin/stats`, { headers: authHeaders() })
            .then(r => r.json())
            .then(setStats)
            .catch(() => {});
    }, []);

    // Загрузка первой страницы событий
    useEffect(() => {
        fetch(`${API}/admin/events?page=1&page_size=20`, { headers: authHeaders() })
            .then(r => r.json())
            .then(data => {
                setEvents(data.items || []);
                setEventsTotal(data.total || 0);
            })
            .catch(() => {});
    }, []);

    // Подгрузка следующей страницы событий
    const loadMoreEvents = async () => {
        setLoadingMore(true);
        const nextPage = eventsPage + 1;
        try {
            const r = await fetch(`${API}/admin/events?page=${nextPage}&page_size=20`, { headers: authHeaders() });
            const data = await r.json();
            setEvents(prev => [...prev, ...(data.items || [])]);
            setEventsPage(nextPage);
        } finally {
            setLoadingMore(false);
        }
    };

    // Экспорт БД
    const handleExport = async () => {
        const r = await fetch(`${API}/admin/export`, { headers: authHeaders() });
        if (!r.ok) return;
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trash_db_dump.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Импорт БД
    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('file', file);
        const r = await fetch(`${API}/admin/import`, { method: 'POST', headers: authHeaders(), body: form });
        const data = await r.json();
        if (r.ok) alert('Импорт успешен: ' + JSON.stringify(data.details));
        else alert('Ошибка импорта: ' + (data.detail || 'неизвестная ошибка'));
        e.target.value = '';
    };

    const hasMoreEvents = events.length < eventsTotal;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="dashboard" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Сводка системы</h2>
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

                    {/* Управление данными */}
                    <div className="bg-[#e7f3e7] rounded-xl border border-[#42f042]/30 shadow-sm p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 text-[#42f042]/20 rotate-12 pointer-events-none">
                            <span className="material-symbols-outlined" style={{ fontSize: '150px' }}>database</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-[#0d1b0d] text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-700">storage</span> Управление данными (ArangoDB)
                            </h3>
                            <p className="text-sm text-[#586458] mt-1">Массовый экспорт и импорт всех коллекций приложения (JSON)</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto relative z-10">
                            <button
                                onClick={handleExport}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#0d1b0d] font-bold py-2.5 px-5 rounded-lg border border-[#e7f3e7] transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">download</span> Дамп
                            </button>
                            <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                            <button
                                onClick={() => importInputRef.current?.click()}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#42f042] hover:bg-[#36c936] text-[#0d1b0d] font-bold py-2.5 px-5 rounded-lg shadow-sm shadow-[#42f042]/20 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">upload</span> Загрузить
                            </button>
                        </div>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon="receipt_long"
                            label="Заказов сегодня"
                            value={stats ? String(stats.orders_today) : '…'}
                            colorClass="bg-blue-100 text-blue-600"
                        />
                        <StatCard
                            icon="directions_car"
                            label="Курьеров на линии"
                            value={stats ? String(stats.couriers_online) : '…'}
                            colorClass="bg-green-100 text-green-600"
                        />
                        <StatCard
                            icon="delete"
                            label="Вывезено сегодня"
                            value={stats ? `${stats.volume_today} кг` : '…'}
                            colorClass="bg-orange-100 text-orange-600"
                        />
                    </div>

                    {/* Лента событий */}
                    <div className="flex-1 min-h-[400px]">
                        <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm flex flex-col h-full">
                            <div className="p-5 border-b border-[#e7f3e7]">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#4c9a4c]">history</span> Лента событий
                                </h3>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                {events.length === 0 ? (
                                    <p className="text-sm text-[#586458] text-center mt-8">Событий за сегодня не найдено</p>
                                ) : (
                                    <div className="relative border-l-2 border-[#e7f3e7] ml-4 space-y-8">
                                        {events.map(ev => {
                                            const style = EVENT_STYLE[ev.type] || { icon: 'info', color: 'bg-gray-100 text-gray-600' };
                                            return (
                                                <TimelineItem
                                                    key={ev._key}
                                                    icon={style.icon}
                                                    iconColor={style.color}
                                                    title={ev.title}
                                                    desc={[ev.description, formatRelativeTime(ev.created_at)].filter(Boolean).join(' • ')}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-[#e7f3e7] text-center bg-[#f8fcf8] rounded-b-xl">
                                {hasMoreEvents ? (
                                    <button
                                        onClick={loadMoreEvents}
                                        disabled={loadingMore}
                                        className="text-sm font-bold text-[#4c9a4c] hover:text-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? 'Загрузка…' : 'Загрузить предыдущие события'}
                                    </button>
                                ) : (
                                    <span className="text-sm text-[#586458]">Все события загружены</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon, label, value, colorClass }) => (
    <div className="bg-white rounded-xl border border-[#e7f3e7] p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`flex items-center justify-center rounded-lg size-12 ${colorClass}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
            <p className="text-sm font-medium text-[#586458]">{label}</p>
            <p className="text-2xl font-bold text-[#0d1b0d]">{value}</p>
        </div>
    </div>
);

const TimelineItem = ({ icon, title, desc, iconColor }) => (
    <div className="relative pl-8">
        <span className={`absolute -left-[17px] top-0 flex size-8 items-center justify-center rounded-full ring-4 ring-white ${iconColor}`}>
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </span>
        <p className="text-base font-bold text-[#0d1b0d]">{title}</p>
        <p className="text-sm text-[#586458] mt-1">{desc}</p>
    </div>
);

export default AdminDashboard;
