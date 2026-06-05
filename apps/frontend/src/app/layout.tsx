import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lawyered - AI Will Maker',
  description: 'Create your will with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
