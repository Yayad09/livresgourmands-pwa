const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'livresgourmands',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const roleMiddleware = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// AUTH
app.post('/api/auth/register', async (req, res) => {
  const { nom, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const conn = await pool.getConnection();
    await conn.execute('INSERT INTO users (nom, email, password_hash) VALUES (?, ?, ?)', 
      [nom, email, hashedPassword]);
    conn.release();
    res.json({ message: 'User created' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    conn.release();
    if (!rows.length) return res.status(401).json({ error: 'User not found' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, nom: user.nom, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// OUVRAGES
app.get('/api/ouvrages', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT * FROM ouvrages WHERE stock > 0');
    conn.release();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/ouvrages/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT * FROM ouvrages WHERE id = ?', [req.params.id]);
    conn.release();
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ouvrages', authMiddleware, roleMiddleware(['gestionnaire', 'editeur']), async (req, res) => {
  const { titre, auteur, isbn, description, prix, stock, categorie_id } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.execute(
      'INSERT INTO ouvrages (titre, auteur, isbn, description, prix, stock, categorie_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titre, auteur, isbn, description, prix, stock, categorie_id]
    );
    conn.release();
    res.json({ message: 'Ouvrage created' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/ouvrages/:id', authMiddleware, roleMiddleware(['gestionnaire']), async (req, res) => {
  const { titre, prix, stock } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.execute('UPDATE ouvrages SET titre = ?, prix = ?, stock = ? WHERE id = ?', 
      [titre, prix, stock, req.params.id]);
    conn.release();
    res.json({ message: 'Updated' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PANIER
app.get('/api/panier', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(`
      SELECT pi.*, o.titre, o.prix FROM panier_items pi
      JOIN panier p ON pi.panier_id = p.id
      JOIN ouvrages o ON pi.ouvrage_id = o.id
      WHERE p.client_id = ? AND p.actif = true
    `, [req.user.id]);
    conn.release();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/panier/items', authMiddleware, async (req, res) => {
  const { ouvrage_id, quantite } = req.body;
  try {
    const conn = await pool.getConnection();
    const [panier] = await conn.execute('SELECT id FROM panier WHERE client_id = ? AND actif = true', [req.user.id]);
    const panier_id = panier[0]?.id || (await conn.execute('INSERT INTO panier (client_id) VALUES (?)', [req.user.id]))[0].insertId;
    const [ouvrage] = await conn.execute('SELECT prix FROM ouvrages WHERE id = ?', [ouvrage_id]);
    await conn.execute('INSERT INTO panier_items (panier_id, ouvrage_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
      [panier_id, ouvrage_id, quantite, ouvrage[0].prix]);
    conn.release();
    res.json({ message: 'Item added' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// COMMANDES
app.post('/api/commandes', authMiddleware, async (req, res) => {
  const { adresse_livraison, mode_livraison, mode_paiement } = req.body;
  try {
    const conn = await pool.getConnection();
    const [panier] = await conn.execute('SELECT id FROM panier WHERE client_id = ? AND actif = true', [req.user.id]);
    if (!panier[0]) return res.status(400).json({ error: 'Empty cart' });
    
    const [items] = await conn.execute(`
      SELECT SUM(quantite * prix_unitaire) as total FROM panier_items WHERE panier_id = ?
    `, [panier[0].id]);
    
    const total = items[0].total;
    const [cmdResult] = await conn.execute(
      'INSERT INTO commandes (client_id, total, adresse_livraison, mode_livraison, mode_paiement) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, total, adresse_livraison, mode_livraison, mode_paiement]
    );
    
    const commande_id = cmdResult.insertId;
    const [panierItems] = await conn.execute('SELECT * FROM panier_items WHERE panier_id = ?', [panier[0].id]);
    
    for (const item of panierItems) {
      await conn.execute('INSERT INTO commande_items (commande_id, ouvrage_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
        [commande_id, item.ouvrage_id, item.quantite, item.prix_unitaire]);
      await conn.execute('UPDATE ouvrages SET stock = stock - ? WHERE id = ?', 
        [item.quantite, item.ouvrage_id]);
    }
    
    await conn.execute('UPDATE panier SET actif = false WHERE id = ?', [panier[0].id]);
    conn.release();
    res.json({ commande_id, total });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/commandes', authMiddleware, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT * FROM commandes WHERE client_id = ?', [req.user.id]);
    conn.release();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// COMMENTAIRES
app.post('/api/ouvrages/:id/commentaires', authMiddleware, async (req, res) => {
  const { contenu } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.execute('INSERT INTO commentaires (client_id, ouvrage_id, contenu) VALUES (?, ?, ?)',
      [req.user.id, req.params.id, contenu]);
    conn.release();
    res.json({ message: 'Comment submitted' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/commentaires/:id/valider', authMiddleware, roleMiddleware(['editeur']), async (req, res) => {
  const { valide } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.execute('UPDATE commentaires SET valide = ?, valide_par = ?, date_validation = NOW() WHERE id = ?',
      [valide, req.user.id, req.params.id]);
    conn.release();
    res.json({ message: 'Updated' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// AVIS
app.post('/api/ouvrages/:id/avis', authMiddleware, async (req, res) => {
  const { note } = req.body;
  try {
    const conn = await pool.getConnection();
    const [cmd] = await conn.execute('SELECT id FROM commande_items WHERE ouvrage_id = ? AND commande_id IN (SELECT id FROM commandes WHERE client_id = ?)',
      [req.params.id, req.user.id]);
    if (!cmd.length) return res.status(400).json({ error: 'Must purchase' });
    
    await conn.execute('INSERT INTO avis (client_id, ouvrage_id, note) VALUES (?, ?, ?)',
      [req.user.id, req.params.id, note]);
    conn.release();
    res.json({ message: 'Review added' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Server on :3000'));
