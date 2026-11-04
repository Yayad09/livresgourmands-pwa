import { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';

const VIDE = { titre: '', auteur: '', isbn: '', description: '', prix: '', stock: '', categorie_id: '', image: '' };

// Formulaire d'ajout / modification d'un ouvrage
export default function BookFormModal({ show, ouvrage, categories, onHide, onSave }) {
  const [form, setForm] = useState(VIDE);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const edition = !!ouvrage;

  useEffect(() => {
    if (show) {
      setForm(ouvrage ? { ...VIDE, ...ouvrage, description: ouvrage.description || '', image: ouvrage.image || '' } : VIDE);
      setValidated(false);
      setError('');
    }
  }, [show, ouvrage]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setValidated(true);
    if (!e.currentTarget.checkValidity()) return;
    setEnvoi(true);
    setError('');
    try {
      await onSave({
        titre: form.titre.trim(),
        auteur: form.auteur.trim(),
        isbn: form.isbn.trim(),
        description: form.description.trim(),
        prix: Number(form.prix),
        stock: Number(form.stock),
        categorie_id: Number(form.categorie_id),
        image: form.image.trim() || undefined,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="titre-form-ouvrage">
      <Form noValidate validated={validated} onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title id="titre-form-ouvrage">{edition ? `Modifier « ${ouvrage.titre} »` : 'Ajouter un ouvrage'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col md={8}>
              <Form.Group controlId="f-titre">
                <Form.Label>Titre *</Form.Label>
                <Form.Control required maxLength={200} value={form.titre} onChange={set('titre')} />
                <Form.Control.Feedback type="invalid">Titre obligatoire.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="f-isbn">
                <Form.Label>ISBN *</Form.Label>
                <Form.Control required maxLength={20} value={form.isbn} onChange={set('isbn')} disabled={edition} />
                {edition && <Form.Text>L'ISBN ne peut pas être modifié.</Form.Text>}
                <Form.Control.Feedback type="invalid">ISBN obligatoire.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="f-auteur">
                <Form.Label>Auteur *</Form.Label>
                <Form.Control required maxLength={100} value={form.auteur} onChange={set('auteur')} />
                <Form.Control.Feedback type="invalid">Auteur obligatoire.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="f-categorie">
                <Form.Label>Catégorie *</Form.Label>
                <Form.Select required value={form.categorie_id} onChange={set('categorie_id')}>
                  <option value="">Choisir…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">Choisissez une catégorie.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group controlId="f-prix">
                <Form.Label>Prix ($) *</Form.Label>
                <Form.Control required type="number" min="0" step="0.01" value={form.prix} onChange={set('prix')} />
                <Form.Control.Feedback type="invalid">Prix ≥ 0.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group controlId="f-stock">
                <Form.Label>Stock *</Form.Label>
                <Form.Control required type="number" min="0" step="1" value={form.stock} onChange={set('stock')} />
                <Form.Control.Feedback type="invalid">Stock entier ≥ 0.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="f-image">
                <Form.Label>Image (URL)</Form.Label>
                <Form.Control value={form.image} onChange={set('image')} placeholder="/images/ouvrage-1.svg" />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="f-description">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={4} value={form.description} onChange={set('description')} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>Annuler</Button>
          <Button type="submit" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
