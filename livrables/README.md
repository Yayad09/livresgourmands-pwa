# Livrables de l'étape 3

| Fichier | Contenu |
|---|---|
| `dossier-conception/Dossier-conception-livresgourmands.pdf` | Dossier de conception (modèle Bonnevaux) : cahier des charges, arborescence, parcours, wireframes desktop et mobile, planche de tendance, charte graphique, justifications UX/UI, maquettes, mockup |
| `dossier-conception/dossier.html` | Source modifiable du dossier (l'ouvrir dans Chrome puis Imprimer → Enregistrer en PDF, marges : aucune, graphiques d'arrière-plan cochés) |
| `dossier-conception/captures/` | Captures du site (desktop et mobile), réutilisables dans Adobe XD |
| `figma/svg/` | 32 wireframes SVG (desktop + mobile) à glisser dans Figma, voir `figma/README.md` |
| `figma/prototype/` | 14 écrans haute fidélité du prototype Figma, avec zones cliquables |
| `GUIDE_FIGMA_XD.md` | Liste des frames et des liaisons du prototype |
| `SCRIPT_VIDEO.md` | Déroulé minute par minute de la vidéo de démonstration |
| `liens.txt` | Liens Figma, prototype, GitHub et vidéo, à mettre dans le ZIP |

## Créer le ZIP pour Léa
Après avoir complété `liens.txt` :

```bash
cd livrables
zip -j Etape3-livresgourmands.zip liens.txt dossier-conception/Dossier-conception-livresgourmands.pdf
```

(Sous Windows : sélectionner les deux fichiers → clic droit → Compresser dans un fichier ZIP.)
