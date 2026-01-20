# Page Breaks: Synchronisation Preview/PDF

## Problème

L'application utilise un système de dual-rendering avec `@invoice-jm/react-pdf-html`:
- **Mode HTML**: Les composants React-PDF (`View`, `Text`, `Page`) sont rendus comme des `<div>` pour la preview
- **Mode PDF**: Les composants sont passés à React-PDF pour générer le PDF

### Le gap

| Aspect | Preview HTML | PDF (React-PDF) |
|--------|--------------|-----------------|
| **Pagination** | `scrollHeight / contentHeightPerPage` | Algorithme Yoga-based interne |
| **Page breaks** | CSS clipping (`translateY`) | `wrap`, `break`, `fixed` props |
| **Résultat** | Approximation | Réel |

**Conséquence**: Le contenu affiché sur chaque page de la preview peut ne pas correspondre au PDF final, surtout avec beaucoup de line items.

## Propriétés React-PDF pour contrôler les page breaks

| Propriété | Type | Description |
|-----------|------|-------------|
| `wrap` | boolean | `false` = l'élément ne peut pas être coupé entre pages |
| `break` | boolean | `true` = force un saut de page avant cet élément |
| `fixed` | boolean | `true` = l'élément apparaît sur toutes les pages |
| `minPresenceAhead` | number | Réserve de l'espace pour garder des siblings ensemble (buggy) |

### Usage actuel dans l'application

```tsx
// Chaque line item ne peut pas être coupé
<View wrap={false}>
  <LineItem />
</View>

// La section totaux reste ensemble
<View wrap={false}>
  <Subtotal />
  <Tax />
  <Total />
</View>

// Le footer de page apparaît sur chaque page
<Text fixed render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
```

---

## Options d'implémentation

### Option A: Approximation améliorée

**Principe**: Améliorer les calculs de hauteur avec des constantes précises.

```typescript
const SECTION_HEIGHTS = {
  topBar: 56,
  fromTo: 180,
  lineItemHeader: 40,
  lineItemRow: 52,
  notesTotals: 160,
  payment: 80,
};
```

| Avantages | Inconvénients |
|-----------|---------------|
| Simple à implémenter | ~15% de différence possible |
| Rapide (pas de calcul) | Ne gère pas les descriptions multi-lignes |
| Pas de refactoring majeur | Maintenance manuelle des constantes |

**Effort**: 1-2 jours | **Précision**: ~85%

---

### Option B: Système de blocs avec pré-calcul (Recommandé)

**Principe**: Modéliser le document comme une séquence de "blocs" atomiques et calculer la pagination en JavaScript.

```
InvoiceFormState
       ↓
┌──────────────────────────┐
│ Block Generator          │
│ - header, fromTo,        │
│ - lineItem[], notesTotals│
│ - payment                │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ Height Measurement       │
│ - Render invisible DOM   │
│ - Measure offsetHeight   │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ Page Break Calculator    │
│ - Greedy algorithm       │
│ - Respect canBreak=false │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ Page-by-Page Rendering   │
│ - Each page = subset     │
│ - Footer with X / Y      │
└──────────────────────────┘
```

#### Types de blocs

| Type | canBreak | Hauteur estimée |
|------|----------|-----------------|
| `header` | false | 56px |
| `fromTo` | false | 150-200px |
| `lineItemsHeader` | false | 40px |
| `lineItem` | false | 40-100px (variable) |
| `notesTotals` | false | 100-160px |
| `payment` | false | 60-100px |

#### Algorithme de pagination

```typescript
function calculatePageBreaks(blocks, heights, pageHeight, footerHeight) {
  const usableHeight = pageHeight - footerHeight;
  const pages = [];
  let currentPage = [];
  let currentHeight = 0;

  for (const block of blocks) {
    const blockHeight = heights.get(block.id);

    // Si le bloc ne tient pas et ne peut pas être coupé
    if (!block.canBreak && currentHeight + blockHeight > usableHeight) {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
    }

    currentPage.push(block);
    currentHeight += blockHeight;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}
```

| Avantages | Inconvénients |
|-----------|---------------|
| ~95% de précision | Refactoring important |
| Gère les descriptions longues | Mesure DOM = léger overhead |
| Interactivité préservée | Complexité accrue |

**Effort**: 4-5 jours | **Précision**: ~95%

---

### Option C: PDF-First

**Principe**: Générer le PDF en arrière-plan et utiliser les pages réelles pour la preview.

```typescript
// Dans un Web Worker
const pdfDoc = await pdf(<InvoicePdf />).toBlob();
const pages = await extractPagesAsImages(pdfDoc);
// Afficher les images dans le carousel
```

| Avantages | Inconvénients |
|-----------|---------------|
| 100% précis | Lent (500ms+) |
| Pas de logique dupliquée | Perte de l'interactivité |
| Simple conceptuellement | UX dégradée (pas de live preview) |

**Effort**: 3-4 jours | **Précision**: 100%

---

## Recommandation

**Option B** est recommandée car elle offre le meilleur équilibre:
- Précision suffisante (~95%)
- Préserve l'interactivité (overlays cliquables)
- Performance acceptable (<200ms)
- Maintenable (logique explicite)

### Fichiers à créer

| Fichier | Description |
|---------|-------------|
| `lib/invoice/pdf/blocks.ts` | Types Block, PageLayout, generateBlocks() |
| `lib/invoice/pdf/page-break-calculator.ts` | Algorithme de pagination |
| `lib/invoice/pdf/use-block-heights.ts` | Hook de mesure des hauteurs |

### Fichiers à modifier

| Fichier | Modifications |
|---------|---------------|
| `lib/invoice/pdf/invoice-pdf-document.tsx` | Support rendu par blocs |
| `components/invoice/preview/pdf-preview.tsx` | Intégration système de blocs |

---

## Références

- [React-PDF Advanced Features](https://react-pdf.org/advanced)
- [React-PDF GitHub - Page break issues](https://github.com/diegomura/react-pdf/issues?q=page+break)
- [Yoga Layout Engine](https://yogalayout.com/)
