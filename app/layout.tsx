import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Whale Splash - Real-time Whale Tracker',
  description: 'Watch whale transactions splash across Somnia Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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