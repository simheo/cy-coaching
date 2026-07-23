# CY Coaching — Refonte visuelle du site (v2)

**Date:** 2026-07-23
**Statut:** Design validé — en attente de relecture avant plan d'implémentation

---

## 1. Contexte & objectif

CY Coaching est le site vitrine de **Yoann**, coach sportif à Toulouse (musculation /
recomposition corporelle, boxe pieds-poings, self-défense féminine, coaching en
entreprise). Le site actuel est un ensemble de pages HTML/CSS/JS statiques hébergées sur
GitHub Pages (domaine `www.cy-coaching.com`).

**Objectif de cette refonte : un rafraîchissement visuel uniquement.** Le contenu et le
périmètre fonctionnel restent globalement les mêmes ; on modernise l'identité visuelle, on
améliore l'architecture de l'information, et on assainit la base de code.

**Non-objectifs (pour cette itération)** — mais l'architecture technique doit les rendre
faciles à ajouter plus tard, sans réécriture :
- Réservation de séances en ligne
- Paiement de programmes en ligne (les « programmes à distance » à 40/80/120€/mois
  déjà présents dans les tarifs sont les candidats naturels)

---

## 2. Identité visuelle — Direction « Chaleureux & Naturel »

Traduit la personnalité de Yoann : bienveillant, souriant, à l'écoute, une pratique
centrée sur le plaisir et la progression.

**Palette**
| Rôle | Couleur |
|---|---|
| Accent principal (terracotta) | `#c76a43` (foncé `#a9552f`) |
| Accent clair (argile) | `#e6b98f` |
| Accent secondaire (olive) | `#7a8a5f` |
| Fond crème | `#f6ede1` / `#efe0cf` |
| Texte (encre chaude) | `#3a2e26` / doux `#5c4d42` |
| Fond page | `#fffdfa` |

**Typographie**
- Titres : **Fraunces** (serif humaniste, chaleureux) — poids 500/600
- Texte : **Nunito Sans** — 400/600/700

**Langage visuel** : angles arrondis (rayons 16–24px), ombres douces, espacements
généreux, photo-forward. Icônes : traits fins/ligne (remplacent les emojis des maquettes).

---

## 3. Stack technique

- **Astro** (site statique / sortie statique).
- **Composants réutilisables** — supprime la duplication actuelle de l'en-tête/pied/menu
  sur les 5 pages : `Header`, `Nav`, `Footer`, `Hero`, `SectionHead`, `ServiceCard`,
  `DisciplineTile`, `MethodItem`, `ReviewCard`, `TransformationCard`, `FaqItem`, `CtaBand`.
- **Optimisation des images** via `astro:assets` (essentiel pour un site riche en photos).
- **Contenu** : centralisé en collections de contenu / données (`transformations`,
  `faq`, textes des prestations) pour édition facile.
- **Déploiement** : GitHub Pages, sortie statique, conservation du `CNAME`
  `www.cy-coaching.com`.

**Chemin d'évolution (futur, hors périmètre)** : passage à un adaptateur SSR Astro +
routes API dans le même projet, hébergé sur Netlify/Vercel (GitHub Pages étant
statique uniquement), pour la réservation et le paiement. Aucune action maintenant.

---

## 4. Architecture de l'information

Structure retenue : **« Par prestation »** (disciplines traitées à égalité, meilleur SEO
local, page Entreprises dédiée).

```
Accueil
Prestations ▾
 ├─ Musculation & remise en forme
 ├─ Boxe pieds-poings
 └─ Self-défense (femmes)
Entreprises            (NOUVEAU — texte/illustration, sans photo pour l'instant)
Qui suis-je ?
Tarifs
Contact
```

- CTA persistant dans l'en-tête : **« Séance offerte »** (deviendra « Réserver » quand la
  réservation en ligne arrivera).
- Chaque page discipline peut se référencer sur ses propres requêtes locales
  (« cours de boxe Toulouse », « self-défense femme Toulouse »…).

---

## 5. Pages & sections

### 5.1 Accueil
1. **Hero plein cadre** — photo d'action, titre « Progresser avec le sourire »,
   sous-titre, 2 CTA (« Réserver ma séance offerte » / « Découvrir la méthode »),
   note de confiance (5,0 ★ · +15 avis).
2. **Mes spécialités** — 3 tuiles image (Musculation / Boxe / Self-défense) → pages.
3. **À qui je m'adresse** — 4 cartes (entreprises, remise en forme, aventureux, self-défense).
4. **Ma méthode** — photo + 4 points (science, +3000h de terrain, bonne humeur, multisport).
5. **Qui suis-je (aperçu)** — photo + court texte à la 1re personne + lien vers la page.
6. **Transformations** — grille de 6 cartes avant/après (voir §6).
7. **Avis** — 5 avis Google (voir §7).
8. **FAQ** — questions fréquentes (voir §8).
9. **Bandeau CTA** — photo + « Prêt à commencer ? » + séance offerte.
10. **Footer** — navigation, contact (tél, email, Instagram).

### 5.2 Pages disciplines (3)
Reprennent le contenu existant, mis en page dans le nouveau style :
- **Musculation & remise en forme** — assemblé depuis « Qui suis-je » (prise de masse,
  tonification) + accueil ; photos `coaching-individuel`, `coaching-groupe` ; 2-3
  transformations en vedette ; CTA.
- **Boxe pieds-poings** — copie existante (défoulement, stress, cardio, cours débutants) ;
  photos `boxe-*`.
- **Self-défense (femmes)** — copie existante (prévention / protection / détermination,
  mises en situation) ; photo `self-defense-coaching`.

### 5.3 Entreprises (nouveau)
Page **sans photo** pour l'instant — mise en page à base de blocs de couleur chaleureux
et d'icônes. Reprend l'angle « bien-être et cohésion des équipes, moins de stress et de
maux liés aux postures ». Structure : pitch, bénéfices, format d'intervention, CTA
« Discutons de vos besoins ». Zone photo réservée pour enrichissement ultérieur.

### 5.4 Qui suis-je ?
Copie existante : 2 Licences STAPS (Entraînement Sportif + Métiers de la Forme, Toulouse),
spécialités, « pourquoi choisir CY Coaching ». Photo `a-propos`. Ton chaleureux, à la
première personne.

### 5.5 Tarifs
Reprend les 3 blocs existants :
- Coaching individuel : 60€/séance · 550€ les 10 · 1000€ les 20 (+1 accessoire).
- Mini-groupe (2-5) : 35€ / 30€ / 25€ par personne selon le nombre.
- Programmes à distance : Découverte 40€/mois · Débutant 80€/mois · Confirmé 120€/mois.

*Note : les programmes à distance sont le futur point d'entrée du paiement en ligne — la
mise en page prévoit un emplacement clair pour un futur bouton « Souscrire ».*

### 5.6 Contact
- Texte d'intro (domicile ou salle, Toulouse et alentours) + coordonnées.
- Formulaire conservé via **Formspree** (endpoint existant `mbjenzqk`) — champs :
  nom, e-mail, téléphone, message.
- Photo `contact`.

---

## 6. Transformations (nouveau)

Source : 6 photos avant/après (`Transformations Physiques 6png/1..6.png`, 1080×1150).
Visages floutés (à conserver).

**Traitement** : le bandeau bleu/jaune d'origine est **recadré** (crop ~`1066×840+7+6`
via ffmpeg, retire cadre + badge), ne conservant que le couple de photos avant/après. Les
légendes sont **reconstruites en HTML/CSS** dans le style chaleureux :
- Titre résultat (Fraunces), fréquence en dessous (italique), petit tag catégorie terracotta.
- Puces « Avant » (encre) / « Après » (terracotta) en overlay.
- Badge olive « 60 ans » / « Danseur pro » recréé le cas échéant.

Les données (image, titre, fréquence, tag, badge) sont stockées comme collection de
contenu éditable. Convention : gauche = avant, droite = après (vrai pour les 6).

**Légendes** :
1. Perte de 8 kg en 1 an — 2 séances/sem — *60 ans* — Remise en forme
2. Perte de 7,3 kg en 3 mois — 3 séances/sem — Perte de poids
3. Recomposition corporelle — 4 mois — *60 ans* — Recomposition
4. Prise de 4 kg en 3 mois — 4 séances/sem — Prise de masse
5. Prise de 2 kg en 2 mois — Préparation physique — *Danseur pro* — Performance
6. +2,2 kg & +7 cm de fessiers — 4 séances/sem — Renforcement

**Emplacement** : section dédiée sur l'accueil (regroupée avec les avis) + 2-3 en vedette
sur la page Musculation.

**Réserve** : le trait central bleu (séparateur avant/après) reste faiblement visible car
incrusté dans les originaux. Acceptable ; des originaux sans bandeau permettraient un
recadrage encore plus net.

---

## 7. Avis Google (automatisés)

**Décision : API Google Places, côté client, 5 avis** rendus avec notre propre design de
carte (remplace le `reviews.json` maintenu manuellement).

- Limite officielle de l'API Places : **5 avis maximum** (non paginable) — jugé suffisant.
- Clé API Google Cloud **restreinte au domaine** (referrer). Le crédit mensuel gratuit
  couvre largement le trafic du site.
- Rappel CGU Google : le contenu des avis ne doit pas être stocké durablement → affichage
  à la volée.
- Fallback : si l'appel échoue, afficher un petit jeu d'avis statiques (les meilleurs
  actuels) pour ne jamais laisser la section vide.

*Évolution future : une fois un backend en place (réservation/paiement), récupération
côté serveur avec cache quotidien — supprime toute dépendance côté client.*

---

## 8. FAQ (nouveau)

Section sur l'accueil, ton chaleureux, bon pour le SEO. Contenu éditable (collection).
Questions initiales proposées (à valider/enrichir avec Yoann) :
- À domicile ou en salle ? Où exactement ?
- Faut-il du matériel / une condition physique préalable ?
- Comment se passe la première séance (offerte) ?
- À quelle fréquence s'entraîner pour des résultats ?
- Proposez-vous des séances en petit groupe / en entreprise ?
- Comment fonctionnent les programmes à distance ?

---

## 9. Intégrations conservées
- **Google Analytics** (gtag `G-TTRMH9G96E`).
- **Formspree** (formulaire de contact, endpoint `mbjenzqk`).
- **Instagram** `@cy.coaching`, téléphone `0608703251`, email `yoann.cycoaching@gmail.com`.
- **SEO** : meta descriptions par page (reprises/améliorées), `favicon`, textes alt,
  titres localisés « … à Toulouse ».

---

## 10. URLs & migration (SEO)

**Décision (figée) : on conserve à l'identique tous les slugs existants** pour préserver
l'équité SEO déjà acquise, et on ajoute des slugs descriptifs riches en mots-clés pour les
nouvelles pages. Raison : GitHub Pages ne gère pas les redirections 301 côté serveur
(seulement meta-refresh/JS, faibles pour le SEO) — changer un slug existant risquerait de
perdre son référencement.

| Page | Slug | Statut |
|---|---|---|
| Accueil | `/` | conservé |
| Boxe pieds-poings | `/boxe` | conservé |
| Qui suis-je ? | `/a-propos` | **conservé** (pas de renommage) |
| Tarifs | `/tarif` | conservé (singulier, tel quel) |
| Contact | `/contact` | conservé |
| Musculation & remise en forme | `/musculation` | nouveau |
| Self-défense (femmes) | `/self-defense` | nouveau |
| Entreprises | `/coaching-entreprise` | nouveau |

- Les nouvelles pages ne remplacent aucune URL existante → aucun risque de redirection.
- SEO on-page : titres/meta descriptions localisés (« … à Toulouse »), balises `alt`,
  données structurées (`LocalBusiness` / `Person`), `sitemap.xml`, texte de qualité par page.
- Conserver `CNAME`.
- Le nouveau projet Astro **remplace** le rendu du site actuel (mêmes URLs conservées).
- Risque contenu : pages Musculation/Entreprises plus légères → assumé, enrichissables.

---

## 11. Décisions ouvertes pour le plan d'implémentation
1. Stratégie repo/déploiement GitHub Pages (build Astro via GitHub Actions ; sort de l'ancien
   `cycoaching/.git` — garder en référence, déplacer, ou retirer le `.git` imbriqué).
2. Jeu final de questions/réponses FAQ (contenu de Yoann).
3. Bibliothèque d'icônes ligne à choisir.
