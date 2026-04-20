import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";

const EVENT_ICONS = {
    order_created: { icon: "add", color: "bg-blue-100 text-blue-600" },
    order_accepted: { icon: "local_shipping", color: "bg-yellow-100 text-yellow-600" },
    order_completed: { icon: "check", color: "bg-green-100 text-green-600" },
    user_registered: { icon: "person_add", color: "bg-orange-100 text-orange-600" },
};

const PAGE_SIZE = 20;
const POLL_INTERVAL = 15000;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventsTotal, setEventsTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const abortRef = useRef(null);

    const token = localStorage.getItem('access_token');

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/v1/admin/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setStats(await res.json());
        } catch (e) {
            console.error('Ошибка загрузки статистики:', e);
        } finally {
            setLoadingStats(false);
        }
    }, [token]);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch(`/api/v1/admin/dashboard/events?offset=0&limit=${PAGE_SIZE}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events);
                setEventsTotal(data.total);
                setHasMore(data.has_more);
            }
        } catch (e) {
            console.error('Ошибка загрузки событий:', e);
        } finally {
            setLoadingEvents(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStats();
        fetchEvents();

        const interval = setInterval(() => {
            fetchStats();
            fetchEvents();
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchStats, fetchEvents]);

    const loadMore = async () => {
        const controller = new AbortController();
        abortRef.current = controller;
        setLoadingMore(true);

        try {
            const res = await fetch(
                `/api/v1/admin/dashboard/events?offset=${events.length}&limit=${PAGE_SIZE}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                }
            );
            if (res.ok) {
                const data = await res.json();
                setEvents(prev => [...prev, ...data.events]);
                setHasMore(data.has_more);
            }
        } catch (e) {
            if (e.name !== 'AbortError') {
                console.error('Ошибка подгрузки:', e);
            }
        } finally {
            setLoadingMore(false);
            abortRef.current = null;
        }
    };

    // Отмена операции: при переходе в другой раздел подгрузка прерывается
    useEffect(() => {
        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, []);

    const formatTime = (isoStr) => {
        if (!isoStr) return '';
        const date = new Date(isoStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMin < 1) return 'только что';
        if (diffMin < 60) return `${diffMin} мин. назад`;
        const diffHours = Math.floor(diffMin / 60);
        if (diffHours < 24) return `${diffHours} ч. назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] text-[#0d1b0d] font-['Public_Sans']">
            <AdminSidebar activeTab="dashboard" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f8fcf8] sticky top-0 z-10">
                    <h2 className="text-xl font-bold">Сводка системы</h2>
                    <div className="flex items-center gap-6">
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
                    </div>
                </header>

                <div className="flex flex-1 flex-col p-8 w-full gap-6">

                    {/* ArangoDB Control Panel */}
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
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#0d1b0d] font-bold py-2.5 px-5 rounded-lg border border-[#e7f3e7] transition-colors">
                                <span className="material-symbols-outlined text-sm">download</span> Дамп
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#42f042] hover:bg-[#36c936] text-[#0d1b0d] font-bold py-2.5 px-5 rounded-lg shadow-sm shadow-[#42f042]/20 transition-all">
                                <span className="material-symbols-outlined text-sm">upload</span> Загрузить
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loadingStats ? (
                            <>
                                <StatCardSkeleton />
                                <StatCardSkeleton />
                                <StatCardSkeleton />
                            </>
                        ) : (
                            <>
                                <StatCard
                                    icon="receipt_long"
                                    label="Заказов сегодня"
                                    value={String(stats?.orders_today ?? 0)}
                                    colorClass="bg-blue-100 text-blue-600"
                                />
                                <StatCard
                                    icon="directions_car"
                                    label="Курьеров на линии"
                                    value={`${stats?.couriers_active ?? 0} / ${stats?.couriers_total ?? 0}`}
                                    colorClass="bg-green-100 text-green-600"
                                />
                                <StatCard
                                    icon="delete"
                                    label="Вывезено сегодня"
                                    value={`${stats?.volume_today ?? 0} м³`}
                                    colorClass="bg-orange-100 text-orange-600"
                                />
                            </>
                        )}
                    </div>

                    {/* Activity Feed */}
                    <div className="flex-1 min-h-[400px]">
                        <div className="bg-white rounded-xl border border-[#e7f3e7] shadow-sm flex flex-col h-full">
                            <div className="p-5 border-b border-[#e7f3e7]">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#4c9a4c]">history</span> Лента событий
                                </h3>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto">
                                {loadingEvents ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#42f042]"></div>
                                    </div>
                                ) : events.length === 0 ? (
                                    /* Альтернативный сценарий: нет событий */
                                    <div className="flex flex-col items-center justify-center h-32 text-[#586458]">
                                        <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                                        <p className="text-sm font-medium">Событий за сегодня не найдено</p>
                                    </div>
                                ) : (
                                    <div className="relative border-l-2 border-[#e7f3e7] ml-4 space-y-8">
                                        {events.map((ev) => (
                                            <EventItem key={ev.id} event={ev} formatTime={formatTime} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Кнопка подгрузки предыдущих событий */}
                            {events.length > 0 && (
                                <div className="p-4 border-t border-[#e7f3e7] text-center bg-[#f8fcf8] rounded-b-xl">
                                    {hasMore ? (
                                        <button
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="text-sm font-bold text-[#4c9a4c] hover:text-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {loadingMore ? 'Загрузка...' : 'Загрузить предыдущие события'}
                                        </button>
                                    ) : (
                                        <p className="text-sm text-[#586458]">Все события загружены</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const EventItem = ({ event, formatTime }) => {
    const style = EVENT_ICONS[event.event_type] || { icon: "info", color: "bg-gray-100 text-gray-600" };

    // Нежелательное завершение: связанный объект удалён
    if (event.error) {
        return (
            <div className="relative pl-8">
                <span className="absolute -left-[17px] top-0 flex size-8 items-center justify-center rounded-full ring-4 ring-white bg-red-100 text-red-500">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                </span>
                <p className="text-sm text-red-500 font-medium">{event.error}</p>
                <p className="text-xs text-[#586458] mt-1">{formatTime(event.created_at)}</p>
            </div>
        );
    }

    return (
        <div className="relative pl-8">
            <span className={`absolute -left-[17px] top-0 flex size-8 items-center justify-center rounded-full ring-4 ring-white ${style.color}`}>
                <span className="material-symbols-outlined text-[16px]">{style.icon}</span>
            </span>
            <p className="text-base font-bold text-[#0d1b0d]">{event.title}</p>
            <p className="text-sm text-[#586458] mt-1">{event.description} • {formatTime(event.created_at)}</p>
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

const StatCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-[#e7f3e7] p-5 shadow-sm flex items-center gap-4 animate-pulse">
        <div className="rounded-lg size-12 bg-gray-200" />
        <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
        </div>
    </div>
);

export default AdminDashboard;
