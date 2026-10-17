# Rapport Étape 02 : API et base de données

## 1. Base de données

Le schéma (`schema.sql`) contient 11 tables : `users`, `categories`, `ouvrages`, `panier`, `panier_items`, `commandes`, `commande_items`, `listes_cadeaux`, `liste_items`, `avis`, `commentaires`.

Le schéma respecte la 3NF : chaque information n'apparaît qu'à un endroit, sauf le prix unitaire copié dans `panier_items` et `commande_items`, volontairement, pour conserver le prix au moment de l'achat.

Contraintes :
- clés primaires auto-incrémentées, clés étrangères sur toutes les relations ;
- `users.email` et `ouvrages.isbn` uniques ;
- `avis.note` entre 1 et 5, et un seul avis par client et par ouvrage (`UNIQUE (client_id, ouvrage_id)`) ;
- `commentaires.valide` vaut `false` par défaut (modération par l'éditeur) ;
- `commandes.statut` est un ENUM (`en_cours`, `payee`, `annulee`, `expediee`).

## 2. API

Technologies : Node.js, Express, mysql2, JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), express-validator.

Le détail des endpoints, des rôles et des codes de réponse est dans `README.md`.

### Règles métier implémentées
1. Seuls les ouvrages en stock (`stock > 0`) sont affichés publiquement.
2. L'ajout au panier vérifie le stock disponible (transaction avec verrou `FOR UPDATE`).
3. La commande est atomique : vérification du stock de chaque article, création de la commande, décrément du stock et fermeture du panier dans une seule transaction. En cas d'erreur, tout est annulé.
4. Un avis n'est accepté que si le client a acheté l'ouvrage.
5. Un commentaire est créé non validé ; seul un éditeur peut le publier.
6. Les rôles sont vérifiés par middleware (`client`, `editeur`, `gestionnaire`, `administrateur`).
7. Les mots de passe sont hachés avec bcrypt ; les tokens JWT expirent après 24 h.

### Validation et erreurs
- Les entrées sont validées avec express-validator (types, longueurs, valeurs permises). Une entrée invalide renvoie `400`.
- Les erreurs de base de données sont centralisées dans un gestionnaire unique qui renvoie `500` sans exposer les détails internes.

## 3. Tests

Tests réalisés manuellement avec PowerShell (`Invoke-RestMethod`) :
- inscription : `201` puis `409` pour un email déjà utilisé ;
- connexion : retourne un token et les informations de l'utilisateur ;
- route protégée sans token : `401 No token` ;
- route protégée avec token : `200`, panier vide retourné.

La collection Postman (`postman_collection.json`) couvre les routes principales.

## 4. Limites connues

- Paiement : l'intégration Stripe ou PayPal n'est pas implémentée à cette étape.
- Listes de cadeaux : l'achat depuis une liste par un ami (`acheterDepuisListe`) n'est pas encore branché.
- Pagination et filtres de recherche : non implémentés.
- Tests automatisés : aucun test unitaire ; les tests sont manuels.
- Les routes `PUT /api/users/:id` et la gestion des rôles par un administrateur ne sont pas encore couvertes.

## 5. Fichiers livrés

| Fichier | Contenu |
|---|---|
| `schema.sql` | Création des 11 tables et des index |
| `seed_data.sql` | Données de test |
| `server.js` | API complète |
| `package.json` | Dépendances |
| `.env.example` | Variables d'environnement à configurer |
| `README.md` | Installation et endpoints |
| `postman_collection.json` | Requêtes de test |
