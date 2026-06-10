CREATE TABLE IF NOT EXISTS identity.outbox_messages (
    id uuid PRIMARY KEY,
    type varchar(500) NOT NULL,
    payload jsonb NOT NULL,
    occurred_at_utc timestamptz NOT NULL DEFAULT NOW(),
    processed_at_utc timestamptz,
    error text,
    retry_count int NOT NULL DEFAULT 0,
    -- Constraints --
    CONSTRAINT chk_retry_count CHECK (retry_count >= 0)
);

CREATE TABLE identity.inbox_messages (
    event_id uuid NOT NULL,
    consumer_name varchar(255) NOT NULL,
    processed_at_utc timestamp NOT NULL,
    -- Constraints --
    CONSTRAINT pk_inbox_messages PRIMARY KEY (event_id, consumer_name)
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_outbox_messages_pending ON identity.outbox_messages (occurred_at_utc)
WHERE
    processed_at_utc IS NULL;
