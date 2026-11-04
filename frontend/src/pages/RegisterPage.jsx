import { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { messageErreur } from '../api/client';

export default function RegisterPage() {
  const { register } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ nom: '', email: '', password: '', confirmation: '' });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => { document.title = 'Créer un compte | Livres Gourmands'; }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const mdpDiff = form.confirmation && form.password !== form.confirmation;

  const submit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!e.currentTarget.checkValidity() || mdpDiff) return;
    setEnvoi(true);
    setError('');
    try {
      await register(form.nom.trim(), form.email.trim(), form.password);
      notify('Compte créé, bienvenue chez Livres Gourmands !');
      navigate(state?.from || '/', { replace: true });
    } catch (err) {
      setError(messageErreur(err));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Container className="py-5 auth-container">
      <Card>
        <Card.Body className="p-4">
          <h1 className="h3 font-display text-center mb-4">Créer un compte</h1>
          {error && <Alert variant="danger" role="alert">{error}</Alert>}
          <Form noValidate validated={validated} onSubmit={submit}>
            <Form.Group className="mb-3" controlId="nom">
              <Form.Label>Nom complet</Form.Label>
              <Form.Control required maxLength={100} autoComplete="name" value={form.nom} onChange={set('nom')} />
              <Form.Control.Feedback type="invalid">Veuillez saisir votre nom.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Courriel</Form.Label>
              <Form.Control type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
              <Form.Control.Feedback type="invalid">Adresse courriel invalide.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} aria-describedby="aide-mdp" />
              <Form.Text id="aide-mdp">6 caractères minimum.</Form.Text>
              <Form.Control.Feedback type="invalid">6 caractères minimum.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4" controlId="confirmation">
              <Form.Label>Confirmer le mot de passe</Form.Label>
              <Form.Control type="password" required autoComplete="new-password" value={form.confirmation} onChange={set('confirmation')} isInvalid={!!mdpDiff} />
              <Form.Control.Feedback type="invalid">Les mots de passe ne correspondent pas.</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className="w-100" size="lg" disabled={envoi}>{envoi ? 'Création…' : 'Créer mon compte'}</Button>
          </Form>
          <p className="text-center mt-3 mb-0">Déjà inscrit ? <Link to="/connexion" state={state}>Se connecter</Link></p>
        </Card.Body>
      </Card>
    </Container>
  );
}
