-- Livresgourmands API - Schéma SQL complet

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('client','editeur','gestionnaire','administrateur') DEFAULT 'client',
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE ouvrages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(200) NOT NULL,
  auteur VARCHAR(100) NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  categorie_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

CREATE TABLE panier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  actif BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE panier_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  panier_id INT NOT NULL,
  ouvrage_id INT NOT NULL,
  quantite INT NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (panier_id) REFERENCES panier(id),
  FOREIGN KEY (ouvrage_id) REFERENCES ouvrages(id)
);

CREATE TABLE commandes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  statut ENUM('en_cours','payee','annulee','expediee') DEFAULT 'en_cours',
  adresse_livraison TEXT,
  mode_livraison VARCHAR(50),
  mode_paiement VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE commande_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commande_id INT NOT NULL,
  ouvrage_id INT NOT NULL,
  quantite INT NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (commande_id) REFERENCES commandes(id),
  FOREIGN KEY (ouvrage_id) REFERENCES ouvrages(id)
);

CREATE TABLE listes_cadeaux (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  proprietaire_id INT NOT NULL,
  code_partage VARCHAR(50) UNIQUE,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proprietaire_id) REFERENCES users(id)
);

CREATE TABLE liste_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  liste_id INT NOT NULL,
  ouvrage_id INT NOT NULL,
  quantite_souhaitee INT DEFAULT 1,
  FOREIGN KEY (liste_id) REFERENCES listes_cadeaux(id),
  FOREIGN KEY (ouvrage_id) REFERENCES ouvrages(id)
);

CREATE TABLE avis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  ouvrage_id INT NOT NULL,
  note INT CHECK(note >= 1 AND note <= 5),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_avis (client_id, ouvrage_id),
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (ouvrage_id) REFERENCES ouvrages(id)
);

CREATE TABLE commentaires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  ouvrage_id INT NOT NULL,
  contenu TEXT NOT NULL,
  valide BOOLEAN DEFAULT false,
  date_soumission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_validation DATETIME,
  valide_par INT,
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (ouvrage_id) REFERENCES ouvrages(id),
  FOREIGN KEY (valide_par) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_ouvrage_stock ON ouvrages(stock);
CREATE INDEX idx_ouvrage_categorie ON ouvrages(categorie_id);
CREATE INDEX idx_commande_client ON commandes(client_id);
CREATE INDEX idx_commentaire_valide ON commentaires(valide);
