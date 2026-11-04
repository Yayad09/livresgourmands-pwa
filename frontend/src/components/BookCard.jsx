import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { imageOuvrage, prix } from '../utils/format';
import StarRating from './StarRating';
import StockBadge from './StockBadge';

export default function BookCard({ ouvrage }) {
  const { addItem } = useCart();
  const epuise = Number(ouvrage.stock) <= 0;

  return (
    <Card className="book-card h-100">
      <Link to={`/ouvrages/${ouvrage.id}`} className="book-cover-link" tabIndex={-1} aria-hidden="true">
        <Card.Img variant="top" src={imageOuvrage(ouvrage)} alt="" loading="lazy" className={epuise ? 'is-epuise' : ''} />
      </Link>
      <Card.Body className="d-flex flex-column">
        {ouvrage.categorie && <span className="small text-uppercase category-label">{ouvrage.categorie}</span>}
        <Card.Title as="h3" className="h6 mt-1 mb-1">
          <Link to={`/ouvrages/${ouvrage.id}`} className="stretched-title">{ouvrage.titre}</Link>
        </Card.Title>
        <p className="small text-muted-strong mb-2">{ouvrage.auteur}</p>
        <div className="mb-2"><StarRating note={ouvrage.note_moyenne} size=".85rem" /></div>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold fs-5 price">{prix(ouvrage.prix)}</span>
            <StockBadge stock={ouvrage.stock} />
          </div>
          <Button
            variant={epuise ? 'outline-secondary' : 'primary'}
            className="w-100"
            disabled={epuise}
            onClick={() => addItem(ouvrage, 1)}
            aria-label={epuise ? `${ouvrage.titre} : épuisé` : `Ajouter ${ouvrage.titre} au panier`}
          >
            <i className={`bi ${epuise ? 'bi-x-circle' : 'bi-bag-plus'} me-2`} aria-hidden="true"></i>
            {epuise ? 'Épuisé' : 'Ajouter au panier'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
