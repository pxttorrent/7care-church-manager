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
    console.log('🔍 useAuth useEffect - Starting auth check');
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.log('🔍 useAuth useEffect - Timeout reached, forcing loading to false');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }, 10000); // 10 segundos (aumentado para dar mais tempo)
    
    // Check for stored auth on mount
    const storedAuth = localStorage.getItem('7care_auth');
    console.log('🔍 useAuth useEffect - Stored auth:', storedAuth ? 'exists' : 'not found');
    
    if (storedAuth) {
      try {
        const user = JSON.parse(storedAuth);
        console.log('🔍 useAuth useEffect - User parsed:', { id: user.id, name: user.name, role: user.role });
        clearTimeout(timeoutId);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('🔍 useAuth useEffect - Auth state set to authenticated');
      } catch (error) {
        console.error('🔍 useAuth useEffect - Error parsing stored auth:', error);
        localStorage.removeItem('7care_auth');
        clearTimeout(timeoutId);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      console.log('🔍 useAuth useEffect - No stored auth, setting loading to false');
      clearTimeout(timeoutId);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
    
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 useAuth login - Starting login request');
      console.log('🔍 useAuth login - Email:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔍 useAuth login - Response status:', response.status);
      console.log('🔍 useAuth login - Response ok:', response.ok);

      const data = await response.json();
      console.log('🔍 useAuth login - Response data:', data);
      
      if (data.success && data.user) {
        // Store the extended user data including usingDefaultPassword
        const extendedUser: ExtendedUser = data.user;
        console.log('🔍 Debug useAuth - Login successful:');
        console.log('  - Extended user data:', extendedUser);
        console.log('  - usingDefaultPassword:', extendedUser.usingDefaultPassword);
        
        // Fetch church information using the simple route
        try {
          console.log('🔍 useAuth login - Fetching church data for user:', extendedUser.id);
          const churchResponse = await fetch(`/api/user/church?userId=${extendedUser.id}`);
          console.log('🔍 useAuth login - Church response status:', churchResponse.status);
          
          if (churchResponse.ok) {
            const churchData = await churchResponse.json();
            console.log('🔍 useAuth login - Church data:', churchData);
            
            if (churchData.success && churchData.church) {
              const userWithChurch = { ...extendedUser, church: churchData.church };
              console.log('🔍 useAuth login - Setting user with church data');
              localStorage.setItem('7care_auth', JSON.stringify(userWithChurch));
              setAuthState({
                user: userWithChurch,
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              // Fallback to login data if church fetch fails
              console.log('🔍 useAuth login - Church data invalid, using fallback');
              localStorage.setItem('7care_auth', JSON.stringify(extendedUser));
              setAuthState({
                user: extendedUser,
                isAuthenticated: true,
                isLoading: false
              });
            }
          } else {
            // Fallback to login data if church fetch fails
            console.log('🔍 useAuth login - Church response not ok, using fallback');
            localStorage.setItem('7care_auth', JSON.stringify(extendedUser));
            setAuthState({
              user: extendedUser,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (fetchError) {
          console.warn('🔍 useAuth login - Failed to fetch church data, using fallback:', fetchError);
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