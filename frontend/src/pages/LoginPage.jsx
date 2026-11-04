import { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { messageErreur } from '../api/client';
import { ROLES_DASHBOARD } from '../utils/format';

const COMPTES_TEST = [
  { email: 'client@test.com', role: 'Client' },
  { email: 'admin@test.com', role: 'Administrateur' },
  { email: 'chef@test.com', role: 'Gestionnaire' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { document.title = 'Connexion | Livres Gourmands'; }, []);

  const submit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setError('');
    try {
      const u = await login(email, password);
      notify(`Bienvenue, ${u.nom} !`);
      const defaut = ROLES_DASHBOARD.includes(u.role) ? '/admin' : '/';
      navigate(state?.from || defaut, { replace: true });
    } catch (err) {
      setError(err.response?.status === 401 ? 'Courriel ou mot de passe incorrect.' : messageErreur(err));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Container className="py-5 auth-container">
      <Card>
        <Card.Body className="p-4">
          <h1 className="h3 font-display text-center mb-4">Connexion</h1>
          {state?.message && <Alert variant="info">{state.message}</Alert>}
          {error && <Alert variant="danger" role="alert">{error}</Alert>}
          <Form onSubmit={submit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Courriel</Form.Label>
              <Form.Control type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Button type="submit" className="w-100" size="lg" disabled={envoi}>{envoi ? 'Connexion…' : 'Se connecter'}</Button>
          </Form>
          <p className="text-center mt-3 mb-0">Pas encore de compte ? <Link to="/inscription" state={state}>Créer un compte</Link></p>
        </Card.Body>
      </Card>
      <Card className="mt-3 test-accounts">
        <Card.Body>
          <p className="fw-semibold mb-2 small">Comptes de démonstration (mot de passe : password123)</p>
          <div className="d-flex flex-wrap gap-2">
            {COMPTES_TEST.map((c) => (
              <Button key={c.email} size="sm" variant="outline-secondary" onClick={() => { setEmail(c.email); setPassword('password123'); }}>
                {c.role}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
