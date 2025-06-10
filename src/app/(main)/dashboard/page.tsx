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
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setCartItems(getCart());
  };

  const getCartItemQuantity = (productId: string) => {
    const item = cartItems.find((item) => item.id === productId);
    return item?.quantity || 0;
  };

  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-lg">Cargando productos...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-md w-full animate-pulse">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 md:mb-0">
            Catálogo de Productos
          </h1>
          <Link
            href="/cart"
            className="relative inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold transition"
            aria-label="Ver carrito"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
              <circle cx="7" cy="21" r="1" />
              <circle cx="17" cy="21" r="1" />
            </svg>
            <span>Ver Carrito</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md select-none">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </header>

        {/* Productos */}
        {products.length === 0 ? (
          <p className="text-center text-slate-700 text-lg">
            No hay productos disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const quantity = getCartItemQuantity(product.id);
              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between transition hover:shadow-xl"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 truncate" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-lg text-slate-700 mb-5">${product.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition"
                      aria-label={`Añadir ${product.name} al carrito`}
                    >
                      Añadir al carrito
                    </button>
                    {quantity > 0 && (
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium select-none">
                        {quantity} en carrito
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
