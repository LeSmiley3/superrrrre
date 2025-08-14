export interface ElectronAPI {
  getProducts: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getProductByBarcode: (barcode: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  addProduct: (product: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateProduct: (id: number, product: any) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: number) => Promise<{ success: boolean; error?: string }>;
  saveInvoice: (invoiceData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}