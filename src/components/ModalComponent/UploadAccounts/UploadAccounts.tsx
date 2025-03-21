import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './UploadAccounts.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import CustomDragDropFile from '@/components/Buttons/CustomDragDropFile/CustomDragDropFile';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

const settingsOptions = ['Upload.modalUpload.check'];

export default function UploadAccounts() {
  const t = useTranslations('');

  const [selectCategory, setSelectCategory] = useState('');

  const [settings, setSettings] = useState(settingsOptions);
  console.log(setSettings);

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', data);
    toast.success(t('DBSettings.form.okMessage'));
    reset();
  };

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFileUpload = (file: File) => {
    console.log('Завантажений файл:', file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Upload.modalUpload.category')}
        </label>
        <CustomSelect
          label={'Facebook UA-фарм 7-дней'}
          options={['Facebook UA-фарм 7-дней', 'Facebook UA-фарм 10-дней']}
          selected={selectCategory}
          onSelect={setSelectCategory}
          width={508}
          selectWidth={383}
        />
        {errors.nameField && (
          <p className={styles.error}>{errors.nameField.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('Upload.modalUpload.names')}</label>
        <CustomSelect
          label={'Facebook UA-фарм 7-дней'}
          options={['Facebook UA-фарм 7-дней', 'Facebook UA-фарм 10-дней']}
          selected={selectCategory}
          onSelect={setSelectCategory}
          width={508}
          selectWidth={383}
        />
        {errors.nameCategoryField && (
          <p className={styles.error}>{errors.nameCategoryField.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <CustomCheckbox
          checked={checkedSettings[settings[0]] || false}
          onChange={() => toggleCheckbox(settings[0])}
          label={t(settings[0])}
        />
        {errors.nameCategoryField && (
          <p className={styles.error}>{errors.nameCategoryField.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <CustomDragDropFile
          acceptedExtensions={['xlsx', 'csv']}
          onFileUpload={handleFileUpload}
        />
        {errors.nameCategoryField && (
          <p className={styles.error}>{errors.nameCategoryField.message}</p>
        )}
      </div>
      <p className={ownStyles.locate_accounts}>
        {t('Upload.modalUpload.accounts')} <span>500</span>
      </p>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="Names.modalCreate.createBtn" />
      </div>
    </form>
  );
}
