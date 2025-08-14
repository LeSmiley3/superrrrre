import React, { createContext, useContext, ReactNode } from 'react';
import { Product } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

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

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocalStorage<Product[]>('supermarket-products', defaultProducts);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...productData } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProductByBarcode = (barcode: string) => {
    return products.find(product => product.barcode === barcode);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductByBarcode,
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