import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { commandesApi } from '../api/services';
import { messageErreur } from '../api/client';
import { useCart } from '../context/CartContext';
import { prix } from '../utils/format';
import ErrorMessage from '../components/ErrorMessage';

const LIVRAISONS = [
  { value: 'standard', label: 'Livraison standard (3 à 5 jours)', detail: 'Gratuite' },
  { value: 'express', label: 'Livraison express (24 à 48 h)', detail: 'Gratuite pendant le lancement' },
  { value: 'retrait', label: 'Retrait en librairie', detail: 'Gratuit' },
];
const PAIEMENTS = [
  { value: 'carte', label: 'Carte bancaire', icon: 'bi-credit-card' },
  { value: 'paypal', label: 'PayPal', icon: 'bi-paypal' },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ adresse: '', ville: '', codePostal: '', mode_livraison: 'standard', mode_paiement: 'carte' });
  const [validated, setValidated] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { document.title = 'Commande | Livres Gourmands'; }, []);

  if (items.length === 0 && !envoi) return <Navigate to="/panier" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const valider = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!e.currentTarget.checkValidity()) return;
    setEnvoi(true);
    setError('');
    try {
      const res = await commandesApi.creer({
        adresse_livraison: `${form.adresse}, ${form.ville} ${form.codePostal.toUpperCase()}`,
        mode_livraison: form.mode_livraison,
        mode_paiement: form.mode_paiement,
      });
      clearCart();
      navigate('/commande/confirmation', { replace: true, state: { commande: res } });
    } catch (err) {
      setError(messageErreur(err));
      setEnvoi(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="font-display mb-4">Finaliser ma commande</h1>
      <ErrorMessage message={error} />
      <Form noValidate validated={validated} onSubmit={valider}>
        <Row className="g-4">
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Body>
                <h2 className="h5 mb-3"><span className="step-num">1</span>Adresse de livraison</h2>
                <Form.Group className="mb-3" controlId="adresse">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control required value={form.adresse} onChange={set('adresse')} autoComplete="street-address" />
                  <Form.Control.Feedback type="invalid">Veuillez saisir votre adresse.</Form.Control.Feedback>
                </Form.Group>
                <Row>
                  <Col sm={7}>
                    <Form.Group className="mb-3" controlId="ville">
                      <Form.Label>Ville</Form.Label>
                      <Form.Control required value={form.ville} onChange={set('ville')} autoComplete="address-level2" />
                      <Form.Control.Feedback type="invalid">Veuillez saisir votre ville.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={5}>
                    <Form.Group className="mb-3" controlId="codePostal">
                      <Form.Label>Code postal</Form.Label>
                      <Form.Control required pattern="[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d" placeholder="H2X 1Y4" value={form.codePostal} onChange={set('codePostal')} autoComplete="postal-code" />
                      <Form.Control.Feedback type="invalid">Format attendu : A1A 1A1.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <fieldset>
                  <legend className="h5 mb-3"><span className="step-num">2</span>Mode de livraison</legend>
                  {LIVRAISONS.map((l) => (
                    <Form.Check key={l.value} type="radio" id={`liv-${l.value}`} name="livraison" className="choice-option"
                      checked={form.mode_livraison === l.value} onChange={() => setForm({ ...form, mode_livraison: l.value })}
                      label={<span className="d-flex justify-content-between w-100 gap-2"><span>{l.label}</span><span className="text-success fw-semibold">{l.detail}</span></span>} />
                  ))}
                </fieldset>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <fieldset>
                  <legend className="h5 mb-3"><span className="step-num">3</span>Mode de paiement</legend>
                  {PAIEMENTS.map((p) => (
                    <Form.Check key={p.value} type="radio" id={`pay-${p.value}`} name="paiement" className="choice-option"
                      checked={form.mode_paiement === p.value} onChange={() => setForm({ ...form, mode_paiement: p.value })}
                      label={<><i className={`bi ${p.icon} me-2`} aria-hidden="true"></i>{p.label}</>} />
                  ))}
                  <p className="small text-muted-strong mt-2 mb-0">
                    <i className="bi bi-shield-lock me-1" aria-hidden="true"></i>
                    Vous serez redirigé vers la page sécurisée de notre partenaire de paiement (simulation dans ce projet).
                  </p>
                </fieldset>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="summary-card">
              <Card.Body>
                <h2 className="h5 mb-3">Votre commande</h2>
                <ul className="list-unstyled small">
                  {items.map((it) => (
                    <li key={it.ouvrage_id} className="d-flex justify-content-between mb-2 gap-2">
                      <span>{it.quantite} × {it.titre}</span><span>{prix(it.prix * it.quantite)}</span>
                    </li>
                  ))}
                </ul>
                <hr />
                <div className="d-flex justify-content-between fs-5 fw-bold mb-3"><span>Total</span><span>{prix(total)}</span></div>
                <Button type="submit" size="lg" className="w-100" disabled={envoi}>
                  {envoi ? 'Validation…' : 'Confirmer et payer'}
                </Button>
                <Link to="/panier" className="d-block text-center mt-3 small">Modifier mon panier</Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
