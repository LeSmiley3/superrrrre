import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Vérifier si nous sommes dans Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI;
};

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    if (!isElectron()) {
      // Fallback pour le développement web
      const defaultProducts: Product[] = [
        {
          id: '1',
          barcode: '1234567890123',
          name: 'Pain de mie',
          price: 2.50,
          category: 'Boulangerie',
          stock: 50,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          barcode: '2345678901234',
          name: 'Lait 1L',
          price: 1.20,
          category: 'Produits laitiers',
          stock: 30,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          barcode: '3456789012345',
          name: 'Bananes (kg)',
          price: 2.80,
          category: 'Fruits',
          stock: 25,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          barcode: '4567890123456',
          name: 'Eau 1.5L',
          price: 0.80,
          category: 'Boissons',
          stock: 100,
          createdAt: new Date().toISOString(),
        },
      ];
      setProducts(defaultProducts);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.getProducts();
      if (result.success) {
        const formattedProducts = result.data.map((p: any) => ({
          id: p.id.toString(),
          barcode: p.barcode,
          name: p.name,
          price: p.price,
          category: p.category,
          stock: p.stock,
          createdAt: p.created_at,
        }));
        setProducts(formattedProducts);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (!isElectron()) {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setProducts(prev => [...prev, newProduct]);
      return;
    }

    try {
      const result = await window.electronAPI.addProduct(productData);
      if (result.success) {
        await refreshProducts();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout du produit');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!isElectron()) {
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? { ...product, ...productData } : product
        )
      );
      return;
    }

    try {
      const result = await window.electronAPI.updateProduct(parseInt(id), productData);
      if (result.success) {
        await refreshProducts();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors de la modification du produit');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isElectron()) {
      setProducts(prev => prev.filter(product => product.id !== id));
      return;
    }

    try {
      const result = await window.electronAPI.deleteProduct(parseInt(id));
      if (result.success) {
        await refreshProducts();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors de la suppression du produit');
    }
  };

  const getProductByBarcode = (barcode: string) => {
    return products.find(product => product.barcode === barcode);
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductByBarcode,
      refreshProducts,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}