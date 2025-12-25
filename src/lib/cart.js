'use client';

/**
 * Consolidated cart operations client.
 * Merges addToCart.js and cartClient.js into a single file.
 */

// ===== Cart Read Operations =====

export async function fetchCart(userId) {
    const res = await fetch(`/api/cart/get?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch cart');
    const data = await res.json();
    return data.items ?? [];
}

// ===== Cart Write Operations =====

export async function addToCart(productId, router, quantity = 1, userEmail) {
    if (!userEmail) {
        alert("You need to log in to add items to your cart.");
        router.push("/login");
        return false;
    }

    try {
        const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userEmail, productId, quantity }),
        });

        const result = await res.json();

        if (result.success) {
            alert("✅ Added to cart!");
            return true;
        } else {
            alert("❌ Failed to add item to cart.");
            return false;
        }
    } catch (error) {
        console.error("❌ Add to cart error:", error);
        alert("Something went wrong while adding to cart.");
        return false;
    }
}

export async function removeCartItem(userId, itemId) {
    const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId })
    });
    if (!res.ok) throw new Error('Failed to remove item');
    return true;
}

export async function updateCartItem(userId, itemId, quantity) {
    const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId, quantity })
    });
    if (!res.ok) throw new Error('Failed to update item');
    return (await res.json()).cart;
}

// ===== Checkout Operations =====

export async function checkout(userId) {
    const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to initiate checkout');
    return res.text();
}

export async function buyNow(productId, quantity = 1, userEmail) {
    if (!userEmail) {
        alert("You need to log in to buy now.");
        window.location.href = "/login";
        return false;
    }

    try {
        const w = window.open('', '_blank');
        if (!w) {
            alert('Popup blocked! Please allow popups for this site.');
            return false;
        }
        w.document.write('<html><body><h2>Connecting to payment gateway...</h2></body></html>');

        const res = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userEmail, productId, quantity })
        });

        if (!res.ok) {
            w.close();
            alert('Failed to initiate checkout');
            return false;
        }

        const html = await res.text();
        w.document.open();
        w.document.write(html);
        w.document.close();
        return true;
    } catch (error) {
        console.error('❌ Buy now error:', error);
        alert('Something went wrong while initiating buy now.');
        return false;
    }
}
