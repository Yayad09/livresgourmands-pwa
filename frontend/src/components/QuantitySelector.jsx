import { Button, InputGroup, Form } from 'react-bootstrap';

export default function QuantitySelector({ value, onChange, min = 1, max = 99, label = 'Quantité', size }) {
  const set = (v) => {
    const n = Math.max(min, Math.min(max, Number(v) || min));
    if (n !== value) onChange(n);
  };
  return (
    <InputGroup size={size} className="qty-selector" role="group" aria-label={label}>
      <Button variant="outline-secondary" onClick={() => set(value - 1)} disabled={value <= min} aria-label="Diminuer la quantité">
        <i className="bi bi-dash" aria-hidden="true"></i>
      </Button>
      <Form.Control
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(e) => set(e.target.value)}
        aria-label={label}
        className="text-center"
      />
      <Button variant="outline-secondary" onClick={() => set(value + 1)} disabled={value >= max} aria-label="Augmenter la quantité">
        <i className="bi bi-plus" aria-hidden="true"></i>
      </Button>
    </InputGroup>
  );
}
