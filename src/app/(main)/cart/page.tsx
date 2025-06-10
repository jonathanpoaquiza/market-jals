'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, removeFromCart, updateCartItemQuantity } from '@/lib/cart';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    setCart(getCart());
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateCartItemQuantity(productId, newQuantity);
    setCart(getCart());
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const handleCheckout = () => {
    router.push('/invoicing/new');
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Carrito de Compras</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Volver al catálogo
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-800 mb-4">No hay productos en el carrito.</p>
          <Link 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-200">
            <ul className="divide-y">
              {cart.map((item) => (
                <li key={item.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">{item.name}</h3>
                      <p className="text-sm text-gray-800">
                        ${item.price.toFixed(2)} c/u
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-800 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-black">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-800 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="font-semibold text-black">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar producto"
                      >
                        {/* Icono de eliminar */}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-black">Subtotal:</span>
                <span className="text-black">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">IVA (12%):</span>
                <span className="text-black">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span className="text-black">Total:</span>
                <span className="text-black">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            Proceder a Facturación
          </button>
        </>
      )}
    </div>
  );
}
