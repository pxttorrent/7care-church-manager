import { useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Pastor João Silva',
    email: 'admin@7care.com',
    role: 'admin',
    church: 'Igreja Central',
    isApproved: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@7care.com',
    role: 'missionary',
    church: 'Igreja Central',
    isApproved: true,
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@email.com',
    role: 'member',
    church: 'Igreja Central',
    isApproved: true,
    createdAt: '2024-02-01'
  }
];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth on mount
    const storedAuth = localStorage.getItem('7care_auth');
    if (storedAuth) {
      const user = JSON.parse(storedAuth);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        localStorage.setItem('7care_auth', JSON.stringify(data.user));
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('7care_auth');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    // Mock registration
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'interested',
      church: userData.church,
      isApproved: userData.role === 'interested',
      createdAt: new Date().toISOString()
    };

    // In a real app, this would make an API call
    console.log('New user registered:', newUser);
    return true;
  };

  return {
    ...authState,
    login,
    logout,
    register
  };
};