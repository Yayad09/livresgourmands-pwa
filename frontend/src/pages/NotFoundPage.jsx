import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Container className="py-5 text-center">
      <p className="display-1 font-display text-primary mb-0">404</p>
      <h1 className="h3">Page introuvable</h1>
      <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <Button as={Link} to="/">Retour à l'accueil</Button>
    </Container>
  );
}
