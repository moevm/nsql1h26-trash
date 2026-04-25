import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';

const CustomerOrderDetails = () => {
    const navigate = useNavigate();
    const { key } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/v1/orders/my/${key}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                }
            } catch (e) {
                console.error("Ошибка загрузки:", e);
            }
        };
        fetchOrder();
    }, [key]);

    const handleConfirmOrder = () => {
        navigate('/order-confirmed-success');
    };

    if (!order) return <div className="p-10">Загрузка заказа...</div>;

    return (
        <div className="flex min-h-screen w-full bg-[#f8fcf8] font-display text-[#0d1b0d] antialiased">
            <SidebarCustomer activePage="/customer-history" />

            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] px-8 bg-white sticky top-0 z-10 shrink-0">
                    {/* Используем динамический ключ */}
                    <h2 className="text-s text-[#0d1b0d]">Главная/История/Заказ #{order._key?.substring(0, 8)}</h2>
                </header>
                <div className="container mx-auto px-6 py-8 max-w-6xl">

                    <nav className="mb-6">
                        <button className="flex items-center gap-2 text-[#586458] hover:text-[#0d1b0d] transition-colors font-bold text-sm"
                                onClick={() => navigate(`/customer-history`)} >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Назад к списку заказов
                        </button>
                    </nav>

                    {/* Заголовок заказа */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight">Заказ #{order._key?.substring(0, 8)}</h1>
                                <span className="bg-[#42f042]/20 text-[#2da32d] border border-[#42f042]/30 px-3 py-1 rounded-full text-xs font-black uppercase">
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-[#586458] mt-1 font-medium">Создан {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Основная информация */}
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white rounded-xl border border-[#e7f3e7] p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#42f042]">info</span>
                                    Информация о вывозе
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                    <InfoField label="Тип мусора" value={order.waste_type} />
                                    <InfoField label="Объем" value={`${order.volume} м³`} />
                                    <InfoField label="Адрес" value={order.address?.full_address || "—"} />
                                    <InfoField label="Подъезд" value={order.address?.details?.entrance || "—"} />
                                    <InfoField label="Этаж" value={order.address?.details?.floor ?? "—"} />
                                    <InfoField label="Домофон" value={order.address?.details?.intercom || "—"} />
                                    <InfoField label="Статус" value={order.status} />
                                </div>
                            </section>
                            {order.description && (
                                <section className="bg-white rounded-xl border border-[#e7f3e7] p-6 shadow-sm">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#42f042]">notes</span>
                                        Комментарий к заказу
                                    </h2>
                                    <p className="text-[#586458] font-medium leading-relaxed bg-[#f8fcf8] p-4 rounded-lg border border-[#e7f3e7]">
                                        {order.description}
                                    </p>
                                </section>
                            )}
                        </div>

                        {/* Курьер и Деньги */}
                        <div className="space-y-6">
                            <section className="bg-white rounded-xl border border-[#e7f3e7] p-6 shadow-sm text-center">
                                <h2 className="text-sm font-black uppercase tracking-widest text-[#586458] mb-6 text-left">
                                    {order.status === 'searching' ? 'Статус поиска' : 'Ваш курьер'}
                                </h2>

                                {order.status === 'searching' ? (
                                    <div className="py-8 flex flex-col items-center">
                                        <div className="size-16 rounded-full bg-[#f8fcf8] border-2 border-dashed border-[#42f042] flex items-center justify-center mb-4 animate-pulse">
                                            <span className="material-symbols-outlined text-[#42f042] text-3xl">local_shipping</span>
                                        </div>
                                        <p className="font-bold text-[#0d1b0d]">Ищем подходящего курьера...</p>
                                        <p className="text-xs text-[#586458] mt-2">Обычно это занимает до 10 минут</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="size-24 rounded-full bg-slate-100 mx-auto mb-4 border-4 border-[#f8fcf8] shadow-sm overflow-hidden">
                                            <img src="https://ui-avatars.com/api/?name=Alexey+Petrov&background=42f042&color=0d1b0d" alt="courier" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-1">Алексей Петров</h3>
                                        <p className="text-sm text-[#586458] mb-4">Газель (А 777 ББ 177)</p>
                                    </>
                                )}
                            </section>

                            <section className="bg-white rounded-xl border border-[#e7f3e7] p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#42f042]">receipt_long</span>
                                    Финансовый отчёт
                                </h2>
                                <div className="h-px bg-[#e7f3e7] my-4"></div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-base font-bold">Стоимость услуги</span>
                                    <span className="text-2xl font-black text-[#42f042]">{order.price} ₽</span>
                                </div>
                                {/* Кнопка подтверждения только если статус active */}
                                {order.status === 'active' && (
                                    <button
                                        onClick={handleConfirmOrder}
                                        className="w-full py-4 bg-[#42f042] hover:bg-[#32d032] text-[#0d1b0d] font-bold rounded-lg transition-all"
                                    >
                                        Подтвердить выполнение
                                    </button>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-xs font-bold text-[#586458] uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-bold text-[#0d1b0d]">{value}</p>
    </div>
);

export default CustomerOrderDetails;