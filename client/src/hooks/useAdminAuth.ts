import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const ADMIN_TOKEN_KEY = "admin_token";

export function useAdminAuth(): AdminAuthState {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    return null;
  });

  // Verify token with server
  const { data: isValid, isLoading } = useQuery({
    queryKey: ["admin-auth", token],
    queryFn: async () => {
      if (!token) return false;
      try {
        const response = await fetch("/api/admin/verify", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          return true;
        } else {
          // Token is invalid, remove it
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          setToken(null);
          return false;
        }
      } catch {
        // Token is invalid, remove it
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
        return false;
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const login = (newToken: string) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  };

  useEffect(() => {
    // Set Authorization header for all admin requests
    if (token) {
      // Store token in a way that apiRequest can access it
      (window as any).__adminToken = token;
    } else {
      delete (window as any).__adminToken;
    }
  }, [token]);

  return {
    isAuthenticated: !!token && isValid === true,
    isLoading: !!token && isLoading,
    token,
    login,
    logout,
  };
}