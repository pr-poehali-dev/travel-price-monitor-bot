CREATE TABLE IF NOT EXISTS tour_deals (
    id SERIAL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    image_url TEXT,
    current_price INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    discount INTEGER NOT NULL,
    url TEXT NOT NULL UNIQUE,
    found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_to_telegram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tour_deals_discount ON tour_deals(discount);
CREATE INDEX IF NOT EXISTS idx_tour_deals_found_at ON tour_deals(found_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_deals_sent ON tour_deals(sent_to_telegram);
