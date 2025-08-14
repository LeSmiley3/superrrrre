export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Invoice {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  subtotal: number;
  timestamp: string;
}