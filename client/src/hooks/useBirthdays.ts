import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface BirthdayUser {
  id: number;
  name: string;
  phone?: string;
  birthDate: string;
  profilePhoto?: string;
  church?: string | null;
}

interface BirthdaysData {
  today: BirthdayUser[];
  thisMonth: BirthdayUser[];
  all: BirthdayUser[]; // Todos os aniversariantes para o calendário
}

export const useBirthdays = () => {
  const [birthdays, setBirthdays] = useState<BirthdaysData>({ today: [], thisMonth: [], all: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        setIsLoading(true);
        
        const headers: Record<string, string> = {};
        if (user?.id) {
          headers['x-user-id'] = user.id.toString();
          headers['x-user-role'] = user.role;
        }
        
        const response = await fetch('/api/users/birthdays', {
          headers
        });
        
        if (!response.ok) {
          throw new Error('Falha ao buscar aniversariantes');
        }
        
        const data = await response.json();
        setBirthdays(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar aniversariantes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchBirthdays();
    }
  }, [user]);

  return { birthdays, isLoading, error };
};
