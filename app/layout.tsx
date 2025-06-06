import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Footer, Header } from '@/components/index';
import SessionProvider from '@/utils/SessionProvider';
import Providers from '@/Providers';
import { getServerSession } from 'next-auth';
import 'svgmap/dist/svgMap.min.css';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  const headersList = headers();
  const pathname =
    headersList.get('x-pathname') || headersList.get('x-url') || '';

  // Kiểm tra chính xác hơn nếu đường dẫn thuộc về dashboard
  const isAdminDashboard = pathname.includes('/admin');
  return (
    <html lang='en' data-theme='light' suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider session={session}>
          {!isAdminDashboard && <Header />}
          <Providers>{children}</Providers>
          {!isAdminDashboard && <Footer />}
        </SessionProvider>
      </body>
    </html>
  );
}
