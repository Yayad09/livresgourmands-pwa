# Prototype interactif (Figma) : 14 écrans haute fidélité

Chaque SVG contient une capture du vrai site + des **zones cliquables invisibles** déjà placées sur les boutons.
Chaque zone porte le nom de l'écran vers lequel elle doit mener, par exemple `lien_vers_03_Fiche_produit`.

| Écran | Zones cliquables → destination |
|---|---|
| 01-Accueil | `lien_vers_02_Accueil_filtre` (pastille Pâtisserie) · `lien_vers_09_Liste_cadeaux_code` (menu) |
| 02-Accueil-filtre-Patisserie | `lien_vers_03_Fiche_produit` (carte Macarons) |
| 03-Fiche-produit | `lien_vers_04_Fiche_produit_ajoute` (Ajouter au panier) |
| 04-Fiche-produit-ajoute | `lien_vers_05_Panier` (icône panier) |
| 05-Panier | `lien_vers_06_Connexion` (Passer la commande) |
| 06-Connexion | `lien_vers_07_Commande` (Se connecter) · `lien_vers_11_Admin_tableau_de_bord` (bouton Administrateur) |
| 07-Commande | `lien_vers_08_Confirmation` (Confirmer et payer) |
| 08-Confirmation | `lien_vers_01_Accueil` (Continuer mes achats) |
| 09-Liste-cadeaux-code | `lien_vers_10_Liste_cadeaux_ouverte` (Voir la liste) |
| 10-Liste-cadeaux-ouverte | `lien_vers_05_Panier` (Offrir) |
| 11-Admin-tableau-de-bord | `lien_vers_12_Admin_ouvrages` · `lien_vers_14_Admin_commandes` (menu) |
| 12-Admin-ouvrages | `lien_vers_13_Admin_formulaire` (Ajouter un ouvrage) · `lien_vers_11_…` · `lien_vers_14_…` (menu) |
| 13-Admin-formulaire | `lien_vers_12_Admin_ouvrages_Enregistrer` · `lien_vers_12_Admin_ouvrages_Annuler` |
| 14-Admin-commandes | `lien_vers_11_Admin_tableau_de_bord` · `lien_vers_12_Admin_ouvrages` (menu) |

Parcours (flows) à créer : **Parcours Client** (départ 01), **Parcours Ami** (départ 09), **Parcours Admin** (départ 11).
