import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './CreatePromoCode.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function CreatePromoCode() {
  const t = useTranslations('');

  const [selectCategory, setSelectCategory] = useState('');
  const [selectNames, setSelectNames] = useState('');
  const [settings, setSettings] = useState('PromoCodeSection.modal.check');

  console.log(setSettings);

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
              {t('PromoCodeSection.modal.promoName')}
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
            <label className={styles.label}>
              {t('PromoCodeSection.modal.code')}
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
              {t('PromoCodeSection.modal.discount')}
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
            <CustomCheckbox
              checked={checkedSettings[settings] || false}
              onChange={() => toggleCheckbox(settings)}
              label={t(settings)}
            />
          </div>
          <div className={ownStyles.data_wrap}>
            <div className={ownStyles.field}>
              <label className={styles.label}>
                {t('PromoCodeSection.modal.date')}
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
            <div className={ownStyles.field}>
              <label className={styles.label}>
                {t('PromoCodeSection.modal.time')}
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
          </div>
        </div>
        <div className={ownStyles.field_wrap_second}>
          <p className={ownStyles.field_header}>
            {t('PromoCodeSection.modal.namesDiscount')}
          </p>
          <div className={ownStyles.buttons_wrap}>
            <label className={styles.label}>
              {t('PromoCodeSection.modal.category')}
            </label>
            <CustomSelect
              options={['Facebook UA-ручной фарм']}
              selected={selectCategory}
              onSelect={setSelectCategory}
            />
            <WhiteBtn
              onClick={toggleCreateName}
              text={'PromoCodeSection.modal.categoryBtn'}
              icon="icon-add-color"
              iconFill="icon-add-color"
            />
            <CustomButtonsInput
              onRemove={() => {}}
              buttons={['Facebook UA-фарм 7-дней - 10 шт.']}
            />
          </div>
          <div className={ownStyles.buttons_wrap}>
            <label className={styles.label}>
              {t('PromoCodeSection.modal.names')}
            </label>
            <CustomSelect
              options={['Все наименования']}
              selected={selectNames}
              onSelect={setSelectNames}
              width={602}
            />
            <WhiteBtn
              onClick={toggleCreateName}
              text={'PromoCodeSection.modal.namesBtn'}
              icon="icon-add-color"
              iconFill="icon-add-color"
            />
            <CustomButtonsInput
              onRemove={() => {}}
              buttons={['Facebook UA-фарм 7-дней - 10 шт.']}
            />
          </div>
        </div>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="PromoCodeSection.modal.addBtn" />
      </div>
    </form>
  );
}
