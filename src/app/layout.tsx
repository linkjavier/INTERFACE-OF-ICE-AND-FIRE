// src/app/layout.tsx
import './globals.css';
import { ReactQueryProvider } from '@/ReactQueryProvider';

export const metadata = {
  title: 'An Interface of Ice and Fire',
  description: 'Track characters from the series A Song of Ice and Fire',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
