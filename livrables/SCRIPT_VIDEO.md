# Script de la vidéo de démonstration (3 à 4 minutes)

**Avant d'enregistrer :** API démarrée (`cd etape02 && npm start`), front démarré
(`cd frontend && npm run dev`), base réinitialisée avec `schema.sql` + `seed_data.sql`,
navigateur en plein écran, localStorage vidé (navigation privée).
Outil : OBS, l'outil Capture d'écran de Windows (Win+Shift+R) ou QuickTime (Mac).

| Temps | À l'écran | À dire |
|---|---|---|
| 0:00 | Accueil | « Voici livresgourmands.net, notre front-end React + Bootstrap connecté à l'API Node/Express/MySQL de l'étape 2. » |
| 0:15 | Carrousel, puis clic sur les pastilles « Pâtisserie », recherche « pâtes », tri par prix, interrupteur « En stock » | « Les livres viennent de GET /api/ouvrages avec Axios. Les filtres sont dynamiques. » |
| 0:45 | Carte « Pâtisserie Pro » | « Un livre épuisé reste visible mais le bouton est désactivé, avec un message clair. » |
| 0:55 | Fiche « Cuisine Facile » : quantité 2 → Ajouter au panier | « La fiche affiche titre, image, prix, description, stock et avis. Notification de confirmation. » |
| 1:15 | Essayer d'ajouter plus que le stock (Macarons, stock 3) | « Message : stock insuffisant. » |
| 1:25 | Panier : +/−, Retirer, total ; puis **F5** | « Le panier utilise Context API et localStorage : il est conservé après rechargement. » |
| 1:45 | Passer la commande → redirection vers Connexion → bouton « Client » | « La commande est une route protégée. À la connexion, le panier local est synchronisé avec l'API. » |
| 2:05 | Commande : adresse, livraison, paiement → Confirmer | « POST /api/commandes : la commande est créée et le stock est décrémenté. » |
| 2:20 | Mes commandes, puis Listes de cadeaux : créer une liste, copier le code | « Le client crée une liste ; un ami l'ouvre avec le code et peut offrir un livre. » |
| 2:40 | Déconnexion → /admin → connexion Administrateur | « L'espace admin est protégé par rôle avec React Router. » |
| 2:50 | Tableau de bord → Ouvrages : ajouter, modifier, supprimer | « CRUD complet branché sur POST, PUT et DELETE /api/ouvrages. » |
| 3:20 | Commandes : changer un statut ; Utilisateurs | « Consultation des commandes et des utilisateurs. » |
| 3:35 | Arrêter l'API (Ctrl+C) puis recharger l'accueil | « En cas de problème de connexion, l'utilisateur voit un message clair et un bouton Réessayer. » |
| 3:45 | Outils de développement → mode mobile (iPhone) | « Le site est responsive : menu hamburger, une colonne, boutons pleine largeur. » |
