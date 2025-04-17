'use client';

import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useAutofarmStore } from '@/store/autofarmStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';

interface FormData {
  availableQuantity: number;
  toDump: string;
  subcategoryId: string;
  fpNumber: string;
}

const settingsOptions = ['AutoFarmSection.modalLoad.check'];

interface UploadAccountsAutoFarmProps {
  geo: string;
  activityMode: string;
  onClose: () => void;
}

export default function UploadAccountsAutoFarm({
  geo,
  activityMode,
  onClose,
}: UploadAccountsAutoFarmProps) {
  const t = useTranslations();
  const {
    stats,
    setStats,
    fetchStatistics,
    dumpReadyAccounts,
    loading: autofarmLoading,
  } = useAutofarmStore();
  const {
    subcategories,
    fetchSubcategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      availableQuantity: 0,
      toDump: '',
      subcategoryId: '',
      fpNumber: '',
    },
  });

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});
  const toastId = useRef<string | number | null>(null);

  const availableQuantity = watch('availableQuantity');

  useEffect(() => {
    const stat = stats.find(s => s.geo === geo && s.mode === activityMode);
    if (!stat) {
      fetchStatistics({ geo, activity_mode: activityMode });
    }
  }, [geo, activityMode, stats, fetchStatistics]);

  useEffect(() => {
    const stat = stats.find(s => s.geo === geo && s.mode === activityMode);
    if (stat) {
      setValue('availableQuantity', stat.ready);
    }
  }, [stats, geo, activityMode, setValue]);

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const onSubmit = async (data: FormData) => {
    const toDumpNum = parseInt(data.toDump);
    if (toDumpNum > availableQuantity) {
      toast.error(t('AutoFarmSection.modalLoad.exceedQuantityError'));
      return;
    }

    if (!data.subcategoryId) {
      toast.error(t('AutoFarmSection.modalLoad.subcategoryRequired'));
      return;
    }

    if (!data.fpNumber) {
      toast.error(t('AutoFarmSection.modalLoad.fpNumberRequired'));
      return;
    }
    toastId.current = toast.info(t('AutoFarmSection.modalLoad.loading'), {
      autoClose: false,
    });

    try {
      const response = await dumpReadyAccounts({
        geo,
        activity_mode: activityMode,
        fp_number: parseInt(data.fpNumber),
        subcategory_id: parseInt(data.subcategoryId),
        to_dump: toDumpNum,
      });

      const subcategory = subcategories.find(
        sub => sub.account_subcategory_id === parseInt(data.subcategoryId)
      );

      const newAvailableQuantity = availableQuantity - response.quantity;

      setStats(
        stats.map(stat =>
          stat.geo === geo && stat.mode === activityMode
            ? { ...stat, ready: newAvailableQuantity }
            : stat
        )
      );

      toast.dismiss(toastId.current);
      toast.success(
        t('AutoFarmSection.modalLoad.successMessage', {
          subcategoryName: subcategory?.account_subcategory_name || 'Unknown',
          quantity: response.quantity,
        })
      );
      reset({
        availableQuantity: newAvailableQuantity,
        toDump: '',
        subcategoryId: '',
        fpNumber: '',
      });
    } catch {
      toast.dismiss(toastId.current);
      toast.error(t('AutoFarmSection.modalLoad.errorMessage'));
    }
  };

  useEffect(() => {
    console.log('autofarmLoading:', autofarmLoading);
  }, [autofarmLoading]);

  const subcategoryOptions = [
    t('AutoFarmSection.modalLoad.subcategoryPlaceholder'),
    ...subcategories.map(sub => sub.account_subcategory_name),
  ];

  const fpNumberOptions = [
    t('AutoFarmSection.modalLoad.fpNumberPlaceholder'),
    '0',
    '2',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalLoad.ablQuantity')}
        </label>
        <input
          className={styles.input}
          type="number"
          readOnly
          disabled
          {...register('availableQuantity')}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalLoad.loadQuantity')}
        </label>
        <input
          className={`${styles.input} ${
            errors.toDump ? styles.input_error : ''
          }`}
          type="number"
          placeholder={t('AutoFarmSection.modalLoad.loadQuantityPlaceholder')}
          {...register('toDump', {
            required: t('DBSettings.form.errorMessage'),
            min: {
              value: 1,
              message: t('AutoFarmSection.modalLoad.minQuantityError'),
            },
          })}
        />
        {errors.toDump && (
          <p className={styles.error}>{errors.toDump.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalLoad.subcategory')}
        </label>
        <CustomSelect
          options={subcategoryOptions}
          selected={
            watch('subcategoryId')
              ? [
                  subcategories.find(
                    sub =>
                      sub.account_subcategory_id ===
                      parseInt(watch('subcategoryId'))
                  )?.account_subcategory_name ||
                    t('AutoFarmSection.modalLoad.subcategoryPlaceholder'),
                ]
              : [t('AutoFarmSection.modalLoad.subcategoryPlaceholder')]
          }
          onSelect={(selected: string[]) => {
            if (
              selected[0] ===
              t('AutoFarmSection.modalLoad.subcategoryPlaceholder')
            ) {
              setValue('subcategoryId', '');
              return;
            }
            const selectedSubcategory = subcategories.find(
              sub => sub.account_subcategory_name === selected[0]
            );
            setValue(
              'subcategoryId',
              selectedSubcategory
                ? selectedSubcategory.account_subcategory_id.toString()
                : ''
            );
          }}
          width={298}
          multiSelections={false}
        />
        {categoriesLoading && <p>{t('AutoFarmSection.loading')}</p>}
        {categoriesError && <p className={styles.error}>{categoriesError}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalLoad.fpNumber')}
        </label>
        <CustomSelect
          options={fpNumberOptions}
          selected={
            watch('fpNumber')
              ? [watch('fpNumber')]
              : [t('AutoFarmSection.modalLoad.fpNumberPlaceholder')]
          }
          onSelect={(selected: string[]) => {
            if (
              selected[0] === t('AutoFarmSection.modalLoad.fpNumberPlaceholder')
            ) {
              setValue('fpNumber', '');
              return;
            }
            setValue('fpNumber', selected[0]);
          }}
          width={298}
          multiSelections={false}
        />
      </div>

      <div className={styles.field}>
        <CustomCheckbox
          checked={checkedSettings[settingsOptions[0]] || false}
          onChange={() => toggleCheckbox(settingsOptions[0])}
          label={t(settingsOptions[0])}
        />
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="AutoFarmSection.modalLoad.btnCancel"
          onClick={() => {
            reset();
            onClose();
          }}
        />
        <SubmitBtn
          text={
            autofarmLoading || categoriesLoading
              ? 'AutoFarmSection.modalLoad.loadingButton'
              : 'AutoFarmSection.modalLoad.btn'
          }
          disabled={autofarmLoading || categoriesLoading}
        />
      </div>
    </form>
  );
}
