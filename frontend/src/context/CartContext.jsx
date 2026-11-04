import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { messageErreur } from '../api/client';
import { panierApi } from '../api/services';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

/*
 * Panier global (Context API)
 * - État conservé dans localStorage => le panier survit à la fermeture du navigateur.
 * - Si un client est connecté, chaque opération est aussi synchronisée avec l'API
 *   (/api/panier). À la connexion, le panier local est fusionné avec celui du serveur.
 * Article : { ouvrage_id, titre, prix, image, stock, quantite, itemId? }  (itemId = id côté serveur)
 */
const CartContext = createContext(null);
const CART_KEY = 'lg_cart';

function lirePanier() {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const depuisServeur = (rows) =>
  rows.map((r) => ({
    ouvrage_id: r.ouvrage_id,
    titre: r.titre,
    prix: Number(r.prix_unitaire),
    image: r.image,
    stock: r.stock,
    quantite: r.quantite,
    itemId: r.id,
  }));

export function CartProvider({ children }) {
  const { user, isClient } = useAuth();
  const notify = useToast();
  const [items, setItems] = useState(lirePanier);
  const [syncing, setSyncing] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Persistance locale
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const rechargerServeur = useCallback(async () => {
    const rows = await panierApi.get();
    setItems(depuisServeur(rows));
  }, []);

  // Connexion d'un client : fusion panier local -> serveur, puis lecture du panier serveur
  const precedentUser = useRef(user?.id);
  useEffect(() => {
    const ancien = precedentUser.current;
    precedentUser.current = user?.id;
    if (!user) {
      if (ancien) setItems([]); // déconnexion : on vide le panier de l'appareil
      return;
    }
    if (!isClient) return;
    (async () => {
      setSyncing(true);
      try {
        const serveur = await panierApi.get();
        const dejaLa = new Set(serveur.map((r) => r.ouvrage_id));
        for (const it of itemsRef.current.filter((i) => !dejaLa.has(i.ouvrage_id))) {
          try {
            await panierApi.ajouter(it.ouvrage_id, it.quantite);
          } catch (e) {
            notify(`« ${it.titre} » n'a pas pu être ajouté : ${messageErreur(e)}`, 'warning');
          }
        }
        await rechargerServeur();
      } catch (e) {
        notify(`Synchronisation du panier impossible. ${messageErreur(e)}`, 'warning');
      } finally {
        setSyncing(false);
      }
    })();
  }, [user, isClient, notify, rechargerServeur]);

  const addItem = useCallback(async (ouvrage, quantite = 1) => {
    const stock = Number(ouvrage.stock);
    if (stock <= 0) {
      notify(`Désolé, « ${ouvrage.titre} » est épuisé.`, 'warning');
      return false;
    }
    const existant = itemsRef.current.find((i) => i.ouvrage_id === ouvrage.id);
    const total = (existant?.quantite || 0) + quantite;
    if (total > stock) {
      notify(`Stock insuffisant : il reste seulement ${stock} exemplaire(s) de « ${ouvrage.titre} ».`, 'warning');
      return false;
    }
    if (isClient) {
      try {
        await panierApi.ajouter(ouvrage.id, quantite);
        await rechargerServeur();
      } catch (e) {
        notify(messageErreur(e), 'danger');
        return false;
      }
    } else {
      setItems((prev) =>
        existant
          ? prev.map((i) => (i.ouvrage_id === ouvrage.id ? { ...i, quantite: total, stock } : i))
          : [...prev, { ouvrage_id: ouvrage.id, titre: ouvrage.titre, prix: Number(ouvrage.prix), image: ouvrage.image, stock, quantite }]
      );
    }
    notify(`« ${ouvrage.titre} » a été ajouté au panier.`);
    return true;
  }, [isClient, notify, rechargerServeur]);

  const updateQuantity = useCallback(async (ouvrageId, quantite) => {
    const item = itemsRef.current.find((i) => i.ouvrage_id === ouvrageId);
    if (!item || quantite < 1) return;
    if (quantite > item.stock) {
      notify(`Stock insuffisant : ${item.stock} exemplaire(s) disponible(s).`, 'warning');
      return;
    }
    const avant = itemsRef.current;
    setItems((prev) => prev.map((i) => (i.ouvrage_id === ouvrageId ? { ...i, quantite } : i)));
    if (isClient && item.itemId) {
      try {
        await panierApi.modifier(item.itemId, quantite);
      } catch (e) {
        setItems(avant); // annulation si le serveur refuse
        notify(messageErreur(e), 'danger');
      }
    }
  }, [isClient, notify]);

  const removeItem = useCallback(async (ouvrageId) => {
    const item = itemsRef.current.find((i) => i.ouvrage_id === ouvrageId);
    if (!item) return;
    const avant = itemsRef.current;
    setItems((prev) => prev.filter((i) => i.ouvrage_id !== ouvrageId));
    if (isClient && item.itemId) {
      try {
        await panierApi.retirer(item.itemId);
      } catch (e) {
        setItems(avant);
        notify(messageErreur(e), 'danger');
        return;
      }
    }
    notify(`« ${item.titre} » a été retiré du panier.`, 'info');
  }, [isClient, notify]);

  // Après une commande, le serveur désactive le panier : on vide aussi le panier local
  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    syncing,
    count: items.reduce((s, i) => s + i.quantite, 0),
    total: items.reduce((s, i) => s + i.quantite * i.prix, 0),
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }), [items, syncing, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
