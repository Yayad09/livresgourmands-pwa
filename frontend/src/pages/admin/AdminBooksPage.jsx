import { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Button, Form, Modal, InputGroup } from 'react-bootstrap';
import { categoriesApi, ouvragesApi } from '../../api/services';
import { messageErreur } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { imageOuvrage, prix } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import StockBadge from '../../components/StockBadge';
import BookFormModal from './BookFormModal';

export default function AdminBooksPage() {
  const { hasRole } = useAuth();
  const notify = useToast();
  const peutSupprimer = hasRole('administrateur', 'gestionnaire');
  const [ouvrages, setOuvrages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recherche, setRecherche] = useState('');
  const [edition, setEdition] = useState({ show: false, ouvrage: null });
  const [aSupprimer, setASupprimer] = useState(null);

  const charger = useCallback(async () => {
    setError('');
    try {
      const [o, c] = await Promise.all([ouvragesApi.list(), categoriesApi.list()]);
      setOuvrages(o);
      setCategories(c);
    } catch (e) {
      setError(messageErreur(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { document.title = 'Ouvrages | Administration'; charger(); }, [charger]);

  const filtres = useMemo(() => {
    const q = recherche.toLowerCase();
    return ouvrages.filter((o) => !q || `${o.titre} ${o.auteur} ${o.isbn}`.toLowerCase().includes(q));
  }, [ouvrages, recherche]);

  const enregistrer = async (data) => {
    try {
      if (edition.ouvrage) {
        await ouvragesApi.update(edition.ouvrage.id, data);
        notify('Ouvrage mis à jour.');
      } else {
        await ouvragesApi.create(data);
        notify('Ouvrage ajouté au catalogue.');
      }
      setEdition({ show: false, ouvrage: null });
      charger();
    } catch (e) {
      throw new Error(messageErreur(e)); // affiché dans le formulaire
    }
  };

  const supprimer = async () => {
    try {
      await ouvragesApi.remove(aSupprimer.id);
      notify(`« ${aSupprimer.titre} » a été supprimé.`, 'info');
      setOuvrages((list) => list.filter((o) => o.id !== aSupprimer.id));
    } catch (e) {
      notify(messageErreur(e), 'danger');
    } finally {
      setASupprimer(null);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h3 font-display mb-0">Ouvrages</h1>
        <Button onClick={() => setEdition({ show: true, ouvrage: null })}>
          <i className="bi bi-plus-lg me-2" aria-hidden="true"></i>Ajouter un ouvrage
        </Button>
      </div>

      <InputGroup className="mb-3" style={{ maxWidth: 420 }}>
        <InputGroup.Text><i className="bi bi-search" aria-hidden="true"></i></InputGroup.Text>
        <Form.Control type="search" placeholder="Rechercher (titre, auteur, ISBN)" aria-label="Rechercher un ouvrage" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </InputGroup>

      {loading && <Loader />}
      <ErrorMessage message={error} onRetry={charger} />

      {!loading && !error && (
        <Table responsive hover className="bg-white align-middle admin-table">
          <caption className="visually-hidden">Liste des ouvrages</caption>
          <thead>
            <tr><th scope="col">Ouvrage</th><th scope="col">Catégorie</th><th scope="col">ISBN</th><th scope="col" className="text-end">Prix</th><th scope="col">Stock</th><th scope="col" className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {filtres.map((o) => (
              <tr key={o.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={imageOuvrage(o)} alt="" width="36" height="54" className="rounded object-fit-cover" />
                    <div><span className="fw-semibold">{o.titre}</span><br /><span className="small text-muted-strong">{o.auteur}</span></div>
                  </div>
                </td>
                <td>{o.categorie}</td>
                <td className="small">{o.isbn}</td>
                <td className="text-end">{prix(o.prix)}</td>
                <td><span className="me-2">{o.stock}</span><StockBadge stock={o.stock} /></td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => setEdition({ show: true, ouvrage: o })} aria-label={`Modifier ${o.titre}`}>
                    <i className="bi bi-pencil" aria-hidden="true"></i>
                  </Button>
                  {peutSupprimer && (
                    <Button size="sm" variant="outline-danger" onClick={() => setASupprimer(o)} aria-label={`Supprimer ${o.titre}`}>
                      <i className="bi bi-trash" aria-hidden="true"></i>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filtres.length === 0 && <tr><td colSpan={6}>Aucun ouvrage trouvé.</td></tr>}
          </tbody>
        </Table>
      )}

      <BookFormModal
        show={edition.show}
        ouvrage={edition.ouvrage}
        categories={categories}
        onHide={() => setEdition({ show: false, ouvrage: null })}
        onSave={enregistrer}
      />

      <Modal show={!!aSupprimer} onHide={() => setASupprimer(null)} centered aria-labelledby="titre-suppr">
        <Modal.Header closeButton><Modal.Title id="titre-suppr">Supprimer l'ouvrage</Modal.Title></Modal.Header>
        <Modal.Body>Voulez-vous vraiment supprimer « {aSupprimer?.titre} » ? Cette action est irréversible.</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setASupprimer(null)}>Annuler</Button>
          <Button variant="danger" onClick={supprimer}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
