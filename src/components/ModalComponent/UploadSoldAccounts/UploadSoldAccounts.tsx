'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './UploadSoldAccounts.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import CustomDragDropFile from '@/components/Buttons/CustomDragDropFile/CustomDragDropFile';
import { useTranslations } from 'next-intl';
import ExcelJS from 'exceljs';
import { ENDPOINTS } from '@/constants/api';
import { UploadResponse } from '@/components/Pages/UploadSection/UploadSection';

interface UploadSoldAccountsProps {
  setResponseData: (data: UploadResponse) => void;
  toggleErrorModal: () => void;
  onClose: () => void;
}

export default function UploadSoldAccounts({
  setResponseData,
  toggleErrorModal,
  onClose,
}: UploadSoldAccountsProps) {
  const t = useTranslations('');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [accountCount, setAccountCount] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!file) {
      setAccountCount(0);
    }
  }, [file]);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);

    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();

    reader.onload = async e => {
      const buffer = e.target?.result as ArrayBuffer;
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        toast.error(t('Upload.modalUpload.invalidFile'));
        setAccountCount(0);
        setUploadedFile(null);
        return;
      }

      const expectedHeaders = [
        'worker_name',
        'teamlead_name',
        'account_name',
        'archive_link',
        'profile_link',
        'account_data',
        'cookies',
      ];
      const firstRow = worksheet.getRow(1);
      const headers = firstRow.values as string[];
      const headersMatch = expectedHeaders.every(
        (header, index) => headers[index + 1] === header
      );

      if (!headersMatch) {
        toast.error(t('Upload.modalUpload.invalidTemplate'));
        setAccountCount(0);
        setUploadedFile(null);
        return;
      }

      const rowCount = worksheet.rowCount;
      const accountCount = rowCount - 1;
      setAccountCount(accountCount > 0 ? accountCount : 0);
    };

    reader.readAsArrayBuffer(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      toast.error(t('Upload.modalUpload.noFile'));
      return;
    }

    const formData = new FormData();
    formData.append('accounts_file', uploadedFile);

    try {
      const headers = {
        accept: 'application/json',
      };

      const response = await fetch(ENDPOINTS.ACCOUNTS_UPLOAD_SOLD, {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.detail ||
            'Не вдалося завантажити акаунти'
        );
      }

      const data: UploadResponse = await response.json();

      setResponseData(data);

      if (data.status === 'failed') {
        toggleErrorModal();
      } else {
        toast.success(data.message);
        setUploadedFile(null);
        setFile(null);
        setAccountCount(0);
      }
    } catch (error) {
      toast.error(`${t('Upload.modalUpload.uploadError')} : ${error}`);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadedFile(null);
    setAccountCount(0);
    onClose();
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.field}>
        <CustomDragDropFile
          setFile={setFile}
          file={file}
          acceptedExtensions={['xlsx', 'csv']}
          onFileUpload={handleFileUpload}
        />
      </div>

      {uploadedFile && accountCount > 0 && (
        <p className={ownStyles.locate_accounts}>
          {t('Upload.modalUpload.accounts')} <span>{accountCount}</span>
        </p>
      )}

      <div className={ownStyles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={handleReset} />
        <SubmitBtn text="Upload.modalUpload.btn" />
      </div>
    </form>
  );
}
