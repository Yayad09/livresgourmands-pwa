import { Container, Button } from 'react-bootstrap';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { prix } from '../utils/format';

export default function ConfirmationPage() {
  const { state } = useLocation();
  if (!state?.commande) return <Navigate to="/" replace />;
  const { commande_id, total } = state.commande;
  return (
    <Container className="py-5 text-center" style={{ maxWidth: 640 }}>
      <i className="bi bi-check-circle-fill display-2 text-success" aria-hidden="true"></i>
      <h1 className="font-display mt-3">Merci pour votre commande !</h1>
      <p className="lead">Commande n° <strong>{commande_id}</strong> pour un total de <strong>{prix(total)}</strong>.</p>
      <p>Un courriel de confirmation vous sera envoyé. Vous pouvez suivre son statut dans votre espace.</p>
      <div className="d-flex gap-2 justify-content-center flex-wrap">
        <Button as={Link} to="/mes-commandes">Mes commandes</Button>
        <Button as={Link} to="/catalogue" variant="outline-primary">Continuer mes achats</Button>
      </div>
    </Container>
  );
}
