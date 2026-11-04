import { useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import BookBrowser from '../components/BookBrowser';

const ATOUTS = [
  { icon: 'bi-truck', titre: 'Livraison rapide', texte: 'Partout au Québec en 3 à 5 jours ouvrables.' },
  { icon: 'bi-gift', titre: 'Listes de cadeaux', texte: 'Partagez vos envies avec un code personnel.' },
  { icon: 'bi-star', titre: 'Avis vérifiés', texte: 'Seuls les acheteurs peuvent noter un livre.' },
  { icon: 'bi-shield-lock', titre: 'Paiement sécurisé', texte: 'Carte bancaire ou PayPal.' },
];

export default function HomePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Livres Gourmands : livres de cuisine en ligne'; }, []);

  return (
    <>
      <h1 className="visually-hidden">Livres Gourmands, librairie de livres de cuisine</h1>
      <HeroCarousel />
      <Container className="py-4">
        {state?.refus && (
          <Alert variant="warning" dismissible onClose={() => navigate('.', { replace: true, state: null })}>
            Cette page est réservée à un autre type de compte.
          </Alert>
        )}
        <Row xs={2} md={4} className="g-3 mb-5 atouts" as="ul" aria-label="Nos engagements">
          {ATOUTS.map((a) => (
            <Col as="li" key={a.titre} className="list-unstyled">
              <div className="atout h-100">
                <i className={`bi ${a.icon}`} aria-hidden="true"></i>
                <p className="fw-semibold mb-1">{a.titre}</p>
                <p className="small mb-0">{a.texte}</p>
              </div>
            </Col>
          ))}
        </Row>
        <BookBrowser titre="Nos livres de cuisine" />
      </Container>
    </>
  );
}
