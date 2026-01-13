import { Font } from "@react-pdf/renderer";

// Register Inter font family for React-PDF
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "/fonts/inter/Inter-Regular.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "/fonts/inter/Inter-RegularItalic.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "/fonts/inter/Inter-Medium.ttf",
      fontWeight: 500,
      fontStyle: "normal",
    },
    {
      src: "/fonts/inter/Inter-MediumItalic.ttf",
      fontWeight: 500,
      fontStyle: "italic",
    },
    {
      src: "/fonts/inter/Inter-SemiBold.ttf",
      fontWeight: 600,
      fontStyle: "normal",
    },
    {
      src: "/fonts/inter/Inter-SemiBoldItalic.ttf",
      fontWeight: 600,
      fontStyle: "italic",
    },
    {
      src: "/fonts/inter/Inter-Bold.ttf",
      fontWeight: 700,
      fontStyle: "normal",
    },
    {
      src: "/fonts/inter/Inter-BoldItalic.ttf",
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

// Register Geist Mono font family for React-PDF
Font.register({
  family: "Geist Mono",
  fonts: [
    {
      src: "/fonts/geist-mono/GeistMono-Regular.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "/fonts/geist-mono/GeistMono-Medium.ttf",
      fontWeight: 500,
      fontStyle: "normal",
    },
    {
      src: "/fonts/geist-mono/GeistMono-SemiBold.ttf",
      fontWeight: 600,
      fontStyle: "normal",
    },
    {
      src: "/fonts/geist-mono/GeistMono-Bold.ttf",
      fontWeight: 700,
      fontStyle: "normal",
    },
  ],
});

// Register Cormorant Garamond font family for React-PDF (fancy/elegant style)
Font.register({
  family: "Cormorant Garamond",
  fonts: [
    {
      src: "/fonts/cormorant-garamond/CormorantGaramond-Regular.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "/fonts/cormorant-garamond/CormorantGaramond-Italic.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "/fonts/cormorant-garamond/CormorantGaramond-Medium.ttf",
      fontWeight: 500,
      fontStyle: "normal",
    },
    {
      src: "/fonts/cormorant-garamond/CormorantGaramond-SemiBold.ttf",
      fontWeight: 600,
      fontStyle: "normal",
    },
    {
      src: "/fonts/cormorant-garamond/CormorantGaramond-Bold.ttf",
      fontWeight: 700,
      fontStyle: "normal",
    },
  ],
});

// Disable hyphenation for cleaner text rendering
Font.registerHyphenationCallback((word) => [word]);

// Font family constants for use in styles
export const FONT_FAMILIES = {
  inter: "Inter",
  geistMono: "Geist Mono",
  cormorantGaramond: "Cormorant Garamond",
} as const;

export type FontFamily = (typeof FONT_FAMILIES)[keyof typeof FONT_FAMILIES];
