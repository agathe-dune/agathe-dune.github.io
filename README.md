# Portfolio Agathe Dune

Site one-page statique (HTML, CSS, JS, sans étape de build), prévu pour GitHub Pages.

```
index.html        toutes les sections (repères <!-- ===== SECTION : … ===== -->)
css/style.css     couleurs et typo en haut, puis une partie par section
js/main.js        fiches projet, lightbox, animations, chargement de la 3D
fonts/            Familjen Grotesk woff2 (licence OFL)
models/           modèles .glb Blockbench
img/<catégorie>/  large/ (2000 px max) et thumb/ (600 px)
img/lineart/      dessins au trait de l'accueil et du pied de page (fond transparent)
cv.pdf            CV téléchargeable
```

Tester en local : `python -m http.server 8000`, puis ouvrir http://localhost:8000.
Ouvrir `index.html` en double-cliquant ne suffit pas pour la 3D : le navigateur bloque le chargement du modèle hors serveur.

## Règles de style

- Nom affiché : Agathe Dune.
- Pas de tiret quadratin (—) ni demi-cadratin (–).
- Pas de texte en capitales, sauf le nom géant de l'accueil et les initiales du pied de page.
- Texte courant 18 px, métadonnées 14 px minimum.

## Ajouter un projet 3D

1. Exporte les images en **WebP** (large : 2000 px max, qualité ~82 ; thumb : 600 px, qualité ~75), par exemple avec [Squoosh](https://squoosh.app). Range-les dans `img/3d/large/` et `img/3d/thumb/`.
2. Dans la section 3D (`<div class="cards">`), copie un bloc `<article class="card">` complet et adapte :
   - `data-project`, `href="#projet-…"`, `data-sheet="…"` et `id="sheet-…"` : le même identifiant court partout ;
   - l'image de la carte, le titre et la ligne d'infos ;
   - dans le `<template>` : titre, texte, infos (`<dl>`) et les étapes du process (`<ol class="process">`, une `<li>` par image).
3. La carte ouvre automatiquement la fiche, et le lien « Projet suivant » se met à jour tout seul.

### Ajouter un modèle 3D interactif

1. Dans Blockbench : *File > Export > Export glTF Model*, format **.glb**, animations cochées. Mets le fichier dans `models/`.
2. Dans le `<template>` du projet, juste après `</header>`, ajoute :
   ```html
   <div class="feature__stage"><model-viewer src="models/mon-modele.glb" alt="Description" camera-controls auto-rotate autoplay interaction-prompt="none"></model-viewer></div>
   ```
   Les textures pixel art restent nettes automatiquement.

## Ajouter un dessin ou une photo

Dans la section concernée, copie un bloc `<figure class="piece">` (dessin) ou `<figure class="shot">` (photo) et change l'image, le texte alternatif (`alt`), la légende (`data-caption`) et le texte sous l'image. Le clic ouvre l'image en grand, avec navigation entre les œuvres de la section.

## Changer une couleur

Tout est en haut de `css/style.css`, dans `:root` :

| Variable | Rôle |
|---|---|
| `--bg` | fond de page |
| `--tile` | fond des vignettes |
| `--ink` | nom, titres |
| `--text`, `--muted` | texte courant, infos secondaires |
| `--line` | filets fins |
| `--olive`, `--on-olive` | bloc contact et son texte |
| `--accent` | lien Alternance et survols (à garder rare) |

Garde un contraste d'au moins 4,5:1 avec le fond pour les textes (https://webaim.org/resources/contrastchecker/).

## Mettre en ligne (GitHub Pages)

Sans Git, depuis le navigateur :

1. Crée un dépôt **public** sur GitHub. Nomme-le **`<pseudo>.github.io`** pour avoir l'adresse `https://<pseudo>.github.io`, ou donne-lui un autre nom (le site sera alors à `https://<pseudo>.github.io/<nom-du-dépôt>/`).
2. Dans le dépôt : *Add file > Upload files*, puis glisse **le contenu** de ce dossier (pas le dossier lui-même) : `index.html` doit être à la racine du dépôt. Valide avec *Commit changes*.
3. Le fichier `.nojekyll` est caché sous Windows : s'il n'a pas été envoyé, crée-le dans GitHub (*Add file > Create new file*, nom `.nojekyll`, contenu vide).
4. *Settings > Pages > Source : Deploy from a branch*, branche `main`, dossier `/ (root)`, *Save*.
5. Le site est en ligne après une à deux minutes. Vérifie-le sur ordinateur et téléphone.
6. L'aperçu de partage (LinkedIn, Discord…) pointe déjà vers `https://agathe-dune.github.io/og-image.jpg`. Si le site est publié à une autre adresse, change `og:url`, `og:image` et `canonical` en haut de `index.html`.

Avec Git :

```bash
git init -b main
git add .
git commit -m "Portfolio"
git remote add origin https://github.com/<pseudo>/<pseudo>.github.io.git
git push -u origin main
```

Puis les étapes 4 à 6 ci-dessus.

## Vie privée

Aucun cookie, aucun traceur, aucune analytics. Seule ressource externe : le script model-viewer (jsDelivr), chargé après l'affichage de la page.
