# Guide Figma (wireframes) et Adobe XD (prototype)

Ce guide décrit exactement quoi dessiner pour les livrables 1 et 2 de la partie 1.
La structure de chaque écran est déjà dessinée dans le dossier de conception
(`dossier-conception/Dossier-conception-livresgourmands.pdf`, section IV, pages 9 à 15) :
il suffit de la reproduire.

---

## 1. Figma : wireframes (basse fidélité, noir et blanc)

### Mise en place (5 min)
1. Nouveau fichier Figma : **« livresgourmands - Wireframes »**.
2. Créer 2 pages Figma : `Desktop` et `Mobile`.
3. Frames : **Desktop 1280 × 800** (ou « Desktop » 1440 si vous préférez) et **iPhone 14 (390 × 844)**.
4. Couleurs : uniquement des gris (#EEEEEE pour les blocs, #888888 pour les boutons, #333333 pour le texte).
5. Grille Desktop : Layout grid → Columns 12, marge 80, gouttière 24. Mobile : Columns 4, marge 16.

### Frames à créer (un desktop et un mobile pour chaque écran = 22 frames)

| # | Nom du frame | Contenu (de haut en bas) |
|---|---|---|
| 01 | Accueil | Barre de nav (logo, Accueil, Catégories ▾, Listes de cadeaux, recherche, panier (n), compte) · carrousel · 4 atouts · titre + pastilles catégories · barre de filtres (recherche, tri, prix max, en stock) · grille de cartes livres (4 colonnes desktop / 1 colonne mobile) · pied de page |
| 02 | Catalogue filtré | Comme l'accueil sans carrousel, une pastille de catégorie active, « 2 livres trouvés » |
| 03 | Fiche produit | Fil d'Ariane · couverture à gauche · catégorie, titre, auteur, étoiles, prix, badge stock · [− 1 +] + **Ajouter au panier** + Liste de cadeaux ▾ · description · bloc Avis · bloc Commentaires |
| 04 | Fiche produit épuisé | Même chose, bouton remplacé par l'encadré « Ce livre est actuellement épuisé » |
| 05 | Panier | Liste d'articles (image, titre, prix unitaire, [− q +], Retirer, sous-total) · récapitulatif à droite (mobile : en dessous) · **Passer la commande** |
| 06 | Panier vide | Icône sac + « Votre panier est vide » + bouton catalogue |
| 07 | Connexion | Courriel · mot de passe · **Se connecter** · lien « Créer un compte » · lien « Mot de passe oublié » |
| 08 | Inscription | Nom · courriel · mot de passe · confirmation · **Créer mon compte** |
| 09 | Commande | ① Adresse ② Livraison (3 radios) ③ Paiement (carte / PayPal) · récapitulatif · **Confirmer et payer** |
| 10 | Confirmation | Icône ✓ · « Merci pour votre commande » · n° et total · boutons Mes commandes / Continuer |
| 11 | Liste de cadeaux : accès Ami | Champ « code personnel » + Voir · livres souhaités avec bouton **Offrir** |
| 12 | Liste de cadeaux : Mes listes (Client) | Champ nom + Créer · tableau (liste, nb livres, code à copier) |
| 13 | Admin : Tableau de bord | Menu latéral (Tableau de bord, Ouvrages, Commandes, Utilisateurs, Boutique) · 4 indicateurs · alertes de stock · dernières commandes |
| 14 | Admin : Ouvrages | Bouton **Ajouter un ouvrage** · recherche · tableau (ouvrage, catégorie, ISBN, prix, stock, ✎ 🗑) |
| 15 | Admin : Formulaire ouvrage | Fenêtre modale : titre, ISBN, auteur, catégorie, prix, stock, image, description, Annuler / **Enregistrer** |
| 16 | Admin : Commandes | Filtre par statut · tableau (n°, date, client, articles, livraison, total, statut ▾) |

> Le minimum exigé par la grille : **toutes les pages pertinentes en mobile ET desktop**.
> Les frames 01, 03, 05, 07, 09, 11, 13 et 14 sont indispensables ; les autres sont des bonus rapides (dupliquer et modifier).

Astuce : créez d'abord des **composants** (barre de nav, carte livre, bouton, pied de page),
puis réutilisez-les dans chaque frame. Ça va beaucoup plus vite.

### Partage
`Share` → « Anyone with the link » → **can view** → copier le lien dans `liens.txt`.

---

## 2. Adobe XD : prototype interactif (haute fidélité)

### Mise en place
1. Nouveau document **Web 1920** ou **Custom 1280 × 800** (+ un artboard **iPhone 13/14** si vous voulez montrer le mobile).
2. Importer la charte : onglet **Assets (Ctrl+Shift+Y)** →
   - Couleurs : `#A63D2A` terre cuite, `#86301F` foncé, `#2F4F3A` sauge, `#FBF7F2` crème, `#F1E6D8` sable, `#2B2521` encre, `#5E534A` gris, `#C98A1B` or.
   - Polices : **Playfair Display** (titres), **Inter** (texte) (Google Fonts, gratuites).
3. **Gain de temps :** les captures du site réel sont dans `dossier-conception/captures/`.
   Vous pouvez les glisser dans les artboards comme fond et placer par-dessus des zones cliquables
   (rectangles transparents), ou redessiner par-dessus pour avoir une vraie maquette XD.
   Couvertures des livres : `frontend/public/images/ouvrage-*.svg`.

### Artboards à créer
`01 Accueil` · `02 Accueil filtré Pâtisserie` · `03 Fiche produit` · `04 Fiche produit (ajouté au panier)` ·
`05 Panier` · `06 Connexion` · `07 Commande` · `08 Confirmation` · `09 Liste cadeaux : code` · `10 Liste cadeaux : ouverte` ·
`11 Admin Tableau de bord` · `12 Admin Ouvrages` · `13 Admin Formulaire (overlay)` · `14 Admin Commandes`

### Liaisons (mode **Prototype**), réglage par défaut : *Tap* → *Dissolve* 0,3 s, *Ease out*

**Parcours Client (achat) : Home = 01**
| De | Élément | Vers | Transition |
|---|---|---|---|
| 01 | Pastille « Pâtisserie » | 02 | Dissolve |
| 02 | Carte « Macarons et Merveilles » | 03 | Slide left |
| 03 | Bouton « Ajouter au panier » | 04 (toast visible, compteur panier = 1) | Dissolve |
| 04 | Icône panier | 05 | Slide left |
| 05 | « Passer la commande » | 06 | Dissolve |
| 06 | « Se connecter » | 07 | Slide left |
| 07 | « Confirmer et payer » | 08 | Dissolve |
| 08 | « Continuer mes achats » | 01 | Slide right |

**Parcours Ami (liste de cadeaux)**
| De | Élément | Vers |
|---|---|---|
| 01 | « Listes de cadeaux » (menu) | 09 |
| 09 | « Voir la liste » | 10 |
| 10 | « Offrir » | 05 (panier) |

**Parcours Administrateur**
| De | Élément | Vers | Transition |
|---|---|---|---|
| 06 | Se connecter (compte admin) | 11 | Dissolve |
| 11 | Menu « Ouvrages » | 12 | Dissolve |
| 12 | « Ajouter un ouvrage » / ✎ | 13 | **Overlay** |
| 13 | « Enregistrer » ou « Annuler » | 12 | Dissolve |
| 11/12 | Menu « Commandes » | 14 | Dissolve |
| 14 | Menu « Tableau de bord » | 11 | Dissolve |

Bonus apprécié : un **Hover state** sur les boutons (composant avec état « Hover » en `#86301F`)
et une interaction **Auto-Animate** pour le compteur du panier (artboards 03 → 04).

Créez **3 flows** (bouton ⌂ sur l'artboard de départ) : `Parcours Client` (01), `Parcours Ami` (01), `Parcours Admin` (06).

### Partage
`Share` → **Share for Review** → *Anyone with the link* → copier le lien dans `liens.txt`.

---

## 3. Si Adobe XD n'est pas disponible
Adobe XD n'est plus vendu aux nouveaux clients. Si vous n'y avez pas accès, demandez à l'enseignante
si le **prototype Figma** (onglet *Prototype*, mêmes liaisons qu'au point 2) est accepté à la place.
