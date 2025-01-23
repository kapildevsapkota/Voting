"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

// Define the type for user authentication
interface AuthContextType {
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  checkAuthStatus: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const checkAuthStatus = async (): Promise<boolean> => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          return true;
        } catch  {
          // Clear invalid stored user data
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    }
    return false;
  };

  // Check for existing auth on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulating an async login process
    return new Promise((resolve) => {
      // Dummy credentials (replace with your actual logic)
      if (email === "admin@admin.com" && password === "biratexpo2025!@") {
        const userInfo = { email };
        setUser(userInfo);
        setIsAuthenticated(true);

        // Ensure this only runs on the client side
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userInfo));
        }

        resolve(true);
      } else {
        resolve(false);
      }
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);

    // Ensure this only runs on the client side
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);
