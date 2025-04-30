'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './ReplenishmentAccountsFarm.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { toast } from 'react-toastify';
import { useState, useMemo, useEffect } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import CustomDragDropFile from '@/components/Buttons/CustomDragDropFile/CustomDragDropFile';
import { useTranslations } from 'next-intl';
import ExcelJS from 'exceljs';
import { useAutofarmStore } from '@/store/autofarmStore';
import { ENDPOINTS } from '@/constants/api';
import { UploadResponse } from '@/components/Pages/UploadSection/UploadSection';

const GEO_OPTIONS = ['Україна', 'Польша', 'США'];
const ACTIVITY_MODES = ['7 дней', '14 дней', '20 дней', '30 дней'];

interface ReplenishmentAccountsFarmProps {
  setResponseData: (data: UploadResponse) => void;
  toggleErrorModal: () => void;
  onClose: () => void;
}

export default function ReplenishmentAccountsFarm({
  setResponseData,
  toggleErrorModal,
  onClose,
}: ReplenishmentAccountsFarmProps) {
  const t = useTranslations('');
  const { missing } = useAutofarmStore();

  const [selectGeo, setSelectGeo] = useState<string[]>([
    t('AutoFarmSection.geoSelect'),
  ]);
  const [selectMode, setSelectMode] = useState<string[]>([
    t('AutoFarmSection.typeSelect'),
  ]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [accountCount, setAccountCount] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);

  const MODE_MAPPING: { [key: string]: string } = {
    '7 дней': 'SEVEN_DAYS',
    '14 дней': 'FOURTEEN_DAYS',
    '20 дней': 'TWENTY_DAYS',
    '30 дней': 'THIRTY_DAYS',
  };

  useEffect(() => {
    if (!file) {
      setAccountCount(0);
    }
  }, [file]);

  const totalMissing = useMemo(() => {
    const selectedGeo =
      selectGeo[0] !== t('AutoFarmSection.geoSelect') ? selectGeo[0] : '';
    const selectedMode =
      selectMode[0] !== t('AutoFarmSection.typeSelect') ? selectMode[0] : '';

    if (!selectedGeo || !selectedMode) {
      return 0;
    }

    const mappedMode = MODE_MAPPING[selectedMode];

    const matchedRow = missing.find(
      item => item.geo === selectedGeo && item.mode_name === mappedMode
    );

    return matchedRow?.total_missing || 0;
  }, [selectGeo, selectMode, missing, t]);

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
        'Название аккаунта',
        'Логин ФБ',
        'Пароль ФБ',
        'Имя',
        'Фамилия',
        'Дата рождения',
        'Почта',
        'Пароль от почты',
        'Cookies',
        'Ссылка на Facebook',
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

    if (
      selectGeo[0] === t('AutoFarmSection.geoSelect') ||
      selectMode[0] === t('AutoFarmSection.typeSelect')
    ) {
      toast.error(t('Upload.modalUpload.noSubcategory'));
      return;
    }

    const queryParams = new URLSearchParams({
      desired_geo: selectGeo[0],
      desired_mode: selectMode[0],
    });

    const url = `${ENDPOINTS.AUTO_FARM_REPLENISH}?${queryParams.toString()}`;

    const formData = new FormData();
    formData.append('accounts_file', uploadedFile);

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

      const data: UploadResponse = await response.json();
      setResponseData(data);

      if (data.status === 'failed') {
        toggleErrorModal();
      } else {
        toast.success(data.message);
        setUploadedFile(null);
        setFile(null);
        setAccountCount(0);
        setSelectGeo([t('AutoFarmSection.geoSelect')]);
        setSelectMode([t('AutoFarmSection.typeSelect')]);
        onClose();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('Upload.modalUpload.uploadError')
      );
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadedFile(null);
    setAccountCount(0);
    setSelectGeo([t('AutoFarmSection.geoSelect')]);
    setSelectMode([t('AutoFarmSection.typeSelect')]);
    onClose();
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.field}>
        <CustomSelect
          label={`${t('AutoFarmSection.geo')}:`}
          options={[t('AutoFarmSection.geoSelect'), ...GEO_OPTIONS]}
          selected={selectGeo}
          onSelect={setSelectGeo}
          multiSelections={false}
          width={508}
        />
      </div>

      <div className={styles.field}>
        <CustomSelect
          label={`${t('AutoFarmSection.type')}:`}
          options={[t('AutoFarmSection.typeSelect'), ...ACTIVITY_MODES]}
          selected={selectMode}
          onSelect={setSelectMode}
          multiSelections={false}
          width={508}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalReplenishmentAcc.lack')}
        </label>
        <input
          className={styles.input}
          value={totalMissing}
          readOnly
          disabled
          placeholder={t('DBSettings.form.placeholder')}
        />
      </div>

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
        <CancelBtn
          text="AutoFarmSection.modalReplenishmentAcc.btnCancel"
          onClick={handleReset}
        />
        <SubmitBtn text="AutoFarmSection.modalReplenishmentAcc.btn" />
      </div>
    </form>
  );
}
