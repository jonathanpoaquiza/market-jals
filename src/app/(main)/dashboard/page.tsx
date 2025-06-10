'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { addToCart, getCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Cargar el carrito al iniciar
  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setCartItems(getCart()); // Actualizar el estado del carrito
  };

  const getCartItemQuantity = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    return item?.quantity || 0;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
        <Link 
          href="/cart" 
          className="flex items-center space-x-2 text-blue-600 hover:underline"
        >
          <span>Ver Carrito</span>
          {getTotalItems() > 0 && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
              {getTotalItems()}
            </span>
          )}
        </Link>
      </div>

      {products.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => {
            const quantity = getCartItemQuantity(p.id);
            return (
              <div key={p.id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">{p.name}</h3>
                <p className="text-gray-600 mb-4">${p.price.toFixed(2)}</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Añadir al carrito
                  </button>
                  {quantity > 0 && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      {quantity} en carrito
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
