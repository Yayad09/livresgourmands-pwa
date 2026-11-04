import { useCallback, useEffect, useState } from 'react';
import { Table, Badge } from 'react-bootstrap';
import { usersApi } from '../../api/services';
import { messageErreur } from '../../api/client';
import { ROLES } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const charger = useCallback(async () => {
    setError('');
    try {
      setUsers(await usersApi.list());
    } catch (e) {
      setError(messageErreur(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { document.title = 'Utilisateurs | Administration'; charger(); }, [charger]);

  return (
    <>
      <h1 className="h3 font-display mb-4">Utilisateurs</h1>
      {loading && <Loader />}
      <ErrorMessage message={error} onRetry={charger} />
      {!loading && !error && (
        <Table responsive hover className="bg-white align-middle admin-table">
          <caption className="visually-hidden">Liste des utilisateurs</caption>
          <thead><tr><th scope="col">#</th><th scope="col">Nom</th><th scope="col">Courriel</th><th scope="col">Rôle</th><th scope="col">État</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.nom}</td><td>{u.email}</td>
                <td><Badge bg="light" text="dark" className="border">{ROLES[u.role] || u.role}</Badge></td>
                <td>{u.actif ? <Badge bg="success">Actif</Badge> : <Badge bg="secondary">Inactif</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
