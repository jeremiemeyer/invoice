# PRD : Invoice PDF Generator v2

## Vision

Générateur de factures avec **pixel-perfect WYSIWYG** : preview HTML temps réel identique au PDF généré.

---

## Approche technique

### Dual-rendering avec source unique

```
Composants React-PDF natifs (View, Text, Page, etc.)
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
HTML Preview       PDF Download
(react-pdf-html)   (React-PDF natif)
```

**Librairie:** `packages/react-pdf-html-main` (fork local de `@rawwee/react-pdf-html`)

**Principe:**
- Écrire les layouts avec `<View>`, `<Text>`, `<Page>` de React-PDF
- Preview : `isHtml=true` → rendu HTML/CSS
- Download : `isHtml=false` → génération PDF client-side

---

## Architecture des données

```
InvoiceFormState (données)
        ↓
    Layout (structure React-PDF)
        ↓
    Theme (tokens : couleurs, fonts, spacing)
```

### Fichiers clés à créer/modifier

| Fichier | Description |
|---------|-------------|
| `lib/invoice/layouts/` | Composants layout (Classic, Modern, Minimal) |
| `lib/invoice/themes/` | Configurations visuelles |
| `lib/invoice/pdf/invoice-pdf.tsx` | Composant principal qui assemble layout + theme |
| `components/invoice/preview/pdf-preview.tsx` | Preview HTML avec carousel multi-page |

### Génération PDF (100% client-side)

```tsx
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

const handleDownload = async () => {
  const blob = await pdf(<InvoicePdf invoice={invoice} />).toBlob();
  saveAs(blob, `${invoice.invoiceNumber}.pdf`);
};
```

**Pas de route API nécessaire** - tout se fait dans le navigateur.

---

## Scope v1

### In
- 3 layouts hardcodés (Classic, Modern, Minimal)
- 4 themes hardcodés
- Country presets (US, France)
- Preview temps réel avec **pagination carousel**
- PDF 100% client-side
- 2 langues (EN, FR)

### Out (v2+)
- Sauvegarde DB
- Customisation UI avancée
- Génération IA de layouts

---

## Challenges techniques

### 1. Fonts WYSIWYG

**Problème:** React-PDF charge les fonts via `Font.register()`, HTML via CSS

**Solution:**
```tsx
// PDF : enregistrer les fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
    // ...
  ],
});

// HTML : charger via Next.js font optimization
import { Inter } from 'next/font/google';
```

### 2. Unités et scaling (à vérifier)

**Question:** React-PDF utilise des points (72 DPI), HTML des pixels (96 DPI)

**À tester:** Le fork `react-pdf-html` passe les styles directement sans conversion.
Il faut vérifier si une conversion 96/72 est nécessaire ou si ça fonctionne tel quel.

**Action:** Tester avec un rectangle de 100pt et mesurer s'il fait bien 100px ou 133px en HTML.

### 3. Multi-page : Pagination Carousel

**Problème:** React-PDF crée plusieurs `<Page>` automatiquement, mais la preview HTML doit les afficher

**Solution v1:** Carousel vertical
```
┌─────────────────────────────────────────┐
│                                         │
│         ┌───────────────────┐           │
│         │                   │           │
│         │      Page 1       │           │
│         │     (active)      │           │
│         │                   │           │
│         └───────────────────┘           │
│              ● ○ ○                      │
│         ┌───────────────────┐           │
│         │      Page 2       │ ←─ miniature cliquable
│         │    (smaller)      │           │
│         └───────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

**Implémentation:**
- Chaque `<Page>` du layout est rendu séparément
- La page active est affichée en grand
- Les pages suivantes sont en miniature **en dessous**
- Clic sur une miniature → switch de page active
- Points indicateurs entre les pages pour la navigation

---

## Plan d'implémentation

### Phase 1 : Setup (1-2 jours)
1. Intégrer `packages/react-pdf-html-main` comme dépendance locale
2. Ajouter `@react-pdf/renderer` et `file-saver`
3. Setup fonts (fichiers TTF dans `/public/fonts/`)
4. Créer composant `InvoicePdf` basique pour valider le dual-rendering
5. **Tester le scaling** : créer un rectangle 100pt et vérifier la taille en HTML

### Phase 2 : Layout Classic (2-3 jours)
1. Porter le layout actuel vers composants React-PDF (`View`, `Text`, etc.)
2. Créer le système de tokens (spacing, colors, fonts)
3. Implémenter la preview HTML simple (1 page)
4. Valider le WYSIWYG (comparaison visuelle)

### Phase 3 : Multi-page & Carousel (1-2 jours)
1. Implémenter le carousel de pagination
2. Gérer le split automatique quand contenu dépasse 1 page
3. Ajouter les miniatures et indicateurs

### Phase 4 : Themes & Layouts (2-3 jours)
1. Créer 4 themes (Default, Blue, Green, Professional)
2. Créer layouts Modern et Minimal
3. Intégrer les sélecteurs dans le wizard

### Phase 5 : Intégration finale (1-2 jours)
1. Connecter au state existant (`useInvoice`)
2. Implémenter le download PDF client-side
3. Supprimer tout le code Puppeteer
4. Tests et polish

---

## Types clés

```typescript
// Theme tokens
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    border: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    page: number;      // Marge page
    section: number;   // Entre sections
    item: number;      // Entre éléments
  };
}

// Layout component signature
type LayoutComponent = React.FC<{
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
  theme: Theme;
  translations: Translations;
}>;

// Registry
interface LayoutDefinition {
  id: string;
  name: string;
  component: LayoutComponent;
}
```

---

## Vérification

### Tests manuels
1. Créer une facture avec tous les champs remplis
2. Comparer visuellement preview HTML vs PDF téléchargé
3. Tester chaque combinaison layout × theme
4. Vérifier les caractères spéciaux (accents, €, etc.)
5. Tester avec 20+ line items pour valider le multi-page

### Critères de succès
- [ ] Preview update < 200ms
- [ ] PDF identique visuellement à la preview
- [ ] PDF < 50KB pour facture standard
- [ ] Génération PDF < 1s
- [ ] Carousel multi-page fluide

---

## Risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Différences subtiles HTML/PDF | Moyen | Tests visuels systématiques, ajuster le fork si nécessaire |
| Scaling 72/96 DPI incorrect | Moyen | Tester en Phase 1, ajuster le fork si besoin |
| Performance avec beaucoup d'items | Faible | Virtualisation si > 50 items |
| Fonts non chargées au moment du PDF | Moyen | Preload fonts, vérifier avant génération |

---

## Fichiers à supprimer

- `lib/pdf/html-wrapper.ts`
- `lib/pdf/render-to-html.tsx`
- `app/api/generate-pdf/route.ts` (route entière)

## Dépendances à ajouter

```bash
pnpm add @react-pdf/renderer file-saver
pnpm add -D @types/file-saver
```

## Dépendances à supprimer

```bash
pnpm remove puppeteer-core @sparticuz/chromium-min