INSERT INTO
    identity.users (
        id,
        keycloak_id,
        first_name,
        last_name,
        username,
        email,
        phone_number,
        is_active
    )
VALUES
    (
        '$adminUserId$',
        '$adminKeycloakId$',
        '$adminFirstName$',
        '$adminLastName$',
        '$adminUsername$',
        '$adminEmail$',
        '$adminPhoneNumber$',
        TRUE
    );
