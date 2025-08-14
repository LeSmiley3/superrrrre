const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Opérations sur les produits
  getProducts: () => ipcRenderer.invoke('db:getProducts'),
  getProductByBarcode: (barcode) => ipcRenderer.invoke('db:getProductByBarcode', barcode),
  addProduct: (product) => ipcRenderer.invoke('db:addProduct', product),
  updateProduct: (id, product) => ipcRenderer.invoke('db:updateProduct', id, product),
  deleteProduct: (id) => ipcRenderer.invoke('db:deleteProduct', id),
  
  // Opérations sur les factures
  saveInvoice: (invoiceData) => ipcRenderer.invoke('db:saveInvoice', invoiceData),
});