# TODO

## Problème critique: Multi-page Preview/PDF Sync

> **État actuel**: La preview HTML et le PDF généré utilisent des logiques de pagination différentes. Sur une facture simple (1 page), tout fonctionne. Sur une facture multi-page (beaucoup de line items), le contenu de chaque page peut différer entre preview et PDF.

### Pourquoi ça arrive

| Aspect | Preview HTML | PDF (React-PDF) |
|--------|--------------|-----------------|
| Pagination | `scrollHeight / contentHeightPerPage` | Algorithme Yoga interne |
| Page breaks | CSS clipping (`translateY`) | Props `wrap`, `break`, `fixed` |
| Résultat | Approximation | Réel |

### Solution recommandée

Implémenter un **système de blocs** (voir `PAGE_BREAKS.md` pour les détails):
1. Modéliser le document comme une séquence de blocs atomiques
2. Mesurer la hauteur de chaque bloc dans le DOM
3. Calculer les page breaks en JavaScript (même algo que React-PDF)
4. Rendre chaque page séparément avec son contenu

**Effort estimé**: 4-5 jours | **Précision attendue**: ~95%

---

## Tâches restantes

### Haute priorité

- [ ] **Multi-page sync** - Implémenter le système de blocs pour synchroniser preview/PDF
- [ ] **Layouts additionnels** - Créer les layouts Modern et Minimal (actuellement: Classic seulement)
- [ ] **Styles additionnels** - Ajouter plus de styles/thèmes (actuellement: Classic, Classic Mono, Elegant)

### Moyenne priorité

- [ ] **Sélecteur de layout** - UI pour choisir le layout dans le wizard
- [ ] **Sélecteur de style** - UI pour choisir le style/thème dans les settings
- [ ] **Quote vs Invoice** - Améliorer le support des devis (labels, dates)

### Basse priorité

- [ ] **Export formats** - Ajouter export PNG, CSV
- [ ] **Templates sauvegardés** - Sauvegarder/charger des templates
- [ ] **Prévisualisation mobile** - Améliorer le responsive

---

## Fichiers clés

| Fichier | Description |
|---------|-------------|
| `lib/invoice/pdf/invoice-pdf-document.tsx` | Composant principal du document |
| `components/invoice/preview/pdf-preview.tsx` | Preview avec carousel multi-page |
| `lib/invoice/layouts/` | Composants de layout (structure) |
| `lib/invoice/styles/` | Configurations de style (couleurs, fonts) |
| `PAGE_BREAKS.md` | Documentation détaillée du problème multi-page |
