import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const OrderDetails = () => {
    const { orderId } = useParams(); // Получаем ID из URL
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [hasPhoto, setHasPhoto] = useState(false);

    useEffect(() => {
        fetch(`/api/v1/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("DEBUG: [FRONTEND] Данные от API:", data);
                setOrder(data);
                setStatus(data.status);
                setHasPhoto(!!data.completion_photo);
                setLoading(false);
            })
            .catch(err => console.error("Ошибка:", err));
    }, [orderId]);
    if (loading) return <div>Загрузка заказа...</div>;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleUploadPhoto = async () => {
        setPhotoUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch(`/api/v1/orders/${orderId}/photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                body: formData
            });
            if (res.ok) {
                setHasPhoto(true);
                alert("Фото успешно загружено!");
            }
        } catch (err) { alert("Ошибка загрузки"); }
        finally { setPhotoUploading(false); }
    };
    const handleAction = async () => {
        const nextStatus = status === 'searching' ? 'active' : 'done';
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (res.ok) {
                // Мгновенно обновляем стейты, чтобы интерфейс перерисовался
                setStatus(nextStatus);

                // Получаем свежие данные с сервера
                const updatedRes = await fetch(`/api/v1/orders/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
                const updatedData = await updatedRes.json();

                setOrder(updatedData);
                setHasPhoto(!!updatedData.completion_photo);

            } else {
                const err = await res.json();
                alert(err.detail);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="bg-[#f6f8f6] text-[#0d1b0d] antialiased h-screen overflow-hidden flex font-display">
            <Sidebar activePage="available" />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f6f8f6]">
                {/* Header*/}
                <header className="h-20 flex items-center justify-between px-8 border-b border-[#e7f3e7] bg-white shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#0d1b0d] transition-colors">
                            <span className="icon-base">arrow_back</span>
                            <span className="text-sm font-medium">Назад</span>
                        </button>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <h2 className="text-2xl font-bold text-[#0d1b0d]">Детали заказа №{order.id}</h2>

                        {/* Статус */}
                        <span className={`... ${
                            status === 'searching' ? 'bg-orange-100 text-orange-600' :
                                status === 'active' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                        }`}>
                            {status === 'searching' ? 'Ожидает' : status === 'active' ? 'В работе' : 'Выполнен'}
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        <div className="xl:col-span-2 space-y-6">

                            {/* Информация о мусоре */}
                            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-[#0d1b0d] flex items-center gap-2">
                                        <span className="icon-base text-gray-400">inventory_2</span>
                                        Информация о мусоре
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Тип мусора</p>
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 bg-red-50 text-red-500 rounded-md">
                                                    <span className="icon-base text-lg">delete_forever</span>
                                                </span>
                                                <span className="text-base font-semibold text-[#0d1b0d]">{order.waste_type}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Объем / Вес</p>
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 bg-blue-50 text-blue-500 rounded-md">
                                                    <span className="icon-base text-lg">scale</span>
                                                </span>
                                                <span className="text-base font-semibold text-[#0d1b0d]">{order.volume} м³</span>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Описание</p>
                                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                {order.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Местоположение */}
                            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-[#0d1b0d] flex items-center gap-2">
                                        <span className="icon-base text-gray-400">location_on</span>
                                        Местоположение
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Адрес забора</p>
                                            <p className="text-xl font-bold text-[#0d1b0d]">{order.address}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-[#0d1b0d]">
                                                Подъезд: <span className="font-bold">{order.address_details?.entrance ?  order.address_details.entrance : ''}</span>
                                            </div>
                                            <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-[#0d1b0d]">
                                                Этаж: <span className="font-bold">{order.address_details?.floor || '-'}</span>
                                            </div>
                                            <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-[#0d1b0d]">
                                                Домофон: <span className="font-bold">{order.address_details?.intercom || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {status === 'active' && !hasPhoto && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <h3 className="text-sm font-bold text-[#0d1b0d] mb-4">Фотофиксация (Обязательно)</h3>
                                            <input type="file" id="photo" className="hidden" onChange={handleFileChange} />
                                            <label htmlFor="photo" className="block cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-green-500 transition-colors">
                                                {filePreview ? <img src={filePreview} className="h-32 mx-auto rounded" /> : "Нажмите, чтобы выбрать фото"}
                                            </label>
                                            {selectedFile && (
                                                <button
                                                    onClick={handleUploadPhoto}
                                                    disabled={photoUploading}
                                                    className="mt-4 w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                                                >
                                                    {photoUploading ? 'Загрузка...' : 'Загрузить фото'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>


                        {/* Правая колонка */}
                        <div className="space-y-6">
                            <div className={`bg-white rounded-xl border ${status === 'completed' ? 'border-gray-200 opacity-75' : 'border-[#13ec13]'} shadow-sm overflow-hidden relative`}>
                                {status !== 'completed' && <div className="absolute top-0 left-0 w-full h-1 bg-[#13ec13]"></div>}
                                <div className="p-6">
                                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-6 flex items-center gap-2">
                                        <span className="icon-base text-[18px]">payments</span>
                                        Финансовые детали
                                    </h3>
                                    {/* Финансовые детали */}
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-gray-600 font-medium">Сумма выплаты</span>
                                        <span className="text-4xl font-black text-[#0d1b0d]">
                                        {order.transaction ? `${order.transaction.amount} ₽` : (order.price ? `${order.price} ₽` : '0 ₽')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-dashed border-gray-200 mt-4 mb-6">
                                        <span className="text-sm text-gray-500">Тип оплаты</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Онлайн</span>
                                    </div>

                                    <button
                                        onClick={handleAction}
                                        disabled={loading || status === 'done' || (status === 'active' && !hasPhoto)}
                                        className={`w-full font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-lg ${
                                            (status === 'done' || (status === 'active' && !hasPhoto))
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' // Сделали серым, если фото не загружено
                                                : 'bg-[#13ec13] hover:bg-[#0fd60f] text-[#0d1b0d] shadow-lg shadow-green-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95'
                                        }`}
                                    >
                                        <span>
                                        {loading ? 'Обработка...' :
                                            status === 'searching' ? 'Взять заказ' :
                                                status === 'active' ? (hasPhoto ? 'Завершить заказ' : 'Сначала добавьте фото') : 'Заказ выполнен'}
                                        </span>
                                        <span className="icon-base">
                                        {loading ? 'autorenew' :
                                            status === 'searching' ? 'pan_tool' :
                                                status === 'active' ? 'task_alt' : 'verified'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-5 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl uppercase">
                                        {order.client_name ? order.client_name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#0d1b0d] leading-none">{order.client_name || "Неизвестный заказчик"}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase font-black mt-1">Заказчик</p>
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

export default OrderDetails;