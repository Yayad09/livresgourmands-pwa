import api from './client';

// Chaque fonction correspond à un endpoint de l'API REST (etape02/server.js)

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (nom, email, password) => api.post('/auth/register', { nom, email, password }).then((r) => r.data),
  me: () => api.get('/users/me').then((r) => r.data),
};

export const ouvragesApi = {
  list: (params = {}) => api.get('/ouvrages', { params }).then((r) => r.data),
  get: (id) => api.get(`/ouvrages/${id}`).then((r) => r.data),
  create: (data) => api.post('/ouvrages', data).then((r) => r.data),
  update: (id, data) => api.put(`/ouvrages/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/ouvrages/${id}`).then((r) => r.data),
  ajouterAvis: (id, note) => api.post(`/ouvrages/${id}/avis`, { note }).then((r) => r.data),
  ajouterCommentaire: (id, contenu) => api.post(`/ouvrages/${id}/commentaires`, { contenu }).then((r) => r.data),
};

export const categoriesApi = {
  list: () => api.get('/categories').then((r) => r.data),
};

export const panierApi = {
  get: () => api.get('/panier').then((r) => r.data),
  ajouter: (ouvrage_id, quantite) => api.post('/panier/items', { ouvrage_id, quantite }).then((r) => r.data),
  modifier: (itemId, quantite) => api.put(`/panier/items/${itemId}`, { quantite }).then((r) => r.data),
  retirer: (itemId) => api.delete(`/panier/items/${itemId}`).then((r) => r.data),
};

export const commandesApi = {
  creer: (data) => api.post('/commandes', data).then((r) => r.data),
  mesCommandes: () => api.get('/commandes').then((r) => r.data),
  toutes: () => api.get('/admin/commandes').then((r) => r.data),
  changerStatut: (id, statut) => api.put(`/commandes/${id}/status`, { statut }).then((r) => r.data),
};

export const usersApi = {
  list: () => api.get('/users').then((r) => r.data),
};

export const listesApi = {
  mesListes: () => api.get('/listes').then((r) => r.data),
  creer: (nom) => api.post('/listes', { nom }).then((r) => r.data),
  ajouterItem: (listeId, ouvrage_id, quantite = 1) =>
    api.post(`/listes/${listeId}/items`, { ouvrage_id, quantite }).then((r) => r.data),
  parCode: (code) => api.get(`/listes/${encodeURIComponent(code)}`).then((r) => r.data),
};
