import React, { useState } from 'react';
import { Store, Scan, Package, ShoppingCart } from 'lucide-react';
import { ProductProvider } from './contexts/ProductContext';
import { BarcodeScanner } from './components/BarcodeScanner';
import { Cart } from './components/Cart';
import { ProductManagement } from './components/ProductManagement';
import { Invoice } from './components/Invoice';
import { useProducts } from './contexts/ProductContext';
import { CartItem } from './types';

type Tab = 'pos' | 'products';

function AppContent() {
  const { getProductByBarcode } = useProducts();
  const [activeTab, setActiveTab] = useState<Tab>('pos');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState('');

  const handleBarcodeScan = (barcode: string) => {
    const product = getProductByBarcode(barcode);
    
    if (product) {
      const existingItem = cartItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        setCartItems(prev => 
          prev.map(item => 
            item.product.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCartItems(prev => [...prev, { product, quantity: 1 }]);
      }
    } else {
      alert(`Produit non trouvé pour le code-barres: ${barcode}`);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleGenerateInvoice = () => {
    const invoiceNumber = `INV-${Date.now()}`;
    setCurrentInvoiceNumber(invoiceNumber);
    
    // Sauvegarder la facture dans la base de données si on est dans Electron
    if (window.electronAPI) {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const tax = subtotal * 0.20;
      const total = subtotal + tax;
      
      window.electronAPI.saveInvoice({
        invoiceNumber,
        items: cartItems,
        subtotal,
        tax,
        total
      }).catch(error => {
        console.error('Erreur lors de la sauvegarde de la facture:', error);
      });
    }
    
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Superette POS</h1>
            </div>
            
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('pos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'pos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Caisse
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Package className="h-4 w-4" />
                Produits
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'pos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Point de Vente</h2>
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-gray-600" />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isScanning}
                      onChange={(e) => setIsScanning(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mode Scanner
                    </span>
                  </label>
                </div>
              </div>
              
              <BarcodeScanner
                onScan={handleBarcodeScan}
                isScanning={isScanning}
              />
            </div>
            
            <Cart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onGenerateInvoice={handleGenerateInvoice}
            />
          </div>
        ) : (
          <ProductManagement />
        )}
      </main>

      {/* Invoice Modal */}
      {showInvoice && (
        <Invoice
          items={cartItems}
          invoiceNumber={currentInvoiceNumber}
          onClose={handleCloseInvoice}
          onPrint={handlePrintInvoice}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ProductProvider>
      <AppContent />
    </ProductProvider>
  );
}

export default App;