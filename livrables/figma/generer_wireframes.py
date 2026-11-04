"""Génère les wireframes (basse fidélité) de livresgourmands.net en SVG, importables dans Figma.

Usage : python3 generer_wireframes.py   -> crée les fichiers dans ./svg/
Chaque SVG devient, une fois glissé dans Figma, un frame avec des rectangles et des textes modifiables.
"""
import os
import re
from html import escape

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'svg')

# ---------- Petit moteur de mise en page ----------
STYLES = {
    'box':  dict(fill='#EEEEEE', stroke='#9E9E9E', dash='6 4', color='#424242'),
    'nav':  dict(fill='#D6D6D6', stroke='#757575', dash='', color='#212121'),
    'cta':  dict(fill='#555555', stroke='#555555', dash='', color='#FFFFFF'),
    'btn2': dict(fill='#FFFFFF', stroke='#555555', dash='', color='#212121'),
    'img':  dict(fill='#DDDDDD', stroke='#9E9E9E', dash='', color='#616161'),
    'text': dict(fill='none', stroke='none', dash='', color='#212121'),
    'line': dict(fill='#BDBDBD', stroke='none', dash='', color='#212121'),
}


class B:
    """Bloc rectangulaire avec un libellé."""
    def __init__(self, label='', h=48, kind='box', size=None, bold=False, align='middle'):
        self.label, self.h, self.kind, self.size, self.bold, self.align = sans_emoji(label), h, kind, size, bold, align

    def height(self, w):
        return self.h

    def render(self, x, y, w, ctx):
        st = STYLES[self.kind]
        out = []
        if self.kind == 'line':
            return [f'<rect x="{x}" y="{y}" width="{w}" height="{self.h}" rx="2" fill="{st["fill"]}"/>']
        if self.kind != 'text':
            dash = f' stroke-dasharray="{st["dash"]}"' if st['dash'] else ''
            r = 6 if self.kind in ('cta', 'btn2') else 4
            out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{self.h}" rx="{r}" fill="{st["fill"]}" stroke="{st["stroke"]}" stroke-width="1.5"{dash}/>')
        if self.kind == 'img':
            out.append(f'<line x1="{x}" y1="{y}" x2="{x+w}" y2="{y+self.h}" stroke="#BDBDBD"/>')
            out.append(f'<line x1="{x+w}" y1="{y}" x2="{x}" y2="{y+self.h}" stroke="#BDBDBD"/>')
        if self.label:
            size = self.size or ctx['font']
            lines = wrap(self.label, max(4, int((w - 12) / (size * 0.55))))
            lh = size * 1.25
            ty = y + self.h / 2 - (len(lines) - 1) * lh / 2 + size * 0.35
            if self.align == 'start':
                tx, anchor = x + 10, 'start'
            else:
                tx, anchor = x + w / 2, 'middle'
            weight = ' font-weight="700"' if (self.bold or self.kind == 'cta') else ''
            for i, l in enumerate(lines):
                out.append(f'<text x="{tx:.1f}" y="{ty + i*lh:.1f}" font-family="Inter, Arial, sans-serif" font-size="{size}"{weight} fill="{st["color"]}" text-anchor="{anchor}">{escape(l)}</text>')
        return out


class Row:
    def __init__(self, items, gap=16):
        self.items = [(1, it) if not isinstance(it, tuple) else it for it in items]
        self.gap = gap

    def widths(self, w):
        tot = sum(f for f, _ in self.items)
        free = w - self.gap * (len(self.items) - 1)
        return [free * f / tot for f, _ in self.items]

    def height(self, w):
        return max(it.height(cw) for (f, it), cw in zip(self.items, self.widths(w)))

    def render(self, x, y, w, ctx):
        out, cx = [], x
        for (f, it), cw in zip(self.items, self.widths(w)):
            out += it.render(cx, y, cw, ctx)
            cx += cw + self.gap
        return out


class Col:
    def __init__(self, items, gap=12):
        self.items, self.gap = items, gap

    def height(self, w):
        return sum(it.height(w) for it in self.items) + self.gap * max(0, len(self.items) - 1)

    def render(self, x, y, w, ctx):
        out, cy = [], y
        for it in self.items:
            out += it.render(x, cy, w, ctx)
            cy += it.height(w) + self.gap
        return out


class Space:
    def __init__(self, h=0):
        self.h = h

    def height(self, w):
        return self.h

    def render(self, x, y, w, ctx):
        return []


EMOJI = re.compile('[\U0001F000-\U0001FAFF\u26A0\uFE0F]')


def sans_emoji(t):
    # Wireframe = niveaux de gris : on retire les emojis en couleur (on garde ★ ✓ ✕ ☰ ▾ ✎…)
    return re.sub(r'\s{2,}', ' ', EMOJI.sub('', t)).strip()


def wrap(text, n):
    words, lines, cur = text.split(), [], ''
    for wd in words:
        if len(cur) + len(wd) + 1 > n and cur:
            lines.append(cur)
            cur = wd
        else:
            cur = (cur + ' ' + wd).strip()
    lines.append(cur)
    return lines


# ---------- Composants réutilisables ----------
def carte_livre(imgh=200, mobile=False):
    return Col([
        B('Couverture', imgh, 'img'),
        B('CATÉGORIE', 14, 'text', size=11, align='start'),
        B('Titre du livre', 18, 'text', bold=True, align='start'),
        B('Auteur · ★★★★☆', 16, 'text', size=12, align='start'),
        Row([(1, B('29,95 $', 22, 'text', bold=True, align='start')), (1, B('En stock', 22, 'btn2', size=11))], gap=8),
        B('Ajouter au panier', 40 if mobile else 36, 'cta'),
    ], gap=6)


def grille(n, per, imgh=200, mobile=False):
    rows = []
    for i in range(0, n, per):
        rows.append(Row([carte_livre(imgh, mobile) for _ in range(per)], gap=16))
    return Col(rows, gap=16)


NAV_D = Row([(1.3, B('LOGO  Livres Gourmands', 44, 'nav', bold=True)),
             (3, B('Accueil   ·   Catégories ▾   ·   Listes de cadeaux', 44, 'nav')),
             (2, B('[ Titre ou auteur… ]  🔍', 44, 'box')),
             (1.4, B('🛍 Panier (2)  ·  👤 Compte', 44, 'nav'))], gap=10)
NAV_M = Row([(4, B('LOGO  Livres Gourmands', 44, 'nav', bold=True)), (1, B('☰', 44, 'nav'))], gap=8)
FOOT_D = Row([B('Livres Gourmands · présentation', 90, 'nav'), B('Boutique : catalogue, listes, panier', 90, 'nav'),
              B('Service client : livraison, paiement, contact', 90, 'nav')], gap=16)
FOOT_M = B('PIED DE PAGE : boutique · service client · ©', 90, 'nav')


def titre(t, mobile=False):
    return B(t, 44 if not mobile else 36, 'text', size=30 if not mobile else 24, bold=True, align='start')


# ---------- Écrans ----------
def ecrans():
    E = {}

    # 01 Accueil
    E['01-Accueil'] = (
        Col([NAV_D,
             B('CARROUSEL : titre « Cuisinez comme un chef » + accroche + bouton « Découvrir le catalogue »     [image livre]', 300, 'img'),
             Row([B('🚚 Livraison rapide', 90), B('🎁 Listes de cadeaux', 90), B('★ Avis vérifiés', 90), B('🔒 Paiement sécurisé', 90)]),
             Row([(3, titre('Nos livres de cuisine')), (1, B('10 livre(s) trouvé(s)', 44, 'text', size=13))]),
             Row([(1, B('Toutes', 34, 'cta', size=13)), (1.4, B('Cuisine française', 34, 'btn2', size=13)), (1.4, B('Cuisine italienne', 34, 'btn2', size=13)),
                  (1.2, B('Pâtisserie', 34, 'btn2', size=13)), (1.4, B('Cuisine du monde', 34, 'btn2', size=13)), (1.6, B('Cuisine végétarienne', 34, 'btn2', size=13)), (3, Space())], gap=8),
             Row([(3, B('Recherche : [ titre ou auteur ]', 64)), (2, B('Trier par : [ Nouveautés ▾ ]', 64)), (2, B('Prix max : ——●', 64)), (1.3, B('◯ En stock · Réinitialiser', 64))], gap=12),
             grille(8, 4), FOOT_D], gap=24),
        Col([NAV_M, B('CARROUSEL : titre + accroche + bouton', 260, 'img'),
             Row([B('🚚 Livraison', 80), B('🎁 Listes', 80)], gap=10), Row([B('★ Avis', 80), B('🔒 Paiement', 80)], gap=10),
             titre('Nos livres', True), B('Pastilles catégories (défilement horizontal) ⇢', 36),
             B('Filtres empilés : recherche, tri, prix max, en stock', 150),
             grille(2, 1, 300, True), FOOT_M], gap=16))

    # 02 Catalogue filtré
    E['02-Catalogue-filtre'] = (
        Col([NAV_D, titre('Catalogue'),
             Row([(3, B('Tous nos livres', 30, 'text', bold=True, align='start')), (1, B('2 livre(s) trouvé(s)', 30, 'text', size=13))]),
             Row([(1, B('Toutes', 34, 'btn2', size=13)), (1.2, B('Pâtisserie', 34, 'cta', size=13)), (8, Space())], gap=8),
             B('Filtres : recherche · tri · prix max · en stock', 64),
             Row([carte_livre(), carte_livre(), Space(), Space()]), FOOT_D], gap=24),
        Col([NAV_M, titre('Catalogue', True), B('[Toutes] [Pâtisserie ●] ⇢', 36), B('Filtres', 120),
             grille(2, 1, 300, True), FOOT_M], gap=16))

    # 03 Fiche produit
    infos_d = Col([Row([(1, B('Catégorie', 26, 'btn2', size=12)), (5, Space())]), titre('Titre du livre (H1)'), B('par Auteur', 24, 'text', align='start'),
                   B('★★★★☆  ·  3 avis', 22, 'text', size=13, align='start'), B('25,50 $', 48, 'text', size=36, bold=True, align='start'),
                   Row([(1, B('✓ En stock', 28, 'btn2', size=12)), (4, Space())]),
                   Row([(1.2, B('[ − ]  1  [ + ]', 50)), (2, B('Ajouter au panier', 50, 'cta')), (1.6, B('🎁 Liste de cadeaux ▾', 50, 'btn2')), (1, Space())], gap=12),
                   B('Description', 26, 'text', bold=True, align='start'), B('Texte de description du livre sur plusieurs lignes…', 80, 'box'),
                   B('ISBN · Catégorie', 40, 'box')], gap=12)
    E['03-Fiche-produit'] = (
        Col([NAV_D, B('Accueil  ›  Catégorie  ›  Titre du livre', 24, 'text', size=13, align='start'),
             Row([(1, B('COUVERTURE (2:3)', 520, 'img')), (2, infos_d)], gap=40),
             Row([B('AVIS DES LECTEURS : liste (nom, date, étoiles) + formulaire « Votre note » (clients)', 220),
                  B('COMMENTAIRES : liste des commentaires validés + champ « Laisser un commentaire »', 220)], gap=24),
             FOOT_D], gap=24),
        Col([NAV_M, B('Accueil › Catégorie › Titre', 20, 'text', size=12, align='start'), B('COUVERTURE', 420, 'img'),
             B('Catégorie', 26, 'btn2', size=12), titre('Titre du livre', True), B('par Auteur · ★★★★☆', 22, 'text', size=13, align='start'),
             B('25,50 $', 40, 'text', size=28, bold=True, align='start'), B('✓ En stock', 26, 'btn2', size=12),
             Row([(1, B('[−] 1 [+]', 50)), (1.6, B('Ajouter au panier', 50, 'cta'))], gap=10),
             B('Description', 100), B('Avis des lecteurs', 140), B('Commentaires', 140), FOOT_M], gap=14))

    # 04 Fiche produit épuisé
    infos_ep = Col([Row([(1, B('Catégorie', 26, 'btn2', size=12)), (5, Space())]), titre('Pâtisserie Pro'), B('par Julia Child', 24, 'text', align='start'),
                    B('45,99 $', 48, 'text', size=36, bold=True, align='start'), Row([(1, B('✕ Épuisé', 28, 'btn2', size=12)), (4, Space())]),
                    B('ⓘ Ce livre est actuellement épuisé. Revenez bientôt : nous réapprovisionnons régulièrement.', 60, 'box'),
                    B('Description', 120)], gap=12)
    E['04-Fiche-produit-epuise'] = (
        Col([NAV_D, B('Accueil › Pâtisserie › Pâtisserie Pro', 24, 'text', size=13, align='start'),
             Row([(1, B('COUVERTURE (grisée)', 520, 'img')), (2, infos_ep)], gap=40), FOOT_D], gap=24),
        Col([NAV_M, B('COUVERTURE (grisée)', 420, 'img'), titre('Pâtisserie Pro', True), B('45,99 $ · ✕ Épuisé', 30, 'text', bold=True, align='start'),
             B('ⓘ Ce livre est actuellement épuisé.', 70), B('Description', 100), FOOT_M], gap=14))

    # 05 Panier
    def ligne_panier(mobile=False):
        if mobile:
            return Row([(1, B('Img', 120, 'img')), (2.6, Col([B('Titre du livre', 20, 'text', bold=True, align='start'), B('Prix unitaire : 30,00 $', 18, 'text', size=12, align='start'),
                                                             B('[−] 2 [+]', 36), B('🗑 Retirer · 60,00 $', 20, 'text', size=12, align='start')], gap=6))], gap=10)
        return Row([(1, B('Img', 110, 'img')), (5, Col([B('Titre du livre', 22, 'text', bold=True, align='start'), B('Prix unitaire : 30,00 $', 20, 'text', size=13, align='start'),
                                                        Row([(1, B('[−] 2 [+]', 36)), (1, B('🗑 Retirer', 36, 'text', size=13)), (3, Space())], gap=10)], gap=8)),
                    (1, B('60,00 $', 110, 'text', bold=True))], gap=16)
    recap = Col([B('Récapitulatif', 26, 'text', bold=True, align='start'), B('Sous-total ............ 85,50 $', 24, 'text', align='start'),
                 B('Livraison ...... étape suivante', 24, 'text', align='start'), B('', 2, 'line'), B('TOTAL ............ 85,50 $', 30, 'text', bold=True, align='start'),
                 B('🔒 Passer la commande', 52, 'cta')], gap=10)
    E['05-Panier'] = (
        Col([NAV_D, titre('Mon panier (3 articles)'),
             Row([(2, Col([ligne_panier(), ligne_panier(), ligne_panier(), B('← Continuer mes achats', 24, 'text', size=13, align='start')], gap=12)),
                  (1, Col([B('', 0, 'text'), recap]))], gap=32), FOOT_D], gap=24),
        Col([NAV_M, titre('Mon panier', True), ligne_panier(True), ligne_panier(True), recap, FOOT_M], gap=16))

    # 06 Panier vide
    vide = lambda m: Col([Space(40), B('🛍 (icône)', 90, 'img'), titre('Votre panier est vide', m), B('Parcourez notre catalogue et laissez-vous tenter !', 24, 'text'),
                          Row([(1, Space()), (1, B('Voir le catalogue', 50, 'cta')), (1, Space())]), Space(40)], gap=16)
    E['06-Panier-vide'] = (Col([NAV_D, vide(False), FOOT_D], gap=24), Col([NAV_M, vide(True), FOOT_M], gap=16))

    # 07 Connexion
    form_cx = lambda m: Col([titre('Connexion', m), B('Courriel', 20, 'text', size=13, align='start'), B('', 46),
                             B('Mot de passe', 20, 'text', size=13, align='start'), B('', 46), B('Se connecter', 52, 'cta'),
                             B('Pas encore de compte ? Créer un compte  ·  Mot de passe oublié', 22, 'text', size=13),
                             B('Comptes de démonstration : [Client] [Administrateur] [Gestionnaire]', 70)], gap=10)
    E['07-Connexion'] = (Col([NAV_D, Row([(1, Space()), (1.2, form_cx(False)), (1, Space())]), FOOT_D], gap=40),
                         Col([NAV_M, form_cx(True), FOOT_M], gap=20))

    # 08 Inscription
    form_ins = lambda m: Col([titre('Créer un compte', m)] + sum([[B(l, 20, 'text', size=13, align='start'), B('', 46)] for l in
                             ['Nom complet', 'Courriel', 'Mot de passe (6 caractères minimum)', 'Confirmer le mot de passe']], []) +
                             [B('Créer mon compte', 52, 'cta'), B('Déjà inscrit ? Se connecter', 22, 'text', size=13)], gap=10)
    E['08-Inscription'] = (Col([NAV_D, Row([(1, Space()), (1.2, form_ins(False)), (1, Space())]), FOOT_D], gap=40),
                           Col([NAV_M, form_ins(True), FOOT_M], gap=20))

    # 09 Commande
    etapes = Col([B('① Adresse de livraison : [ adresse ]  [ ville ]  [ code postal A1A 1A1 ]', 130),
                  B('② Mode de livraison :  ◉ Standard (3-5 j) gratuite   ◯ Express (24-48 h)   ◯ Retrait en librairie', 130),
                  B('③ Mode de paiement :  ◉ Carte bancaire   ◯ PayPal   ·  🔒 paiement sécurisé', 110)], gap=16)
    recap_c = Col([B('Votre commande', 26, 'text', bold=True, align='start'), B('2 × Cuisine Facile ........ 51,00 $', 22, 'text', size=13, align='start'),
                   B('1 × Pâtes Parfaites ........ 30,00 $', 22, 'text', size=13, align='start'), B('', 2, 'line'),
                   B('TOTAL ........ 81,00 $', 30, 'text', bold=True, align='start'), B('Confirmer et payer', 52, 'cta'), B('Modifier mon panier', 22, 'text', size=13)], gap=10)
    E['09-Commande'] = (Col([NAV_D, titre('Finaliser ma commande'), Row([(2, etapes), (1, recap_c)], gap=32), FOOT_D], gap=24),
                        Col([NAV_M, titre('Finaliser ma commande', True), B('① Adresse : adresse · ville · code postal', 170),
                             B('② Livraison : 3 choix', 130), B('③ Paiement : carte / PayPal', 100), recap_c, FOOT_M], gap=16))

    # 10 Confirmation
    conf = lambda m: Col([Space(30), B('✓ (icône succès)', 90, 'img'), titre('Merci pour votre commande !', m),
                          B('Commande n° 2 pour un total de 81,00 $', 26, 'text'), B('Un courriel de confirmation vous sera envoyé.', 22, 'text', size=13),
                          Row([(0.5, Space()), (1, B('Mes commandes', 50, 'cta')), (1, B('Continuer mes achats', 50, 'btn2')), (0.5, Space())], gap=12), Space(30)], gap=16)
    E['10-Confirmation'] = (Col([NAV_D, conf(False), FOOT_D], gap=24), Col([NAV_M, conf(True), FOOT_M], gap=16))

    # 11 Liste de cadeaux : Ami
    item_l = lambda: Row([(1, B('Img', 100, 'img')), (4, Col([B('Titre du livre', 22, 'text', bold=True, align='start'), B('Souhaité : 1 · 34,90 $', 20, 'text', size=13, align='start'),
                                                          Row([(1, B('✓ En stock', 26, 'btn2', size=12)), (3, Space())])], gap=6)), (1.2, B('🎁 Offrir', 44, 'cta'))], gap=14)
    E['11-Liste-cadeaux-Ami'] = (
        Col([NAV_D, titre('Listes de cadeaux'), B('Offrez exactement ce qui fait plaisir : vos proches vous partagent leur code personnel.', 24, 'text', align='start'),
             B('Code personnel reçu par courriel', 20, 'text', size=13, align='start'),
             Row([(4, B('[ ef4392c3d7f70335 ]', 50)), (1, B('Voir la liste', 50, 'cta'))], gap=0),
             B('Mon anniversaire', 30, 'text', size=20, bold=True, align='start'), item_l(), item_l(), item_l(), FOOT_D], gap=16),
        Col([NAV_M, titre('Listes de cadeaux', True), B('[ code personnel ]', 50), B('Voir la liste', 50, 'cta'),
             B('Mon anniversaire', 26, 'text', bold=True, align='start'), item_l(), item_l(), FOOT_M], gap=14))

    # 12 Mes listes (Client)
    mes = Col([B('🎁 Mes listes', 26, 'text', bold=True, align='start'), B('Nouvelle liste', 20, 'text', size=13, align='start'),
               Row([(3, B('[ Mon anniversaire ]', 46)), (1, B('Créer', 46, 'btn2'))], gap=0),
               B('Ajoutez des livres depuis leur fiche (bouton « Liste de cadeaux »).', 20, 'text', size=12, align='start'),
               B('TABLEAU : Liste | Nb livres | Code (copier 📋)', 44, 'nav'), B('Mon anniversaire | 3 | ef4392c3… 📋', 40), B('Noël | 1 | a81b77e0… 📋', 40)], gap=10)
    E['12-Mes-listes-Client'] = (
        Col([NAV_D, titre('Listes de cadeaux'), Row([(1.4, B('🔑 ACCÉDER À UNE LISTE : [ code ] [Voir la liste] + livres', 330)), (1, mes)], gap=24), FOOT_D], gap=24),
        Col([NAV_M, titre('Listes de cadeaux', True), B('🔑 Accéder à une liste (code)', 100), mes, FOOT_M], gap=16))

    # Admin
    def admin_d(contenu, actif='Tableau de bord'):
        liens = ['Tableau de bord', 'Ouvrages', 'Commandes', 'Utilisateurs']
        menu = Col([B('LOGO  Administration', 50, 'nav', bold=True)] +
                   [B(l, 42, 'cta' if l == actif else 'nav', size=14) for l in liens] +
                   [Space(20), B('Voir la boutique', 42, 'nav', size=14)], gap=8)
        main = Col([Row([(5, Space()), (2, B('👤 Admin User (Administrateur)', 40, 'text', size=13)), (1, B('Déconnexion', 40, 'btn2', size=13))], gap=10)] + contenu, gap=20)
        h = max(main.height(960), 700)
        return Row([(1, Col([menu, B('', h - menu.height(240), 'nav')], gap=0)), (4, main)], gap=24)

    def admin_m(contenu):
        return Col([Row([(1, B('☰', 44, 'nav')), (3, B('Admin User', 44, 'text', size=13)), (2, B('Déconnexion', 44, 'btn2', size=13))], gap=8)] + contenu +
                   [B('Le menu s’ouvre en panneau latéral (offcanvas) au clic sur ☰', 50, 'nav', size=12)], gap=14)

    stats = lambda: Row([B('📖 Ouvrages au catalogue : 10', 80), B('⚠ Ouvrages épuisés : 2', 80), B('🧾 Commandes : 2', 80), B('💲 Chiffre d’affaires : 136,50 $', 80)], gap=16)
    E['13-Admin-Tableau-de-bord'] = (
        admin_d([titre('Tableau de bord'), stats(),
                 Row([(2, B('ALERTES DE STOCK : liste (titre + badge Épuisé / 3 restants) · lien « Gérer les ouvrages »', 260)),
                      (3, B('DERNIÈRES COMMANDES : tableau N° | Client | Date | Statut | Total · lien « Toutes les commandes »', 260))], gap=20)]),
        admin_m([titre('Tableau de bord', True), B('Ouvrages : 10', 70), B('Épuisés : 2', 70), B('Commandes : 2', 70), B('CA : 136,50 $', 70),
                 B('Alertes de stock', 160), B('Dernières commandes (défilement horizontal)', 180)]))

    tab_o = Col([B('Ouvrage | Catégorie | ISBN | Prix | Stock | Actions', 44, 'nav')] +
                [B('[img] Titre / auteur | Catégorie | ISBN-00X | 25,50 $ | 15 ✓ | ✎ 🗑', 56) for _ in range(6)], gap=4)
    E['14-Admin-Ouvrages'] = (
        admin_d([Row([(3, titre('Ouvrages')), (1, B('+ Ajouter un ouvrage', 46, 'cta'))]),
                 Row([(1, B('🔍 Rechercher (titre, auteur, ISBN)', 44)), (1.5, Space())]), tab_o], 'Ouvrages'),
        admin_m([titre('Ouvrages', True), B('+ Ajouter un ouvrage', 48, 'cta'), B('🔍 Rechercher', 44),
                 B('Tableau (défilement horizontal) : ouvrage, prix, stock, ✎ 🗑', 380)]))

    modal = Col([Row([(5, B('Modifier « Risotto & Co »', 30, 'text', size=20, bold=True, align='start')), (1, B('✕', 30, 'text'))]), B('', 2, 'line'),
                 Row([(2, B('Titre *  [                    ]', 56)), (1, B('ISBN *  [ ISBN-005 ] (non modifiable)', 56))]),
                 Row([B('Auteur *  [            ]', 56), B('Catégorie *  [ Choisir… ▾ ]', 56)]),
                 Row([B('Prix ($) *  [ 27,00 ]', 56), B('Stock *  [ 5 ]', 56), (2, B('Image (URL)  [ /images/… ]', 56))]),
                 B('Description  [ zone de texte ]', 110), B('', 2, 'line'),
                 Row([(3, Space()), (1, B('Annuler', 46, 'btn2')), (1, B('Enregistrer', 46, 'cta'))], gap=12)], gap=14)
    E['15-Admin-Formulaire-ouvrage'] = (
        admin_d([B('(Page Ouvrages assombrie en arrière-plan)', 30, 'text', size=13), Row([(0.3, Space()), (3, modal), (0.3, Space())])], 'Ouvrages'),
        admin_m([B('(Fenêtre modale plein écran)', 24, 'text', size=12), Col([B('Modifier « Risotto & Co »', 30, 'text', size=18, bold=True, align='start'),
                 B('Titre *', 52), B('ISBN * (non modifiable)', 52), B('Auteur *', 52), B('Catégorie * ▾', 52), B('Prix · Stock', 52), B('Image (URL)', 52),
                 B('Description', 100), Row([B('Annuler', 46, 'btn2'), B('Enregistrer', 46, 'cta')], gap=10)], gap=10)]))

    tab_c = Col([B('N° | Date | Client | Articles | Livraison / paiement | Total | Statut', 44, 'nav')] +
                [B('#2 | 4 nov. 2026 | Client Test | 3 | standard / carte | 81,00 $ | [En cours ▾]', 56) for _ in range(4)], gap=4)
    E['16-Admin-Commandes'] = (
        admin_d([Row([(3, titre('Commandes')), (1, B('Tous les statuts ▾', 44))]), tab_c], 'Commandes'),
        admin_m([titre('Commandes', True), B('Tous les statuts ▾', 44), B('Tableau (défilement horizontal) avec liste déroulante de statut par commande', 380)]))
    return E


def frame_svg(name, layout, width, mobile):
    pad = 16 if mobile else 40
    ctx = {'font': 13 if mobile else 15}
    inner_w = width - 2 * pad
    h = layout.height(inner_w) + 2 * pad
    body = layout.render(pad, pad, inner_w, ctx)
    titre_frame = escape(name)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{int(h)}" viewBox="0 0 {width} {int(h)}">\n'
            f'<title>{titre_frame}</title>\n<rect width="{width}" height="{int(h)}" fill="#FFFFFF"/>\n' + '\n'.join(body) + '\n</svg>\n'), h


def main():
    os.makedirs(OUT, exist_ok=True)
    E = ecrans()
    for key, (desk, mob) in E.items():
        for suffix, lay, w, m in (('Desktop', desk, 1280, False), ('Mobile', mob, 390, True)):
            name = f'{key}-{suffix}'
            svg, h = frame_svg(name, lay, w, m)
            open(os.path.join(OUT, f'{name}.svg'), 'w', encoding='utf-8').write(svg)
    print(f'{len(E) * 2} wireframes générés dans {OUT}')


if __name__ == '__main__':
    main()
