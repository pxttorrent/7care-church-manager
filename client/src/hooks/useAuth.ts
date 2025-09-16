import { useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';

// Extend User type to include usingDefaultPassword
interface ExtendedUser extends User {
  usingDefaultPassword?: boolean;
}

// Mock users for demonstration (removed church field to use real data)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Pastor João Silva',
    email: 'admin@7care.com',
    role: 'admin',
    isApproved: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@7care.com',
    role: 'missionary',
    isApproved: true,
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@email.com',
    role: 'member',
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
        // Store the extended user data including usingDefaultPassword
        const extendedUser: ExtendedUser = data.user;
        console.log('🔍 Debug useAuth - Login successful:');
        console.log('  - Extended user data:', extendedUser);
        console.log('  - usingDefaultPassword:', extendedUser.usingDefaultPassword);
        
        // Fetch church information using the simple route
        try {
          const churchResponse = await fetch(`/api/user/church?userId=${extendedUser.id}`);
          if (churchResponse.ok) {
            const churchData = await churchResponse.json();
            if (churchData.success && churchData.church) {
              const userWithChurch = { ...extendedUser, church: churchData.church };
              localStorage.setItem('7care_auth', JSON.stringify(userWithChurch));
              setAuthState({
                user: userWithChurch,
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              // Fallback to login data if church fetch fails
              localStorage.setItem('7care_auth', JSON.stringify(extendedUser));
              setAuthState({
                user: extendedUser,
                isAuthenticated: true,
                isLoading: false
              });
            }
          } else {
            // Fallback to login data if church fetch fails
            localStorage.setItem('7care_auth', JSON.stringify(extendedUser));
            setAuthState({
              user: extendedUser,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (fetchError) {
          console.warn('Failed to fetch church data, using login data:', fetchError);
          // Fallback to login data if church fetch fails
          localStorage.setItem('7care_auth', JSON.stringify(extendedUser));
          setAuthState({
            user: extendedUser,
            isAuthenticated: true,
            isLoading: false
          });
        }
        
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

  const refreshUserData = async () => {
    if (!authState.user?.id) return false;
    
    try {
      console.log('🔄 Refreshing user data for ID:', authState.user.id);
      
      // Buscar dados completos do usuário
      const response = await fetch(`/api/users/${authState.user.id}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('🔄 User data received:', { 
          id: userData.id, 
          name: userData.name, 
          phone: userData.phone,
          birthDate: userData.birthDate,
          profilePhoto: userData.profilePhoto 
        });
        
        const updatedUser = { ...authState.user, ...userData };
        
        localStorage.setItem('7care_auth', JSON.stringify(updatedUser));
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
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
    register,
    refreshUserData
  };
};