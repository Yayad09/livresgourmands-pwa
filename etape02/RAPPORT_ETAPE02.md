# Rapport Étape 02 — API & Base de données

## Schéma de base de données

**12 tables relationnelles** : users, categories, ouvrages, panier, panier_items, commandes, commande_items, listes_cadeaux, liste_items, avis, commentaires, payments (optionnel)

**Normalisation** :
- Forme 3NF respectée (pas de redondance)
- PKs : tous en INT AUTO_INCREMENT
- FKs : intégrité référentielle activée
- ENUMs : roles (client/editeur/gestionnaire/administrateur), statuts commande

**Contraintes implémentées** :
- `ouvrages.stock >= 0` (filtrage à l'affichage)
- `avis.note CHECK (1-5)`
- `commentaires.valide DEFAULT false` (modération)
- `users.email UNIQUE`
- `avis UNIQUE (client_id, ouvrage_id)`

## API REST

**Framework** : Node.js + Express
**Auth** : JWT (jsonwebtoken) + bcryptjs (hash mot de passe)
**Validation** : vérifications côté serveur

**Endpoints** : 17 total
- Auth (2) : register, login
- Ouvrages (4) : GET, GET/:id, POST, PUT
- Panier (2) : GET, POST items
- Commandes (2) : POST, GET historique
- Commentaires (2) : POST, PUT/valider
- Avis (1) : POST

**Règles métier** :
1. Seuls ouvrages avec stock > 0 affichés publiquement
2. Stock décrémenté lors de validation commande (transactionnel)
3. Avis accepté seulement si client a acheté ce livre (vérif API)
4. Commentaires : valide=false par défaut, édition requise pour publication
5. Rôles avec middleware : gestionnaire/editeur/administrateur ont droits différents

## Livrables

| Fichier | Contenu |
|---------|---------|
| schema.sql | DDL 12 tables + indexes |
| server.js | API complète (247 lignes) |
| package.json | Dépendances (Express, JWT, bcrypt) |
| .env.example | Configuration (DB, JWT_SECRET) |
| README.md | Instructions install + endpoints |
| postman_collection.json | Tests endpoints (export JSON) |

## Limitations & améliorations futures

- Paiement : intégration Stripe/PayPal non implémentée (optionnel)
- Recherche/filtres avancés : pagination à ajouter
- Cache Redis : non utilisé (perfs OK pour usage étudiant)
- Logs : console.log basique (Winston à ajouter en prod)
- Tests : unit tests manquants (jest/mocha recommandé)

