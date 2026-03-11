import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Whale Splash - Real-time Whale Tracker on Somnia',
  description: 'Track large transactions on Somnia Network in real-time with stunning visual effects',
  keywords: 'somnia, blockchain, whale tracker, real-time, crypto, transactions',
  authors: [{ name: 'Your Team Name' }],
  openGraph: {
    title: 'Whale Splash - Real-time Whale Tracker',
    description: 'Watch whale transactions splash across Somnia Network',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #3b82f6',
            },
          }}
        />
      </body>
    </html>
  );
}