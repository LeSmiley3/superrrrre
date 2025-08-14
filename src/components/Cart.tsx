import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onGenerateInvoice: () => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onGenerateInvoice }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.20; // 20% TVA
  const total = subtotal + tax;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Panier</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
          {items.reduce((sum, item) => sum + item.quantity, 0)} articles
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Panier vide</p>
          <p className="text-sm text-gray-400 mt-1">Scannez un produit pour commencer</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">{item.product.price.toFixed(2)}€ / unité</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {(item.product.price * item.quantity).toFixed(2)}€
                  </p>
                </div>
                
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total:</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>TVA (20%):</span>
              <span>{tax.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800">
              <span>Total:</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>

          <button
            onClick={onGenerateInvoice}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Générer la facture
          </button>
        </>
      )}
    </div>
  );
}