const test = require('node:test');
const assert = require('node:assert/strict');
const { decryptText, encryptText } = require('../controllers/notesController');

test('decryptText can read values encrypted with a configured migration key list', () => {
  const originalKey = process.env.NOTES_ENCRYPTION_KEY;
  const originalKeys = process.env.NOTES_ENCRYPTION_KEYS;
  const originalJwtSecret = process.env.JWT_SECRET;

  process.env.NOTES_ENCRYPTION_KEY = 'new-key';
  process.env.NOTES_ENCRYPTION_KEYS = 'legacy-key,new-key';
  process.env.JWT_SECRET = 'different-key';

  try {
    const ciphertext = encryptText('hello from legacy note');

    process.env.NOTES_ENCRYPTION_KEY = 'new-key';
    process.env.NOTES_ENCRYPTION_KEYS = 'legacy-key,new-key';
    process.env.JWT_SECRET = 'another-key';

    assert.equal(decryptText(ciphertext), 'hello from legacy note');
  } finally {
    if (originalKey === undefined) delete process.env.NOTES_ENCRYPTION_KEY;
    else process.env.NOTES_ENCRYPTION_KEY = originalKey;

    if (originalKeys === undefined) delete process.env.NOTES_ENCRYPTION_KEYS;
    else process.env.NOTES_ENCRYPTION_KEYS = originalKeys;

    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
});
