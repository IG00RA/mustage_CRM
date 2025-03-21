import { useState, ReactNode } from 'react';

export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState<string>('');

  const openModal = (
    modalContent: ReactNode,
    modalTitle: string = 'Модальне вікно'
  ) => {
    setContent(modalContent);
    setTitle(modalTitle);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setContent(null);
    }, 300); // Додаємо затримку для плавного закриття
  };

  return { isOpen, openModal, closeModal, content, title };
}
