import React, { useState, useEffect } from 'react';
import SidebarCustomer from './SidebarCustomer.jsx';
import { useAuth } from '../../AuthContext';

const TopUpBalance = () => {
    const [amount, setAmount] = useState('500');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [customAmount, setCustomAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const { user } = useAuth();

    const quickAmounts = ['100', '500', '1000'];
    const fetchBalance = async () => {
        try {
            const response = await fetch('/api/v1/client/balance', {
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
    const topUpBalance = async () => {
        const finalAmount = Number(amount);
        if (!finalAmount || finalAmount < 50) {
            alert("Минимальная сумма пополнения — 50 ₽");
            return;
        }

        try {
            const response = await fetch('/api/v1/client/top-up-balance', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: finalAmount,
                    payment_method: paymentMethod
                })
            });

            if (response.ok) {
                alert("Баланс успешно пополнен!");
                setCustomAmount('');
                fetchBalance();
            } else {
                const errorData = await response.json();
                alert("Ошибка: " + (errorData.detail || "Не удалось пополнить баланс"));
            }
        } catch (error) {
            console.error("Ошибка при пополнении:", error);
            alert("Произошла ошибка соединения с сервером");
        }
    };
    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fcf8] font-['Public_Sans'] text-[#0d1b0d]">
            <SidebarCustomer activePage="wallet" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-[#e7f3e7] bg-[#f8fcf8] px-8 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-[#0d1b0d]">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold text-[#0d1b0d]">Пополнение баланса</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-[#0d1b0d] leading-tight">{user?.full_name || "Пользователь"}</p>
                                <p className="text-xs text-[#586458]">{user?.role === 'customer' ? 'Частный клиент' : 'Пользователь'}</p>
                            </div>
                            <div
                                className="size-10 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDTiCI_dC7jSvEbQ_v7IfnxG_OwHa0E8UjvhNWe3nJfBSD6l2G_-4CqIQ5zRS5tNa9SzGqIDh51a7jZZ9zbMusSd_Oqf61kzX8dbNjO4AXM-ZO5LgR2oCAsLjWyQVmT6Y-1gYOL46we3CmSYpVZKzjqJ8jIVwqNCJo5X2MjvghqrcT7-l3Mfd8TrYjFa9q1vDR0Ea-KgtWbfJ2oLkQTWmCagcEeAY0BbkLf3pDv9NAIfHy_YAZotR5nT57p58_Dnitf5SEsrSNketFH')" }}
                            ></div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">

                        {/* Баланс*/}
                        <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0d330d] to-[#1a551a] shadow-lg text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-end md:items-center">
                            <div className="relative z-10 flex flex-col gap-2">
                                <div className="flex items-center gap-2 opacity-80 mb-1">
                                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                                    <span className="text-sm font-medium uppercase tracking-wider">Текущий баланс</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{balance.toLocaleString()} ₽</h1>
                            </div>
                            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#42f042] opacity-10 blur-3xl"></div>
                        </section>

                        {/* Основная карточка пополнения */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold mb-6 text-slate-900">Пополнение счёта</h2>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                                    {/* Выбор суммы */}
                                    <div className="md:col-span-7 space-y-8">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-3">Выберите сумму</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {quickAmounts.map((val) => (
                                                    <button
                                                        key={val}
                                                        onClick={() => {setAmount(val); setCustomAmount('');}}
                                                        className={`group relative flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all focus:outline-none ${
                                                            amount === val && !customAmount
                                                                ? 'border-[#42f042] bg-[#42f042]/5'
                                                                : 'border-slate-200 hover:border-[#42f042] hover:bg-[#42f042]/5'
                                                        }`}
                                                    >
                                                        <span className={`font-bold ${amount === val && !customAmount ? 'text-[#42f042]' : 'text-slate-800'}`}>
                                                            {val} ₽
                                                        </span>
                                                        {val === '500' && (
                                                            <div className="absolute -top-2 -right-2 bg-[#42f042] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">POPULAR</div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-3">Или введите свою сумму</label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-slate-400 material-symbols-outlined">payments</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => {setCustomAmount(e.target.value); setAmount(e.target.value);}}
                                                    placeholder="0"
                                                    className="block w-full rounded-lg border-slate-200 py-3.5 pl-10 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#42f042] focus:border-[#42f042] text-lg outline-none"
                                                />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <span className="text-slate-500 font-bold">₽</span>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-400">Минимальная сумма пополнения: 50 ₽</p>
                                        </div>
                                    </div>

                                    {/* Чек и Оплата */}
                                    <div className="md:col-span-5 flex flex-col justify-between space-y-8 bg-slate-50 rounded-xl p-6 border border-slate-100">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-4">Способ оплаты</label>
                                            <div className="space-y-3">
                                                {/* Карты */}
                                                <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-all ${paymentMethod === 'card' ? 'border-[#42f042] ring-1 ring-[#42f042]' : 'border-slate-200'}`}>
                                                    <input type="radio" className="sr-only" onChange={() => setPaymentMethod('card')} checked={paymentMethod === 'card'} />
                                                    <span className="flex flex-1 flex-col">
                                                        <span className="block text-sm font-bold text-slate-900">Банковская карта</span>
                                                        <span className="mt-1 text-xs text-slate-500">Visa, Mastercard, МИР</span>
                                                    </span>
                                                    <span className={`material-symbols-outlined ${paymentMethod === 'card' ? 'text-[#42f042]' : 'text-transparent'}`}>check_circle</span>
                                                </label>
                                                {/* СБП */}
                                                <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-all ${paymentMethod === 'sbp' ? 'border-[#42f042] ring-1 ring-[#42f042]' : 'border-slate-200'}`}>
                                                    <input type="radio" className="sr-only" onChange={() => setPaymentMethod('sbp')} checked={paymentMethod === 'sbp'} />
                                                    <span className="flex flex-1 flex-col">
                                                        <span className="block text-sm font-bold text-slate-900">СБП</span>
                                                        <span className="mt-1 text-xs text-slate-500">Быстрый платеж</span>
                                                    </span>
                                                    <span className={`material-symbols-outlined ${paymentMethod === 'sbp' ? 'text-[#42f042]' : 'text-transparent'}`}>check_circle</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm text-slate-500">К оплате:</span>
                                                <span className="text-xl font-bold text-slate-900">{amount || 0} ₽</span>
                                            </div>
                                            <button
                                                onClick={topUpBalance}
                                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#42f042] py-3 text-base font-bold text-[#111811] shadow-md hover:bg-opacity-90 transition-all active:scale-95">
                                                <span className="material-symbols-outlined text-[20px]">lock</span>
                                                Пополнить баланс
                                            </button>
                                            <p className="mt-3 text-center text-[10px] text-slate-400 leading-tight uppercase tracking-tighter">
                                                Нажимая кнопку, вы соглашаетесь с условиями оферты
                                            </p>
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

export default TopUpBalance;