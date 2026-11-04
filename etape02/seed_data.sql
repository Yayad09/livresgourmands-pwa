-- Données de test
-- Tous les comptes de test ont le mot de passe : password123

INSERT INTO categories (nom, description) VALUES
('Cuisine Française', 'Recettes françaises classiques'),
('Cuisine Italienne', 'Pâtes et risottos'),
('Pâtisserie', 'Gâteaux et desserts'),
('Cuisine du monde', 'Saveurs d''Asie, d''Afrique et d''Amérique'),
('Cuisine végétarienne', 'Recettes sans viande, gourmandes et équilibrées');

INSERT INTO ouvrages (titre, auteur, isbn, description, prix, stock, categorie_id, image) VALUES
('Cuisine Facile', 'Gordon Ramsay', 'ISBN-001', 'Les basiques de la cuisine maison expliqués pas à pas : sauces, cuissons, découpes et 80 recettes du quotidien.', 25.50, 15, 1, '/images/ouvrage-1.svg'),
('Pâtes Parfaites', 'Mario Rossi', 'ISBN-002', 'Guide complet des pâtes fraîches et sèches : façonnage, sauces traditionnelles et 60 recettes de toute l''Italie.', 30.00, 8, 2, '/images/ouvrage-2.svg'),
('Pâtisserie Pro', 'Julia Child', 'ISBN-003', 'Desserts sophistiqués : pâte feuilletée, crèmes, entremets et techniques de chef pâtissier.', 45.99, 0, 3, '/images/ouvrage-3.svg'),
('Le Goût du Terroir', 'Anne Morel', 'ISBN-004', 'Un tour de France des plats régionaux : bœuf bourguignon, cassoulet, tarte tatin et bien d''autres.', 34.90, 12, 1, '/images/ouvrage-4.svg'),
('Risotto & Co', 'Lucia Bianchi', 'ISBN-005', 'Quarante risottos crémeux pour toutes les saisons, des plus classiques aux plus créatifs.', 27.00, 5, 2, '/images/ouvrage-5.svg'),
('Macarons et Merveilles', 'Claire Dubois', 'ISBN-006', 'Réussir ses macarons, choux et petits gâteaux grâce à des fiches techniques illustrées.', 32.50, 3, 3, '/images/ouvrage-6.svg'),
('Saveurs d''Asie', 'Kenji Tanaka', 'ISBN-007', 'Ramen, curry, dim sum et woks : les grands classiques asiatiques adaptés à la cuisine maison.', 29.95, 20, 4, '/images/ouvrage-7.svg'),
('Épices d''Afrique', 'Aminata Diallo', 'ISBN-008', 'Mafé, yassa, tajines et thiéboudienne : un voyage culinaire du Sénégal au Maroc.', 31.00, 9, 4, '/images/ouvrage-8.svg'),
('Le Potager Gourmand', 'Léa Fontaine', 'ISBN-009', '100 recettes végétariennes de saison, simples, colorées et équilibrées.', 24.00, 14, 5, '/images/ouvrage-9.svg'),
('Bowls & Salades', 'Hugo Martin', 'ISBN-010', 'Bowls complets, salades repas et vinaigrettes maison pour manger sain sans se priver.', 19.90, 0, 5, '/images/ouvrage-10.svg');

INSERT INTO users (nom, email, password_hash, role) VALUES
('Admin User', 'admin@test.com', '$2a$10$dstU.zEj4BQtlRQOigmmO.CbIeMz5aar8rFkhOjYMPzsowOR5SEsO', 'administrateur'),
('Chef Test', 'chef@test.com', '$2a$10$dstU.zEj4BQtlRQOigmmO.CbIeMz5aar8rFkhOjYMPzsowOR5SEsO', 'gestionnaire'),
('Client Test', 'client@test.com', '$2a$10$dstU.zEj4BQtlRQOigmmO.CbIeMz5aar8rFkhOjYMPzsowOR5SEsO', 'client'),
('Éditrice Test', 'editeur@test.com', '$2a$10$dstU.zEj4BQtlRQOigmmO.CbIeMz5aar8rFkhOjYMPzsowOR5SEsO', 'editeur');

-- Une commande livrée pour que le client puisse laisser un avis, + avis et commentaires d'exemple
INSERT INTO commandes (client_id, total, statut, adresse_livraison, mode_livraison, mode_paiement) VALUES
(3, 55.50, 'expediee', '123 rue des Érables, Montréal', 'standard', 'carte');
INSERT INTO commande_items (commande_id, ouvrage_id, quantite, prix_unitaire) VALUES
(1, 1, 1, 25.50), (1, 2, 1, 30.00);
INSERT INTO avis (client_id, ouvrage_id, note) VALUES (3, 1, 5), (3, 2, 4);
INSERT INTO commentaires (client_id, ouvrage_id, contenu, valide, valide_par, date_validation) VALUES
(3, 1, 'Parfait pour débuter, les explications sont très claires.', true, 4, NOW()),
(3, 2, 'Les pâtes fraîches sont devenues un rituel du dimanche !', true, 4, NOW());
