import React, { createContext, useState, useContext } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock logged-in user for the dashboard
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Admin User',
    email: 'admin@techflix.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=e50914&color=fff',
  });

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
