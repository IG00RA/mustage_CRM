'use client';

import styles from './UploadSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '@/utils/apiUtils';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import UploadAccounts from '@/components/ModalComponent/UploadAccounts/UploadAccounts';
import FormingSet from '@/components/ModalComponent/FormingSet/FormingSet';

export interface UploadResponse {
  status: 'success' | 'failed';
  message: string;
  file?: string;
}

export default function UploadSection() {
  const t = useTranslations();

  const [isOpenUpload, setIsOpenUpload] = useState(false);
  const [isOpenError, setIsOpenError] = useState(false);
  const [isOpenForming, setIsOpenForming] = useState(false);
  const [responseData, setResponseData] = useState<UploadResponse | null>(null);

  const toggleFormingModal = () => {
    setIsOpenForming(!isOpenForming);
  };

  const toggleUploadModal = () => {
    setIsOpenUpload(!isOpenUpload);
  };

  const toggleErrorModal = () => {
    setIsOpenError(!isOpenError);
    setIsOpenUpload(false);
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/assets/accounts_template.xlsx';
    link.download = 'accounts_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadErrorFile = async () => {
    if (!responseData?.file) {
      toast.error(t('Upload.downloadError.noFile'));
      return;
    }

    try {
      const headers = {
        ...getAuthHeaders(),
        accept: 'application/octet-stream',
      };

      const response = await fetch(responseData.file, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.detail ||
            'Не вдалося завантажити файл із помилками'
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download =
        responseData.file.split('/').pop() || 'upload-errors.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success(t('Upload.downloadError.success'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('Upload.downloadError.error')
      );
      console.error('Download error:', error);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.upload')}</h2>
        <p className={styles.header_text}>{t('Upload.headerText')}</p>
        <div className={styles.button_wrap}>
          <WhiteBtn
            onClick={downloadTemplate}
            text={'Upload.buttons.download'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
          <WhiteBtn
            onClick={toggleUploadModal}
            text={'Upload.buttons.load'}
            icon="icon-upload"
          />
          {/* <WhiteBtn
            onClick={toggleFormingModal}
            text={'Upload.buttons.createSet'}
            icon="icon-create-set"
          /> */}
        </div>
      </div>
      <ModalComponent
        isOpen={isOpenUpload}
        onClose={toggleUploadModal}
        title="Upload.modalUpload.title"
      >
        <UploadAccounts
          onClose={toggleUploadModal}
          setResponseData={setResponseData}
          toggleErrorModal={toggleErrorModal}
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenError}
        onClose={toggleErrorModal}
        title="Upload.modalUpload.titleError"
        icon="icon-error-load"
      >
        <div className={styles.modal_error}>
          <p className={styles.error_text}>
            {t('Upload.textError')} <span>{responseData?.message}</span>
          </p>
          <p className={styles.error_download_text}>
            {t('Upload.textDownloadError')}
          </p>
        </div>
        <WhiteBtn
          onClick={downloadErrorFile}
          text={'Upload.buttons.errorDownload'}
          icon="icon-cloud-download"
          iconFill="icon-cloud-download-fill"
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenForming}
        onClose={toggleFormingModal}
        title="Upload.modalForming.title"
      >
        <FormingSet />
      </ModalComponent>
    </section>
  );
}
