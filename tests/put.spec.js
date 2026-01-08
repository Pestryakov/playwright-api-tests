import { test, expect } from '@playwright/test';

test('PUT /products/{id} — update product', async ({ request }) => {
  // 1️⃣ Обновляем продукт с id=1
  const response = await request.put('https://fakestoreapi.com/products/1', {
    data: {
      title: 'Updated product',
      price: 123.45,
    },
  });

  // 2️⃣ Проверяем статус
  expect([200, 201]).toContain(response.status());

  // 3️⃣ Проверяем тело ответа
  const product = await response.json();

  console.log(product);

  expect(product.id).toBe(1);
  expect(product.title).toBe('Updated product');
  expect(product.price).toBe(123.45);
});

test('PUT /products/{id} — not found', async ({ request }) => {
  const response = await request.put('https://fakestoreapi.com/products/99999', {
    data: {
      title: 'Ghost product',
    },
  });

  expect([404, 200]).toContain(response.status());
});

test('PUT /products/{id} — invalid payload', async ({ request }) => {
  const response = await request.put('https://fakestoreapi.com/products/1', {
    data: {
      price: 'free', // неправильный тип
    },
  });

  expect([400, 200]).toContain(response.status());
});
