# Livresgourmands API - Étape 02

API REST pour le site e-commerce livresgourmands.net (Express, MySQL, JWT, bcrypt).

## Installation

```bash
npm install
```

## Configuration

1. Copier `.env.example` en `.env`.
2. Renseigner `DB_PASSWORD` et `JWT_SECRET`.
3. Créer la base et charger le schéma :
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS livresgourmands;"
mysql -u root -p livresgourmands < schema.sql
```
4. Données de test : `mysql -u root -p livresgourmands < seed_data.sql`
   (10 ouvrages, 5 catégories, une commande, des avis). Comptes, tous avec le mot de passe **password123** :
   `admin@test.com` (administrateur), `chef@test.com` (gestionnaire), `editeur@test.com` (éditeur), `client@test.com` (client).
5. (Optionnel) `FRONT_ORIGIN` dans `.env` si le front-end n'est pas sur `http://localhost:5173` (CORS).

> **Mise à jour étape 3 :** une colonne `image` a été ajoutée à `ouvrages`. Si votre base date de l'étape 2,
> recréez-la avec `schema.sql` puis `seed_data.sql`.

## Lancer

```bash
npm start      # production
npm run dev    # développement (nodemon)
```

Le serveur écoute sur le port 3000.

## Authentification

Les routes protégées demandent l'en-tête `Authorization: Bearer <token>`. Le token est obtenu via `POST /api/auth/login` et expire après 24 h.

Rôles : `client`, `editeur`, `gestionnaire`, `administrateur`.

## Endpoints

### Auth
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Inscription (201, 409 si email existant) |
| POST | `/api/auth/login` | public | Connexion, retourne un JWT |
| GET | `/api/users/me` | connecté | Profil de l'utilisateur courant |
| GET | `/api/users` | administrateur | Liste des utilisateurs |

### Catégories
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/categories` | public | Liste des catégories |
| POST | `/api/categories` | editeur, gestionnaire | Créer une catégorie |

### Ouvrages
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/ouvrages` | public | Tous les ouvrages avec catégorie et note moyenne. Filtres : `?categorie=`, `?q=`, `?disponible=1` |
| GET | `/api/ouvrages/:id` | public | Détail, avis et commentaires validés |
| POST | `/api/ouvrages` | gestionnaire, editeur, administrateur | Ajouter un ouvrage |
| PUT | `/api/ouvrages/:id` | gestionnaire, editeur, administrateur | Modifier un ouvrage |
| DELETE | `/api/ouvrages/:id` | gestionnaire, administrateur | Supprimer un ouvrage (409 s'il est lié à des commandes) |

### Panier
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/panier` | client | Contenu du panier |
| POST | `/api/panier/items` | client | Ajouter un article (vérifie le stock, transaction ; cumule si déjà présent) |
| PUT | `/api/panier/items/:id` | client | Modifier la quantité (vérifie le stock) |
| DELETE | `/api/panier/items/:id` | client | Retirer un article |

### Commandes
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/commandes` | client | Passer commande (transaction, décrémente le stock) |
| GET | `/api/commandes` | client | Historique du client |
| GET | `/api/commandes/:id` | propriétaire, gestionnaire, administrateur | Détail d'une commande |
| PUT | `/api/commandes/:id/status` | gestionnaire, administrateur | Changer le statut |
| GET | `/api/admin/commandes` | gestionnaire, administrateur | Toutes les commandes (dashboard) |

### Listes de cadeaux
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/listes` | client | Mes listes |
| POST | `/api/listes` | client | Créer une liste (retourne un code de partage) |
| POST | `/api/listes/:id/items` | client | Ajouter un ouvrage à une de mes listes |
| GET | `/api/listes/:code` | public | Consulter une liste via son code |

### Avis et commentaires
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/ouvrages/:id/avis` | client | Noter un ouvrage acheté (1 à 5, un avis par ouvrage) |
| POST | `/api/ouvrages/:id/commentaires` | client | Soumettre un commentaire (non publié) |
| PUT | `/api/commentaires/:id/valider` | editeur | Valider ou refuser un commentaire |

## Codes de réponse

- `400` : données invalides ou stock insuffisant
- `401` : token absent ou invalide
- `403` : rôle insuffisant
- `404` : ressource introuvable
- `409` : doublon (email, ISBN, avis déjà laissé)
- `500` : erreur serveur

## Équipe

Yaya & Ayman-Abdelaziz Chahboun
