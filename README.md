# ЭкоСервис (nsql1h26-trash)

Прототип сервиса вывоза отходов с ролями:
- заказчик (`customer`)
- курьер (`courier`)
- администратор (`admin`)

## Быстрый запуск

```bash
docker compose build --no-cache
docker compose up
```

Доступ после запуска:
- фронтенд: http://127.0.0.1:8080
- backend API: http://127.0.0.1:8001
- ArangoDB: http://127.0.0.1:8529

## Тестовые пользователи (создаются автоматически при старте backend)

Пользователи создаются в `lifespan` приложения функцией `ensure_default_debug_users()`.

### 1) Администратор
- email: `admin@trash.local`
- phone: `+70000000000`
- password: `Admin123`
- role: `admin`

### 2) Курьер
- email: `courier@trash.local`
- phone: `+70000000001`
- password: `Courier123`
- role: `courier`

### 3) Заказчик
- email: `customer@trash.local`
- phone: `+70000000002`
- password: `Customer123`
- role: `customer`

Можно логиниться как по `email`, так и по `phone`.

## Настройка через переменные окружения

Дефолтные тестовые пользователи настраиваются через переменные (см. `backend/app/core/config.py`):
- `TRASH_DEBUG_ADMIN_*`
- `TRASH_DEBUG_COURIER_*`
- `TRASH_DEBUG_CUSTOMER_*`

## Предварительная проверка заданий

<a href=" ./../../../actions/workflows/1_helloworld.yml" >![1. Согласована и сформулирована тема курсовой]( ./../../actions/workflows/1_helloworld.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/2_usecase.yml" >![2. Usecase]( ./../../actions/workflows/2_usecase.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/3_data_model.yml" >![3. Модель данных]( ./../../actions/workflows/3_data_model.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/4_prototype_store_and_view.yml" >![4. Прототип хранение и представление]( ./../../actions/workflows/4_prototype_store_and_view.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/5_prototype_analysis.yml" >![5. Прототип анализ]( ./../../actions/workflows/5_prototype_analysis.yml/badge.svg)</a> 

<a href=" ./../../../actions/workflows/6_report.yml" >![6. Пояснительная записка]( ./../../actions/workflows/6_report.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/7_app_is_ready.yml" >![7. App is ready]( ./../../actions/workflows/7_app_is_ready.yml/badge.svg)</a>
