"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  userId: string;
  setUserId: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // For development, use a default userId
  // In production, this should come from authentication
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Try to get userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // For demo purposes, generate a default userId
      const defaultUserId = 'com_1';
      setUserId(defaultUserId);
      localStorage.setItem('userId', defaultUserId);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}








