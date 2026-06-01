DROP VIEW IF EXISTS v_tender_cards CASCADE;
CREATE VIEW v_tender_cards AS
SELECT
    t.id,
    t.title,
    t.description,
    t.start_price,
    t.status,
    t.deadline,
    t.created_at,
    u.id            AS customer_id,
    u.name          AS customer_name,
    u.organization  AS customer_organization,
    COUNT(b.id)                       AS bids_count,
    MIN(b.price)                      AS min_bid_price,
    t.winner_bid_id
FROM tenders t
JOIN users u           ON u.id = t.customer_id
LEFT JOIN bids b       ON b.tender_id = t.id
GROUP BY t.id, u.id;

COMMENT ON VIEW v_tender_cards IS 'Карточки тендеров с заказчиком и агрегатами по заявкам';

DROP VIEW IF EXISTS v_supplier_rating CASCADE;
CREATE VIEW v_supplier_rating AS

SELECT
    u.id                                       AS supplier_id,
    u.name                                     AS supplier_name,
    u.organization,
    COALESCE(b.total_bids, 0)                  AS total_bids,
    COALESCE(b.won_bids, 0)                     AS won_bids,
    COALESCE(c.contracts_count, 0)             AS contracts_count,
    COALESCE(c.contracts_total_sum, 0)         AS contracts_total_sum
FROM users u
LEFT JOIN (
    SELECT supplier_id,
           COUNT(*)                                  AS total_bids,
           COUNT(*) FILTER (WHERE status = 'won')     AS won_bids
    FROM bids
    GROUP BY supplier_id
) b ON b.supplier_id = u.id
LEFT JOIN (
    SELECT supplier_id,
           COUNT(*)            AS contracts_count,
           SUM(final_price)    AS contracts_total_sum
    FROM contracts
    GROUP BY supplier_id
) c ON c.supplier_id = u.id
WHERE u.role = 'supplier'
ORDER BY u.id;

COMMENT ON VIEW v_supplier_rating IS 'Рейтинг поставщиков по числу заявок, побед и сумме контрактов';

DROP VIEW IF EXISTS v_contracts_summary CASCADE;
CREATE VIEW v_contracts_summary AS
SELECT
    c.id              AS contract_id,
    c.signed_at,
    c.status          AS contract_status,
    c.final_price,
    t.id              AS tender_id,
    t.title           AS tender_title,
    t.start_price,
    (t.start_price - c.final_price)                          AS economy_abs,
    ROUND((t.start_price - c.final_price) / t.start_price * 100, 2) AS economy_percent,
    sup.name          AS supplier_name,
    sup.organization  AS supplier_org,
    cus.name          AS customer_name,
    cus.organization  AS customer_org
FROM contracts c
JOIN tenders t  ON t.id  = c.tender_id
JOIN users sup  ON sup.id = c.supplier_id
JOIN users cus  ON cus.id = c.customer_id;

COMMENT ON VIEW v_contracts_summary IS 'Сводка по контрактам с расчётом экономии бюджета';

DROP FUNCTION IF EXISTS fn_count_bids(INTEGER);
CREATE OR REPLACE FUNCTION fn_count_bids(p_tender_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM bids
    WHERE tender_id = p_tender_id;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_count_bids IS 'Возвращает число заявок на указанный тендер';

DROP FUNCTION IF EXISTS fn_min_bid_price(INTEGER);
CREATE OR REPLACE FUNCTION fn_min_bid_price(p_tender_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_min NUMERIC;
BEGIN
    SELECT MIN(price) INTO v_min
    FROM bids
    WHERE tender_id = p_tender_id;
    RETURN v_min;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_min_bid_price IS 'Возвращает минимальную предложенную цену по тендеру';

DROP FUNCTION IF EXISTS fn_tender_economy_percent(INTEGER);
CREATE OR REPLACE FUNCTION fn_tender_economy_percent(p_tender_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_start  NUMERIC;
    v_final  NUMERIC;
BEGIN
    SELECT t.start_price, b.price
    INTO v_start, v_final
    FROM tenders t
    JOIN bids b ON b.id = t.winner_bid_id
    WHERE t.id = p_tender_id;

    IF v_start IS NULL OR v_final IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN ROUND((v_start - v_final) / v_start * 100, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_tender_economy_percent IS 'Процент экономии бюджета по выигравшей заявке тендера';
