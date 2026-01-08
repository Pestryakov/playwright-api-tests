import { test, expect } from '@playwright/test';

test('POST /products — create product', async ({ request }) => {
  // 1️⃣ Отправляем POST-запрос на создание продукта
  const response = await request.post('https://fakestoreapi.com/products', {
    data: {
      title: 'Test product', // название нового продукта
      price: 99.99, // цена
      description: 'QA test product', // описание
      image: 'https://i.pravatar.cc', // ссылка на картинку
      category: 'electronics', // категория
    },
  });

  // 2️⃣ Проверяем статус ответа
  console.log('Status:', response.status());
  expect(response.status()).toBe(201); // fakestoreapi всегда возвращает 200

  // 3️⃣ Парсим тело ответа
  const product = await response.json();
  console.log('Created product:', product);

  // 4️⃣ Проверяем, что вернулся объект с нужными полями
  expect(product).toHaveProperty('id'); // id должен быть создан автоматически
  expect(product.title).toBe('Test product'); // title совпадает с отправленным
  expect(product.price).toBe(99.99); // цена совпадает
});

test('POST /products — missing fields', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/products', {
    data: {
      title: '', // пустое название
      price: 'not-a-number', // неправильный тип
    },
  });

  console.log('Status for invalid POST:', response.status());

  const body = await response.text();
  console.log('Response body:', body);

  // fakestoreapi обычно возвращает 200, но в реальном API это 400
  //expect(response.status()).toBe(400);
  expect([200, 201, 400]).toContain(response.status());
});

test('POST /products — create product with random title', async ({ request }) => {
  const randomTitle = `Product ${Math.floor(Math.random() * 1000)}`;

  const response = await request.post('https://fakestoreapi.com/products', {
    data: {
      title: randomTitle,
      price: 55.5,
      description: 'Randomized test product',
      image: 'https://i.pravatar.cc',
      category: 'jewelery',
    },
  });

  console.log('Created product with random title:', await response.json());

  expect(response.status()).toBe(201);
});

test('POST /auth/login — valid credentials', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/auth/login', {
    data: {
      username: 'mor_2314',
      password: '83r5^_',
    },
  });

  expect([200, 201]).toContain(response.status()); // fakestoreapi возвращает 200

  const body = await response.json();

  // ❌ не логируем пароль и токен полностью
  console.log('Login successful');
  console.log('Token received:', body.token ? 'YES' : 'NO');
  console.log('Token length:', body.token?.length);

  expect(body).toHaveProperty('token');
  expect(typeof body.token).toBe('string');
  expect(body.token.length).toBeGreaterThan(10);
});

test('POST /auth/login — invalid password', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/auth/login', {
    data: {
      username: 'mor_2314',
      password: '',
    },
  });

  expect([400, 401]).toContain(response.status());
});

//SQL
test('POST /auth/login — SQL injection in password', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/auth/login', {
    data: {
      username: 'mor_2314',
      password: `' OR '1'='1`,
    },
  });

  expect([400, 401]).toContain(response.status());
});

//long pass
test('POST /auth/login — very long password', async ({ request }) => {
  const longPassword = 'a'.repeat(10_000);

  const response = await request.post('https://fakestoreapi.com/auth/login', {
    data: {
      username: 'mor_2314',
      password: longPassword,
    },
  });

  expect([400, 401]).toContain(response.status());
});

//replay
test('POST /auth/login — replay request', async ({ request }) => {
  const payload = {
    username: 'mor_2314',
    password: '83r5^_',
  };

  const first = await request.post('https://fakestoreapi.com/auth/login', { data: payload });
  const second = await request.post('https://fakestoreapi.com/auth/login', { data: payload });

  expect([200, 201]).toContain(first.status());
  expect([200, 201]).toContain(second.status());
});

//bruteforce
test('POST /auth/login — multiple rapid login attempts', async ({ request }) => {
  const attempts = 5;
  const responses = [];

  for (let i = 0; i < attempts; i++) {
    const res = await request.post('https://fakestoreapi.com/auth/login', {
      data: {
        username: 'mor_2314',
        password: 'wrong',
      },
    });
    responses.push(res.status());
  }

  console.log('Statuses:', responses);

  responses.forEach((status) => {
    expect([400, 401, 429]).toContain(status);
  });
});

//username null
test('POST /auth/login — username is null', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/auth/login', {
    data: {
      username: null,
      password: '123',
    },
  });

  expect([400]).toContain(response.status());
});

//pass = numb
test('POST /auth/login — password is number', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/auth/login', {
    data: {
      username: 'mor_2314',
      password: 12345,
    },
  });

  expect([400, 401]).toContain(response.status());
});

//missing username
test('POST /auth/login — missing username', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/auth/login', {
    data: {
      password: '123',
    },
  });

  expect([400]).toContain(response.status());
});

//extra fields
test('POST /auth/login — extra fields in body', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/auth/login', {
    data: {
      username: 'mor_2314',
      password: '83r5^_',
      isAdmin: true,
      role: 'superuser',
    },
  });

  expect([200, 201]).toContain(response.status());
});

//two login
test('POST /auth/login — same login twice', async ({ request }) => {
  const payload = {
    username: 'mor_2314',
    password: '83r5^_',
  };

  const first = await request.post('https://fakestoreapi.com/auth/login', { data: payload });
  const second = await request.post('https://fakestoreapi.com/auth/login', { data: payload });

  expect([200, 201]).toContain(first.status());
  expect([200, 201]).toContain(second.status());
});

test('POST /carts — create cart', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/carts', {
    data: {
      userId: 1,
      date: '2024-01-01',
      products: [{ productId: 1, quantity: 2 }],
    },
  });

  expect(response.status()).toBe(201);

  const cart = await response.json();
  expect(cart).toHaveProperty('id');
});

test('POST /carts — invalid quantity', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/carts', {
    data: {
      userId: 1,
      products: [{ productId: 1, quantity: -5 }],
    },
  });

  expect([200, 400]).toContain(response.status());
});

test('POST /products — zero price', async ({ request }) => {
  const response = await request.post('https://fakestoreapi.com/products', {
    data: {
      title: 'Free product',
      price: 0,
      description: 'edge case',
      image: 'https://i.pravatar.cc',
      category: 'electronics',
    },
  });

  expect([200, 201]).toContain(response.status());
});

test('POST /products — duplicate request', async ({ request }) => {
  const payload = {
    title: 'Duplicate',
    price: 10,
    description: 'test',
    image: 'https://i.pravatar.cc',
    category: 'electronics',
  };

  const r1 = await request.post('https://fakestoreapi.com/products', { data: payload });
  const r2 = await request.post('https://fakestoreapi.com/products', { data: payload });

  console.log('r1 status:', r1.status());
  console.log('r2 status:', r2.status());

  expect([200, 201]).toContain(r1.status());
  expect([200, 201]).toContain(r2.status());
});

test('POST /login — success', async ({ request }) => {
  const response = await request.post('https://reqres.in/api/login', {
    data: {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka',
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty('token');
});

test('POST /login — missing password', async ({ request }) => {
  const response = await request.post('https://reqres.in/api/login', {
    data: {
      email: 'eve.holt@reqres.in',
    },
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.error).toContain('Missing');
});

test('POST /users — create user', async ({ request }) => {
  const response = await request.post('https://reqres.in/api/users', {
    data: {
      name: 'Maksim',
      job: 'QA',
    },
  });

  expect(response.status()).toBe(201);

  const user = await response.json();
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('createdAt');
});

test('POST /users — response schema', async ({ request }) => {
  const response = await request.post('https://reqres.in/api/users', {
    data: {
      name: 'Schema test',
      job: 'QA',
    },
  });

  const body = await response.json();

  expect(typeof body.id).toBe('string');
  expect(body.createdAt).toBeTruthy();
});

//идемпотентность
test('POST /payment — idempotent request', async ({ request }) => {
  // 1️⃣ Генерируем уникальный ключ
  // Один ключ = одна бизнес-операция
  const idempotencyKey = crypto.randomUUID();

  // 2️⃣ Тело платежа
  const payload = {
    amount: 100,
    currency: 'USD',
  };

  // 3️⃣ Заголовки запроса
  const headers = {
    'Idempotency-Key': idempotencyKey,
  };

  // 4️⃣ Первый запрос — операция создаётся
  const r1 = await request.post('/payments', {
    data: payload,
    headers,
  });

  // 5️⃣ Повторный запрос с тем же ключом
  // Сервер обязан вернуть тот же результат
  const r2 = await request.post('/payments', {
    data: payload,
    headers,
  });

  // 6️⃣ Читаем ответы
  const b1 = await r1.json();
  const b2 = await r2.json();

  // 7️⃣ Проверка идемпотентности
  expect(b1.id).toBe(b2.id);
});
