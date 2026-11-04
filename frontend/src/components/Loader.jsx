import { Spinner } from 'react-bootstrap';

export default function Loader({ label = 'Chargement…' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" role="status" aria-live="polite">
      <Spinner animation="border" variant="primary" aria-hidden="true" />
      <span className="mt-2 text-muted-strong">{label}</span>
    </div>
  );
}
