interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function addToCart(product: { id: string; name: string; price: number }) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find((item: CartItem) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function removeFromCart(productId: string) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const updatedCart = cart.filter((item: CartItem) => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find((item: CartItem) => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
}

export function getCart(): CartItem[] {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

export function clearCart() {
  localStorage.removeItem('cart');
} 