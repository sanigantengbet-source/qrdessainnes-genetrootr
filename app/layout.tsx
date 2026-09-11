import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'QR Design Generator - Modern Neo-Brutalist Visual QR Code Studio',
  description: 'Professional Neo-Brutalist QR Code generator with 100+ visual QR styles, 100+ modern QR card themes (QRIS, fluid waves, geometric, standees), live canvas preview, and high-resolution exports.',
  openGraph: {
    title: 'QR Design Generator - Modern Neo-Brutalist Visual QR Code Studio',
    description: 'Professional Neo-Brutalist QR Code generator with 100+ visual QR styles, 100+ modern QR card themes (QRIS, fluid waves, geometric, standees), live canvas preview, and high-resolution exports.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Design Generator',
    description: 'Professional Neo-Brutalist QR Code generator with 100+ visual QR styles, 100+ modern QR card themes (QRIS, fluid waves, geometric, standees), live canvas preview, and high-resolution exports.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Core typography for Neo-Brutalist UI and dynamic preview fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Cabinet+Grotesk:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@700;800&family=Cinzel:wght@600;700&family=Playfair+Display:ital,wght@0,600;1,600&family=Bungee&family=Righteous&family=Press+Start+2P&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FFFDF8] text-[#121212] antialiased selection:bg-[#FFE600] selection:text-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
