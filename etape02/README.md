# Livresgourmands API - Étape 02

API REST complète pour le site e-commerce livresgourmands.net

## Installation

```bash
npm install
```

## Configuration

1. Copier `.env.example` en `.env`
2. Configurer les variables MySQL
3. Exécuter `schema.sql` pour créer les tables

## Lancer

```bash
npm start        # production
npm run dev      # développement (nodemon)
```

## Endpoints disponibles

### Auth

* `POST /api/auth/register` — inscription
* `POST /api/auth/login` — connexion (retourne JWT)

### Ouvrages

* `GET /api/ouvrages` — liste (stock > 0)
* `GET /api/ouvrages/:id` — détail
* `POST /api/ouvrages` — créer (gestionnaire/editeur)
* `PUT /api/ouvrages/:id` — modifier (gestionnaire)

### Panier

* `GET /api/panier` — afficher panier
* `POST /api/panier/items` — ajouter item

### Commandes

* `POST /api/commandes` — passer commande (décrément stock)
* `GET /api/commandes` — historique client

### Commentaires

* `POST /api/ouvrages/:id/commentaires` — soumettre (valide=false)
* `PUT /api/commentaires/:id/valider` — valider (editeur)

### Avis

* `POST /api/ouvrages/:id/avis` — ajouter avis (1-5, achat requis)

## Équipe

Yaya \&  Ayman-Abdelaziz Chahboun

## Règles métier implémentées

✓ Stock > 0 pour affichage
✓ Stock décrémenté lors de la commande
✓ Avis/commentaires : validation côté API
✓ JWT + bcrypt pour auth
✓ Roles : client/editeur/gestionnaire/administrateur

