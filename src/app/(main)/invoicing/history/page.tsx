'use client';
import React from 'react';
import { useEffect, useState, useRef } from 'react';
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

// Componente para la vista de impresión
const InvoicePrintView = React.forwardRef<HTMLDivElement, { invoice: Invoice }>(
  ({ invoice }, ref) => (
    <div ref={ref} className="p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Factura #{invoice.id}</h1>
        <p className="text-lg">Fecha: {invoice.date}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detalles de la Compra</h2>
        <div className="space-y-4">
          {invoice.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm">
                  ${item.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
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
          <div className="flex justify-between font-bold text-xl pt-2 border-t">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-sm">
        <p>Gracias por su compra</p>
        <p>www.tutienda.com</p>
      </div>
    </div>
  )
);
InvoicePrintView.displayName = 'InvoicePrintView';

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulación de carga desde la base de datos
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
    contentRef: printRef, // Changed from 'content' to 'contentRef'
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

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Historial de Facturas</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
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
        <div className="text-center py-8">
          <p className="text-gray-800">No hay facturas disponibles.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-black">Factura #{invoice.id}</h2>
                  <p className="text-sm text-gray-800">Fecha: {invoice.date}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Completada
                </span>
              </div>

              <div className="space-y-4 mb-4">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
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

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-black">Subtotal:</span>
                    <span className="text-black">${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">IVA (12%):</span>
                    <span className="text-black">${invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span className="text-black">Total:</span>
                    <span className="text-black">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onPrintInvoice(invoice)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Imprimir Factura
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}