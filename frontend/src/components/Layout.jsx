import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <a href="#contenu" className="skip-link">Aller au contenu principal</a>
      <Header />
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
