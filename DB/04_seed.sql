-- =====================================================================
-- Система государственных закупок «GosZakupki»
-- Файл 04: Начальные данные (seed)
-- =====================================================================
-- Пароль у всех демо-пользователей: password123
-- Хеш получен алгоритмом bcrypt (10 раундов).
-- =====================================================================

-- Очистка данных и сброс счётчиков
TRUNCATE tender_status_history, contracts, bids, tenders, users RESTART IDENTITY CASCADE;

-- --- Пользователи -----------------------------------------------------
-- Администратор
INSERT INTO users (name, email, password, role, organization) VALUES
('Администратор', 'admin@gov.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 'Госзакупки РФ');

-- Заказчики (customer)
INSERT INTO users (name, email, password, role, organization) VALUES
('Иван Петров',    'petrov@minzdrav.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'customer', 'Министерство здравоохранения'),
('Мария Соколова', 'sokolova@minobr.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'customer', 'Министерство образования');

-- Поставщики (supplier)
INSERT INTO users (name, email, password, role, organization) VALUES
('Алексей Смирнов',   'smirnov@medtech.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'supplier', 'ООО «МедТех»'),
('Ольга Кузнецова',   'kuznetsova@stroyprom.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'supplier', 'АО «СтройПром»'),
('Дмитрий Волков',    'volkov@itservice.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'supplier', 'ООО «АйТи-Сервис»'),
('Елена Морозова',    'morozova@bookhouse.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'supplier', 'ООО «КнижныйДом»');

-- id: 1 admin | 2,3 заказчики | 4,5,6,7 поставщики

-- --- Тендеры ----------------------------------------------------------
-- Заказчик 2 (Минздрав)
INSERT INTO tenders (title, description, start_price, status, deadline, customer_id) VALUES
('Поставка медицинского оборудования',
 'Закупка аппаратов ИВЛ для городских больниц, 20 единиц.',
 5000000.00, 'published', now() + interval '14 days', 2),
('Закупка лекарственных препаратов',
 'Поставка препаратов первой необходимости на квартал.',
 2300000.00, 'published', now() + interval '10 days', 2),
('Ремонт инженерных систем поликлиники №5',
 'Капитальный ремонт системы вентиляции и отопления.',
 1800000.00, 'published', now() - interval '2 days', 2); -- дедлайн истёк

-- Заказчик 3 (Минобр)
INSERT INTO tenders (title, description, start_price, status, deadline, customer_id) VALUES
('Поставка учебной литературы',
 'Учебники для школ региона на новый учебный год.',
 1200000.00, 'published', now() + interval '20 days', 3),
('Оснащение компьютерных классов',
 'Поставка и настройка 150 рабочих станций.',
 4500000.00, 'published', now() + interval '7 days', 3);

-- id тендеров: 1,2,3 (Минздрав) | 4,5 (Минобр)

-- --- Заявки -----------------------------------------------------------
-- На тендер 1 (мед. оборудование) — поставщики 4 и 5
INSERT INTO bids (tender_id, supplier_id, price, comment) VALUES
(1, 4, 4800000.00, 'Оборудование в наличии, поставка 30 дней'),
(1, 5, 4950000.00, 'Гарантия 3 года, обучение персонала включено');

-- На тендер 2 (лекарства) — поставщик 4
INSERT INTO bids (tender_id, supplier_id, price, comment) VALUES
(2, 4, 2250000.00, 'Полный ассортимент, поставка партиями');

-- На тендер 4 (учебники) — поставщики 7 и 6
INSERT INTO bids (tender_id, supplier_id, price, comment) VALUES
(4, 7, 1150000.00, 'Прямые поставки от издательств'),
(4, 6, 1180000.00, 'Доставка по всему региону');

-- На тендер 5 (компьютеры) — поставщики 6 и 5
INSERT INTO bids (tender_id, supplier_id, price, comment) VALUES
(5, 6, 4300000.00, 'Техника с расширенной гарантией'),
(5, 5, 4400000.00, 'Установка и пусконаладка включены');

-- --- Определение победителя по тендеру 5 (через процедуру) ------------
-- Победитель — заявка поставщика 6 (id заявки 7), как минимальная
CALL sp_award_tender(5, 7);

-- Проверочные сообщения
DO $$
BEGIN
    RAISE NOTICE 'Seed выполнен. Пользователей: %, Тендеров: %, Заявок: %, Контрактов: %',
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM tenders),
        (SELECT COUNT(*) FROM bids),
        (SELECT COUNT(*) FROM contracts);
END $$;
