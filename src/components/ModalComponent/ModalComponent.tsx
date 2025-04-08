'use client';

import { useTranslations } from 'next-intl';
import { ReactNode, useEffect } from 'react';
import Modal from 'react-modal';
import styles from './ModalComponent.module.css';
import Icon from '@/helpers/Icon';

if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleSecond?: string;
  text?: string;
  editedTitle?: string;
  editedTitleSecond?: string;
  children: ReactNode;
  icon?: string;
}

export default function ModalComponent({
  isOpen,
  onClose,
  title,
  text,
  titleSecond,
  editedTitleSecond,
  editedTitle = '',
  children,
  icon,
}: ModalProps) {
  const t = useTranslations('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header_wrap}>
        {icon && (
          <Icon
            className={styles.close_icon}
            name={icon}
            width={64}
            height={64}
          />
        )}
        <h2 className={styles.title}>
          <span>{t(title)}</span>
          {editedTitle && (
            <>
              <br /> {editedTitle} <br />
            </>
          )}
          {titleSecond && (
            <>
              <span>{t(titleSecond)}</span> <br />
            </>
          )}
          {editedTitleSecond}
        </h2>
        <button onClick={onClose} className={styles.close_btn}>
          <Icon
            className={styles.close_icon}
            name="icon-close-modal"
            width={16}
            height={16}
            color="#a9a9c1"
          />
        </button>
      </div>
      {text && <p className={styles.text}>{t(text)}</p>}
      <div className={styles.fields_wrap}>{children}</div>
    </Modal>
  );
}
