import { useCallback, useEffect, useState } from 'react';
import { Container, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { commandesApi } from '../api/services';
import { messageErreur } from '../api/client';
import { STATUTS, dateFr, prix } from '../utils/format';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function MyOrdersPage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCommandes(await commandesApi.mesCommandes());
    } catch (e) {
      setError(messageErreur(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { document.title = 'Mes commandes | Livres Gourmands'; charger(); }, [charger]);

  return (
    <Container className="py-4">
      <h1 className="font-display mb-4">Mes commandes</h1>
      {loading && <Loader />}
      <ErrorMessage message={error} onRetry={charger} />
      {!loading && !error && commandes.length === 0 && (
        <p>Vous n'avez pas encore passé de commande. <Link to="/catalogue">Découvrir le catalogue</Link></p>
      )}
      {commandes.length > 0 && (
        <Table responsive hover className="bg-white align-middle">
          <caption className="visually-hidden">Historique de vos commandes</caption>
          <thead><tr><th scope="col">N°</th><th scope="col">Date</th><th scope="col">Livraison</th><th scope="col">Statut</th><th scope="col" className="text-end">Total</th></tr></thead>
          <tbody>
            {commandes.map((c) => {
              const s = STATUTS[c.statut] || STATUTS.en_cours;
              return (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>{dateFr(c.date)}</td>
                  <td className="small">{c.adresse_livraison}</td>
                  <td><Badge bg={s.bg} text={s.text}>{s.label}</Badge></td>
                  <td className="text-end fw-semibold">{prix(c.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
      <Button as={Link} to="/catalogue" variant="outline-primary" className="mt-2">Continuer mes achats</Button>
    </Container>
  );
}
