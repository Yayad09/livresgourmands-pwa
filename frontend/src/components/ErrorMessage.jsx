import { Alert, Button } from 'react-bootstrap';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <Alert variant="danger" className="d-flex flex-wrap align-items-center gap-2" role="alert">
      <i className="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
      <span className="flex-grow-1">{message}</span>
      {onRetry && <Button size="sm" variant="outline-danger" onClick={onRetry}>Réessayer</Button>}
    </Alert>
  );
}
