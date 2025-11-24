// /lib/addToCart.js

export async function addToCart(productId, router, quantity = 1) {
    try {
      // ✅ Step 1: Check if user is logged in
      const sessionRes = await fetch("/api/check-session");
      const sessionData = await sessionRes.json();
  
      if (!sessionData.loggedIn) {
        alert("You need to log in to add items to your cart.");
        router.push("/login");
        return false;
      }
  
      const userEmail = sessionData.user.email;
  
      // ✅ Step 2: Add product to cart
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

export async function buyNow(productId, quantity = 1) {
  try {
    const sessionRes = await fetch("/api/check-session");
    const sessionData = await sessionRes.json();
    if (!sessionData.loggedIn) {
      alert("You need to log in to buy now.");
      window.location.href = "/login";
      return false;
    }

    const userEmail = sessionData.user.email;

    const w = window.open('', '_blank');
    if (!w) { alert('Popup blocked! Please allow popups for this site.'); return false; }
    w.document.write('<html><body><h2>Connecting to payment gateway...</h2></body></html>');

    const res = await fetch('/api/checkout/buynow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userEmail, productId, quantity })
    });
    if (!res.ok) { w.close(); alert('Failed to initiate checkout'); return false; }
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
  
