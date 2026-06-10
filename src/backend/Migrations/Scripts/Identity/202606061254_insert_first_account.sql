INSERT INTO
    identity.users (
        id,
        keycloak_id,
        first_name,
        last_name,
        username,
        avatar_url,
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
        '$adminAvatarUrl$',
        '$adminEmail$',
        '$adminPhoneNumber$',
        TRUE
    );
