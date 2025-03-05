import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              SecondHandCPT
            </Link>
            <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
              Baby Items
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for items..."
                className="w-full px-4 py-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white p-1 rounded-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>

          <nav className="flex space-x-6">
            <Link href="/listings" className="text-secondary-600 hover:text-primary-600">
              All Items
            </Link>
            <Link href="/iso" className="text-secondary-600 hover:text-primary-600">
              ISO Posts
            </Link>
            <Link href="/categories" className="text-secondary-600 hover:text-primary-600">
              Categories
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 