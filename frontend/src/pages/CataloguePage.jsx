import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import BookBrowser from '../components/BookBrowser';

// Catalogue : mêmes filtres que l'accueil, mais synchronisés avec l'URL (?categorie=…&q=…)
export default function CataloguePage() {
  const [params, setParams] = useSearchParams();
  useEffect(() => { document.title = 'Catalogue | Livres Gourmands'; }, []);

  const filtres = { categorie: params.get('categorie') || '', q: params.get('q') || '' };
  const onChange = (patch) => {
    if (!('categorie' in patch) && !('q' in patch)) return;
    const next = new URLSearchParams(params);
    for (const k of ['categorie', 'q']) {
      if (k in patch) (patch[k] ? next.set(k, patch[k]) : next.delete(k));
    }
    setParams(next, { replace: true });
  };

  return (
    <Container className="py-4">
      <h1 className="font-display mb-4">Catalogue</h1>
      <BookBrowser titre="Tous nos livres" filtres={filtres} onFiltresChange={onChange} />
    </Container>
  );
}
