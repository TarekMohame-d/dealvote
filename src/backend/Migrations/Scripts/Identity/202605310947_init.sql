-- ==============================================================================
-- SCHEMA & UTILITIES
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS identity;

CREATE OR REPLACE FUNCTION identity.set_updated_at_utc () RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at_utc := NOW();
    RETURN NEW;
END;
$$;

-- ==============================================================================
-- TABLES
-- ==============================================================================
CREATE TABLE identity.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id uuid NOT NULL UNIQUE,
    first_name varchar(25) NOT NULL,
    last_name varchar(25) NOT NULL,
    username varchar(50) NOT NULL UNIQUE,
    avatar_url varchar(2048) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    phone_number varchar(11) NOT NULL UNIQUE,
    show_phone_number boolean NOT NULL DEFAULT FALSE,
    rating NUMERIC(3, 2) DEFAULT NULL,
    rating_count integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT FALSE,
    is_shadowbanned boolean NOT NULL DEFAULT FALSE,
    is_deleted boolean NOT NULL DEFAULT FALSE,
    deleted_at_utc timestamptz,
    created_at_utc timestamptz NOT NULL DEFAULT NOW(),
    updated_at_utc timestamptz NOT NULL DEFAULT NOW(),
    -- Constraints --
    CONSTRAINT chk_rating CHECK (
        rating >= 1.00
        AND rating <= 5.00
    )
);

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================
CREATE TRIGGER set_users_updated_at BEFORE
UPDATE ON identity.users FOR EACH ROW
EXECUTE FUNCTION identity.set_updated_at_utc ();

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX idx_users_active_public ON identity.users (id, username)
WHERE
    is_active = TRUE
    AND is_deleted = FALSE;

-- ==============================================================================
-- VIEWS
-- ==============================================================================
CREATE OR REPLACE VIEW identity.vw_public_user_profiles AS
SELECT
    id AS user_id,
    username,
    first_name || ' ' || last_name AS display_name,
    CASE
        WHEN show_phone_number = TRUE
        AND is_deleted = FALSE THEN phone_number
        ELSE NULL
    END AS public_phone_number,
    created_at_utc AS member_since
FROM
    identity.users
WHERE
    is_active = TRUE
    AND is_deleted = FALSE;
