import axios from 'axios';

export const TOKEN_KEY = 'lg_token';

// Instance Axios unique utilisée par toute l'application
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Ajoute automatiquement le jeton JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Jeton expiré ou invalide : on prévient l'application (AuthContext déconnecte l'utilisateur)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new Event('lg:session-expiree'));
    }
    return Promise.reject(error);
  }
);

const TRADUCTIONS = {
  'No token': 'Veuillez vous connecter pour continuer.',
  'Invalid token': 'Votre session a expiré. Veuillez vous reconnecter.',
  Forbidden: "Vous n'avez pas les droits nécessaires pour cette action.",
  'User created': 'Compte créé.',
};

/** Transforme une erreur Axios en message clair pour l'utilisateur. */
export function messageErreur(error) {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') return 'Le serveur met trop de temps à répondre. Réessayez dans un instant.';
    return 'Impossible de joindre le serveur. Vérifiez votre connexion Internet ou réessayez plus tard.';
  }
  const { status, data } = error.response;
  // 502/503/504, ou 500 sans corps JSON (proxy de développement) : l'API est injoignable
  if ([502, 503, 504].includes(status) || (status >= 500 && !data?.error)) {
    return "Le serveur est momentanément indisponible. Vérifiez votre connexion ou réessayez dans quelques instants.";
  }
  if (Array.isArray(data?.errors) && data.errors.length) {
    return 'Données invalides : ' + [...new Set(data.errors.map((e) => e.path || e.param))].join(', ') + '.';
  }
  if (data?.error) return TRADUCTIONS[data.error] || data.error;
  if (status === 404) return 'Ressource introuvable.';
  if (status >= 500) return 'Erreur du serveur. Réessayez plus tard.';
  return 'Une erreur inattendue est survenue.';
}

export default api;
