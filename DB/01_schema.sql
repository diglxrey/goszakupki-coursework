-- =====================================================================
-- Система государственных закупок «GosZakupki»
-- Курсовая работа. Масалимов
-- Файл 01: Схема базы данных (таблицы, связи, индексы)
-- СУБД: PostgreSQL
-- =====================================================================

-- Удаление таблиц при повторном запуске (в обратном порядке зависимостей)
DROP TABLE IF EXISTS tender_status_history CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS tenders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================================
-- Таблица 1: users — пользователи системы (все роли)
-- =====================================================================
CREATE TABLE users (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,                 -- хеш bcrypt
    role         VARCHAR(20)  NOT NULL DEFAULT 'supplier'
                 CHECK (role IN ('customer', 'supplier', 'admin')),
    organization VARCHAR(200),                           -- название организации
    created_at   TIMESTAMP    NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users IS 'Пользователи системы: заказчики, поставщики, администраторы';
COMMENT ON COLUMN users.role IS 'Роль: customer (заказчик), supplier (поставщик), admin';

-- =====================================================================
-- Таблица 2: tenders — тендеры (государственные закупки)
-- =====================================================================
CREATE TABLE tenders (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(250) NOT NULL,
    description   TEXT,
    start_price   NUMERIC(14,2) NOT NULL CHECK (start_price > 0),  -- начальная цена
    status        VARCHAR(20)  NOT NULL DEFAULT 'published'
                  CHECK (status IN ('published', 'closed', 'awarded', 'cancelled')),
    deadline      TIMESTAMP    NOT NULL,                  -- дедлайн подачи заявок
    customer_id   INTEGER      NOT NULL
                  REFERENCES users(id) ON DELETE CASCADE,
    winner_bid_id INTEGER,                                -- FK на bids, задаётся при выборе победителя
    created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

COMMENT ON TABLE  tenders IS 'Тендеры (закупки), публикуемые заказчиками';
COMMENT ON COLUMN tenders.status IS 'published — опубликован, closed — приём заявок закрыт, awarded — определён победитель, cancelled — отменён';

-- =====================================================================
-- Таблица 3: bids — заявки поставщиков на участие в тендере
-- =====================================================================
CREATE TABLE bids (
    id          SERIAL PRIMARY KEY,
    tender_id   INTEGER       NOT NULL
                REFERENCES tenders(id) ON DELETE CASCADE,
    supplier_id INTEGER       NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,
    price       NUMERIC(14,2) NOT NULL CHECK (price > 0),  -- предложенная цена
    comment     TEXT,
    status      VARCHAR(20)   NOT NULL DEFAULT 'submitted'
                CHECK (status IN ('submitted', 'won', 'rejected')),
    created_at  TIMESTAMP     NOT NULL DEFAULT now(),
    -- один поставщик — одна заявка на один тендер
    CONSTRAINT uq_bid_tender_supplier UNIQUE (tender_id, supplier_id)
);

COMMENT ON TABLE  bids IS 'Заявки поставщиков на участие в тендерах';
COMMENT ON COLUMN bids.status IS 'submitted — подана, won — победила, rejected — отклонена';

-- Внешний ключ tenders.winner_bid_id добавляем после создания bids,
-- чтобы избежать циклической зависимости при создании таблиц
ALTER TABLE tenders
    ADD CONSTRAINT fk_tender_winner_bid
    FOREIGN KEY (winner_bid_id) REFERENCES bids(id) ON DELETE SET NULL;

-- =====================================================================
-- Таблица 4: contracts — контракты, заключённые с победителями
-- =====================================================================
CREATE TABLE contracts (
    id          SERIAL PRIMARY KEY,
    tender_id   INTEGER       NOT NULL
                REFERENCES tenders(id) ON DELETE CASCADE,
    bid_id      INTEGER       NOT NULL
                REFERENCES bids(id) ON DELETE CASCADE,
    supplier_id INTEGER       NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,
    customer_id INTEGER       NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,
    final_price NUMERIC(14,2) NOT NULL CHECK (final_price > 0),
    status      VARCHAR(20)   NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'terminated')),
    signed_at   TIMESTAMP     NOT NULL DEFAULT now(),
    -- по одному тендеру — один контракт
    CONSTRAINT uq_contract_tender UNIQUE (tender_id)
);

COMMENT ON TABLE  contracts IS 'Контракты, заключённые между заказчиком и победителем тендера';
COMMENT ON COLUMN contracts.status IS 'active — действует, completed — исполнен, terminated — расторгнут';

-- =====================================================================
-- Таблица 5: tender_status_history — история смены статусов тендера
-- =====================================================================
CREATE TABLE tender_status_history (
    id         SERIAL PRIMARY KEY,
    tender_id  INTEGER     NOT NULL
               REFERENCES tenders(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    note       VARCHAR(255),
    changed_at TIMESTAMP   NOT NULL DEFAULT now()
);

COMMENT ON TABLE tender_status_history IS 'Журнал изменений статуса тендеров (заполняется триггером)';

-- =====================================================================
-- Индексы для ускорения частых выборок
-- =====================================================================
CREATE INDEX idx_tenders_customer   ON tenders(customer_id);
CREATE INDEX idx_tenders_status     ON tenders(status);
CREATE INDEX idx_bids_tender        ON bids(tender_id);
CREATE INDEX idx_bids_supplier      ON bids(supplier_id);
CREATE INDEX idx_contracts_supplier ON contracts(supplier_id);
CREATE INDEX idx_contracts_customer ON contracts(customer_id);
CREATE INDEX idx_history_tender     ON tender_status_history(tender_id);
