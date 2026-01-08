import { test, expect } from '@playwright/test';

/**
 * Безопасный парсинг JSON.
 * Возвращает null, если ответ не JSON или статус ошибки.
 */
async function safeJson(response) {
  try {
    if (response.status() >= 400) {
      console.warn(`⚠️ HTTP Error ${response.status()}:`, await response.text());
      return null;
    }

    const contentType = response.headers()['content-type'] || '';
    if (!contentType.includes('application/json')) {
      console.warn('⚠️ Response is not JSON:', await response.text());
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn('⚠️ Failed to parse JSON:', err);
    return null;
  }
}

// -------------------------
// GET /products — список продуктов
// -------------------------
test('GET /products — list of products', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products');
  expect(response.status()).toBe(200);

  const body = await safeJson(response);
  expect(body).not.toBeNull();
  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(0);

  console.log('First product title:', body[0].title);
  expect(body[0]).toHaveProperty('id');
  expect(body[0]).toHaveProperty('title');
  expect(body[0]).toHaveProperty('price');
});

// -------------------------
// GET /products/{id} — существующий продукт
// -------------------------
test('GET /products/{id} — valid product', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/11');
  expect(response.status()).toBe(200);

  const product = await safeJson(response);
  expect(product).not.toBeNull();
  expect(product).toHaveProperty('id', 11);
  expect(product).toHaveProperty('title');
  expect(product).toHaveProperty('price');
});

// -------------------------
// GET /products/{id} — несуществующий продукт
// -------------------------
test('GET /products/{id} — non-existent product', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/9999');
  expect([200, 404]).toContain(response.status());

  const product = await safeJson(response);
  if (product) console.log('Non-existent product JSON:', product);
});

// -------------------------
// GET /products/category/electronics
// -------------------------
test('GET /products/category/electronics', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/category/electronics');
  expect(response.status()).toBe(200);

  const products = await safeJson(response);
  expect(products).not.toBeNull();
  expect(products.every((p) => p.category === 'electronics')).toBeTruthy();
});

// -------------------------
// GET /products?limit=5
// -------------------------
test('GET /products?limit=5', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products?limit=5');
  expect(response.status()).toBe(200);

  const products = await safeJson(response);
  expect(products).not.toBeNull();
  expect(products.length).toBeLessThanOrEqual(5);
});

// -------------------------
// GET /products — проверка полей и типов
// -------------------------
test('GET /products — fields and types', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products');
  expect(response.status()).toBe(200);

  const products = await safeJson(response);
  expect(products).not.toBeNull();

  for (const p of products) {
    expect(typeof p.id).toBe('number');
    expect(typeof p.title).toBe('string');
    expect(typeof p.price).toBe('number');
    expect(typeof p.category).toBe('string');
  }
});

// -------------------------
// GET /products/{id} — отрицательный ID
// -------------------------
test('GET /products/{id} — negative ID', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/-1');
  expect([200, 404]).toContain(response.status());

  const product = await safeJson(response);
  if (product) console.log('Negative ID product:', product);
});

// -------------------------
// GET /products/{id} — ID = 0
// -------------------------
test('GET /products/{id} — ID = 0', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/0');
  expect([200, 404]).toContain(response.status());

  const product = await safeJson(response);
  if (product) console.log('ID=0 product:', product);
});

// -------------------------
// GET /products?limit=1000
// -------------------------
test('GET /products?limit=1000', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products?limit=1000');
  expect(response.status()).toBe(200);

  const products = await safeJson(response);
  expect(products).not.toBeNull();
  expect(products.length).toBeLessThanOrEqual(20); // FakeStoreAPI всего 20 продуктов
});

// -------------------------
// GET /wrong-url — ошибка 404
// -------------------------
test('GET /wrong-url — should return 404', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/wrong-url');
  expect(response.status()).toBe(404);
});

// -------------------------
// GET /products — multiple requests (idempotency)
// -------------------------
test('GET /products — multiple requests (idempotency)', async ({ request }) => {
  const response1 = await request.get('https://fakestoreapi.com/products');
  const response2 = await request.get('https://fakestoreapi.com/products');

  const products1 = await safeJson(response1);
  const products2 = await safeJson(response2);

  expect(products1).not.toBeNull();
  expect(products2).not.toBeNull();
  expect(products1).toEqual(products2); // Проверка идемпотентности
});
