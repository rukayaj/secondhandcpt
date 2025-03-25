import React, { useState, useEffect } from 'react';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export default function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Check if already authenticated on mount (via localStorage)
  useEffect(() => {
    const authenticated = localStorage.getItem('nifty-thrifty-auth') === 'true';
    setIsAuthenticated(authenticated);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the site password from environment variable
    const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD || 'niftythrifty';
    
    // Simple password check - note this is not secure, but is just a basic deterrent
    if (password === sitePassword) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('nifty-thrifty-auth', 'true');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };
  
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Nifty Thrifty Archive</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This site contains an archive of Nifty Thrifty listings.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Enter Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 