'use client';

import { useTranslations } from 'next-intl';
import { useState, ReactNode } from 'react';
import Modal from 'react-modal';
import styles from './ModalComponent.module.css';
import SubmitBtn from '../Buttons/SubmitBtn/SubmitBtn';
import CancelBtn from '../Buttons/CancelBtn/CancelBtn';
import Icon from '@/helpers/Icon';

if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  text: string;
  editedTitle?: string;
  children: ReactNode;
}

export default function ModalComponent({
  isOpen,
  onClose,
  title,
  text,
  editedTitle = '',
  children,
}: ModalProps) {
  const t = useTranslations('');

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <button onClick={onClose} className={styles.close_btn}>
        <Icon
          className={styles.close_icon}
          name="icon-close-modal"
          width={16}
          height={16}
        />
      </button>
      <h2 className={styles.title}>{`${t(title)} ${editedTitle}`}</h2>
      <p className={styles.text}>{t(text)}</p>
      <div className={styles.fields_wrap}>{children}</div>
    </Modal>
  );
}
