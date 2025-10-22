// Set up environment variables for testing
process.env['JWT_ACCESS_SECRET'] = 'test-access-secret';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret';
process.env['PASSWORD_HASH_ROUNDS'] = '10';
process.env['DATABASE_URL'] = ':memory:';
