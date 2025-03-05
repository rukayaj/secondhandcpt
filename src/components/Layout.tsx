import React from 'react';
import Head from 'next/head';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string | undefined;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'SecondHandCPT - Baby Items in Cape Town',
  description = 'Find second-hand baby items in Cape Town. A better way to browse WhatsApp groups.',
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-secondary-200 py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-secondary-500 text-sm">
                  &copy; {new Date().getFullYear()} SecondHandCPT. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-secondary-500 hover:text-primary-600 text-sm">
                  About
                </a>
                <a href="#" className="text-secondary-500 hover:text-primary-600 text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-secondary-500 hover:text-primary-600 text-sm">
                  Terms of Service
                </a>
                <a href="#" className="text-secondary-500 hover:text-primary-600 text-sm">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 