// cud.spec.js
const { test, expect } = require('@playwright/test');

test('E2E: POST → PUT → DELETE product', async ({ request }) => {
  let productId;

  // 1️⃣ CREATE
  await test.step('Create product', async () => {
    const createResponse = await request.post('https://fakestoreapi.com/products', {
      data: {
        title: 'E2E Test Product',
        price: 50,
        description: 'Created by E2E test',
        image: 'https://i.pravatar.cc',
        category: 'electronics',
      },
    });

    expect([200, 201]).toContain(createResponse.status());
    const createdProduct = await createResponse.json();
    expect(createdProduct).toHaveProperty('id');
    productId = createdProduct.id;
  });

  // 2️⃣ UPDATE
  await test.step('Update product', async () => {
    const updateResponse = await request.put(`https://fakestoreapi.com/products/${productId}`, {
      data: {
        title: 'Updated E2E Product',
        price: 99.99,
      },
    });

    expect([200, 201]).toContain(updateResponse.status());
    const updatedProduct = await updateResponse.json();
    expect(updatedProduct.id).toBe(productId);
    expect(updatedProduct.title).toBe('Updated E2E Product');
    expect(updatedProduct.price).toBe(99.99);
  });

  // 3️⃣ DELETE
  await test.step('Delete product', async () => {
    const deleteResponse = await request.delete(`https://fakestoreapi.com/products/${productId}`);
    expect([200, 204]).toContain(deleteResponse.status());
  });
});
