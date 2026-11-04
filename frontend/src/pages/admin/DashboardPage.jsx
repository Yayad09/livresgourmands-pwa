import { useCallback, useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { commandesApi, ouvragesApi } from '../../api/services';
import { messageErreur } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { STATUTS, dateFr, prix } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

function Stat({ icon, label, value, variant }) {
  return (
    <Card className="stat-card h-100">
      <Card.Body className="d-flex align-items-center gap-3">
        <span className={`stat-icon bg-${variant}-subtle text-${variant}-emphasis`}><i className={`bi ${icon}`} aria-hidden="true"></i></span>
        <div>
          <p className="small mb-0 text-muted-strong">{label}</p>
          <p className="h4 mb-0 fw-bold">{value}</p>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function DashboardPage() {
  const { hasRole } = useAuth();
  const voitCommandes = hasRole('administrateur', 'gestionnaire');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const charger = useCallback(async () => {
    setError('');
    try {
      const [ouvrages, commandes] = await Promise.all([
        ouvragesApi.list(),
        voitCommandes ? commandesApi.toutes() : Promise.resolve([]),
      ]);
      setData({ ouvrages, commandes });
    } catch (e) {
      setError(messageErreur(e));
    }
  }, [voitCommandes]);
  useEffect(() => { document.title = 'Tableau de bord | Livres Gourmands'; charger(); }, [charger]);

  if (error) return <ErrorMessage message={error} onRetry={charger} />;
  if (!data) return <Loader />;

  const { ouvrages, commandes } = data;
  const epuises = ouvrages.filter((o) => Number(o.stock) <= 0);
  const stockFaible = ouvrages.filter((o) => Number(o.stock) > 0 && Number(o.stock) <= 5);
  const ca = commandes.filter((c) => c.statut !== 'annulee').reduce((s, c) => s + Number(c.total), 0);

  return (
    <>
      <h1 className="h3 font-display mb-4">Tableau de bord</h1>
      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><Stat icon="bi-book" label="Ouvrages au catalogue" value={ouvrages.length} variant="primary" /></Col>
        <Col><Stat icon="bi-exclamation-triangle" label="Ouvrages épuisés" value={epuises.length} variant="danger" /></Col>
        {voitCommandes && <Col><Stat icon="bi-receipt" label="Commandes" value={commandes.length} variant="info" /></Col>}
        {voitCommandes && <Col><Stat icon="bi-cash-coin" label="Chiffre d'affaires" value={prix(ca)} variant="success" /></Col>}
      </Row>

      <Row className="g-4">
        <Col xl={voitCommandes ? 5 : 12}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="h5">Alertes de stock</h2>
              {epuises.length + stockFaible.length === 0 ? <p className="mb-0">Tous les stocks sont suffisants.</p> : (
                <ul className="list-unstyled mb-0">
                  {[...epuises, ...stockFaible].map((o) => (
                    <li key={o.id} className="d-flex justify-content-between border-bottom py-2">
                      <span>{o.titre}</span>
                      {Number(o.stock) <= 0 ? <Badge bg="danger">Épuisé</Badge> : <Badge bg="warning" text="dark">{o.stock} restant(s)</Badge>}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/ouvrages" className="d-inline-block mt-3">Gérer les ouvrages →</Link>
            </Card.Body>
          </Card>
        </Col>
        {voitCommandes && (
          <Col xl={7}>
            <Card className="h-100">
              <Card.Body>
                <h2 className="h5">Dernières commandes</h2>
                <Table responsive size="sm" className="mb-0 align-middle">
                  <thead><tr><th scope="col">N°</th><th scope="col">Client</th><th scope="col">Date</th><th scope="col">Statut</th><th scope="col" className="text-end">Total</th></tr></thead>
                  <tbody>
                    {commandes.slice(0, 5).map((c) => {
                      const s = STATUTS[c.statut] || STATUTS.en_cours;
                      return (
                        <tr key={c.id}>
                          <td>#{c.id}</td><td>{c.client}</td><td>{dateFr(c.date)}</td>
                          <td><Badge bg={s.bg} text={s.text}>{s.label}</Badge></td>
                          <td className="text-end">{prix(c.total)}</td>
                        </tr>
                      );
                    })}
                    {commandes.length === 0 && <tr><td colSpan={5}>Aucune commande.</td></tr>}
                  </tbody>
                </Table>
                <Link to="/admin/commandes" className="d-inline-block mt-3">Toutes les commandes →</Link>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
}
