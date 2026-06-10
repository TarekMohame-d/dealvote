#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" << EOSQL
    -- 1. Create the users first
    CREATE USER dealvote_app WITH PASSWORD '${DEALVOTE_DB_PASSWORD}';
    CREATE USER keycloak_app WITH PASSWORD '${KC_DB_PASSWORD}';

    -- 2. Create the databases and assign ownership directly
    CREATE DATABASE dealvote_db OWNER dealvote_app;
    CREATE DATABASE keycloak_db OWNER keycloak_app;
EOSQL
