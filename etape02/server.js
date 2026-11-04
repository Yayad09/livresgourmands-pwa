require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, param, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// CORS : autorise le front-end React (Vite, port 5173 par défaut)
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:5173';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONT_ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'livresgourmands',
  waitForConnections: true,
  connectionLimit: 10
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET manquant dans .env');
  process.exit(1);
}

// ---------- Middlewares ----------
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const roles = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ---------- Auth ----------
app.post('/api/auth/register',
  body('nom').isLength({ min: 1, max: 100 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate,
  async (req, res, next) => {
    try {
      const { nom, email, password } = req.body;
      const hash = await bcrypt.hash(password, 10);
      await pool.execute(
        'INSERT INTO users (nom, email, password_hash) VALUES (?, ?, ?)',
        [nom, email, hash]
      );
      res.status(201).json({ message: 'User created' });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email déjà utilisé' });
      next(e);
    }
  });

app.post('/api/auth/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, nom: user.nom, role: user.role } });
    } catch (e) { next(e); }
  });

app.get('/api/users/me', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, nom, email, role FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0] || null);
  } catch (e) { next(e); }
});

app.get('/api/users', auth, roles('administrateur'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, nom, email, role, actif FROM users');
    res.json(rows);
  } catch (e) { next(e); }
});

// ---------- Catégories ----------
app.get('/api/categories', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories');
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/api/categories', auth, roles('editeur', 'gestionnaire'),
  body('nom').isLength({ min: 1, max: 100 }), validate,
  async (req, res, next) => {
    try {
      const [r] = await pool.execute('INSERT INTO categories (nom, description) VALUES (?, ?)',
        [req.body.nom, req.body.description || null]);
      res.status(201).json({ id: r.insertId });
    } catch (e) { next(e); }
  });

// ---------- Ouvrages ----------
// Filtres optionnels : ?categorie=<id>  ?q=<texte>  ?disponible=1 (stock > 0 seulement)
// Les ouvrages épuisés sont renvoyés pour que le front affiche « Épuisé ».
app.get('/api/ouvrages', async (req, res, next) => {
  try {
    const where = [];
    const params = [];
    if (req.query.categorie) { where.push('o.categorie_id = ?'); params.push(Number(req.query.categorie)); }
    if (req.query.q) {
      where.push('(o.titre LIKE ? OR o.auteur LIKE ?)');
      params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }
    if (req.query.disponible === '1') where.push('o.stock > 0');
    const [rows] = await pool.execute(
      `SELECT o.*, c.nom AS categorie,
              (SELECT ROUND(AVG(a.note), 1) FROM avis a WHERE a.ouvrage_id = o.id) AS note_moyenne
       FROM ouvrages o JOIN categories c ON c.id = o.categorie_id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY o.created_at DESC, o.id DESC`, params);
    res.json(rows);
  } catch (e) { next(e); }
});

app.get('/api/ouvrages/:id', param('id').isInt(), validate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT o.*, c.nom AS categorie FROM ouvrages o
       JOIN categories c ON c.id = o.categorie_id WHERE o.id = ?`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Ouvrage introuvable' });
    const [avis] = await pool.execute(
      `SELECT a.note, a.date, u.nom AS client FROM avis a
       JOIN users u ON u.id = a.client_id WHERE a.ouvrage_id = ? ORDER BY a.date DESC`, [req.params.id]);
    const [commentaires] = await pool.execute(
      `SELECT cm.id, cm.contenu, cm.date_soumission, u.nom AS client FROM commentaires cm
       JOIN users u ON u.id = cm.client_id
       WHERE cm.ouvrage_id = ? AND cm.valide = true ORDER BY cm.date_soumission DESC`, [req.params.id]);
    res.json({ ...rows[0], avis, commentaires });
  } catch (e) { next(e); }
});

app.post('/api/ouvrages', auth, roles('gestionnaire', 'editeur', 'administrateur'),
  body('titre').notEmpty(),
  body('auteur').notEmpty(),
  body('isbn').notEmpty(),
  body('prix').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('categorie_id').isInt(),
  validate,
  async (req, res, next) => {
    try {
      const { titre, auteur, isbn, description, prix, stock, categorie_id, image } = req.body;
      const [r] = await pool.execute(
        'INSERT INTO ouvrages (titre, auteur, isbn, description, prix, stock, categorie_id, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [titre, auteur, isbn, description || null, prix, stock, categorie_id, image || null]);
      res.status(201).json({ id: r.insertId });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'ISBN déjà existant' });
      next(e);
    }
  });

app.put('/api/ouvrages/:id', auth, roles('gestionnaire', 'editeur', 'administrateur'),
  param('id').isInt(),
  body('prix').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('categorie_id').optional().isInt(),
  validate,
  async (req, res, next) => {
    try {
      const { titre, auteur, prix, stock, description, categorie_id, image } = req.body;
      const [r] = await pool.execute(
        `UPDATE ouvrages SET titre = COALESCE(?, titre), auteur = COALESCE(?, auteur),
           prix = COALESCE(?, prix), stock = COALESCE(?, stock), description = COALESCE(?, description),
           categorie_id = COALESCE(?, categorie_id), image = COALESCE(?, image)
         WHERE id = ?`,
        [titre ?? null, auteur ?? null, prix ?? null, stock ?? null, description ?? null,
          categorie_id ?? null, image ?? null, req.params.id]);
      if (!r.affectedRows) return res.status(404).json({ error: 'Ouvrage introuvable' });
      res.json({ message: 'Ouvrage mis à jour' });
    } catch (e) { next(e); }
  });

app.delete('/api/ouvrages/:id', auth, roles('gestionnaire', 'administrateur'), param('id').isInt(), validate,
  async (req, res, next) => {
    try {
      const [r] = await pool.execute('DELETE FROM ouvrages WHERE id = ?', [req.params.id]);
      if (!r.affectedRows) return res.status(404).json({ error: 'Ouvrage introuvable' });
      res.json({ message: 'Ouvrage supprimé' });
    } catch (e) {
      if (e.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: 'Ouvrage lié à des commandes : mettez plutôt son stock à 0' });
      }
      next(e);
    }
  });

// ---------- Panier ----------
async function getOrCreatePanier(clientId, conn = pool) {
  const [rows] = await conn.execute('SELECT id FROM panier WHERE client_id = ? AND actif = true', [clientId]);
  if (rows[0]) return rows[0].id;
  const [r] = await conn.execute('INSERT INTO panier (client_id) VALUES (?)', [clientId]);
  return r.insertId;
}

app.get('/api/panier', auth, roles('client'), async (req, res, next) => {
  try {
    const panierId = await getOrCreatePanier(req.user.id);
    const [rows] = await pool.execute(`
      SELECT pi.id, pi.ouvrage_id, pi.quantite, pi.prix_unitaire, o.titre, o.stock, o.image
      FROM panier_items pi JOIN ouvrages o ON o.id = pi.ouvrage_id
      WHERE pi.panier_id = ?`, [panierId]);
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/api/panier/items', auth, roles('client'),
  body('ouvrage_id').isInt(),
  body('quantite').isInt({ min: 1 }),
  validate,
  async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [ouv] = await conn.execute('SELECT prix, stock FROM ouvrages WHERE id = ? FOR UPDATE', [req.body.ouvrage_id]);
      if (!ouv[0]) { await conn.rollback(); return res.status(404).json({ error: 'Ouvrage introuvable' }); }
      if (ouv[0].stock < req.body.quantite) {
        await conn.rollback();
        return res.status(400).json({ error: 'Stock insuffisant' });
      }
      const panierId = await getOrCreatePanier(req.user.id, conn);
      // Si l'ouvrage est déjà dans le panier, on cumule la quantité
      const [exist] = await conn.execute(
        'SELECT id, quantite FROM panier_items WHERE panier_id = ? AND ouvrage_id = ?',
        [panierId, req.body.ouvrage_id]);
      if (exist[0]) {
        if (ouv[0].stock < exist[0].quantite + req.body.quantite) {
          await conn.rollback();
          return res.status(400).json({ error: 'Stock insuffisant' });
        }
        await conn.execute('UPDATE panier_items SET quantite = quantite + ? WHERE id = ?',
          [req.body.quantite, exist[0].id]);
      } else {
        await conn.execute(
          'INSERT INTO panier_items (panier_id, ouvrage_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
          [panierId, req.body.ouvrage_id, req.body.quantite, ouv[0].prix]);
      }
      await conn.commit();
      res.status(201).json({ message: 'Article ajouté' });
    } catch (e) {
      await conn.rollback();
      next(e);
    } finally {
      conn.release();
    }
  });

app.put('/api/panier/items/:id', auth, roles('client'),
  param('id').isInt(),
  body('quantite').isInt({ min: 1 }),
  validate,
  async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        `SELECT pi.id, o.stock FROM panier_items pi
         JOIN panier p ON p.id = pi.panier_id JOIN ouvrages o ON o.id = pi.ouvrage_id
         WHERE pi.id = ? AND p.client_id = ?`, [req.params.id, req.user.id]);
      if (!rows[0]) return res.status(404).json({ error: 'Article introuvable' });
      if (rows[0].stock < req.body.quantite) return res.status(400).json({ error: 'Stock insuffisant' });
      await pool.execute('UPDATE panier_items SET quantite = ? WHERE id = ?', [req.body.quantite, req.params.id]);
      res.json({ message: 'Quantité mise à jour' });
    } catch (e) { next(e); }
  });

app.delete('/api/panier/items/:id', auth, roles('client'), param('id').isInt(), validate,
  async (req, res, next) => {
    try {
      await pool.execute(
        `DELETE pi FROM panier_items pi JOIN panier p ON p.id = pi.panier_id
         WHERE pi.id = ? AND p.client_id = ?`, [req.params.id, req.user.id]);
      res.json({ message: 'Article retiré' });
    } catch (e) { next(e); }
  });

// ---------- Commandes ----------
app.post('/api/commandes', auth, roles('client'),
  body('adresse_livraison').notEmpty(),
  validate,
  async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [pan] = await conn.execute('SELECT id FROM panier WHERE client_id = ? AND actif = true FOR UPDATE', [req.user.id]);
      if (!pan[0]) { await conn.rollback(); return res.status(400).json({ error: 'Panier vide' }); }
      const panierId = pan[0].id;

      const [items] = await conn.execute(
        'SELECT ouvrage_id, quantite, prix_unitaire FROM panier_items WHERE panier_id = ?', [panierId]);
      if (!items.length) { await conn.rollback(); return res.status(400).json({ error: 'Panier vide' }); }

      let total = 0;
      for (const it of items) {
        const [s] = await conn.execute('SELECT stock FROM ouvrages WHERE id = ? FOR UPDATE', [it.ouvrage_id]);
        if (s[0].stock < it.quantite) {
          await conn.rollback();
          return res.status(400).json({ error: `Stock insuffisant pour l'ouvrage ${it.ouvrage_id}` });
        }
        total += it.quantite * it.prix_unitaire;
      }

      const [cmd] = await conn.execute(
        `INSERT INTO commandes (client_id, total, adresse_livraison, mode_livraison, mode_paiement, statut)
         VALUES (?, ?, ?, ?, ?, 'en_cours')`,
        [req.user.id, total, req.body.adresse_livraison, req.body.mode_livraison || null, req.body.mode_paiement || null]);

      for (const it of items) {
        await conn.execute(
          'INSERT INTO commande_items (commande_id, ouvrage_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
          [cmd.insertId, it.ouvrage_id, it.quantite, it.prix_unitaire]);
        await conn.execute('UPDATE ouvrages SET stock = stock - ? WHERE id = ?', [it.quantite, it.ouvrage_id]);
      }

      await conn.execute('UPDATE panier SET actif = false WHERE id = ?', [panierId]);
      await conn.commit();
      res.status(201).json({ commande_id: cmd.insertId, total });
    } catch (e) {
      await conn.rollback();
      next(e);
    } finally {
      conn.release();
    }
  });

app.get('/api/commandes', auth, roles('client'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM commandes WHERE client_id = ? ORDER BY date DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

// Toutes les commandes (dashboard administrateur / gestionnaire)
app.get('/api/admin/commandes', auth, roles('administrateur', 'gestionnaire'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, u.nom AS client, u.email,
              (SELECT SUM(ci.quantite) FROM commande_items ci WHERE ci.commande_id = c.id) AS nb_articles
       FROM commandes c JOIN users u ON u.id = c.client_id ORDER BY c.date DESC`);
    res.json(rows);
  } catch (e) { next(e); }
});

app.get('/api/commandes/:id', auth, param('id').isInt(), validate, async (req, res, next) => {
  try {
    const admin = ['administrateur', 'gestionnaire'].includes(req.user.role);
    const [rows] = await pool.execute(
      'SELECT * FROM commandes WHERE id = ? AND (client_id = ? OR ? = 1)',
      [req.params.id, req.user.id, admin ? 1 : 0]);
    if (!rows[0]) return res.status(404).json({ error: 'Commande introuvable' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.put('/api/commandes/:id/status', auth, roles('administrateur', 'gestionnaire'),
  param('id').isInt(),
  body('statut').isIn(['en_cours', 'payee', 'annulee', 'expediee']),
  validate,
  async (req, res, next) => {
    try {
      await pool.execute('UPDATE commandes SET statut = ? WHERE id = ?', [req.body.statut, req.params.id]);
      res.json({ message: 'Statut mis à jour' });
    } catch (e) { next(e); }
  });

// ---------- Listes de cadeaux ----------
app.post('/api/listes', auth, roles('client'), body('nom').notEmpty(), validate,
  async (req, res, next) => {
    try {
      const code = require('crypto').randomBytes(8).toString('hex');
      const [r] = await pool.execute(
        'INSERT INTO listes_cadeaux (nom, proprietaire_id, code_partage) VALUES (?, ?, ?)',
        [req.body.nom, req.user.id, code]);
      res.status(201).json({ id: r.insertId, code_partage: code });
    } catch (e) { next(e); }
  });

// Listes du client connecté
app.get('/api/listes', auth, roles('client'), async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT l.id, l.nom, l.code_partage, l.date_creation,
              (SELECT COUNT(*) FROM liste_items li WHERE li.liste_id = l.id) AS nb_items
       FROM listes_cadeaux l WHERE l.proprietaire_id = ? ORDER BY l.date_creation DESC`, [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/api/listes/:id/items', auth, roles('client'),
  param('id').isInt(),
  body('ouvrage_id').isInt(),
  body('quantite').optional().isInt({ min: 1 }),
  validate,
  async (req, res, next) => {
    try {
      const [l] = await pool.execute(
        'SELECT id FROM listes_cadeaux WHERE id = ? AND proprietaire_id = ?', [req.params.id, req.user.id]);
      if (!l[0]) return res.status(404).json({ error: 'Liste introuvable' });
      const [o] = await pool.execute('SELECT id FROM ouvrages WHERE id = ?', [req.body.ouvrage_id]);
      if (!o[0]) return res.status(404).json({ error: 'Ouvrage introuvable' });
      await pool.execute(
        'INSERT INTO liste_items (liste_id, ouvrage_id, quantite_souhaitee) VALUES (?, ?, ?)',
        [req.params.id, req.body.ouvrage_id, req.body.quantite || 1]);
      res.status(201).json({ message: 'Ouvrage ajouté à la liste' });
    } catch (e) { next(e); }
  });

app.get('/api/listes/:code', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, nom FROM listes_cadeaux WHERE code_partage = ?', [req.params.code]);
    if (!rows[0]) return res.status(404).json({ error: 'Liste introuvable' });
    const [items] = await pool.execute(
      `SELECT li.id, li.ouvrage_id, li.quantite_souhaitee, o.titre, o.prix, o.stock, o.image
       FROM liste_items li JOIN ouvrages o ON o.id = li.ouvrage_id WHERE li.liste_id = ?`, [rows[0].id]);
    res.json({ ...rows[0], items });
  } catch (e) { next(e); }
});

// ---------- Avis ----------
app.post('/api/ouvrages/:id/avis', auth, roles('client'),
  param('id').isInt(),
  body('note').isInt({ min: 1, max: 5 }),
  validate,
  async (req, res, next) => {
    try {
      const [achat] = await pool.execute(
        `SELECT ci.id FROM commande_items ci JOIN commandes c ON c.id = ci.commande_id
         WHERE ci.ouvrage_id = ? AND c.client_id = ? LIMIT 1`, [req.params.id, req.user.id]);
      if (!achat[0]) return res.status(403).json({ error: 'Achat requis pour laisser un avis' });
      await pool.execute('INSERT INTO avis (client_id, ouvrage_id, note) VALUES (?, ?, ?)',
        [req.user.id, req.params.id, req.body.note]);
      res.status(201).json({ message: 'Avis ajouté' });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Avis déjà laissé' });
      next(e);
    }
  });

// ---------- Commentaires ----------
app.post('/api/ouvrages/:id/commentaires', auth, roles('client'),
  param('id').isInt(),
  body('contenu').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      await pool.execute(
        'INSERT INTO commentaires (client_id, ouvrage_id, contenu, valide) VALUES (?, ?, ?, false)',
        [req.user.id, req.params.id, req.body.contenu]);
      res.status(201).json({ message: 'Commentaire soumis, en attente de validation' });
    } catch (e) { next(e); }
  });

app.put('/api/commentaires/:id/valider', auth, roles('editeur'),
  param('id').isInt(),
  body('valide').isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      await pool.execute(
        'UPDATE commentaires SET valide = ?, valide_par = ?, date_validation = NOW() WHERE id = ?',
        [req.body.valide, req.user.id, req.params.id]);
      res.json({ message: 'Commentaire mis à jour' });
    } catch (e) { next(e); }
  });

// ---------- Gestion d'erreurs centralisée ----------
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on :${PORT}`));
