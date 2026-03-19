import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCustomer from './SidebarCustomer.jsx';
const ApproveOrder = () => {
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasPhoto, setHasPhoto] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setHasPhoto(true);
        }
    };

    const handleComplete = () => {
        if (hasPhoto) {
            setIsCompleted(true);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f8f6] font-display text-[#0d1b0d] antialiased">
            {/* Sidebar */}
            <SidebarCustomer activePage="/create-order" />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f6f8f6]">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-[#e7f3e7] bg-white shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-gray-500 hover:text-[#0d1b0d] transition-colors"
                                onClick={() => navigate('/customer-dashboard')}>
                            <span className="material-symbols-outlined">arrow_back</span>
                            <span className="text-sm font-medium">Назад</span>
                        </button>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <h2 className="text-2xl font-bold text-[#0d1b0d]">Заказ №4829</h2>

                        {isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">done</span> Выполнен
                            </span>
                        ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">
                                В работе
                            </span>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">

                        <div className="xl:col-span-2 space-y-6">

                            {/* Информация о мусоре */}
                            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-[#0d1b0d] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400">inventory_2</span>
                                        Информация о мусоре
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <InfoBlock
                                            icon="delete_forever"
                                            label="Тип мусора"
                                            value="Бытовой мусор"
                                            iconColor="text-red-500"
                                            bgColor="bg-red-50"
                                        />
                                        <InfoBlock
                                            icon="scale"
                                            label="Объем / Вес"
                                            value="~ 5-10 кг (2 пакета)"
                                            iconColor="text-blue-500"
                                            bgColor="bg-blue-50"
                                        />
                                        <div className="sm:col-span-2">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Описание от клиента</p>
                                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                Два больших черных пакета с бытовым мусором. Стекла нет, только пластик и бумага. Стоят у двери в коридоре.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Местоположение */}
                            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-[#0d1b0d] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400">location_on</span>
                                        Адрес забора
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Адрес</p>
                                            <p className="text-xl font-bold text-[#0d1b0d]">ул. Ленина, 45, кв. 12</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <Badge label="Подъезд" value="3" />
                                            <Badge label="Этаж" value="4" />
                                            <Badge label="Домофон" value="1234" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Секция подтверждения*/}
                            {!isCompleted && (
                                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-[#0d1b0d] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400">photo_camera</span>
                                            Подтверждение выполнения
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm text-gray-600 mb-4">Пожалуйста, прикрепите фото вывезенного мусора или чистого места.</p>
                                        <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all relative group
                                            ${hasPhoto ? 'border-[#13ec13] bg-[#f0fff0]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                                <span className={`material-symbols-outlined text-4xl mb-2 transition-colors ${hasPhoto ? 'text-[#13ec13]' : 'text-gray-400'}`}>
                                                    {hasPhoto ? 'task_alt' : 'cloud_upload'}
                                                </span>
                                                <p className="mb-1 text-sm">
                                                    <span className="font-bold text-[#0d1b0d]">
                                                        {hasPhoto ? 'Фотография прикреплена' : 'Нажмите для загрузки фото'}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG (Макс. 10МБ)</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Правая колонка */}
                        <div className="space-y-6">
                            {/* Финансовая карточка */}
                            <div className="bg-white rounded-xl border border-[#13ec13] shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#13ec13]"></div>
                                <div className="p-6">
                                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-6">Оплата за заказ</h3>
                                    <div className="flex items-baseline justify-between mb-4">
                                        <span className="text-gray-600 font-medium">К выплате</span>
                                        <span className="text-4xl font-black text-[#0d1b0d]">350 ₽</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-dashed border-gray-200 mb-6">
                                        <span className="text-sm text-gray-500">Способ</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Онлайн</span>
                                    </div>

                                    <button
                                        onClick={handleComplete}
                                        disabled={!hasPhoto || isCompleted}
                                        className={`w-full font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-lg
                                            ${isCompleted
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : hasPhoto
                                                ? 'bg-[#13ec13] hover:bg-[#0fd60f] text-[#0d1b0d] shadow-lg shadow-green-100'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                                        }`}
                                    >
                                        <span>{isCompleted ? 'Заказ завершен' : 'Заказ выполнен'}</span>
                                        <span className="material-symbols-outlined">
                                            {isCompleted ? 'verified' : 'task_alt'}
                                        </span>
                                    </button>

                                    {!hasPhoto && !isCompleted && (
                                        <p className="text-[10px] text-center text-red-500 mt-3 font-bold uppercase tracking-tight">
                                            Сначала приложите фото подтверждение
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Карточка клиента */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl">
                                    М
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0d1b0d]">Мария Иванова</h4>
                                    <p className="text-xs text-gray-500">Заказчик</p>
                                </div>
                                <button className="ml-auto text-gray-400 hover:text-[#13ec13]">
                                    <span className="material-symbols-outlined text-[20px]">chat</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

// Вспомогательные компоненты
const NavItem = ({ icon, label, active = false }) => (
    <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-[#e7f3e7] text-[#0d1b0d]' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`} href="#">
        <span className="material-symbols-outlined">{icon}</span>
        <span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </a>
);

const InfoBlock = ({ icon, label, value, iconColor, bgColor }) => (
    <div>
        <p className="text-xs text-gray-500 uppercase font-bold mb-1.5">{label}</p>
        <div className="flex items-center gap-2">
            <span className={`p-2 ${bgColor} ${iconColor} rounded-lg`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </span>
            <span className="text-base font-bold text-[#0d1b0d]">{value}</span>
        </div>
    </div>
);

const Badge = ({ label, value }) => (
    <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-[#0d1b0d]">
        <span className="text-gray-500 font-normal">{label}:</span> <span className="font-bold">{value}</span>
    </div>
);

export default ApproveOrder;