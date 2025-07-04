'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './ReplenishmentProxyFarm.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import CustomDragDropFile from '@/components/Buttons/CustomDragDropFile/CustomDragDropFile';
import { useTranslations } from 'next-intl';
import ExcelJS from 'exceljs';
import { ENDPOINTS } from '@/constants/api';

type ProxyItem = {
  host: string;
  port: number;
  modem: string;
  password: string;
  change_ip_link: string;
  geo: string;
  provider: string | null;
  operator: string | null;
  proxy_id: number;
};

type SuccessResponse = ProxyItem[];

export type ErrorResponse = {
  status: 'failed';
  message: string;
  file: string;
};

type ProxiesResponse = SuccessResponse | ErrorResponse;

interface ReplenishmentProxyFarmProps {
  setResponseData: (data: ErrorResponse) => void;
  toggleErrorModal: () => void;
  onClose: () => void;
}

export default function ReplenishmentProxyFarm({
  setResponseData,
  toggleErrorModal,
  onClose,
}: ReplenishmentProxyFarmProps) {
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
        'host',
        'port',
        'modem',
        'password',
        'change_ip_link',
        'geo',
        'provider',
        'operator',
      ];
      const firstRow = worksheet.getRow(1);
      const headers = firstRow.values as string[];
      const headersMatch = expectedHeaders.every(
        (header, index) => headers[index + 1]?.trim() === header
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

    const url = ENDPOINTS.AUTO_FARM_PROXIES;

    const formData = new FormData();
    formData.append('proxies_file', uploadedFile);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.detail ||
            t('Upload.modalUpload.uploadError')
        );
      }

      const data: ProxiesResponse = await response.json();
      setResponseData(data as ErrorResponse);
      if (!Array.isArray(data)) {
        toggleErrorModal();
      } else {
        toast.success(
          `${t('ServersProxiesSection.loadSuccess')} ${data.length} ${t(
            'ServersProxiesSection.loadSuccessSecond'
          )} `
        );
        setUploadedFile(null);
        setFile(null);
        setAccountCount(0);
        onClose();
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

      <div className={styles.buttons_wrap}>
        <CancelBtn text="ServersProxiesSection.cancel" onClick={handleReset} />
        <SubmitBtn text="ServersProxiesSection.proxyBtn" />
      </div>
    </form>
  );
}
