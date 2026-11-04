import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protégée : redirige vers /connexion si l'utilisateur n'est pas connecté,
 * ou vers / si son rôle n'est pas autorisé.
 */
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname, message: 'Veuillez vous connecter pour accéder à cette page.' }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace state={{ refus: true }} />;
  return children || <Outlet />;
}
