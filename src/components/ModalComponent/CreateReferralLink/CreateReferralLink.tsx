import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './CreateReferralLink.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function CreateReferralLink() {
  const t = useTranslations('');

  const [selectCategory, setSelectCategory] = useState('');

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', data);
    toast.success(t('DBSettings.form.okMessage'));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>{t('ReferralsStat.referral')}</label>
        <CustomSelect
          options={['Рэндом нейм']}
          selected={selectCategory}
          onSelect={setSelectCategory}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('ReferralsStat.tableTop.refParam')}
        </label>
        <input
          className={`${styles.input} ${
            errors.columnName ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('columnName', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.columnName && (
          <p className={styles.error}>{errors.columnName.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <CustomCheckbox
          checked={
            checkedSettings['ReferralsStat.modalCreate.checkSell'] || false
          }
          onChange={() => toggleCheckbox('ReferralsStat.modalCreate.checkSell')}
          label={t('ReferralsStat.modalCreate.checkSell')}
        />
      </div>
      <div className={ownStyles.buttons_wrap}>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('ReferralsAll.modalCreate.sellModel')}
          </label>
          <CustomSelect
            options={['RevShare']}
            selected={selectCategory}
            onSelect={setSelectCategory}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            {t('ReferralsAll.modalCreate.percent')}
          </label>
          <CustomSelect
            options={['5%']}
            selected={selectCategory}
            onSelect={setSelectCategory}
          />
        </div>
      </div>
      <div className={styles.field}>
        <CustomCheckbox
          checked={checkedSettings['ReferralsAll.modalCreate.add'] || false}
          onChange={() => toggleCheckbox('ReferralsAll.modalCreate.add')}
          label={t('ReferralsAll.modalCreate.add')}
        />
      </div>
      <div className={ownStyles.buttons_wrap}>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('ReferralsAll.modalCreate.sellModel')}
          </label>
          <CustomSelect
            options={['CPA']}
            selected={selectCategory}
            onSelect={setSelectCategory}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            {t('ReferralsAll.modalCreate.sum')}
          </label>
          <CustomSelect
            options={['20$']}
            selected={selectCategory}
            onSelect={setSelectCategory}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('ReferralsAll.modalCreate.minSum')}
        </label>
        <input
          className={`${styles.input} ${
            errors.columnName ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('columnName', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.columnName && (
          <p className={styles.error}>{errors.columnName.message}</p>
        )}
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="ReferralsStat.modalCreate.addBtn" />
      </div>
    </form>
  );
}
