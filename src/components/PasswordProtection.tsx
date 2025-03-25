import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// This component will serve as a simple password gate
export default function PasswordProtection({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if we're already authenticated when the component mounts
  useEffect(() => {
    const hasPassword = document.cookie.includes('site_password=true');
    if (hasPassword) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the correct password from environment variables
    const correctPassword = process.env.NEXT_PUBLIC_SITE_PASSWORD;
    
    // Check if password matches the secret password
    if (password === correctPassword) {
      // Set a cookie to remember authentication
      document.cookie = 'site_password=true; path=/; max-age=86400'; // 24 hours
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  // If authenticated, show the children (the actual site content)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, show the password prompt
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-600 flex items-center justify-center">
            <i className="fas fa-tags mr-2 text-primary-600"></i>
            Nifty Thrifty
          </h1>
          <p className="mt-2 text-secondary-600">This site is password protected</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full btn btn-primary py-2"
          >
            Enter Site
          </button>
        </form>
      </div>
    </div>
  );
} 