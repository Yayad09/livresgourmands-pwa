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

## Répartition des rôles
| Membre | Responsabilités |
|---|---|
| Yaya & Ayman Abdelaziz  |Travail collectif diagrammes et readme |

## Contenu du dépôt
- `README.md` : ce fichier
- `diagrammes/Etape01-Diagrammes.pdf` : diagramme de cas d'utilisation + diagramme de classes (export final)
- `diagrammes/usecase.drawio` : source éditable du diagramme de cas d'utilisation
- `diagrammes/classes.drawio` : source éditable du diagramme de classes

## Date
11 septembre 2026
