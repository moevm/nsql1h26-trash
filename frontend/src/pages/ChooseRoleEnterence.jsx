import React from 'react';

const RoleSelectionPage = () => {
  return (
    <div className="bg-background-light text-text-main font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-black">

      {/* Navbar */}
      <header className="w-full bg-white border-b border-[#e7f3e7] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary">recycling</span>
              <h1 className="text-xl font-bold tracking-tight text-text-main">ЭкоСервис</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button className="hidden md:flex items-center justify-center h-11 px-6 rounded-xl bg-primary/10 hover:bg-primary/20 text-green-700 font-bold transition-colors">
                Выйти
              </button>
              <div className="size-11 rounded-full bg-gray-200 overflow-hidden ring-2 ring-primary/20 border-2 border-white">
                <img
                    alt="User avatar"
                    className="w-full h-full object-cover"
                    src="https://via.placeholder.com/100"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[50%] bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-5xl z-10">
          {/* Header Text */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-text-main">
              Выберите профиль для входа
            </h2>
            <p className="text-[#4c9a4c] text-lg max-w-2xl mx-auto font-medium">
              Укажите, под какой ролью вы хотите войти в систему. От этого зависит доступный функционал.
            </p>
          </div>

          {/* Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

            {/* Customer Card (Заказчик) */}
            <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e7f3e7] hover:border-primary/50 hover:-translate-y-1.5">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <img
                  alt="Customer profile"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute bottom-4 left-4 z-20 bg-white/95 p-2.5 rounded-xl backdrop-blur-sm shadow-lg">
                  <span className="material-symbols-outlined text-primary text-3xl block">home_work</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-text-main mb-3">Заказчик</h3>
                <p className="text-[#4c9a4c] mb-8 flex-grow leading-relaxed">
                  Быстрый и удобный сервис для вывоза бытовых отходов прямо от вашей двери. Идеально для жильцов квартир и частных домов.
                </p>
                <button className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(19,236,19,0.3)] active:scale-[0.98]">
                  Войти как заказчик
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Courier Card (Курьер) */}
            <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#e7f3e7] hover:border-primary/50 hover:-translate-y-1.5">
              <div className="h-56 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <img
                  alt="Courier profile"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=1000&auto=format&fit=crop"
                />
                <div className="absolute bottom-4 left-4 z-20 bg-white/95 p-2.5 rounded-xl backdrop-blur-sm shadow-lg">
                  <span className="material-symbols-outlined text-primary text-3xl block">local_shipping</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-text-main mb-3">Курьер</h3>
                <p className="text-[#4c9a4c] mb-8 flex-grow leading-relaxed">
                  Станьте нашим партнером, выполняйте заказы в удобное время и получайте доход. Гибкий график и еженедельные выплаты на карту.
                </p>
                <button className="w-full py-4 px-6 bg-text-main hover:bg-black text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]">
                  Войти как курьер
                  <span className="material-symbols-outlined text-xl">login</span>
                </button>
              </div>
            </div>

          </div>

          <p className="mt-12 text-center text-sm text-[#4c9a4c] font-medium">
            Нужна помощь? <button className="text-primary hover:underline font-bold transition-all">Связаться с поддержкой</button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RoleSelectionPage;