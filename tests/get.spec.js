import { test, expect } from '@playwright/test';

test('GET /products — list of products', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products');

  expect(response.status()).toBe(200);

  const body = await response.json();
  console.log(body);

  expect(Array.isArray(body)).toBeTruthy();

  expect(body.length).toBeGreaterThan(0);

  console.log('First product title:', body[0].title);
  expect(body[0]).toHaveProperty('id');
  expect(body[0]).toHaveProperty('title');
  expect(body[0]).toHaveProperty('price');
});

test('GET /products/{id} — valid product', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/11');
  console.log('Status:', response.status());

  const product = await response.json();
  console.log('Product 11:', product);

  expect(response.status()).toBe(200);
  expect(product).toHaveProperty('id', 11);
  expect(product).toHaveProperty('title');
  expect(product).toHaveProperty('price');
});

test('GET /products/{id} — non-existent product', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/9999');
  console.log('Status for non-existent product:', response.status());

  // Проверяем статус
  expect(response.status()).toBe(200); // fakestoreapi возвращает 200 даже для несуществующего ID

  // Проверяем тело только если есть
  const text = await response.text();
  console.log('Response body (raw):', text);

  if (text) {
    const product = JSON.parse(text);
    console.log('Parsed JSON:', product);
  } else {
    console.log('No body returned for non-existent product');
  }
});

test('GET /products/category/electronics', async ({ request }) => {
  // Отправляем GET-запрос на категорию "electronics"
  const response = await request.get('https://fakestoreapi.com/products/category/electronics');
  console.log('Status:', response.status()); // Выводим HTTP статус (должно быть 200)

  const products = await response.json(); // Парсим тело ответа в JSON
  console.log('Electronics products:', products); // Выводим все продукты категории

  expect(response.status()).toBe(200); // Проверяем, что статус успешный
  expect(products.every((p) => p.category === 'electronics')).toBeTruthy();
  // Проверяем, что каждый продукт действительно принадлежит категории "electronics"
});

test('GET /products?limit=5', async ({ request }) => {
  // GET-запрос с параметром limit=5
  const response = await request.get('https://fakestoreapi.com/products?limit=5');
  console.log('Status:', response.status());

  const products = await response.json();
  console.log('Limited products:', products); // Выводим полученные продукты

  expect(response.status()).toBe(200); // Проверяем статус
  expect(products.length).toBeLessThanOrEqual(5);
  // Проверяем, что вернулось не больше 5 продуктов
});

test('GET /products — fields and types', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products');
  console.log('Status:', response.status());

  const products = await response.json();
  for (const p of products) {
    console.log('Checking product:', p.id, p.title); // Выводим ID и название продукта
    expect(typeof p.id).toBe('number'); // Проверяем тип id
    expect(typeof p.title).toBe('string'); // Проверяем тип title
    expect(typeof p.price).toBe('number'); // Проверяем тип price
    expect(typeof p.category).toBe('string'); // Проверяем тип category
  }
});

// 1️⃣ GET /products/{id} — отрицательный ID
test('GET /products/{id} — negative ID', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/-1');
  console.log('Status for negative ID:', response.status());

  const text = await response.text();
  console.log('Response body (raw):', text);

  // Проверяем, что API возвращает пустой объект или корректный статус
  expect([200, 404]).toContain(response.status());
});

test('GET /products/{id} — ID = 0', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products/0');
  console.log('Status for ID = 0:', response.status());

  const text = await response.text();
  console.log('Response body (raw):', text);

  expect([200, 404]).toContain(response.status());
});

test('GET /products?limit=0', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products?limit=0');
  console.log('Status for limit=0:', response.status());

  const products = await response.json();
  console.log('Products with limit=0:', products);

  expect(response.status()).toBe(200);
  expect(products.length).toBe(0);
});

test('GET /products?limit=1000', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/products?limit=1000');
  console.log('Status for limit=1000:', response.status());

  const products = await response.json();
  console.log('Products with limit=1000:', products);

  expect(response.status()).toBe(200);
  // Массив должен быть <= фактического числа продуктов
  expect(products.length).toBeLessThanOrEqual(20); // FakeStoreAPI всего 20 продуктов
});

test('GET /wrong-url — should return 404', async ({ request }) => {
  const response = await request.get('https://fakestoreapi.com/wrong-url');
  console.log('Status for wrong URL:', response.status());

  expect(response.status()).toBe(404);
});

test('GET /products — multiple requests (idempotency)', async ({ request }) => {
  const response1 = await request.get('https://fakestoreapi.com/products');
  const response2 = await request.get('https://fakestoreapi.com/products');

  const products1 = await response1.json();
  const products2 = await response2.json();

  console.log(
    'First request IDs:',
    products1.map((p) => p.id),
  );
  console.log(
    'Second request IDs:',
    products2.map((p) => p.id),
  );

  expect(products1).toEqual(products2); // Ответы должны быть одинаковыми
});
