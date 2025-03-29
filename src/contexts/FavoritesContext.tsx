import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favorites: string[];
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Load favorites from cookie when component mounts
    const loadFavorites = () => {
      if (typeof window === 'undefined') return; // Skip on server-side
      
      const cookies = document.cookie.split(';');
      const favoriteCookie = cookies.find(cookie => cookie.trim().startsWith('favorites='));
      
      if (favoriteCookie) {
        try {
          const savedFavorites = JSON.parse(decodeURIComponent(favoriteCookie.split('=')[1]));
          setFavorites(savedFavorites);
        } catch (e) {
          console.error('Error parsing favorites cookie:', e);
          setFavorites([]);
        }
      }
      setIsInitialized(true);
    };
    
    loadFavorites();
  }, []);
  
  const saveFavorites = (favoritesList: string[]) => {
    if (typeof window === 'undefined') return; // Skip on server-side
    document.cookie = `favorites=${encodeURIComponent(JSON.stringify(favoritesList))};path=/;max-age=31536000`;
  };
  
  const addToFavorites = (id: string) => {
    if (!favorites.includes(id)) {
      const updatedFavorites = [...favorites, id];
      setFavorites(updatedFavorites);
      saveFavorites(updatedFavorites);
    }
  };
  
  const removeFromFavorites = (id: string) => {
    const updatedFavorites = favorites.filter(fav => fav !== id);
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };
  
  const isFavorite = (id: string) => favorites.includes(id);
  
  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 