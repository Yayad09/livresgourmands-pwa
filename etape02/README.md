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
4. (Optionnel) Données de test : `seed_data.sql`. Les mots de passe de ce fichier sont des placeholders : créer un compte via `/api/auth/register`.

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
| GET | `/api/ouvrages` | public | Ouvrages en stock (stock > 0) |
| GET | `/api/ouvrages/:id` | public | Détail et avis d'un ouvrage |
| POST | `/api/ouvrages` | gestionnaire, editeur | Ajouter un ouvrage |
| PUT | `/api/ouvrages/:id` | gestionnaire, editeur | Modifier un ouvrage |
| DELETE | `/api/ouvrages/:id` | gestionnaire | Supprimer un ouvrage |

### Panier
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/panier` | client | Contenu du panier |
| POST | `/api/panier/items` | client | Ajouter un article (vérifie le stock, transaction) |
| DELETE | `/api/panier/items/:id` | client | Retirer un article |

### Commandes
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/commandes` | client | Passer commande (transaction, décrémente le stock) |
| GET | `/api/commandes` | client | Historique du client |
| GET | `/api/commandes/:id` | propriétaire, gestionnaire, administrateur | Détail d'une commande |
| PUT | `/api/commandes/:id/status` | gestionnaire, administrateur | Changer le statut |

### Listes de cadeaux
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/listes` | client | Créer une liste (retourne un code de partage) |
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
