import { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { imageOuvrage, prix } from '../utils/format';
import QuantitySelector from '../components/QuantitySelector';
import Loader from '../components/Loader';

export default function CartPage() {
  const { items, count, total, updateQuantity, removeItem, syncing } = useCart();
  const { user, isClient } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Panier | Livres Gourmands'; }, []);

  if (syncing) return <Container className="py-5"><Loader label="Synchronisation du panier…" /></Container>;

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <i className="bi bi-bag display-3 text-muted-strong" aria-hidden="true"></i>
        <h1 className="font-display mt-3">Votre panier est vide</h1>
        <p>Parcourez notre catalogue et laissez-vous tenter !</p>
        <Button as={Link} to="/catalogue" size="lg">Voir le catalogue</Button>
      </Container>
    );
  }

  const commander = () => navigate(isClient ? '/commande' : '/connexion', isClient ? undefined : { state: { from: '/commande', message: 'Connectez-vous avec un compte client pour passer commande.' } });

  return (
    <Container className="py-4">
      <h1 className="font-display mb-4">Mon panier <span className="h5 text-muted-strong">({count} article{count > 1 ? 's' : ''})</span></h1>
      <Row className="g-4">
        <Col lg={8}>
          <ul className="list-unstyled cart-list" aria-label="Articles du panier">
            {items.map((it) => {
              const indispo = it.stock <= 0;
              return (
                <li key={it.ouvrage_id} className="cart-item">
                  <Link to={`/ouvrages/${it.ouvrage_id}`} tabIndex={-1} aria-hidden="true">
                    <img src={imageOuvrage(it)} alt="" className="cart-thumb" />
                  </Link>
                  <div className="flex-grow-1">
                    <h2 className="h6 mb-1"><Link to={`/ouvrages/${it.ouvrage_id}`}>{it.titre}</Link></h2>
                    <p className="small text-muted-strong mb-2">Prix unitaire : {prix(it.prix)}</p>
                    {indispo && <p className="small text-danger mb-2"><i className="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>Ce livre n'est plus en stock.</p>}
                    <div className="d-flex flex-wrap align-items-center gap-3">
                      <div style={{ width: 140 }}>
                        <QuantitySelector size="sm" value={it.quantite} max={Math.max(it.quantite, it.stock)} onChange={(q) => updateQuantity(it.ouvrage_id, q)} label={`Quantité pour ${it.titre}`} />
                      </div>
                      <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeItem(it.ouvrage_id)} aria-label={`Retirer ${it.titre} du panier`}>
                        <i className="bi bi-trash me-1" aria-hidden="true"></i>Retirer
                      </Button>
                    </div>
                  </div>
                  <p className="fw-bold mb-0 text-end" aria-label={`Sous-total ${prix(it.prix * it.quantite)}`}>{prix(it.prix * it.quantite)}</p>
                </li>
              );
            })}
          </ul>
          <Link to="/catalogue"><i className="bi bi-arrow-left me-1" aria-hidden="true"></i>Continuer mes achats</Link>
        </Col>
        <Col lg={4}>
          <Card className="summary-card">
            <Card.Body>
              <h2 className="h5 mb-3">Récapitulatif</h2>
              <div className="d-flex justify-content-between mb-2"><span>Sous-total</span><span>{prix(total)}</span></div>
              <div className="d-flex justify-content-between mb-2"><span>Livraison</span><span>Calculée à l'étape suivante</span></div>
              <hr />
              <div className="d-flex justify-content-between fs-5 fw-bold mb-3"><span>Total</span><span>{prix(total)}</span></div>
              <Button size="lg" className="w-100" onClick={commander}>
                <i className="bi bi-lock me-2" aria-hidden="true"></i>Passer la commande
              </Button>
              {!user && <p className="small mt-2 mb-0">Votre panier est conservé sur cet appareil. Connectez-vous pour le retrouver partout.</p>}
              {user && !isClient && <Alert variant="info" className="small mt-3 mb-0">Seuls les comptes clients peuvent passer commande.</Alert>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
