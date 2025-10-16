import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModalContextType {
  isAnyModalOpen: boolean;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const openModal = (modalId: string) => {
    setOpenModals(prev => new Set([...prev, modalId]));
  };

  const closeModal = (modalId: string) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(modalId);
      return newSet;
    });
  };

  const isAnyModalOpen = openModals.size > 0;

  // Adicionar classe ao body para esconder menu inferior quando modal estiver aberto
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isAnyModalOpen]);

  return (
    <ModalContext.Provider value={{ isAnyModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
