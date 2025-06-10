'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, clearCart } from '@/lib/cart';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function NewInvoicePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const items = getCart();
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    setCart(items);
    setLoading(false);
  }, [router]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const handleComplete = () => {
    // Aquí podrías guardar la factura en la base de datos
    clearCart();
    router.push('/invoicing/history');
  };

  if (loading) return <div>Cargando...</div>;


  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Nueva Factura</h1>
        <Link href="/cart" className="text-blue-600 hover:underline">
          Volver al carrito
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-black">Detalles de la Compra</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-black">{item.name}</p>
                  <p className="text-sm text-gray-800">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-black">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
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
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/cart')}
          className="flex-1 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-semibold"
        >
          Cancelar
        </button>
        <button
          onClick={handleComplete}
          className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 font-semibold"
        >
          Completar Compra
        </button>
      </div>
    </div>
  );
} 