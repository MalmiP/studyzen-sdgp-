import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import ClientSidebar from '@/components/ui/ClientSidebar'; // Use the client component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudyZen',
  description: 'Your personal study companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} m-0`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <ClientSidebar /> {/* Conditionally renders based on auth */}
            <main className="flex-1 overflow-auto">
              <div className="w-full p-0 m-0">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}