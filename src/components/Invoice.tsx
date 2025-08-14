import React from 'react';
import { Receipt, Printer, X } from 'lucide-react';
import { CartItem } from '../types';

interface InvoiceProps {
  items: CartItem[];
  invoiceNumber: string;
  onClose: () => void;
  onPrint: () => void;
}

export function Invoice({ items, invoiceNumber, onClose, onPrint }: InvoiceProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.20;
  const total = subtotal + tax;
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const currentTime = new Date().toLocaleTimeString('fr-FR');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Facture</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6" id="invoice-content">
          {/* En-tête de la facture */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">SUPERETTE MODERNE</h1>
            <p className="text-gray-600">123 Rue de la République</p>
            <p className="text-gray-600">75001 Paris, France</p>
            <p className="text-gray-600">Tél: 01 23 45 67 89</p>
          </div>

          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Facture N°:</p>
                <p className="font-mono text-lg">{invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Date:</p>
                <p>{currentDate}</p>
                <p className="text-sm text-gray-500">{currentTime}</p>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {item.product.price.toFixed(2)}€
                  </p>
                </div>
                <p className="font-medium">
                  {(item.product.price * item.quantity).toFixed(2)}€
                </p>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total:</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA (20%):</span>
              <span>{tax.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-2">
              <span>Total:</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Merci de votre visite !</p>
            <p>TVA: FR 12 345 678 901</p>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onPrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}