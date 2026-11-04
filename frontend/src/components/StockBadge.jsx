import { Badge } from 'react-bootstrap';

export default function StockBadge({ stock }) {
  const s = Number(stock);
  if (s <= 0) return <Badge bg="secondary"><i className="bi bi-x-circle me-1" aria-hidden="true"></i>Épuisé</Badge>;
  if (s <= 5) return <Badge bg="warning" text="dark"><i className="bi bi-exclamation-circle me-1" aria-hidden="true"></i>Plus que {s} en stock</Badge>;
  return <Badge bg="success"><i className="bi bi-check-circle me-1" aria-hidden="true"></i>En stock</Badge>;
}
