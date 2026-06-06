# Государственные закупки

Клиент-серверное веб-приложение для проведения государственных закупок: публикация тендеров, подача заявок, выбор победителя и заключение контрактов с разграничением прав по ролям (заказчик, поставщик, администратор).

## Технологии

### Backend
- NestJS
- TypeScript
- Node.js
- TypeORM
- PostgreSQL
- Passport (JWT, local)
- JWT
- bcrypt

### Frontend
- React
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios

### База данных
- PostgreSQL (таблицы, представления, функции, хранимые процедуры, триггеры)

## Структура проекта

```
.
├── DB/                  # SQL-скрипты и объекты базы данных
└── Source/
    ├── backend/         # Серверная часть (NestJS)
    └── frontend/        # Клиентская часть (React)
```

## Запуск

### База данных
```bash
createdb goszakupki
psql -d goszakupki -f DB/01_schema.sql
psql -d goszakupki -f DB/02_views_functions.sql
psql -d goszakupki -f DB/03_procedures_triggers.sql
psql -d goszakupki -f DB/04_seed.sql
```

### Backend
```bash
cd Source/backend
npm install
npm run start:dev
```

### Frontend
```bash
cd Source/frontend
npm install
npm run dev
```
