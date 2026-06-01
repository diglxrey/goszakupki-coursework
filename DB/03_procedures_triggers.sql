-- =====================================================================
-- Система государственных закупок «GosZakupki»
-- Файл 03: Хранимые процедуры (PROCEDURE) и триггеры (TRIGGER)
-- СУБД: PostgreSQL
-- =====================================================================

-- =====================================================================
-- ХРАНИМЫЕ ПРОЦЕДУРЫ (минимум 3)
-- =====================================================================

-- 1) Выбор победителя тендера.
--    Заказчик выбирает заявку вручную; процедура:
--      - проверяет корректность тендера и заявки;
--      - помечает выбранную заявку как 'won', остальные — 'rejected';
--      - переводит тендер в статус 'awarded' и проставляет winner_bid_id;
--      - создаёт контракт с финальной ценой из заявки.
DROP PROCEDURE IF EXISTS sp_award_tender(INTEGER, INTEGER);
CREATE OR REPLACE PROCEDURE sp_award_tender(p_tender_id INTEGER, p_bid_id INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
    v_tender   tenders%ROWTYPE;
    v_bid      bids%ROWTYPE;
BEGIN
    -- Получаем тендер
    SELECT * INTO v_tender FROM tenders WHERE id = p_tender_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Тендер с id=% не найден', p_tender_id;
    END IF;

    IF v_tender.status = 'awarded' THEN
        RAISE EXCEPTION 'По тендеру id=% победитель уже выбран', p_tender_id;
    END IF;

    IF v_tender.status = 'cancelled' THEN
        RAISE EXCEPTION 'Тендер id=% отменён, выбор победителя невозможен', p_tender_id;
    END IF;

    -- Получаем заявку и проверяем принадлежность тендеру
    SELECT * INTO v_bid FROM bids WHERE id = p_bid_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Заявка с id=% не найдена', p_bid_id;
    END IF;

    IF v_bid.tender_id <> p_tender_id THEN
        RAISE EXCEPTION 'Заявка id=% не относится к тендеру id=%', p_bid_id, p_tender_id;
    END IF;

    -- Помечаем заявки: выбранную — won, прочие по этому тендеру — rejected
    UPDATE bids SET status = 'rejected'
        WHERE tender_id = p_tender_id AND id <> p_bid_id;
    UPDATE bids SET status = 'won'
        WHERE id = p_bid_id;

    -- Обновляем тендер (триггер запишет смену статуса в историю)
    UPDATE tenders
        SET status = 'awarded', winner_bid_id = p_bid_id
        WHERE id = p_tender_id;

    -- Создаём контракт
    INSERT INTO contracts (tender_id, bid_id, supplier_id, customer_id, final_price, status)
    VALUES (p_tender_id, p_bid_id, v_bid.supplier_id, v_tender.customer_id, v_bid.price, 'active');
END;
$$;

COMMENT ON PROCEDURE sp_award_tender IS 'Выбор победителя тендера и заключение контракта';

-- 2) Отмена тендера. Переводит тендер в статус 'cancelled'
--    и отклоняет все поданные по нему заявки.
DROP PROCEDURE IF EXISTS sp_cancel_tender(INTEGER, VARCHAR);
CREATE OR REPLACE PROCEDURE sp_cancel_tender(p_tender_id INTEGER, p_reason VARCHAR DEFAULT NULL)
LANGUAGE plpgsql AS $$
DECLARE
    v_status VARCHAR(20);
BEGIN
    SELECT status INTO v_status FROM tenders WHERE id = p_tender_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Тендер с id=% не найден', p_tender_id;
    END IF;

    IF v_status = 'awarded' THEN
        RAISE EXCEPTION 'Нельзя отменить тендер id=%: победитель уже выбран', p_tender_id;
    END IF;

    UPDATE bids SET status = 'rejected' WHERE tender_id = p_tender_id;

    UPDATE tenders SET status = 'cancelled' WHERE id = p_tender_id;
END;
$$;

COMMENT ON PROCEDURE sp_cancel_tender IS 'Отмена тендера и отклонение всех его заявок';

-- 3) Закрытие приёма заявок по тендерам с истёкшим дедлайном.
--    Массовая операция: все 'published' тендеры с deadline < now() -> 'closed'.
DROP PROCEDURE IF EXISTS sp_close_expired_tenders();
CREATE OR REPLACE PROCEDURE sp_close_expired_tenders()
LANGUAGE plpgsql AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE tenders
        SET status = 'closed'
        WHERE status = 'published' AND deadline < now();
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Закрыто тендеров по истечении срока: %', v_count;
END;
$$;

COMMENT ON PROCEDURE sp_close_expired_tenders IS 'Закрывает приём заявок по тендерам с истёкшим дедлайном';

-- =====================================================================
-- ТРИГГЕРЫ (минимум 3)
-- =====================================================================

-- 1) Логирование смены статуса тендера в tender_status_history.
--    Срабатывает после UPDATE, если статус действительно изменился.
DROP TRIGGER IF EXISTS trg_log_tender_status ON tenders;
DROP FUNCTION IF EXISTS trg_fn_log_tender_status();
CREATE OR REPLACE FUNCTION trg_fn_log_tender_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO tender_status_history (tender_id, old_status, new_status, note)
        VALUES (NEW.id, OLD.status, NEW.status, 'Автоматическая запись (триггер)');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_tender_status
    AFTER UPDATE ON tenders
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_log_tender_status();

-- 2) Первичная запись в историю при создании тендера.
DROP TRIGGER IF EXISTS trg_log_tender_insert ON tenders;
DROP FUNCTION IF EXISTS trg_fn_log_tender_insert();
CREATE OR REPLACE FUNCTION trg_fn_log_tender_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO tender_status_history (tender_id, old_status, new_status, note)
    VALUES (NEW.id, NULL, NEW.status, 'Тендер создан');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_tender_insert
    AFTER INSERT ON tenders
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_log_tender_insert();

-- 3) Запрет подачи заявки на тендер, если он не 'published'
--    или истёк дедлайн. Срабатывает до вставки заявки.
DROP TRIGGER IF EXISTS trg_check_bid_allowed ON bids;
DROP FUNCTION IF EXISTS trg_fn_check_bid_allowed();
CREATE OR REPLACE FUNCTION trg_fn_check_bid_allowed()
RETURNS TRIGGER AS $$
DECLARE
    v_status   VARCHAR(20);
    v_deadline TIMESTAMP;
    v_customer INTEGER;
BEGIN
    SELECT status, deadline, customer_id
    INTO v_status, v_deadline, v_customer
    FROM tenders WHERE id = NEW.tender_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Тендер id=% не существует', NEW.tender_id;
    END IF;

    IF v_status <> 'published' THEN
        RAISE EXCEPTION 'Приём заявок по тендеру id=% закрыт (статус %)', NEW.tender_id, v_status;
    END IF;

    IF v_deadline < now() THEN
        RAISE EXCEPTION 'Срок подачи заявок по тендеру id=% истёк', NEW.tender_id;
    END IF;

    -- Заказчик не может подавать заявку на собственный тендер
    IF v_customer = NEW.supplier_id THEN
        RAISE EXCEPTION 'Заказчик не может подавать заявку на свой тендер';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_bid_allowed
    BEFORE INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_check_bid_allowed();
