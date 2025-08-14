const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

let mainWindow;
let db;

// Initialiser la base de données
function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'superette.db');
  
  // Créer le répertoire s'il n'existe pas
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);
  
  // Créer les tables si elles n'existent pas
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  // Insérer des données par défaut si la table est vide
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (barcode, name, price, category, stock)
      VALUES (?, ?, ?, ?, ?)
    `);

    const defaultProducts = [
      ['1234567890123', 'Pain de mie', 2.50, 'Boulangerie', 50],
      ['2345678901234', 'Lait 1L', 1.20, 'Produits laitiers', 30],
      ['3456789012345', 'Bananes (kg)', 2.80, 'Fruits', 25],
      ['4567890123456', 'Eau 1.5L', 0.80, 'Boissons', 100],
      ['5678901234567', 'Yaourt nature', 3.20, 'Produits laitiers', 40],
      ['6789012345678', 'Pommes (kg)', 3.50, 'Fruits', 20],
      ['7890123456789', 'Coca-Cola 33cl', 1.50, 'Boissons', 60],
      ['8901234567890', 'Baguette', 1.10, 'Boulangerie', 15]
    ];

    for (const product of defaultProducts) {
      insertProduct.run(...product);
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/vite.svg'),
    title: 'Superette POS - Point de Vente',
    show: false
  });

  // Charger l'application
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Gestionnaires IPC pour la base de données
ipcMain.handle('db:getProducts', () => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name').all();
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getProductByBarcode', (event, barcode) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE barcode = ?').get(barcode);
    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:addProduct', (event, product) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO products (barcode, name, price, category, stock)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(product.barcode, product.name, product.price, product.category, product.stock);
    return { success: true, data: { id: result.lastInsertRowid, ...product } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:updateProduct', (event, id, product) => {
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET barcode = ?, name = ?, price = ?, category = ?, stock = ?
      WHERE id = ?
    `);
    stmt.run(product.barcode, product.name, product.price, product.category, product.stock, id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:deleteProduct', (event, id) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:saveInvoice', (event, invoiceData) => {
  try {
    const transaction = db.transaction((data) => {
      // Insérer la facture
      const insertInvoice = db.prepare(`
        INSERT INTO invoices (invoice_number, subtotal, tax, total)
        VALUES (?, ?, ?, ?)
      `);
      const invoiceResult = insertInvoice.run(
        data.invoiceNumber,
        data.subtotal,
        data.tax,
        data.total
      );

      // Insérer les articles de la facture
      const insertItem = db.prepare(`
        INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const item of data.items) {
        insertItem.run(
          invoiceResult.lastInsertRowid,
          item.product.id,
          item.quantity,
          item.product.price,
          item.product.price * item.quantity
        );

        // Mettre à jour le stock
        const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
        updateStock.run(item.quantity, item.product.id);
      }

      return invoiceResult.lastInsertRowid;
    });

    const invoiceId = transaction(invoiceData);
    return { success: true, data: { id: invoiceId } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});