import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';
import {useAuth} from "../../AuthContext.jsx";

const CreateOrder = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);

    const [volume, setVolume] = useState(8);
    const [wasteType, setWasteType] = useState('Бытовой');
    const [city, setCity] = useState('Москва');
    const [price, setPrice] = useState(5000);
    const [comment, setComment] = useState('');
    const [street, setStreet] = useState('');
    const [house, setHouse] = useState('');
    const [entrance, setEntrance] = useState('');
    const [floor, setFloor] = useState('');
    const [intercom, setIntercom] = useState('');
    const { user, token, setBalance: setGlobalBalance } = useAuth();
    const accessToken = token || localStorage.getItem('access_token');

    const fetchBalance = async () => {
        try {
            const response = await fetch('/api/v1/client/balance', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBalance(data.balance);
                if (setGlobalBalance) setGlobalBalance(data.balance);
            }
        } catch (error) {
            console.error("Ошибка загрузки баланса:", error);
        }
    };

    const updatePrice = (newVolume) => {
        const basePrice = newVolume * 500 + 1000;
        setPrice(basePrice);
    };

    const handleCreateOrder = async () => {
        const totalCost = price + 500;

        if (balance < totalCost) {
            alert("Недостаточно средств на балансе!");
            return;
        }

        const orderData = {
            waste_type: wasteType,
            volume: Number(volume),
            address: `${city}, ул. ${street}, д. ${house}`,
            address_details: {
                entrance: entrance || null,
                floor: floor ? Number(floor) : null,
                intercom: intercom || null
            },
            scheduled_at: new Date().toISOString(),
            description: comment,
            status: "searching",
            price: totalCost
        };

        try {
            const response = await fetch('/api/v1/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                setBalance(prev => prev - totalCost);
                alert("Заказ успешно создан!");
                navigate(`/customer-dashboard`);
            } else {
                const err = await response.json();
                alert("Ошибка: " + (err.detail || "Не удалось создать заказ"));
            }
        } catch (e) {
            alert("Ошибка сети");
        }
    };
    useEffect(() => {
        fetchBalance();
    }, [accessToken]);
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f8f6] font-display text-[#0d1b0d] antialiased">
            <SidebarCustomer activePage="/create-order" />

            <main className="flex flex-1 flex-col overflow-y-auto">
                <header className="flex h-32 items-center justify-between border-b border-[#e7f3e7] px-8 bg-[#f6f8f6] sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-[#0d1b0d]">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold text-[#0d1b0d]">Оформление заказа</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Баланс */}
                        <div className="hidden md:flex items-center gap-2 rounded-full bg-white border border-[#e7f3e7] px-4 py-2 shadow-sm">
                            <span className="text-xs font-semibold uppercase text-[#4c9a4c]">Баланс</span>
                            <span className="text-sm font-bold text-[#0d1b0d]">{balance.toLocaleString()} ₽</span>
                            <button className="ml-2 flex size-6 items-center justify-center rounded-full bg-[#42f042] text-[#0d1b0d] hover:bg-[#32d032] transition-colors">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-[#e7f3e7] to-white rounded-2xl p-8 border border-[#d4ebd4]">
                        <div className="flex flex-col gap-2 max-w-xl">
                            <h1 className="text-3xl font-black tracking-tight text-[#0d1b0d]">Оформление нового заказа</h1>
                            <p className="text-[#4c9a4c] font-medium text-lg">Заполните форму ниже, чтобы рассчитать стоимость и заказать вывоз.</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Форма */}
                        <div className="flex-1 flex flex-col gap-8">

                            {/* 1. Тип мусора */}
                            <section className="bg-white rounded-xl p-6 shadow-sm border border-[#e7f3e7]">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#42f042]/20 text-[#0d1b0d] font-bold text-sm">1</span>
                                    <h2 className="text-[#0d1b0d] text-xl font-bold">Тип мусора</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" onChange={(e) => setWasteType(e.target.value)}>
                                    <TypeOption icon="delete_outline" title="Бытовой" id="type-1" name="waste_type" value="Бытовой" defaultChecked />
                                    <TypeOption icon="construction" title="Строительный" id="type-2" name="waste_type" value="Строительный" />
                                    <TypeOption icon="chair" title="Мебель" id="type-3" name="waste_type" value="Мебель" />
                                </div>
                            </section>

                            {/* 2. Детали */}
                            <section className="bg-white rounded-xl p-6 shadow-sm border border-[#e7f3e7]">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#42f042]/20 text-[#0d1b0d] font-bold text-sm">2</span>
                                    <h2 className="text-[#0d1b0d] text-xl font-bold">Детали заказа</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex justify-between text-sm font-medium text-[#0d1b0d] mb-2">
                                            <span>Объем мусора</span>
                                            <span className="text-[#42f042] font-bold">{volume} м³</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={volume}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setVolume(val);
                                                updatePrice(val);
                                            }}
                                            className="w-full h-2 bg-[#f6f8f6] rounded-lg appearance-none cursor-pointer accent-[#42f042]"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                                            <span>1 м³</span>
                                            <span>10 м³</span>
                                            <span>20 м³</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <span className="material-symbols-outlined text-yellow-600 mt-0.5">info</span>
                                        <p className="text-sm text-yellow-800">
                                            Обычный мусорный контейнер вмещает около 1.1 м³. Кузов Газели — это примерно 8-10 м³.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Адрес */}
                            <section className="bg-white rounded-xl p-6 shadow-sm border border-[#e7f3e7]">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#42f042]/20 text-[#0d1b0d] font-bold text-sm">3</span>
                                        <h2 className="text-[#0d1b0d] text-xl font-bold">Адрес вывоза</h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-[#0d1b0d] mb-1.5">Город</label>
                                        <input
                                            className="w-full py-2.5 px-3 bg-[#f6f8f6] rounded-lg text-sm"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>
                                    <InputField icon="signpost" label="Улица" placeholder="Улица" value={street} onChange={setStreet} />
                                    <InputField icon="home" label="Дом" placeholder="№" value={house} onChange={setHouse} />
                                    <InputField icon="apartment" label="Подъезд" placeholder="№" value={entrance} onChange={setEntrance} />
                                    <InputField icon="layers" label="Этаж" placeholder="№" value={floor} onChange={setFloor} />
                                    <InputField icon="dialpad" label="Домофон" placeholder="Код" value={intercom} onChange={setIntercom} />
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                    <label className="block text-sm font-medium text-[#0d1b0d] mb-1.5">
                                        Комментарий к заказу
                                    </label>
                                    <textarea
                                        className="block w-full px-3 py-2.5 bg-[#f6f8f6] border-transparent focus:border-[#42f042] focus:bg-white focus:ring-0 rounded-lg text-[#0d1b0d] text-sm transition-colors resize-none"
                                        rows="3"
                                        placeholder="Описание/пожелания"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    ></textarea>
                                </div>
                            </section>
                        </div>

                        {/* Правая колонка: Итог */}
                        <aside className="lg:w-[360px] flex-shrink-0">
                            <div className="sticky top-24">
                                <div className="bg-white rounded-xl shadow-lg border border-[#e7f3e7] overflow-hidden">
                                    <div className="p-6 border-b border-[#f0f0f0]">
                                        <h3 className="text-lg font-bold text-[#0d1b0d]">Ваш заказ</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <SummaryRow icon="delete" label="Тип отходов" value={wasteType} />
                                        <SummaryRow icon="widgets" label="Объем" value={`${volume} м³`} />
                                        <SummaryRow icon="location_on" label="Город" value={city} />

                                        <div className="h-px bg-gray-100 my-4"></div>

                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Стоимость работ</span>
                                            <span className="text-2xl font-black text-[#0d1b0d]">{price.toLocaleString()} ₽</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Подача машины</span>
                                            <span className="font-medium">500 ₽</span>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                                            <div className="flex justify-between items-end mb-6">
                                                <span className="text-base font-bold text-gray-600">Итого:</span>
                                                <span className="text-2xl font-black text-[#0d1b0d]">
                                                    {(price + 500).toLocaleString()} ₽
                                                </span>
                                            </div>
                                            <button
                                                className="w-full flex items-center justify-center gap-2 bg-[#42f042] hover:bg-[#32d032] text-[#0d1b0d] font-bold py-4 rounded-lg text-base shadow-lg shadow-[#42f042]/20 transition-all hover:scale-[1.02]"
                                                onClick={handleCreateOrder} // Теперь вызываем прямую отправку
                                            >
                                                Создать заказ
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </button>
                                            <p className="text-xs text-center text-gray-400 mt-3 leading-tight">
                                                Нажимая кнопку, вы соглашаетесь с <a href="#" className="underline hover:text-[#42f042]">условиями оферты</a>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-[#f6f8f6] p-4 text-center">
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                            <span className="material-symbols-outlined text-[16px] text-[#42f042]">verified_user</span>
                                            Безопасная оплата после выполнения
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

const TypeOption = ({ icon, title, name, id, value, defaultChecked }) => (
    <label className="relative cursor-pointer group">
        <input
            defaultChecked={defaultChecked}
            value={value}
            className="peer sr-only"
            name={name} id={id}
            type="radio" />
        <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-lg border-2 border-transparent bg-[#f6f8f6] hover:bg-[#eff5ef] peer-checked:border-[#42f042] peer-checked:bg-[#42f042]/5 transition-all h-full">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#42f042] group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <span className="text-[#0d1b0d] font-bold text-center text-sm">{title}</span>
        </div>
        <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 text-[#42f042] transition-opacity">
            <span className="material-symbols-outlined">check_circle</span>
        </div>
    </label>
);

const InputField = ({ icon, label, placeholder, value, onChange }) => (
    <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium text-[#0d1b0d] mb-1.5">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </span>
            <input
                className="block w-full pl-10 pr-3 py-2.5 bg-[#f6f8f6] rounded-lg text-sm"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

const SummaryRow = ({ icon, label, value }) => (
    <div className="flex justify-between items-start">
        <div>
            <p className="text-sm font-medium text-[#0d1b0d]">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
        <span className="material-symbols-outlined text-gray-300 text-[20px]">{icon}</span>
    </div>
);

export default CreateOrder;