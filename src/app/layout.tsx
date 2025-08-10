import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
  <body suppressHydrationWarning className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
