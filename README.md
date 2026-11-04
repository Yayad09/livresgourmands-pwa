# livresgourmands.net

## Description du projet
livresgourmands.net est une plateforme de commerce électronique spécialisée dans la vente de livres de cuisine, destinée à tous les niveaux (débutants, amateurs, chefs). Le site se distingue par la gestion de listes de cadeaux personnalisées, la collecte et validation des avis/commentaires clients, et un module de paiement en ligne sécurisé.

Projet réalisé dans le cadre du cours **Programmation Web avancée**, Institut Grasset, session Automne 2026 (enseignante : Kahina Tamazouzt).

## Objectifs de l'étape 01
- Analyser et modéliser les acteurs et fonctionnalités du site (diagramme de cas d'utilisation).
- Produire une première ébauche du diagramme de classes, cohérente avec les cas d'utilisation.
- Mettre en place la structure du dépôt GitHub commun.

## Modèle retenu
- **Utilisateur** (classe de base) → **Client**, **Editeur**, **Gestionnaire**, **Administrateur** (héritage).
- **Internaute** et **Ami** sont des acteurs du diagramme de cas d'utilisation, mais pas des classes persistées : navigation publique pour l'Internaute, accès par code (`ListeCadeaux.codeAcces`) pour l'Ami. L'achat d'un Ami est réalisé via `ListeCadeaux.acheterDepuisListe()`, qui produit une Commande.
- **Paiement** (interface) → **CarteBancaire**, **PayPal**.
- Entités métier : Ouvrage, Categorie, Panier, Commande, Avis, Commentaire, ListeCadeaux.

### Correspondance cas d'utilisation → classes
| Cas d'utilisation | Méthode / classe |
|---|---|
| S'enregistrer / Se connecter | `Client.sEnregistrer()`, `Utilisateur.seConnecter()` |
| Gérer le panier | `Panier.ajouterArticle()`, `Panier.calculerTotal()` |
| Passer une commande | `Client.passerCommande()`, `Commande.validerCommande()` |
| Consulter l'historique | `Client.consulterHistorique()` (Administrateur : `superviserTransactions()`) |
| Créer une liste de cadeaux | `Client.creerListeCadeaux()`, `ListeCadeaux.partager()` |
| Acheter depuis une liste (Ami) | `ListeCadeaux.acheterDepuisListe()` |
| Laisser un avis / un commentaire | `Avis.ajouterAvis()`, `Commentaire.soumettreCommentaire()` |
| Gérer descriptions/catégories, valider commentaires | `Editeur.gererCategories()`, `Editeur.validerCommentaire()` |
| Gérer catalogue/stock, suivre les ventes | `Gestionnaire.gererCatalogue()`, `Gestionnaire.gererStock()`, `Gestionnaire.suivreVentes()` |
| Gérer les utilisateurs, superviser les transactions | `Administrateur.gererUtilisateurs()`, `Administrateur.superviserTransactions()` |
| Effectuer un paiement en ligne | `Paiement.payer()` (CarteBancaire, PayPal) |

## Étape 03 : conception visuelle et intégration front-end / back-end

**Remise : 26 novembre 2026.**

### Démarrage rapide
```bash
# Base de données
mysql -u root -p -e "CREATE DATABASE livresgourmands CHARACTER SET utf8mb4;"
mysql -u root -p livresgourmands < etape02/schema.sql
mysql -u root -p livresgourmands < etape02/seed_data.sql

# API (port 3000) : copier etape02/.env.example en etape02/.env et le compléter
cd etape02 && npm install && npm start

# Front-end React (port 5173), dans un autre terminal
cd frontend && npm install && npm run dev
```
Ouvrir http://localhost:5173. Comptes de test (mot de passe `password123`) :
`client@test.com`, `admin@test.com`, `chef@test.com` (gestionnaire), `editeur@test.com`.

### Ce qui a été réalisé
- **Front-end React + Bootstrap** (`frontend/`) : accueil (carrousel, filtres dynamiques, cartes), catalogue,
  fiche produit (stock, avis, commentaires), panier dynamique (Context API + localStorage, synchronisé avec l'API),
  commande (livraison et paiement), mes commandes, listes de cadeaux (client et ami), connexion / inscription,
  **dashboard administrateur** (CRUD des ouvrages, commandes, utilisateurs) avec routes protégées par rôle.
- **Communication API** avec Axios (intercepteur JWT, messages d'erreur clairs : produit épuisé, stock insuffisant,
  serveur injoignable, session expirée…). Détails : [`frontend/README.md`](frontend/README.md).
- **API complétée** (`etape02/`) : CORS, filtres sur `/api/ouvrages`, images, modification de quantité dans le panier,
  commandes pour l'admin, routes des listes de cadeaux, comptes de test fonctionnels. Détails : [`etape02/README.md`](etape02/README.md).
- **Conception visuelle** (`livrables/`) : dossier de conception PDF (modèle Bonnevaux) avec wireframes desktop et mobile,
  charte graphique et maquettes ; guide des frames Figma et des liaisons du prototype Adobe XD ; script de la vidéo de démonstration.

## Répartition des rôles
| Membre | Responsabilités |
|---|---|
| Yaya Diallo & Ayman Abdelaziz  |Travail collectif diagrammes et readme |

## Contenu du dépôt
- `README.md` : ce fichier
- `frontend/` : application React (étape 3)
- `etape02/` : API REST Node.js / Express / MySQL
- `livrables/` : dossier de conception, guide Figma/XD, script vidéo, liens (étape 3)
- `diagrammes/Etape01-Diagrammes.pdf` : diagramme de cas d'utilisation + diagramme de classes (export final)
- `diagrammes/usecase.drawio` : source éditable du diagramme de cas d'utilisation
- `diagrammes/classes.drawio` : source éditable du diagramme de classes

## Date
11 septembre 2026
