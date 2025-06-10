'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';

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

const InvoicePrintView = React.forwardRef<HTMLDivElement, { invoice: Invoice }>(({ invoice }, ref) => (
  <div ref={ref} className="p-8 max-w-2xl mx-auto text-gray-800 bg-white shadow-md rounded-lg">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Factura #{invoice.id}</h1>
      <p className="text-lg">Fecha: {invoice.date}</p>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Detalles de la Compra</h2>
      <div className="space-y-4">
        {invoice.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-gray-700">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)} x {item.quantity}</p>
            </div>
            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t pt-4">
      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA (12%):</span>
          <span>${invoice.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-xl pt-2 border-t text-blue-800">
          <span>Total:</span>
          <span>${invoice.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="mt-12 text-center text-sm text-gray-600">
      <p>Gracias por su compra</p>
      <p className="text-blue-700">www.tutienda.com</p>
    </div>
  </div>
));
InvoicePrintView.displayName = 'InvoicePrintView';

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: 'INV-' + Date.now(),
        date: new Date().toLocaleDateString(),
        items: [
          { name: 'Laptop HP', price: 1200, quantity: 1 },
          { name: 'Mouse inalámbrico', price: 25, quantity: 2 }
        ],
        subtotal: 1250,
        tax: 150,
        total: 1400
      },
      {
        id: 'INV-' + (Date.now() - 86400000),
        date: new Date(Date.now() - 86400000).toLocaleDateString(),
        items: [
          { name: 'Monitor 24"', price: 300, quantity: 1 },
          { name: 'Teclado mecánico', price: 80, quantity: 1 }
        ],
        subtotal: 380,
        tax: 45.6,
        total: 425.6
      }
    ];
    setInvoices(mockInvoices);
    setLoading(false);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `factura_${Date.now()}`,
    pageStyle: `
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
      }
    `
  });

  const onPrintInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setTimeout(() => handlePrint(), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Historial de Facturas</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm font-medium">
            Volver al catálogo
          </Link>
        </div>

        {/* Componente oculto para impresión */}
        <div className="hidden">
          {currentInvoice && (
            <InvoicePrintView ref={printRef} invoice={currentInvoice} />
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="text-center text-gray-600 mt-20">No hay facturas disponibles.</div>
        ) : (
          <div className="space-y-6">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all hover:shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-700">Factura #{invoice.id}</h2>
                    <p className="text-sm text-gray-500">Fecha: {invoice.date}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Completada
                  </span>
                </div>

                <div className="space-y-3 mb-4 text-gray-700">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-1 text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (12%):</span>
                    <span>${invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t text-blue-800">
                    <span>Total:</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onPrintInvoice(invoice)}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium"
                >
                  Imprimir Factura
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
