'use client';

import styles from './Upload.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import AddBtn from '../Buttons/AddBtn/AddBtn';
import CancelBtn from '../Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '../Buttons/SubmitBtn/SubmitBtn';
import { toast } from 'react-toastify';
import ModalComponent from '../ModalComponent/ModalComponent';
import UploadAccounts from '../ModalComponent/UploadAccounts/UploadAccounts';

const Upload = () => {
  const t = useTranslations();

  const [isOpenUpload, setIsOpenUpload] = useState(false);

  const toggleUploadModal = () => {
    setIsOpenUpload(!isOpenUpload);
  };

  const download = () => {};
  const add = () => {};

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.upload')}</h2>
        <p className={styles.header_text}>{t('Upload.headerText')}</p>
        <div className={styles.button_wrap}>
          <WhiteBtn
            onClick={download}
            text={'Upload.buttons.download'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
          <WhiteBtn
            onClick={toggleUploadModal}
            text={'Upload.buttons.load'}
            icon="icon-upload"
          />
          <WhiteBtn
            onClick={download}
            text={'Upload.buttons.createSet'}
            icon="icon-create-set"
          />
        </div>
      </div>
      <ModalComponent
        isOpen={isOpenUpload}
        onClose={toggleUploadModal}
        title="Upload.modalUpload.title"
      >
        <UploadAccounts />
      </ModalComponent>
    </section>
  );
};

export default Upload;
