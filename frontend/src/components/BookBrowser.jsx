import { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Col, Form, Button, ButtonGroup } from 'react-bootstrap';
import { categoriesApi, ouvragesApi } from '../api/services';
import { messageErreur } from '../api/client';
import BookCard from './BookCard';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';

const TRIS = {
  recent: { label: 'Nouveautés', fn: () => 0 },
  'prix-asc': { label: 'Prix croissant', fn: (a, b) => a.prix - b.prix },
  'prix-desc': { label: 'Prix décroissant', fn: (a, b) => b.prix - a.prix },
  titre: { label: 'Titre (A-Z)', fn: (a, b) => a.titre.localeCompare(b.titre, 'fr') },
  note: { label: 'Mieux notés', fn: (a, b) => (b.note_moyenne || 0) - (a.note_moyenne || 0) },
};

/**
 * Liste des ouvrages avec filtres dynamiques (catégorie, recherche, prix, disponibilité, tri).
 * Les ouvrages viennent de GET /api/ouvrages ; le filtrage se fait instantanément côté client.
 * `filtres` / `onFiltresChange` permettent de synchroniser avec l'URL (page Catalogue).
 */
export default function BookBrowser({ filtres, onFiltresChange, titre = 'Nos livres', titreId = 'titre-livres' }) {
  const [ouvrages, setOuvrages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [local, setLocal] = useState({ categorie: '', q: '', tri: 'recent', dispo: false, prixMax: '' });

  const f = filtres ? { ...local, ...filtres } : local;
  const setF = (patch) => {
    setLocal((l) => ({ ...l, ...patch }));
    onFiltresChange?.(patch);
  };

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [o, c] = await Promise.all([ouvragesApi.list(), categoriesApi.list()]);
      setOuvrages(o.map((x) => ({ ...x, prix: Number(x.prix), stock: Number(x.stock) })));
      setCategories(c);
    } catch (e) {
      setError(`Impossible de charger les livres. ${messageErreur(e)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const prixPlafond = useMemo(() => Math.ceil(Math.max(0, ...ouvrages.map((o) => o.prix))), [ouvrages]);

  const resultats = useMemo(() => {
    const q = (f.q || '').toLowerCase().trim();
    return ouvrages
      .filter((o) => !f.categorie || String(o.categorie_id) === String(f.categorie))
      .filter((o) => !q || o.titre.toLowerCase().includes(q) || o.auteur.toLowerCase().includes(q))
      .filter((o) => !f.dispo || o.stock > 0)
      .filter((o) => !f.prixMax || o.prix <= Number(f.prixMax))
      .sort(TRIS[f.tri]?.fn || TRIS.recent.fn);
  }, [ouvrages, f.categorie, f.q, f.dispo, f.prixMax, f.tri]);

  const reinitialiser = () => setF({ categorie: '', q: '', tri: 'recent', dispo: false, prixMax: '' });

  return (
    <section aria-labelledby={titreId}>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <h2 id={titreId} className="h3 font-display mb-0">{titre}</h2>
        {!loading && !error && (
          <span className="text-muted-strong small" aria-live="polite">{resultats.length} livre(s) trouvé(s)</span>
        )}
      </div>

      {/* Filtres par catégorie (pastilles) */}
      <div className="category-pills mb-3" role="group" aria-label="Filtrer par catégorie">
        <ButtonGroup className="flex-wrap gap-2">
          <Button size="sm" variant={!f.categorie ? 'primary' : 'outline-primary'} aria-pressed={!f.categorie} onClick={() => setF({ categorie: '' })}>
            Toutes
          </Button>
          {categories.map((c) => {
            const actif = String(f.categorie) === String(c.id);
            return (
              <Button key={c.id} size="sm" variant={actif ? 'primary' : 'outline-primary'} aria-pressed={actif} onClick={() => setF({ categorie: String(c.id) })}>
                {c.nom}
              </Button>
            );
          })}
        </ButtonGroup>
      </div>

      <Form className="filters-bar p-3 mb-4" onSubmit={(e) => e.preventDefault()}>
        <Row className="g-3 align-items-end">
          <Col xs={12} md={4}>
            <Form.Label htmlFor="filtre-q" className="small fw-semibold">Recherche</Form.Label>
            <Form.Control id="filtre-q" type="search" placeholder="Titre ou auteur" value={f.q} onChange={(e) => setF({ q: e.target.value })} />
          </Col>
          <Col xs={6} md={3}>
            <Form.Label htmlFor="filtre-tri" className="small fw-semibold">Trier par</Form.Label>
            <Form.Select id="filtre-tri" value={f.tri} onChange={(e) => setF({ tri: e.target.value })}>
              {Object.entries(TRIS).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
            </Form.Select>
          </Col>
          <Col xs={6} md={3}>
            <Form.Label htmlFor="filtre-prix" className="small fw-semibold">
              Prix max : {f.prixMax ? `${f.prixMax} $` : 'tous'}
            </Form.Label>
            <Form.Range id="filtre-prix" min={0} max={prixPlafond || 100} step={1}
              value={f.prixMax || prixPlafond || 100}
              onChange={(e) => setF({ prixMax: Number(e.target.value) >= prixPlafond ? '' : e.target.value })} />
          </Col>
          <Col xs={12} md={2} className="d-flex flex-md-column gap-2 justify-content-between">
            <Form.Check type="switch" id="filtre-dispo" label="En stock" checked={!!f.dispo} onChange={(e) => setF({ dispo: e.target.checked })} />
            <Button variant="link" size="sm" className="p-0 text-start" onClick={reinitialiser}>Réinitialiser</Button>
          </Col>
        </Row>
      </Form>

      {loading && <Loader label="Chargement des livres…" />}
      <ErrorMessage message={error} onRetry={charger} />

      {!loading && !error && resultats.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-search display-5 text-muted-strong" aria-hidden="true"></i>
          <p className="mt-3">Aucun livre ne correspond à vos critères.</p>
          <Button variant="outline-primary" onClick={reinitialiser}>Voir tous les livres</Button>
        </div>
      )}

      <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
        {resultats.map((o) => (
          <Col key={o.id}><BookCard ouvrage={o} /></Col>
        ))}
      </Row>
    </section>
  );
}
