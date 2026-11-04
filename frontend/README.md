# livresgourmands.net : front-end React (étape 3)

Interface React + Bootstrap connectée à l'API REST de l'étape 2 (`../etape02`).

## Démarrage

```bash
# 1. API (voir ../etape02/README.md pour la base MySQL)
cd ../etape02 && npm install && npm start      # http://localhost:3000

# 2. Front-end
cd ../frontend && npm install && npm run dev   # http://localhost:5173
```

En développement, Vite redirige `/api` vers `http://localhost:3000` (voir `vite.config.js`).
Pour une autre URL d'API, copier `.env.example` en `.env` et modifier `VITE_API_URL`.

Comptes de démonstration (mot de passe `password123`) : `client@test.com`, `admin@test.com`,
`chef@test.com` (gestionnaire), `editeur@test.com`. Des boutons les préremplissent sur la page de connexion.

Autres commandes : `npm run build` (version de production dans `dist/`), `npm run lint`.

## Structure

```
src/
├── api/
│   ├── client.js        Instance Axios (JWT, timeout, traduction des erreurs en messages clairs)
│   └── services.js      Une fonction par endpoint (ouvrages, panier, commandes, listes…)
├── context/
│   ├── AuthContext.jsx  Session (JWT + utilisateur dans localStorage, déconnexion auto sur 401)
│   ├── CartContext.jsx  Panier global : Context API + localStorage + synchronisation /api/panier
│   └── ToastContext.jsx Notifications (succès, erreur, produit épuisé…)
├── components/          Header, Footer, Layout, HeroCarousel, BookBrowser (filtres), BookCard,
│                        StockBadge, StarRating, QuantitySelector, ProtectedRoute, Loader, ErrorMessage
├── pages/
│   ├── HomePage, CataloguePage, ProductPage, CartPage, CheckoutPage, ConfirmationPage,
│   │   MyOrdersPage, LoginPage, RegisterPage, GiftListPage, NotFoundPage
│   └── admin/           AdminLayout (menu latéral), DashboardPage, AdminBooksPage + BookFormModal,
│                        AdminOrdersPage, AdminUsersPage
├── utils/format.js      Prix, dates, statuts, rôles
├── App.jsx              Routes (React Router 6) et routes protégées par rôle
└── index.css            Charte graphique (couleurs, typographies, composants)
```

## Correspondance avec l'énoncé

| Exigence | Où |
|---|---|
| Accueil : carrousel, cartes, filtres dynamiques, navigation par catégorie | `HomePage`, `HeroCarousel`, `BookBrowser`, menu « Catégories » du `Header` |
| Page produit : titre, image, prix, description, stock, avis, ajout au panier | `ProductPage` |
| Panier dynamique (ajout, retrait, quantités, total) avec Context API + localStorage | `CartContext`, `CartPage` |
| Dashboard admin : CRUD ouvrages, commandes, utilisateurs, routage protégé, menu latéral | `pages/admin/*`, `ProtectedRoute`, `App.jsx` |
| Axios, `/api/ouvrages` | `api/client.js`, `api/services.js`, `BookBrowser` |
| Synchronisation du panier avec l'API | `CartContext` (fusion à la connexion, POST/PUT/DELETE `/api/panier/items`) |
| Messages d'erreur (épuisé, stock insuffisant, connexion, session expirée…) | `messageErreur()` dans `api/client.js`, `ToastContext`, `ErrorMessage` |
| Responsive et accessibilité | Grille Bootstrap, menu hamburger, offcanvas admin, contrastes AA, lien d'évitement, `aria-*` |

## Fonctionnement du panier

- Visiteur : le panier vit dans le Context et est sauvegardé dans `localStorage` (`lg_cart`).
- Client connecté : chaque action appelle aussi l'API (`POST/PUT/DELETE /api/panier/items`).
  En cas de refus (stock insuffisant…), l'action est annulée et un message s'affiche.
- À la connexion, les articles du panier local sont ajoutés au panier du compte, puis le panier serveur est rechargé.
- Après la commande (`POST /api/commandes`), le panier est vidé.
