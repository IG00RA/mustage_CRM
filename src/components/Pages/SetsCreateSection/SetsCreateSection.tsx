'use client';

import styles from './SetsCreateSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useCallback } from 'react';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import CreateNamesSet from '@/components/ModalComponent/CreateNamesSet/CreateNamesSet';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';

export default function SetsCreateSection() {
  const t = useTranslations();
  const [isOpenCreateNamesSet, setIsOpenCreateNamesSet] = useState(false);

  const toggleCreateNamesSet = useCallback(
    () => setIsOpenCreateNamesSet(prev => !prev),
    []
  );

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sets.create.header')}</h2>
        <p className={styles.header_text}>{t('Sets.create.headerText')}</p>
        <WhiteBtn
          onClick={toggleCreateNamesSet}
          text={'Names.addSetBtn'}
          icon="icon-add-color"
          iconFill="icon-add-color"
        />
      </div>
      <ModalComponent
        isOpen={isOpenCreateNamesSet}
        onClose={toggleCreateNamesSet}
        title="Names.modalCreateSet.title"
        text="Names.modalCreateSet.description"
      >
        <CreateNamesSet onClose={toggleCreateNamesSet} />
      </ModalComponent>
    </section>
  );
}
