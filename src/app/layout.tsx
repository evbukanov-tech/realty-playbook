import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Realty Playbook — Публичные промты",
  description: "Каталог публичных промтов и рабочих материалов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="realty-playbook-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
