const test = require('node:test');
const assert = require('node:assert/strict');
const { isOriginAllowed } = require('../config/cors');

test('allows the known Vercel app origins for production', () => {
  assert.equal(isOriginAllowed('https://ritesh-notes.vercel.app'), true);
  assert.equal(isOriginAllowed('https://notes-db-server.vercel.app'), true);
  assert.equal(isOriginAllowed('http://localhost:5173'), true);
});

test('allows Vercel-hosted frontend origins', () => {
  assert.equal(isOriginAllowed('https://evil.example.com'), false);
  assert.equal(isOriginAllowed('https://not-allowed.vercel.app'), true);
});
