import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate} from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const WithdrawMoney = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userName = location.state?.userName || "Дмитрий К.";
    const [amount, setAmount] = useState('1000');
    const [cardNumber, setCardNumber] = useState('');
    const [balance, setBalance] = useState(0);
    const [cardError, setCardError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBalance = async () => {
        try {
            const response = await fetch('/api/v1/courier/balance', {
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
    const handleWithdraw = async () => {
        if (!isFormValid() || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/courier/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    card_number: cardNumber.replace(/\s/g, '')
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Заявка на вывод успешно создана!');

                setCardNumber('');
                setAmount('1000');
                if (data.new_balance !== undefined) {
                    setBalance(data.new_balance);
                }
            } else {
                alert(data.detail || 'Ошибка при выводе');
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert('Проблема с соединением');
        } finally {
            setIsLoading(false);
        }
    };
    const validateCardNumber = (number) => {
        const res = String(number).replace(/\s+/g, '');

        if (!/^\d{16}$/.test(res)) return false;

        // Алгоритм Луна
        let sum = 0;
        for (let i = 0; i < res.length; i++) {
            let cardNum = parseInt(res[i]);
            if ((res.length - i) % 2 === 0) {
                cardNum *= 2;
                if (cardNum > 9) cardNum -= 9;
            }
            sum += cardNum;
        }
        return sum % 10 === 0;
    };
    const handleCardChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);

        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(formattedValue);
    };

    const isFormValid = () => {
        const amountNum = Number(amount);
        const isValidCard = validateCardNumber(cardNumber);
        return amountNum >= 500 && amountNum <= balance && isValidCard;
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light text-text-main font-display">
            <Sidebar activePage="wallet" userName={userName} />

            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-[#e7f3e7] bg-white shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-text-main">Вывод средств</h2>
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
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{balance.toLocaleString()} ₽</h1>
                            </div>
                            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary opacity-10 blur-3xl"></div>
                            <div className="relative z-10 mt-6 md:mt-0">
                                <button
                                    onClick={() => navigate('/courier-wallet', { state: { userName } })}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                    История аккаунта
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
                                                <button
                                                    onClick={() => setAmount(balance.toString())}
                                                    className={`py-3 px-4 rounded-lg border transition-all ${amount === balance.toString() ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary'}`}
                                                >
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
                                                    <span className={`text-${cardError ? 'red' : 'slate'}-400 sm:text-lg material-symbols-outlined`}>
                                                        credit_card
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={cardNumber}
                                                    onChange={handleCardChange}
                                                    onBlur={() => setCardError(cardNumber.length > 0 && !validateCardNumber(cardNumber))}
                                                    className={`block w-full rounded-lg border-${cardError ? 'red-500' : 'slate-200'} py-3.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-${cardError ? 'red-500' : 'primary'} sm:text-lg`}
                                                    placeholder="0000 0000 0000 0000"
                                                />
                                            </div>
                                            {cardError && <p className="mt-1 text-xs text-red-500 font-medium">Некорректный номер карты</p>}
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
                                            <button
                                                onClick={handleWithdraw}
                                                disabled={!isFormValid() || isLoading}
                                                className={`w-full py-3 px-4 rounded-lg font-bold transition-all flex justify-center items-center gap-2 ${
                                                    (!isFormValid() || isLoading)
                                                        ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                                        : 'bg-primary text-[#111811] hover:scale-[1.02] active:scale-[0.98]'
                                                }`}
                                            >
                                                {isLoading ? (
                                                    <span className="animate-spin">⌛</span>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined">payments</span>
                                                        Вывести {amount} ₽
                                                    </>
                                                )}
                                            </button>
                                            <p className="mt-3 text-center text-[10px] text-slate-400 leading-tight">
                                                Нажимая кнопку, вы подтверждаете корректность указанных данных и согласие с условиями вывода средств.
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

export default WithdrawMoney;