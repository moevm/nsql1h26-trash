import React, { useState } from 'react';
import { useLocation} from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const WithdrawMoney = () => {
    const location = useLocation();
    const userName = location.state?.userName || "Дмитрий К.";
    const [amount, setAmount] = useState('1000');
    const [cardNumber, setCardNumber] = useState('');

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display">
            <Sidebar activePage="wallet" userName={userName} />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-[#e7f3e7] bg-white shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-text-main">Вывод средств</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#e7f3e7] shadow-sm">
                            <span className="material-symbols-outlined text-green-600">account_balance_wallet</span>
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[10px] text-gray-500 font-medium uppercase">Баланс</span>
                                <span className="text-text-main font-bold text-base">5 420 ₽</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">

                        <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0d330d] to-[#1a551a] shadow-lg text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-end md:items-center">
                            <div className="relative z-10 flex flex-col gap-2">
                                <div className="flex items-center gap-2 opacity-80 mb-1">
                                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                                    <span className="text-sm font-medium uppercase tracking-wider">Доступно для вывода</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">5 420 ₽</h1>
                            </div>
                            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary opacity-10 blur-3xl"></div>
                            <div className="relative z-10 mt-6 md:mt-0">
                                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                    История выводов
                                </button>
                            </div>
                        </section>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold mb-6 text-slate-900">Оформление вывода</h2>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                                    <div className="md:col-span-7 space-y-8">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-3">Выберите сумму</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button onClick={() => setAmount('500')} className={`py-3 px-4 rounded-lg border transition-all ${amount === '500' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary'}`}>
                                                    <span className="font-bold text-slate-800">500 ₽</span>
                                                </button>
                                                <button onClick={() => setAmount('1000')} className={`relative py-3 px-4 rounded-lg border-2 transition-all ${amount === '1000' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                                                    <span className="font-bold text-primary">1000 ₽</span>
                                                    <div className="absolute -top-2 -right-2 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">ПОПУЛЯРНО</div>
                                                </button>
                                                <button onClick={() => setAmount('5420')} className="py-3 px-4 rounded-lg border border-slate-200 hover:border-primary transition-all">
                                                    <span className="font-bold text-slate-800">Все</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Custom Amount */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-3">Или введите свою сумму</label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-slate-400 sm:text-lg material-symbols-outlined">payments</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="block w-full rounded-lg border-slate-200 py-3.5 pl-10 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary sm:text-lg"
                                                    placeholder="0"
                                                />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <span className="text-slate-500 sm:text-lg font-bold">₽</span>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-400">Минимальная сумма вывода: 500 ₽</p>
                                        </div>

                                        {/* Card Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-3">Номер карты</label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-slate-400 sm:text-lg material-symbols-outlined">credit_card</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(e.target.value)}
                                                    className="block w-full rounded-lg border-slate-200 py-3.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary sm:text-lg"
                                                    placeholder="0000 0000 0000 0000"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-5 flex flex-col justify-between space-y-8 bg-slate-50 rounded-xl p-6 border border-slate-100">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-4">Информация о выводе</label>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-500">Сумма к выводу:</span>
                                                    <span className="text-base font-bold text-slate-900">{amount} ₽</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-500">Комиссия (0%):</span>
                                                    <span className="text-base font-semibold text-slate-900">0 ₽</span>
                                                </div>
                                                <div className="h-px bg-slate-200"></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-slate-600">Вы получите:</span>
                                                    <span className="text-xl font-bold text-primary">{amount} ₽</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                <div className="flex gap-3">
                                                    <span className="material-symbols-outlined text-blue-600 text-[20px] shrink-0">info</span>
                                                    <div>
                                                        <p className="text-xs text-blue-800 font-medium mb-1">Сроки зачисления</p>
                                                        <p className="text-xs text-blue-600">Средства поступят на карту в течение 1-3 рабочих дней</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-200">
                                            <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 text-base font-bold text-[#111811] shadow hover:bg-opacity-90 transition-all">
                                                <span className="material-symbols-outlined text-[20px]">send</span>
                                                Вывести средства
                                            </button>
                                            <p className="mt-3 text-center text-[10px] text-slate-400 leading-tight">
                                                Нажимая кнопку, вы подтверждаете корректность указанных данных и согласие с условиями вывода средств.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#e7f3e7] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[#e7f3e7]">
                                <h3 className="text-lg font-bold text-text-main">Последние выводы</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-[#f8fcf8] text-[#586458] text-sm">
                                        <th className="px-6 py-4 font-medium">Дата</th>
                                        <th className="px-6 py-4 font-medium">Сумма</th>
                                        <th className="px-6 py-4 font-medium">Карта</th>
                                        <th className="px-6 py-4 font-medium">Статус</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e7f3e7]">
                                    {[
                                        { date: '23 фев, 15:00', amount: '5 000 ₽', card: '**** 4532', status: 'Выполнено' },
                                        { date: '15 фев, 10:30', amount: '3 000 ₽', card: '**** 4532', status: 'Выполнено' },
                                        { date: '08 фев, 14:20', amount: '7 500 ₽', card: '**** 4532', status: 'Выполнено' }
                                    ].map((item, i) => (
                                        <tr key={i} className="hover:bg-[#f8fcf8] transition-colors">
                                            <td className="px-6 py-4 text-sm text-[#0d1b0d]">{item.date}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-text-main">{item.amount}</td>
                                            <td className="px-6 py-4 text-sm text-[#586458]">{item.card}</td>
                                            <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {item.status}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WithdrawMoney;