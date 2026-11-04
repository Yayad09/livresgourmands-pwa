import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GiftListPage from './pages/GiftListPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import { ROLES_DASHBOARD } from './utils/format';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Boutique publique */}
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogue" element={<CataloguePage />} />
          <Route path="ouvrages/:id" element={<ProductPage />} />
          <Route path="panier" element={<CartPage />} />
          <Route path="liste-cadeaux" element={<GiftListPage />} />
          <Route path="connexion" element={<LoginPage />} />
          <Route path="inscription" element={<RegisterPage />} />

          {/* Réservé aux clients connectés */}
          <Route element={<ProtectedRoute roles={['client']} />}>
            <Route path="commande" element={<CheckoutPage />} />
            <Route path="commande/confirmation" element={<ConfirmationPage />} />
            <Route path="mes-commandes" element={<MyOrdersPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Espace d'administration (routage protégé par rôle) */}
        <Route path="admin" element={<ProtectedRoute roles={ROLES_DASHBOARD}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="ouvrages" element={<AdminBooksPage />} />
          <Route element={<ProtectedRoute roles={['administrateur', 'gestionnaire']} />}>
            <Route path="commandes" element={<AdminOrdersPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['administrateur']} />}>
            <Route path="utilisateurs" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
