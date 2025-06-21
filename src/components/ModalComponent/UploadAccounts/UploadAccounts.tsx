'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './UploadAccounts.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import CustomDragDropFile from '@/components/Buttons/CustomDragDropFile/CustomDragDropFile';
import { useTranslations } from 'next-intl';
import ExcelJS from 'exceljs';
import { useCategoriesStore } from '@/store/categoriesStore';
import { ENDPOINTS } from '@/constants/api';
import { UploadResponse } from '@/components/Pages/UploadSection/UploadSection';

const settingsOptions = ['Upload.modalUpload.check'];

interface UploadAccountsProps {
  setResponseData: (data: UploadResponse) => void;
  toggleErrorModal: () => void;
  onClose: () => void;
}

export default function UploadAccounts({
  setResponseData,
  toggleErrorModal,
  onClose,
}: UploadAccountsProps) {
  const t = useTranslations('');

  const {
    categories,
    subcategoriesWithParams: subcategories,
    fetchCategories,
    fetchSubcategories,
  } = useCategoriesStore();

  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [accountCount, setAccountCount] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!file) {
      setAccountCount(0);
    }
  }, [file]);

  useEffect(() => {
    if (
      selectedCategory.length > 0 &&
      selectedCategory[0] !== t('Load.category')
    ) {
      const categoryId = categories.find(
        cat => cat.account_category_name === selectedCategory[0]
      )?.account_category_id;
      if (categoryId) {
        fetchSubcategories(categoryId, false);
      }
    } else {
      setSelectedSubcategory([]);
    }
  }, [selectedCategory, categories, fetchSubcategories, t]);

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

    if (
      selectedSubcategory.length === 0 ||
      selectedSubcategory[0] === t('Load.names')
    ) {
      toast.error(t('Upload.modalUpload.noSubcategory'));
      return;
    }

    const selectedSubcategoryObj = subcategories.find(
      sub => sub.account_subcategory_name === selectedSubcategory[0]
    );

    if (!selectedSubcategoryObj) {
      toast.error(t('Upload.modalUpload.noSubcategory'));
      return;
    }

    const formData = new FormData();
    formData.append('accounts_file', uploadedFile);
    const subcategoryId =
      selectedSubcategoryObj.account_subcategory_id.toString();
    formData.append('subcategory_id', subcategoryId);

    try {
      const headers = {
        accept: 'application/json',
      };

      const response = await fetch(ENDPOINTS.ACCOUNTS_UPLOAD, {
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
        setSelectedCategory([]);
        setSelectedSubcategory([]);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('Upload.modalUpload.uploadError')
      );
    }
  };

  const handleCategorySelect = (values: string[]) => {
    const value = values[0] || '';
    setSelectedCategory([value]);
    setSelectedSubcategory([]);
  };

  const handleSubcategorySelect = (values: string[]) => {
    const value = values[0] || '';
    setSelectedSubcategory([value]);
  };

  const handleReset = () => {
    setFile(null);
    setUploadedFile(null);
    setAccountCount(0);
    setSelectedCategory([]);
    setSelectedSubcategory([]);
    setCheckedSettings({});
    onClose();
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Upload.modalUpload.category')}
        </label>
        <CustomSelect
          label={t('Load.selectCategory')}
          options={[
            t('Load.category'),
            ...categories.map(cat => cat.account_category_name),
          ]}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          multiSelections={false}
          width={'100%'}
          // selectWidth={383}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('Upload.modalUpload.names')}</label>
        <CustomSelect
          label={t('Load.selectNames')}
          options={[
            t('Load.names'),
            ...subcategories.map(sub => sub.account_subcategory_name),
          ]}
          selected={selectedSubcategory}
          onSelect={handleSubcategorySelect}
          multiSelections={false}
          width={'100%'}
          // selectWidth={383}
        />
      </div>

      <div className={styles.field}>
        <CustomCheckbox
          checked={checkedSettings[settingsOptions[0]] || false}
          onChange={() => toggleCheckbox(settingsOptions[0])}
          label={t(settingsOptions[0])}
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

      <div className={ownStyles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={handleReset} />
        <SubmitBtn text="Upload.modalUpload.btn" />
      </div>
    </form>
  );
}
