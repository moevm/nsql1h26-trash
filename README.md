# ЭкоСервис (nsql1h26-trash)

Прототип сервиса вывоза отходов с ролями:

-   заказчик (`customer`)
-   курьер (`courier`)
-   администратор (`admin`)

## Быстрый запуск

```bash
docker compose build --no-cache
docker compose up
```

Доступ после запуска:

-   фронтенд: [http://127.0.0.1:8080](http://127.0.0.1:8080)
-   backend API: [http://127.0.0.1:8001](http://127.0.0.1:8001)

## Тестовые пользователи (создаются автоматически)

### Администратор

-   email: `admin@trash.local`
-   phone: `+70000000000`
-   password: `Admin123`
-   role: `admin`

**Общий пароль для всех тестовых курьеров и заказчиков:** `Demo1234!`

### Аккаунты Курьеров

*Используются для проверки принятия заказов, навигации и просмотра истории доходов в кошельке.*

Email

-   `demo_courier1@test.local`
-   `demo_courier2@test.local`
-   `demo_courier3@test.local`
-   `demo_courier4@test.local`
-   `demo_courier5@test.local`
-   `demo_courier6@test.local`
-   `demo_courier7@test.local`
-   `demo_courier8@test.local`
-   `demo_courier9@test.local`
-   `demo_courier10@test.local`

### Аккаунты Заказчиков

*Используются для создания заявок на вывоз и управления личным балансом.*

Email

-   `demo_customer1@test.local`
-   `demo_customer2@test.local`
-   `demo_customer3@test.local`
-   `demo_customer4@test.local`
-   `demo_customer5@test.local`
-   `demo_customer6@test.local`
-   `demo_customer7@test.local`
-   `demo_customer8@test.local`
-   `demo_customer9@test.local`
-   `demo_customer10@test.local`

Можно логиниться как по `email`, так и по `phone`.

**Также обращаем внимание, что при восстановлении пароля через почту, пароль приходит в логи Doker**

## Предварительная проверка заданий

[![1. Согласована и сформулирована тема курсовой](./../../actions/workflows/1_helloworld.yml/badge.svg)](./../../../actions/workflows/1_helloworld.yml)

[![2. Usecase](./../../actions/workflows/2_usecase.yml/badge.svg)](./../../../actions/workflows/2_usecase.yml)

[![3. Модель данных](./../../actions/workflows/3_data_model.yml/badge.svg)](./../../../actions/workflows/3_data_model.yml)

[![4. Прототип хранение и представление](./../../actions/workflows/4_prototype_store_and_view.yml/badge.svg)](./../../../actions/workflows/4_prototype_store_and_view.yml)

[![5. Прототип анализ](./../../actions/workflows/5_prototype_analysis.yml/badge.svg)](./../../../actions/workflows/5_prototype_analysis.yml)

[![6. Пояснительная записка](./../../actions/workflows/6_report.yml/badge.svg)](./../../../actions/workflows/6_report.yml)

[![7. App is ready](./../../actions/workflows/7_app_is_ready.yml/badge.svg)](./../../../actions/workflows/7_app_is_ready.yml)