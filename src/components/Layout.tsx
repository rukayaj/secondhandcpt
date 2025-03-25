import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';
import Analytics from './Analytics';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string | undefined;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Nifty Thrifty - Baby Items in Cape Town',
  description = 'Find second-hand baby items in Cape Town. A better way to browse WhatsApp groups.',
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle route change start
    const handleStart = () => {
      setLoading(true);
    };

    // Handle route change complete
    const handleComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏷️</text></svg>" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Head>

      <div className="flex flex-col min-h-screen">
        {loading && <LoadingSpinner fullScreen />}
        
        <Header />

        <main className="flex-grow py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-secondary-200 py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <i className="fas fa-tags text-primary-600 mr-2"></i>
                  <span className="text-primary-600 font-semibold">Nifty Thrifty</span>
                </div>
                <p className="text-secondary-500 text-sm">
                  &copy; {new Date().getFullYear()} Nifty Thrifty. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="/about" className="text-secondary-500 hover:text-primary-600 text-sm flex items-center">
                  <i className="fas fa-info-circle mr-1"></i>
                  About
                </a>
                <a href="#" className="text-secondary-500 hover:text-primary-600 text-sm flex items-center">
                  <i className="fas fa-shield-alt mr-1"></i>
                  Privacy Policy
                </a>
                <a href="#" className="text-secondary-500 hover:text-primary-600 text-sm flex items-center">
                  <i className="fas fa-file-contract mr-1"></i>
                  Terms of Service
                </a>
                <a href="/contact" className="text-secondary-500 hover:text-primary-600 text-sm flex items-center">
                  <i className="fas fa-envelope mr-1"></i>
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      <Analytics />
    </>
  );
};

export default Layout; 