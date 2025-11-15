'use client';

export async function fetchCartApi(userId) {
  const res = await fetch(`/api/cart/get?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch cart');
  const data = await res.json();
  return data.items ?? [];
}

export async function removeCartItemApi(userId, itemId) {
  const res = await fetch('/api/cart/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId })
  });
  if (!res.ok) throw new Error('Failed to remove item');
  return true;
}

export async function checkoutApi(userId) {
  const res = await fetch('/api/cart/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Failed to initiate checkout');
  return res.text();
}