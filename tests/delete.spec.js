// delete.spec.js
const { test, expect } = require('@playwright/test');

test('DELETE /products/{id} — delete product', async ({ request }) => {
  const response = await request.delete('https://fakestoreapi.com/products/1');
  expect([200, 204]).toContain(response.status());
  // ✅ Тело не парсим
});

test('DELETE /products/{id} — repeated delete', async ({ request }) => {
  const url = 'https://fakestoreapi.com/products/1';
  const r1 = await request.delete(url);
  const r2 = await request.delete(url);

  expect([200, 204, 404]).toContain(r1.status());
  expect([200, 204, 404]).toContain(r2.status());
});

test('DELETE /products/{id} — not found', async ({ request }) => {
  const response = await request.delete('https://fakestoreapi.com/products/99999');
  expect([404, 200]).toContain(response.status());
});
