TRUNCATE tender_status_history, contracts, bids, tenders, users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, password, role, organization) VALUES
('Администратор', 'admin@gov.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 'Госзакупки РФ');

INSERT INTO users (name, email, password, role, organization) VALUES
('Иван Петров',    'petrov@minzdrav.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'customer', 'Министерство здравоохранения'),
('Мария Соколова', 'sokolova@minobr.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'customer', 'Министерство образования');

INSERT INTO users (name, email, password, role, organization) VALUES
('Алексей Смирнов',   'smirnov@medtech.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'supplier', 'ООО «МедТех»'),
('Ольга Кузнецова',   'kuznetsova@stroyprom.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'supplier', 'АО «СтройПром»'),
('Дмитрий Волков',    'volkov@itservice.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'supplier', 'ООО «АйТи-Сервис»'),
('Елена Морозова',    'morozova@bookhouse.ru',
 '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'supplier', 'ООО «КнижныйДом»');

INSERT INTO tenders (title, description, start_price, status, deadline, customer_id) VALUES
('Поставка медицинского оборудования',
 'Закупка аппаратов ИВЛ для городских больниц, 20 единиц.',
 5000000.00, 'published', now() + interval '14 days', 2),
('Закупка лекарственных препаратов',
 'Поставка препаратов первой необходимости на квартал.',
 2300000.00, 'published', now() + interval '10 days', 2),
('Ремонт инженерных систем поликлиники №5',
 'Капитальный ремонт системы вентиляции и отопления.',
 1800000.00, 'published', now() - interval '2 days', 2);

INSERT INTO tenders (title, description, start_price, status, deadline, customer_id) VALUES
('Поставка учебной литературы',
 'Учебники для школ региона на новый учебный год.',
 1200000.00, 'published', now() + interval '20 days', 3),
('Оснащение компьютерных классов',
 'Поставка и настройка 150 рабочих станций.',
 4500000.00, 'published', now() + interval '7 days', 3);

INSERT INTO bids (tender_id, supplier_id, price, comment) VALUES
(1, 4, 4800000.00, 'Оборудование в наличии, поставка 30 дней'),
(1, 5, 4950000.00, 'Гарантия 3 года, обучение персонала включено');

INSERT INTO bids (tender_id, supplier_id, price, comment) VALUES
(2, 4, 2250000.00, 'Полный ассортимент, поставка партиями');

INSERT INTO bids (tender_id, supplier_id, price, comment) VALUES
(4, 7, 1150000.00, 'Прямые поставки от издательств'),
(4, 6, 1180000.00, 'Доставка по всему региону');

INSERT INTO bids (tender_id, supplier_id, price, comment) VALUES
(5, 6, 4300000.00, 'Техника с расширенной гарантией'),
(5, 5, 4400000.00, 'Установка и пусконаладка включены');

CALL sp_award_tender(5, 7);

DO $$
BEGIN
    RAISE NOTICE 'Seed выполнен. Пользователей: %, Тендеров: %, Заявок: %, Контрактов: %',
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM tenders),
        (SELECT COUNT(*) FROM bids),
        (SELECT COUNT(*) FROM contracts);
END $$;
