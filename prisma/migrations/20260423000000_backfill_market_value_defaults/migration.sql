-- Backfill default market value records for blueprints that don't have one
INSERT INTO card_blueprint_market_value (card_blueprint_id, median_market_value_cents, listing_count, fetched_at, created_at, updated_at)
SELECT cb.id, 0, 0, NOW(), NOW(), NOW()
FROM card_blueprint cb
WHERE NOT EXISTS (
  SELECT 1 FROM card_blueprint_market_value mv WHERE mv.card_blueprint_id = cb.id
);
