import { Carousel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    titre: 'Cuisinez comme un chef',
    texte: 'Des livres de recettes pour tous les niveaux, du premier œuf au plat signature.',
    cta: 'Découvrir le catalogue',
    to: '/catalogue',
    image: '/images/ouvrage-1.svg',
    theme: 'slide-terracotta',
  },
  {
    titre: 'Le monde dans votre assiette',
    texte: "Asie, Afrique, Italie : voyagez sans quitter votre cuisine.",
    cta: 'Cuisine du monde',
    to: '/catalogue?categorie=4',
    image: '/images/ouvrage-7.svg',
    theme: 'slide-green',
  },
  {
    titre: 'Offrez la gourmandise',
    texte: 'Créez une liste de cadeaux et partagez-la avec vos proches grâce à un code personnel.',
    cta: 'Créer ma liste',
    to: '/liste-cadeaux',
    image: '/images/ouvrage-6.svg',
    theme: 'slide-plum',
  },
];

export default function HeroCarousel() {
  return (
    <Carousel className="hero-carousel" interval={6000} pause="hover" aria-label="À la une">
      {SLIDES.map((s) => (
        <Carousel.Item key={s.titre} className={s.theme}>
          <div className="container hero-inner">
            <div className="hero-text">
              <h2 className="display-6 font-display">{s.titre}</h2>
              <p className="lead">{s.texte}</p>
              <Button as={Link} to={s.to} variant="light" size="lg">{s.cta}</Button>
            </div>
            <img src={s.image} alt="" className="hero-book d-none d-md-block" />
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
