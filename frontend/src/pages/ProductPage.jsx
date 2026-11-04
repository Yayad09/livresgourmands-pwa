import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Button, Badge, Card, Form, Breadcrumb, Alert, Dropdown } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { listesApi, ouvragesApi } from '../api/services';
import { messageErreur } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dateFr, imageOuvrage, prix } from '../utils/format';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import StarRating from '../components/StarRating';
import StockBadge from '../components/StockBadge';
import QuantitySelector from '../components/QuantitySelector';

export default function ProductPage() {
  const { id } = useParams();
  const { addItem, items } = useCart();
  const { isClient, isAuthenticated } = useAuth();
  const notify = useToast();
  const [ouvrage, setOuvrage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [ajout, setAjout] = useState(false);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [listes, setListes] = useState([]);

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const o = await ouvragesApi.get(id);
      setOuvrage({ ...o, prix: Number(o.prix), stock: Number(o.stock) });
      document.title = `${o.titre} | Livres Gourmands`;
    } catch (e) {
      setError(e.response?.status === 404 ? "Ce livre n'existe pas ou a été retiré du catalogue." : messageErreur(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { charger(); setQuantite(1); }, [charger]);
  useEffect(() => {
    if (isClient) listesApi.mesListes().then(setListes).catch(() => setListes([]));
  }, [isClient]);

  if (loading) return <Container className="py-5"><Loader label="Chargement du livre…" /></Container>;
  if (error) {
    return (
      <Container className="py-5">
        <ErrorMessage message={error} onRetry={charger} />
        <Link to="/catalogue">← Retour au catalogue</Link>
      </Container>
    );
  }

  const epuise = ouvrage.stock <= 0;
  const dansPanier = items.find((i) => i.ouvrage_id === ouvrage.id)?.quantite || 0;
  const maxAjout = Math.max(0, ouvrage.stock - dansPanier);
  const moyenne = ouvrage.avis.length ? ouvrage.avis.reduce((s, a) => s + a.note, 0) / ouvrage.avis.length : null;

  const ajouter = async () => {
    setAjout(true);
    const ok = await addItem(ouvrage, quantite);
    setAjout(false);
    if (ok) setQuantite(1);
  };

  const envoyerAvis = async (e) => {
    e.preventDefault();
    try {
      await ouvragesApi.ajouterAvis(ouvrage.id, note);
      notify('Merci ! Votre avis a été publié.');
      charger();
    } catch (err) {
      notify(messageErreur(err), 'danger');
    }
  };

  const envoyerCommentaire = async (e) => {
    e.preventDefault();
    if (!commentaire.trim()) return;
    try {
      await ouvragesApi.ajouterCommentaire(ouvrage.id, commentaire.trim());
      setCommentaire('');
      notify('Commentaire envoyé : il sera visible après validation par notre équipe.', 'info');
    } catch (err) {
      notify(messageErreur(err), 'danger');
    }
  };

  const ajouterALaListe = async (liste) => {
    try {
      await listesApi.ajouterItem(liste.id, ouvrage.id, 1);
      notify(`Ajouté à la liste « ${liste.nom} ».`);
    } catch (err) {
      notify(messageErreur(err), 'danger');
    }
  };

  return (
    <Container className="py-4">
      <Breadcrumb aria-label="Fil d'Ariane">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Accueil</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/catalogue?categorie=${ouvrage.categorie_id}` }}>{ouvrage.categorie}</Breadcrumb.Item>
        <Breadcrumb.Item active>{ouvrage.titre}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-4 g-lg-5">
        <Col md={5} lg={4}>
          <img src={imageOuvrage(ouvrage)} alt={`Couverture du livre ${ouvrage.titre}`} className={`img-fluid product-cover ${epuise ? 'is-epuise' : ''}`} />
        </Col>
        <Col md={7} lg={8}>
          <Badge bg="light" text="dark" className="category-badge mb-2">{ouvrage.categorie}</Badge>
          <h1 className="font-display">{ouvrage.titre}</h1>
          <p className="lead mb-2">par <strong>{ouvrage.auteur}</strong></p>
          <div className="d-flex align-items-center gap-2 mb-3">
            <StarRating note={moyenne} />
            <a href="#avis" className="small">{ouvrage.avis.length} avis</a>
          </div>
          <p className="display-6 fw-bold price mb-2">{prix(ouvrage.prix)}</p>
          <div className="mb-4"><StockBadge stock={ouvrage.stock} /></div>

          {epuise ? (
            <Alert variant="secondary" className="d-flex gap-2 align-items-center">
              <i className="bi bi-info-circle" aria-hidden="true"></i>
              Ce livre est actuellement épuisé. Revenez bientôt : nous réapprovisionnons régulièrement.
            </Alert>
          ) : (
            <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
              <div style={{ width: 150 }}>
                <QuantitySelector value={quantite} onChange={setQuantite} max={Math.max(1, maxAjout)} />
              </div>
              <Button size="lg" onClick={ajouter} disabled={ajout || maxAjout === 0}>
                <i className="bi bi-bag-plus me-2" aria-hidden="true"></i>
                {ajout ? 'Ajout…' : 'Ajouter au panier'}
              </Button>
              {isClient && listes.length > 0 && (
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" size="lg" id="ajout-liste">
                    <i className="bi bi-gift me-2" aria-hidden="true"></i>Liste de cadeaux
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {listes.map((l) => <Dropdown.Item key={l.id} onClick={() => ajouterALaListe(l)}>{l.nom}</Dropdown.Item>)}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          )}
          {dansPanier > 0 && (
            <p className="small text-muted-strong">
              <i className="bi bi-bag-check me-1" aria-hidden="true"></i>
              Vous avez déjà {dansPanier} exemplaire(s) dans votre <Link to="/panier">panier</Link>.
            </p>
          )}

          <h2 className="h5 mt-4">Description</h2>
          <p>{ouvrage.description || 'Aucune description disponible.'}</p>
          <dl className="row small mb-0">
            <dt className="col-4 col-sm-3">ISBN</dt><dd className="col-8 col-sm-9">{ouvrage.isbn}</dd>
            <dt className="col-4 col-sm-3">Catégorie</dt><dd className="col-8 col-sm-9">{ouvrage.categorie}</dd>
          </dl>
        </Col>
      </Row>

      <Row className="g-4 mt-4" id="avis">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="h4 font-display">Avis des lecteurs</h2>
              {ouvrage.avis.length === 0 && <p className="text-muted-strong">Aucun avis pour le moment.</p>}
              <ul className="list-unstyled mb-0">
                {ouvrage.avis.map((a, i) => (
                  <li key={i} className="border-bottom py-2 d-flex justify-content-between">
                    <span><strong>{a.client}</strong> <span className="small text-muted-strong">· {dateFr(a.date)}</span></span>
                    <StarRating note={a.note} size=".9rem" />
                  </li>
                ))}
              </ul>
              {isClient && (
                <Form onSubmit={envoyerAvis} className="mt-3 d-flex gap-2 align-items-end flex-wrap">
                  <div>
                    <Form.Label htmlFor="note" className="small fw-semibold">Votre note</Form.Label>
                    <Form.Select id="note" value={note} onChange={(e) => setNote(Number(e.target.value))}>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
                    </Form.Select>
                  </div>
                  <Button type="submit" variant="outline-primary">Noter ce livre</Button>
                  <Form.Text className="w-100">Réservé aux clients ayant acheté ce livre.</Form.Text>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="h4 font-display">Commentaires</h2>
              {ouvrage.commentaires.length === 0 && <p className="text-muted-strong">Aucun commentaire pour le moment.</p>}
              <ul className="list-unstyled mb-0">
                {ouvrage.commentaires.map((c) => (
                  <li key={c.id} className="border-bottom py-2">
                    <p className="mb-1">« {c.contenu} »</p>
                    <span className="small text-muted-strong">{c.client} · {dateFr(c.date_soumission)}</span>
                  </li>
                ))}
              </ul>
              {isClient ? (
                <Form onSubmit={envoyerCommentaire} className="mt-3">
                  <Form.Label htmlFor="commentaire" className="small fw-semibold">Laisser un commentaire</Form.Label>
                  <Form.Control as="textarea" id="commentaire" rows={3} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} maxLength={1000} required />
                  <Button type="submit" variant="outline-primary" className="mt-2">Envoyer</Button>
                </Form>
              ) : !isAuthenticated && (
                <p className="mt-3 small"><Link to="/connexion">Connectez-vous</Link> pour noter ou commenter ce livre.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
