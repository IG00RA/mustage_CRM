import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './CreateReferral.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState } from 'react';
import { CustomSelect } from '@/components/Buttons/CustomSelect/CustomSelect';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function CreateReferral() {
  const t = useTranslations('');

  const [selectCategory, setSelectCategory] = useState('');
  const [selectNames, setSelectNames] = useState('');
  const [settings, setSettings] = useState('PromoCodeSection.modal.check');

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

  const toggleCreateName = () => {
    toast.success(t('DBSettings.form.okMessage'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={ownStyles.field_wrap_main}>
        <div className={ownStyles.field_wrap}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.name')}
            </label>
            <input
              className={`${styles.input} ${
                errors.displayName ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('displayName', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.displayName && (
              <p className={styles.error}>{errors.displayName.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.tg')}
            </label>
            <input
              className={`${styles.input} ${
                errors.displayName ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('displayName', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.displayName && (
              <p className={styles.error}>{errors.displayName.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.email')}
            </label>
            <input
              className={`${styles.input} ${
                errors.displayName ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('displayName', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.displayName && (
              <p className={styles.error}>{errors.displayName.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.login')}
            </label>
            <input
              className={`${styles.input} ${
                errors.displayName ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('displayName', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.displayName && (
              <p className={styles.error}>{errors.displayName.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.pass')}
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
        </div>
        <div className={ownStyles.field_wrap_second}>
          <div className={styles.field}>
            <label className={`${styles.label} ${ownStyles.label}`}>
              {t('ReferralsAll.modalCreate.defaultModel')}
            </label>
            <CustomCheckbox
              checked={
                checkedSettings['ReferralsAll.modalCreate.sellCheck'] || false
              }
              onChange={() =>
                toggleCheckbox('ReferralsAll.modalCreate.sellCheck')
              }
              label={t('ReferralsAll.modalCreate.sellCheck')}
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
                options={['10%']}
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
                options={['20%']}
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
        </div>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="ReferralsAll.modalCreate.addBtn" />
      </div>
    </form>
  );
}
