# Wireframes prêts à importer dans Figma

`svg/` contient **32 wireframes** (16 écrans × desktop 1280 px + mobile 390 px), en niveaux de gris.
Dans Figma, chaque SVG devient un frame avec des **rectangles et des textes modifiables**.

## Importer (environ 10 minutes)

1. Figma → **New design file** → le renommer « livresgourmands - Wireframes ».
2. Créer deux pages (panneau de gauche, « + » à côté de *Pages*) : `Desktop` et `Mobile`.
3. Page `Desktop` : sélectionner tous les fichiers `*-Desktop.svg` dans l'explorateur et les **glisser-déposer** sur le canevas.
   (Ou menu ☰ → *File* → *Place image…* et choisir les fichiers.)
4. Page `Mobile` : même chose avec les fichiers `*-Mobile.svg`.
5. Ranger les frames : tout sélectionner (Ctrl/Cmd + A) → panneau de droite → *Tidy up* (icône de grille).
6. Vérifier les noms des frames (01-Accueil-Desktop, etc.) : double-clic pour renommer si besoin.
7. Si un texte s'affiche dans une autre police : sélectionner tout → remplacer la police par **Inter**.

## Pour montrer un vrai travail Figma (recommandé)
L'énoncé évalue les wireframes **réalisés avec Figma**. Après l'import, prenez 15 à 20 minutes pour :
- transformer la barre de navigation, la carte livre, le bouton principal et le pied de page en **composants**
  (sélection → clic droit → *Create component*, ou Ctrl/Cmd + Alt + K), puis remplacer les copies par des instances ;
- ajouter une **Layout grid** sur chaque frame (12 colonnes en desktop, 4 en mobile) ;
- ajuster les textes à votre goût.

## Partager
Bouton **Share** → *Anyone with the link* → **can view** → *Copy link* → coller dans `../liens.txt`.

## Régénérer les fichiers
```bash
python3 generer_wireframes.py
```
(Le contenu des écrans est défini dans la fonction `ecrans()` du script.)
