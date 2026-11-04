import { useState } from 'react';
import { Nav, Offcanvas, Button } from 'react-bootstrap';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/format';

// Liens du menu latéral, filtrés selon le rôle (mêmes règles que l'API)
const LIENS = [
  { to: '/admin', end: true, icon: 'bi-speedometer2', label: 'Tableau de bord' },
  { to: '/admin/ouvrages', icon: 'bi-book', label: 'Ouvrages' },
  { to: '/admin/commandes', icon: 'bi-receipt', label: 'Commandes', roles: ['administrateur', 'gestionnaire'] },
  { to: '/admin/utilisateurs', icon: 'bi-people', label: 'Utilisateurs', roles: ['administrateur'] },
];

function Menu({ onNavigate }) {
  const { user } = useAuth();
  return (
    <Nav className="flex-column gap-1" as="nav" aria-label="Menu administration">
      {LIENS.filter((l) => !l.roles || l.roles.includes(user.role)).map((l) => (
        <Nav.Link key={l.to} as={NavLink} to={l.to} end={l.end} onClick={onNavigate} className="admin-link">
          <i className={`bi ${l.icon} me-2`} aria-hidden="true"></i>{l.label}
        </Nav.Link>
      ))}
      <hr className="border-light" />
      <Nav.Link as={Link} to="/" className="admin-link" onClick={onNavigate}>
        <i className="bi bi-shop me-2" aria-hidden="true"></i>Voir la boutique
      </Nav.Link>
    </Nav>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-shell">
      <a href="#admin-contenu" className="skip-link">Aller au contenu</a>
      <aside className="admin-sidebar d-none d-lg-flex flex-column">
        <Link to="/admin" className="admin-brand"><img src="/favicon.svg" width="32" height="32" alt="" /> Administration</Link>
        <Menu />
      </aside>

      <Offcanvas show={open} onHide={() => setOpen(false)} className="admin-sidebar" aria-labelledby="titre-menu-admin">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title id="titre-menu-admin">Administration</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body><Menu onNavigate={() => setOpen(false)} /></Offcanvas.Body>
      </Offcanvas>

      <div className="admin-main">
        <header className="admin-topbar">
          <Button variant="outline-secondary" className="d-lg-none" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
            <i className="bi bi-list" aria-hidden="true"></i>
          </Button>
          <span className="ms-auto small">
            <i className="bi bi-person-circle me-1" aria-hidden="true"></i>{user.nom} <span className="text-muted-strong">({ROLES[user.role]})</span>
          </span>
          <Button size="sm" variant="outline-primary" onClick={() => { logout(); navigate('/'); }}>Déconnexion</Button>
        </header>
        <main id="admin-contenu" className="p-3 p-md-4" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
