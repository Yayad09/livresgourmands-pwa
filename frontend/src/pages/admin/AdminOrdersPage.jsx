import { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Form, Badge } from 'react-bootstrap';
import { commandesApi } from '../../api/services';
import { messageErreur } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { STATUTS, dateFr, prix } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

export default function AdminOrdersPage() {
  const notify = useToast();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtre, setFiltre] = useState('');

  const charger = useCallback(async () => {
    setError('');
    try {
      setCommandes(await commandesApi.toutes());
    } catch (e) {
      setError(messageErreur(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { document.title = 'Commandes | Administration'; charger(); }, [charger]);

  const visibles = useMemo(() => commandes.filter((c) => !filtre || c.statut === filtre), [commandes, filtre]);

  const changerStatut = async (c, statut) => {
    try {
      await commandesApi.changerStatut(c.id, statut);
      setCommandes((list) => list.map((x) => (x.id === c.id ? { ...x, statut } : x)));
      notify(`Commande #${c.id} : statut « ${STATUTS[statut].label} ».`);
    } catch (e) {
      notify(messageErreur(e), 'danger');
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h3 font-display mb-0">Commandes</h1>
        <Form.Select style={{ maxWidth: 220 }} value={filtre} onChange={(e) => setFiltre(e.target.value)} aria-label="Filtrer par statut">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </Form.Select>
      </div>
      {loading && <Loader />}
      <ErrorMessage message={error} onRetry={charger} />
      {!loading && !error && (
        <Table responsive hover className="bg-white align-middle admin-table">
          <caption className="visually-hidden">Liste des commandes</caption>
          <thead>
            <tr><th scope="col">N°</th><th scope="col">Date</th><th scope="col">Client</th><th scope="col">Articles</th><th scope="col">Livraison / paiement</th><th scope="col" className="text-end">Total</th><th scope="col">Statut</th></tr>
          </thead>
          <tbody>
            {visibles.map((c) => {
              const s = STATUTS[c.statut] || STATUTS.en_cours;
              return (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td className="text-nowrap">{dateFr(c.date)}</td>
                  <td>{c.client}<br /><span className="small text-muted-strong">{c.email}</span></td>
                  <td>{c.nb_articles || 0}</td>
                  <td className="small">{c.mode_livraison || '-'} / {c.mode_paiement || '-'}<br />{c.adresse_livraison}</td>
                  <td className="text-end fw-semibold">{prix(c.total)}</td>
                  <td style={{ minWidth: 150 }}>
                    <Badge bg={s.bg} text={s.text} className="mb-1">{s.label}</Badge>
                    <Form.Select size="sm" value={c.statut} onChange={(e) => changerStatut(c, e.target.value)} aria-label={`Changer le statut de la commande ${c.id}`}>
                      {Object.entries(STATUTS).map(([k, st]) => <option key={k} value={k}>{st.label}</option>)}
                    </Form.Select>
                  </td>
                </tr>
              );
            })}
            {visibles.length === 0 && <tr><td colSpan={7}>Aucune commande.</td></tr>}
          </tbody>
        </Table>
      )}
    </>
  );
}
