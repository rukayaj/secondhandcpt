import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import PasswordProtection from '@/components/PasswordProtection';
import { useRouter } from 'next/router';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // List of public routes that don't require password
  const publicRoutes = ['/api', '/_next']; 
  
  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some(route => router.pathname.startsWith(route));
  
  // If it's a public route, don't wrap with password protection
  if (isPublicRoute) {
    return (
      <FavoritesProvider>
        <Component {...pageProps} />
      </FavoritesProvider>
    );
  }
  
  // Otherwise, wrap with password protection
  return (
    <PasswordProtection>
      <FavoritesProvider>
        <Component {...pageProps} />
      </FavoritesProvider>
    </PasswordProtection>
  );
} 