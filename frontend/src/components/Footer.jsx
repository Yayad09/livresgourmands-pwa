import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="lg-footer mt-5">
      <Container className="py-5">
        <Row className="g-4">
          <Col md={5}>
            <p className="h5 font-display">Livres Gourmands</p>
            <p className="mb-0">La librairie en ligne des passionnés de cuisine : des livres pour débutants, amateurs et chefs.</p>
          </Col>
          <Col sm={6} md={3}>
            <p className="fw-semibold mb-2">Boutique</p>
            <ul className="list-unstyled mb-0">
              <li><Link to="/catalogue">Catalogue</Link></li>
              <li><Link to="/liste-cadeaux">Listes de cadeaux</Link></li>
              <li><Link to="/panier">Panier</Link></li>
            </ul>
          </Col>
          <Col sm={6} md={4}>
            <p className="fw-semibold mb-2">Service client</p>
            <ul className="list-unstyled mb-0">
              <li><i className="bi bi-truck me-2" aria-hidden="true"></i>Livraison au Québec en 3 à 5 jours</li>
              <li><i className="bi bi-shield-lock me-2" aria-hidden="true"></i>Paiement sécurisé</li>
              <li><i className="bi bi-envelope me-2" aria-hidden="true"></i>contact@livresgourmands.net</li>
            </ul>
          </Col>
        </Row>
        <hr />
        <p className="small mb-0">© {new Date().getFullYear()} livresgourmands.net. Projet réalisé pour le cours Programmation Web avancée, Institut Grasset.</p>
      </Container>
    </footer>
  );
}
