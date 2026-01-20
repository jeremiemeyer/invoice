# @invoice-jm/react-pdf-html

Local fork of [react-pdf-html](https://github.com/josippapez/react-pdf-html) by Josip Papež.

## Why a local fork?

This package provides dual-rendering capabilities: the same React components can render as HTML (for preview) or as PDF (for download). We maintain a local copy to:

- Add custom modifications for our specific use case
- Have full control over the rendering behavior
- Avoid dependency on external package updates

## Original package

- **Repository**: https://github.com/josippapez/react-pdf-html
- **Author**: Josip Papež
- **License**: MIT

## Local modifications

- Added `setIsHtmlMode()` and `getIsHtmlMode()` for direct mode control without hooks
- Adjusted default styles for better compatibility with our layouts

## Usage

```tsx
import { Document, Page, View, Text, setIsHtmlMode } from "@invoice-jm/react-pdf-html";

// For HTML preview
setIsHtmlMode(true);

// For PDF generation
setIsHtmlMode(false);
```

## License

MIT (same as original)
