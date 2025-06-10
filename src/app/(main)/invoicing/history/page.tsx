'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Invoice {
  id: string;
  date: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí normalmente cargarías las facturas desde la base de datos
    // Por ahora, simularemos una factura reciente
    const mockInvoice: Invoice = {
      id: 'INV-' + Date.now(),
      date: new Date().toLocaleDateString(),
      items: [
        { name: 'Producto de ejemplo', price: 100, quantity: 2 }
      ],
      subtotal: 200,
      tax: 24,
      total: 224
    };
    setInvoices([mockInvoice]);
    setLoading(false);
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historial de Facturas</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Volver al catálogo
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay facturas disponibles.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Factura #{invoice.id}</h2>
                  <p className="text-sm text-gray-600">Fecha: {invoice.date}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Completada
                </span>
              </div>

              <div className="space-y-4 mb-4">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (12%):</span>
                    <span>${invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
