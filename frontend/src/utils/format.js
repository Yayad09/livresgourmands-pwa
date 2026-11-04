const money = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' });
export const prix = (n) => money.format(Number(n) || 0);

export const dateFr = (d) =>
  d ? new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export const imageOuvrage = (o) => o?.image || '/images/placeholder.svg';

export const STATUTS = {
  en_cours: { label: 'En cours', bg: 'warning', text: 'dark' },
  payee: { label: 'Payée', bg: 'info', text: 'dark' },
  expediee: { label: 'Expédiée', bg: 'success' },
  annulee: { label: 'Annulée', bg: 'secondary' },
};

export const ROLES = {
  client: 'Client',
  editeur: 'Éditeur',
  gestionnaire: 'Gestionnaire',
  administrateur: 'Administrateur',
};

// Rôles ayant accès au tableau de bord
export const ROLES_DASHBOARD = ['administrateur', 'gestionnaire', 'editeur'];
