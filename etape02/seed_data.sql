-- Données de test

INSERT INTO categories (nom, description) VALUES
('Cuisine Française', 'Recettes françaises classiques'),
('Cuisine Italienne', 'Pâtes et risottos'),
('Pâtisserie', 'Gâteaux et desserts');

INSERT INTO ouvrages (titre, auteur, isbn, description, prix, stock, categorie_id) VALUES
('Cuisine Facile', 'Gordon Ramsay', 'ISBN-001', 'Les basiques', 25.50, 15, 1),
('Pâtes Parfaites', 'Mario Rossi', 'ISBN-002', 'Guide complet pâtes', 30.00, 8, 2),
('Pâtisserie Pro', 'Julia Child', 'ISBN-003', 'Desserts sophistiqués', 45.99, 0, 3);

INSERT INTO users (nom, email, password_hash, role) VALUES
('Admin User', 'admin@test.com', '$2a$10$...', 'administrateur'),
('Chef Test', 'chef@test.com', '$2a$10$...', 'gestionnaire'),
('Client Test', 'client@test.com', '$2a$10$...', 'client');
