import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Table } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { listesApi } from '../api/services';
import { messageErreur } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { dateFr, imageOuvrage, prix } from '../utils/format';
import ErrorMessage from '../components/ErrorMessage';
import StockBadge from '../components/StockBadge';

/*
 * Listes de cadeaux
 * - Ami (sans compte) : saisit le code personnel reçu et achète des livres de la liste.
 * - Client connecté : crée ses listes et obtient le code à partager.
 */
export default function GiftListPage() {
  const { isClient } = useAuth();
  const { addItem } = useCart();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [liste, setListe] = useState(null);
  const [erreurCode, setErreurCode] = useState('');
  const [mesListes, setMesListes] = useState([]);
  const [nom, setNom] = useState('');

  useEffect(() => { document.title = 'Listes de cadeaux | Livres Gourmands'; }, []);

  const ouvrir = useCallback(async (c) => {
    setErreurCode('');
    setListe(null);
    try {
      setListe(await listesApi.parCode(c.trim()));
    } catch (e) {
      setErreurCode(e.response?.status === 404 ? 'Aucune liste ne correspond à ce code. Vérifiez le code reçu par courriel.' : messageErreur(e));
    }
  }, []);

  useEffect(() => {
    const c = params.get('code');
    if (c) ouvrir(c);
  }, [params, ouvrir]);

  const chargerMesListes = useCallback(() => {
    if (isClient) listesApi.mesListes().then(setMesListes).catch((e) => notify(messageErreur(e), 'danger'));
  }, [isClient, notify]);
  useEffect(() => { chargerMesListes(); }, [chargerMesListes]);

  const creer = async (e) => {
    e.preventDefault();
    if (!nom.trim()) return;
    try {
      const r = await listesApi.creer(nom.trim());
      notify(`Liste créée ! Code à partager : ${r.code_partage}`);
      setNom('');
      chargerMesListes();
    } catch (err) {
      notify(messageErreur(err), 'danger');
    }
  };

  const copier = async (c) => {
    try {
      await navigator.clipboard.writeText(c);
      notify('Code copié dans le presse-papiers.', 'info');
    } catch {
      notify(`Code : ${c}`, 'info');
    }
  };

  return (
    <Container className="py-4">
      <h1 className="font-display mb-2">Listes de cadeaux</h1>
      <p className="lead mb-4">Offrez exactement ce qui fait plaisir : vos proches vous partagent leur code personnel.</p>

      <Row className="g-4">
        <Col lg={isClient ? 7 : 12}>
          <Card>
            <Card.Body>
              <h2 className="h5"><i className="bi bi-key me-2" aria-hidden="true"></i>Accéder à une liste</h2>
              <Form onSubmit={(e) => { e.preventDefault(); setParams(code.trim() ? { code: code.trim() } : {}); }}>
                <Form.Label htmlFor="code-liste">Code personnel reçu par courriel</Form.Label>
                <InputGroup>
                  <Form.Control id="code-liste" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="ex. 3f9a1c2b7d4e5f60" />
                  <Button type="submit">Voir la liste</Button>
                </InputGroup>
              </Form>
              <div className="mt-3"><ErrorMessage message={erreurCode} /></div>

              {liste && (
                <section aria-labelledby="titre-liste" className="mt-3">
                  <h3 id="titre-liste" className="h5 font-display">{liste.nom}</h3>
                  {liste.items.length === 0 ? (
                    <p className="text-muted-strong">Cette liste est encore vide.</p>
                  ) : (
                    <ul className="list-unstyled cart-list">
                      {liste.items.map((it) => (
                        <li key={it.id} className="cart-item">
                          <img src={imageOuvrage(it)} alt="" className="cart-thumb" />
                          <div className="flex-grow-1">
                            <Link to={`/ouvrages/${it.ouvrage_id}`} className="fw-semibold">{it.titre}</Link>
                            <p className="small mb-1">Souhaité : {it.quantite_souhaitee} · {prix(it.prix)}</p>
                            <StockBadge stock={it.stock} />
                          </div>
                          <Button size="sm" disabled={it.stock <= 0}
                            onClick={() => addItem({ id: it.ouvrage_id, titre: it.titre, prix: it.prix, stock: it.stock, image: it.image }, 1)}>
                            <i className="bi bi-bag-plus me-1" aria-hidden="true"></i>Offrir
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </Card.Body>
          </Card>
        </Col>

        {isClient && (
          <Col lg={5}>
            <Card>
              <Card.Body>
                <h2 className="h5"><i className="bi bi-gift me-2" aria-hidden="true"></i>Mes listes</h2>
                <Form onSubmit={creer} className="mb-3">
                  <Form.Label htmlFor="nom-liste">Nouvelle liste</Form.Label>
                  <InputGroup>
                    <Form.Control id="nom-liste" required maxLength={100} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Mon anniversaire" />
                    <Button type="submit" variant="outline-primary">Créer</Button>
                  </InputGroup>
                  <Form.Text>Ajoutez ensuite des livres depuis leur fiche (bouton « Liste de cadeaux »).</Form.Text>
                </Form>
                {mesListes.length === 0 ? <p className="small text-muted-strong mb-0">Aucune liste pour l'instant.</p> : (
                  <Table size="sm" responsive className="mb-0 align-middle">
                    <thead><tr><th scope="col">Liste</th><th scope="col">Livres</th><th scope="col">Code</th></tr></thead>
                    <tbody>
                      {mesListes.map((l) => (
                        <tr key={l.id}>
                          <td><span className="fw-semibold">{l.nom}</span><br /><span className="small text-muted-strong">{dateFr(l.date_creation)}</span></td>
                          <td>{l.nb_items}</td>
                          <td>
                            <Button size="sm" variant="link" className="p-0 font-monospace" onClick={() => copier(l.code_partage)} aria-label={`Copier le code de ${l.nom}`}>
                              {l.code_partage.slice(0, 8)}… <i className="bi bi-clipboard" aria-hidden="true"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      {!isClient && (
        <p className="mt-4"><Link to="/connexion" state={{ from: '/liste-cadeaux' }}>Connectez-vous</Link> avec un compte client pour créer votre propre liste.</p>
      )}
    </Container>
  );
}
