import { useEffect, useState } from 'react';
import { Container, Nav, Navbar, NavDropdown, Badge, Form, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoriesApi } from '../api/services';
import { ROLES_DASHBOARD } from '../utils/format';

export default function Header() {
  const { user, isClient, hasRole, logout } = useAuth();
  const { count } = useCart();
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  const rechercher = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/catalogue?q=${encodeURIComponent(q.trim())}` : '/catalogue');
  };

  return (
    <header>
      <Navbar expand="lg" className="lg-navbar shadow-sm" sticky="top" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <img src="/favicon.svg" width="36" height="36" alt="" />
            <span className="brand-text">Livres <span>Gourmands</span></span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="nav-principale" label="Ouvrir le menu" />
          <Navbar.Collapse id="nav-principale">
            <Nav className="me-auto" as="nav" aria-label="Navigation principale">
              <Nav.Link as={NavLink} to="/" end eventKey="accueil">Accueil</Nav.Link>
              <NavDropdown title="Catégories" id="menu-categories">
                <NavDropdown.Item as={Link} to="/catalogue">Tous les livres</NavDropdown.Item>
                <NavDropdown.Divider />
                {categories.map((c) => (
                  <NavDropdown.Item key={c.id} as={Link} to={`/catalogue?categorie=${c.id}`}>{c.nom}</NavDropdown.Item>
                ))}
              </NavDropdown>
              <Nav.Link as={NavLink} to="/liste-cadeaux" eventKey="cadeaux">Listes de cadeaux</Nav.Link>
            </Nav>

            <Form className="d-flex my-2 my-lg-0 me-lg-3" role="search" onSubmit={rechercher}>
              <Form.Control
                type="search"
                placeholder="Titre ou auteur…"
                aria-label="Rechercher un livre"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                size="sm"
              />
              <Button type="submit" variant="outline-primary" size="sm" className="ms-1" aria-label="Lancer la recherche">
                <i className="bi bi-search" aria-hidden="true"></i>
              </Button>
            </Form>

            <Nav className="align-items-lg-center">
              <Nav.Link as={NavLink} to="/panier" eventKey="panier" aria-label={`Panier, ${count} article(s)`}>
                <i className="bi bi-bag fs-5" aria-hidden="true"></i>
                <span className="d-lg-none ms-2">Panier</span>
                {count > 0 && <Badge bg="primary" pill className="ms-1">{count}</Badge>}
              </Nav.Link>
              {user ? (
                <NavDropdown
                  align="end"
                  id="menu-compte"
                  title={<><i className="bi bi-person-circle me-1" aria-hidden="true"></i>{user.nom}</>}
                >
                  {isClient && <NavDropdown.Item as={Link} to="/mes-commandes">Mes commandes</NavDropdown.Item>}
                  {isClient && <NavDropdown.Item as={Link} to="/liste-cadeaux">Mes listes de cadeaux</NavDropdown.Item>}
                  {hasRole(...ROLES_DASHBOARD) && <NavDropdown.Item as={Link} to="/admin">Tableau de bord</NavDropdown.Item>}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => { logout(); navigate('/'); }}>Se déconnecter</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={NavLink} to="/connexion" eventKey="connexion">
                  <i className="bi bi-person me-1" aria-hidden="true"></i>Se connecter
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
