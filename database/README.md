# Database Directory

This folder holds local database helpers and seed data for development.

## Test admin seed (optional)

Enable this environment variable before starting the backend to auto-create a test admin user if it does not exist:

- SEED_TEST_ADMIN=1
- TEST_ADMIN_EMAIL=test@admin.local
- TEST_ADMIN_PASSWORD=testtest

Note: The password is stored hashed in MongoDB.

## Default test credentials

- Email: test@admin.local
- Password: testtest

## eGov IIN encryption

Set a 32-byte base64 key for IIN encryption:

- IIN_ENCRYPTION_KEY=<your-32-byte-base64-key>
- IIN_HASH_KEY=<optional-hmac-key>

If IIN_HASH_KEY is not set, IIN_ENCRYPTION_KEY will be used for hashing.
