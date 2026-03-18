import React from 'react';

const ChooseRoleAdmin = () => {
    return (
        <div className="bg-background-light text-text-main font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-black">

            {/* Navbar */}
            <header className="w-full bg-white border-b border-[#e7f3e7] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-primary">recycling</span>
                            <h1 className="text-xl font-bold tracking-tight text-text-main">ЭкоСервис</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="hidden md:flex items-center justify-center h-11 px-6 rounded-xl bg-primary/10 hover:bg-primary/20 text-green-700 font-bold transition-colors">
                                Выйти
                            </button>
                            <div className="size-11 rounded-full bg-gray-200 overflow-hidden ring-2 ring-primary/20 border-2 border-white shadow-sm">
                                <img
                                    alt="User avatar"
                                    className="w-full h-full object-cover"
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[50%] bg-primary/5 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-7xl z-10">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-main">
                            Выберите профиль для входа
                        </h2>
                        <p className="text-[#4c9a4c] text-lg max-w-2xl mx-auto font-medium">
                            Укажите вашу роль в системе для перехода в соответствующую панель управления.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">

                        <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e7f3e7] hover:border-primary/50 hover:-translate-y-1.5">
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                                <img
                                    alt="Customer"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800"
                                />
                                <div className="absolute bottom-4 left-4 z-20 bg-white/95 p-2 rounded-xl backdrop-blur-sm shadow-lg">
                                    <span className="material-symbols-outlined text-primary text-2xl block">home_work</span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <h3 className="text-2xl font-bold text-text-main mb-3">Заказчик</h3>
                                <p className="text-[#4c9a4c] mb-8 flex-grow leading-relaxed text-sm">
                                    Оформляйте заявки на вывоз отходов и следите за их выполнением в реальном времени.
                                </p>
                                <button className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-[0_4px_12px_0_rgba(19,236,19,0.2)]">
                                    Войти как заказчик
                                </button>
                            </div>
                        </div>

                        {/* Courier Card */}
                        <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e7f3e7] hover:border-primary/50 hover:-translate-y-1.5">
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                                <img
                                    alt="Courier"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=800"
                                />
                                <div className="absolute bottom-4 left-4 z-20 bg-white/95 p-2 rounded-xl backdrop-blur-sm shadow-lg">
                                    <span className="material-symbols-outlined text-primary text-2xl block">local_shipping</span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <h3 className="text-2xl font-bold text-text-main mb-3">Курьер</h3>
                                <p className="text-[#4c9a4c] mb-8 flex-grow leading-relaxed text-sm">
                                    Принимайте заказы поблизости, стройте маршруты и зарабатывайте на эко-логистике.
                                </p>
                                <button className="w-full py-3.5 bg-text-main hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg">
                                    Войти как курьер
                                </button>
                            </div>
                        </div>

                        {/* Admin Card */}
                        <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e7f3e7] hover:border-blue-400/50 hover:-translate-y-1.5">
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent z-10"></div>
                                <img
                                    alt="Admin"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800"
                                />
                                <div className="absolute bottom-4 left-4 z-20 bg-white/95 p-2 rounded-xl backdrop-blur-sm shadow-lg">
                                    <span className="material-symbols-outlined text-blue-600 text-2xl block">admin_panel_settings</span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <h3 className="text-2xl font-bold text-text-main mb-3">Администратор</h3>
                                <p className="text-[#4c9a4c] mb-8 flex-grow leading-relaxed text-sm">
                                    Управление платформой, модерация пользователей и мониторинг общей статистики сервиса.
                                </p>
                                <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_0_rgba(37,99,235,0.2)]">
                                    Войти как администратор
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
};

export default ChooseRoleAdmin;