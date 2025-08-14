# Superette POS - Application de Point de Vente

Une application de point de vente moderne et complète pour superettes, avec scanner de codes-barres et gestion des produits.

## Fonctionnalités

- 🔍 **Scanner de codes-barres** : Compatible avec les scanners USB standard
- 📦 **Gestion des produits** : Ajout, modification et suppression des produits
- 🧾 **Génération de factures** : Factures détaillées avec calcul automatique de la TVA
- 💾 **Base de données locale** : SQLite intégrée pour la persistance des données
- 🖥️ **Application desktop** : Fonctionne en local sans connexion internet
- 📱 **Interface responsive** : Optimisée pour les écrans tactiles et les ordinateurs

## Installation et Utilisation

### Mode Développement Web
```bash
npm install
npm run dev
```

### Mode Application Desktop

#### Développement
```bash
npm install
npm run electron:dev
```

#### Construction de l'application
```bash
npm run electron:build
```

#### Distribution (création d'installateur)
```bash
npm run electron:dist
```

## Structure de la Base de Données

L'application utilise SQLite avec les tables suivantes :

- **products** : Stockage des produits (code-barres, nom, prix, catégorie, stock)
- **invoices** : Factures générées
- **invoice_items** : Détails des articles par facture

## Utilisation du Scanner

L'application est compatible avec tous les scanners de codes-barres USB qui émulent un clavier. Il suffit de :

1. Connecter le scanner USB
2. Activer le mode scanner dans l'application
3. Scanner les produits - ils s'ajoutent automatiquement au panier

## Technologies Utilisées

- **Frontend** : React + TypeScript + Tailwind CSS
- **Desktop** : Electron
- **Base de données** : SQLite (better-sqlite3)
- **Build** : Vite + Electron Builder

## Déploiement

L'application peut être distribuée sous forme d'exécutable pour :
- Windows (.exe avec installateur NSIS)
- macOS (.dmg)
- Linux (AppImage)

Les données sont stockées localement dans le dossier utilisateur de l'application.