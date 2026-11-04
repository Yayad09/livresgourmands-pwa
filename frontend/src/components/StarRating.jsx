// Affichage d'une note sur 5 (lisible par les lecteurs d'écran)
export default function StarRating({ note, size = '1rem' }) {
  if (note == null) return <span className="small text-muted-strong">Aucun avis</span>;
  const n = Math.round(Number(note) * 2) / 2;
  return (
    <span className="stars" role="img" aria-label={`Note : ${Number(note).toFixed(1)} sur 5`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} aria-hidden="true" className={`bi ${n >= i ? 'bi-star-fill' : n >= i - 0.5 ? 'bi-star-half' : 'bi-star'}`}></i>
      ))}
    </span>
  );
}
