import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Live Leaderboard — LT II",
  description:
    "Sistem Penilaian & Live Leaderboard Lomba Tingkat II (LT II) dengan papan klasemen real-time.",
};

export const viewport = {
  width: 1280,
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function applyDesktopMode() {
                  var targetWidth = 1280;
                  var screenW = window.screen.width || targetWidth;
                  if (screenW < targetWidth) {
                    var scale = screenW / targetWidth;
                    var meta = document.querySelector('meta[name="viewport"]');
                    if (!meta) {
                      meta = document.createElement('meta');
                      meta.name = 'viewport';
                      document.head.appendChild(meta);
                    }
                    meta.setAttribute('content', 'width=' + targetWidth + ', initial-scale=' + scale + ', minimum-scale=' + (scale * 0.5) + ', maximum-scale=5.0, user-scalable=yes');
                  }
                }
                applyDesktopMode();
                window.addEventListener('resize', applyDesktopMode);
                window.addEventListener('orientationchange', function() {
                  setTimeout(applyDesktopMode, 150);
                });
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground" style={{ minWidth: "1280px" }}>
        {children}
      </body>
    </html>
  );
}
