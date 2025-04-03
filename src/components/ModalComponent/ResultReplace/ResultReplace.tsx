'use client';

import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './ResultReplace.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState, useEffect } from 'react';
import { useSellersStore } from '@/store/sellersStore';
import { useAccountsStore } from '@/store/accountsStore';
import { SearchResults } from '@/components/ReplacementSection/ReplacementSection';
import { ReplaceRequest, Subcategory } from '@/types/salesTypes';

interface ResultReplaceProps {
  searchResults: SearchResults | null;
  onClose: () => void;
}

type FormData = {
  nick: string;
  reason: string;
  newPrice: number;
  dolphinMail?: string;
};

const settingsOptions = ['ReplacementSection.check'];

export default function ResultReplace({
  searchResults,
  onClose,
}: ResultReplaceProps) {
  const t = useTranslations();
  const [settings] = useState(settingsOptions);
  const [selectSeller, setSelectSeller] = useState<string[]>([]);
  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sellers, fetchSellers } = useSellersStore();
  const { replaceAccounts } = useAccountsStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const getMajoritySubcategory = (): Subcategory | null => {
    if (!searchResults?.foundAccounts.length) return null;

    const subcategoryCount = new Map<number, number>();
    searchResults.foundAccounts.forEach(account => {
      const subcatId = account.subcategory.account_subcategory_id;
      subcategoryCount.set(subcatId, (subcategoryCount.get(subcatId) || 0) + 1);
    });

    let maxCount = 0;
    let majoritySubcategory: number | null = null;
    subcategoryCount.forEach((count, subcatId) => {
      if (count > maxCount) {
        maxCount = count;
        majoritySubcategory = subcatId;
      }
    });

    const majorityAccount = searchResults.foundAccounts.find(
      acc => acc.subcategory.account_subcategory_id === majoritySubcategory
    );
    return majorityAccount?.subcategory || null;
  };

  const majoritySubcategory = getMajoritySubcategory();

  const filteredAccounts =
    searchResults?.foundAccounts.filter(
      acc =>
        acc.subcategory.account_subcategory_id ===
        majoritySubcategory?.account_subcategory_id
    ) || [];

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const onSubmit = async (data: FormData) => {
    if (!filteredAccounts.length || !selectSeller[0]) {
      toast.error(t('ReplacementSection.modalReplace.validationError'));
      return;
    }

    const selectedSeller = sellers.find(s => s.seller_name === selectSeller[0]);
    if (!selectedSeller) {
      toast.error(t('ReplacementSection.modalReplace.sellerError'));
      return;
    }

    const requestBody: ReplaceRequest = {
      account_ids: filteredAccounts.map(acc => acc.account_id),
      subcategory_id: majoritySubcategory!.account_subcategory_id,
      seller_id: selectedSeller.seller_id,
      replace_reason: data.reason,
      new_price: data.newPrice,
      client_name: data.nick,
      ...(checkedSettings[settings[0]] && {
        client_dolphin_email: data.dolphinMail,
      }),
    };

    try {
      setIsSubmitting(true);
      const response = await replaceAccounts(requestBody);

      if (!response.success) {
        throw new Error('Replacement failed');
      }

      toast.success(t('ReplacementSection.modalReplace.success'));
      reset();
      onClose();
    } catch (error) {
      toast.error(String(error) || t('ReplacementSection.modalReplace.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <div className={ownStyles.label_wrap}>
          <label className={styles.label}>
            {t('ReplacementSection.modalReplace.accQuantity')}
          </label>
          <input
            className={`${styles.input} ${ownStyles.input_numb} ${ownStyles.input}`}
            value={filteredAccounts.length}
            readOnly
            disabled
          />
        </div>
      </div>
      <div className={styles.field}>
        <div className={ownStyles.label_wrap}>
          <label className={styles.label}>
            {t('ReplacementSection.modalReplace.category')}
          </label>
          <input
            className={`${styles.input} ${ownStyles.input}`}
            value={majoritySubcategory?.category?.account_category_name || ''}
            readOnly
            disabled
          />
        </div>
      </div>
      <div className={styles.field}>
        <div className={ownStyles.label_wrap}>
          <label className={styles.label}>
            {t('ReplacementSection.modalReplace.names')}
          </label>
          <input
            className={`${styles.input} ${ownStyles.input}`}
            value={majoritySubcategory?.account_subcategory_name || ''}
            readOnly
            disabled
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('ReplacementSection.modalReplace.seller')}
        </label>
        <CustomSelect
          options={[
            t('ReplacementSection.modalReplace.sellerSelect'),
            ...sellers.map(seller => seller.seller_name || ''),
          ]}
          selected={selectSeller}
          onSelect={setSelectSeller}
          width={'100%'}
          multiSelections={false}
        />
      </div>
      <div className={styles.field}>
        <div className={ownStyles.label_wrap}>
          <label className={styles.label}>
            {t('ReplacementSection.modalReplace.nick')}
          </label>
          <input
            className={`${styles.input} ${
              errors.nick ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            {...register('nick', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
        </div>
        {errors.nick && <p className={styles.error}>{errors.nick.message}</p>}
      </div>
      <div className={styles.field}>
        <div className={ownStyles.label_wrap}>
          <label className={styles.label}>
            {t('ReplacementSection.modalReplace.reason')}
          </label>
          <input
            className={`${styles.input} ${
              errors.reason ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            {...register('reason', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
        </div>
        {errors.reason && (
          <p className={styles.error}>{errors.reason.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <div className={ownStyles.label_wrap}>
          <label className={styles.label}>
            {t('ReplacementSection.modalReplace.newPrice')}
          </label>
          <input
            className={`${styles.input} ${
              errors.newPrice ? styles.input_error : ''
            }`}
            type="number"
            step="any"
            placeholder={t('DBSettings.form.placeholder')}
            {...register('newPrice', {
              required: t('DBSettings.form.errorMessage'),
              valueAsNumber: true,
            })}
          />
        </div>
        {errors.newPrice && (
          <p className={styles.error}>{errors.newPrice.message}</p>
        )}
      </div>
      <div className={ownStyles.checkbox}>
        <CustomCheckbox
          checked={checkedSettings[settings[0]] || false}
          onChange={() => toggleCheckbox(settings[0])}
          label={t(settings[0])}
        />
      </div>
      {checkedSettings[settings[0]] && (
        <div className={styles.field}>
          <div className={ownStyles.label_wrap}>
            <label className={styles.label}>
              {t('ReplacementSection.dolphinMail')}
            </label>
            <input
              className={`${styles.input} ${
                errors.dolphinMail ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('dolphinMail', {
                required: t('DBSettings.form.errorMessage'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('ReplacementSection.invalidEmail'),
                },
              })}
            />
          </div>
          {errors.dolphinMail && (
            <p className={styles.error}>{errors.dolphinMail.message}</p>
          )}
        </div>
      )}
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="ReplacementSection.modalReplace.btnCancel"
          onClick={handleClose}
        />
        <SubmitBtn
          text={
            isSubmitting
              ? 'ReplacementSection.modalReplace.isSubmitting'
              : 'ReplacementSection.modalReplace.btnOk'
          }
        />
      </div>
    </form>
  );
}
