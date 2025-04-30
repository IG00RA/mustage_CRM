'use client';

import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './ResultReplace.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState, useEffect } from 'react';
import { useAccountsStore } from '@/store/accountsStore';
import { useUsersStore } from '@/store/usersStore';
import { SearchResults } from '@/components/Pages/ReplacementSection/ReplacementSection';
import {
  ReplaceRequest,
  AccountDataWrapper,
  SellAccountsResponse,
} from '@/types/accountsTypes';
import ExcelJS from 'exceljs';
import { Subcategory } from '@/types/categoriesTypes';

interface ResultReplaceProps {
  searchResults: SearchResults | null;
  onClose: () => void;
}

type FormData = {
  nick: string;
  reason: string;
  newPrice: number;
  dolphinMail?: string;
  seller_name: string;
};

const settingsOptions = ['ReplacementSection.check'];

export default function ResultReplace({
  searchResults,
  onClose,
}: ResultReplaceProps) {
  const t = useTranslations();
  const [settings] = useState(settingsOptions);
  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { replaceAccounts } = useAccountsStore();
  const { currentUser, fetchCurrentUser } = useUsersStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
    let isMounted = true;

    const fetchData = async () => {
      try {
        await fetchCurrentUser();
        if (isMounted && currentUser?.seller?.seller_name) {
          setValue('seller_name', currentUser.seller.seller_name);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser, setValue]);

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const generateFiles = async (data: SellAccountsResponse) => {
    const accounts: AccountDataWrapper[] = data.account_data;
    const date = new Date();
    const fileName = `replace_${accounts.length}_${
      majoritySubcategory?.account_subcategory_name || 'unknown'
    }_${date.getDate()}_${
      date.getMonth() + 1
    }_${date.getFullYear()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ReplacedAccounts');

    worksheet.columns = [
      { header: 'transfer_requested', key: 'transfer_requested', width: 15 },
      { header: 'transfer_success', key: 'transfer_success', width: 15 },
      { header: 'transfer_message', key: 'transfer_message', width: 20 },
      { header: 'account_id', key: 'account_id', width: 10 },
      { header: 'upload_datetime', key: 'upload_datetime', width: 25 },
      { header: 'sold_datetime', key: 'sold_datetime', width: 25 },
      { header: 'worker_name', key: 'worker_name', width: 15 },
      { header: 'teamlead_name', key: 'teamlead_name', width: 15 },
      { header: 'client_name', key: 'client_name', width: 15 },
      { header: 'account_name', key: 'account_name', width: 20 },
      { header: 'price', key: 'price', width: 10 },
      { header: 'status', key: 'status', width: 10 },
      { header: 'frozen_at', key: 'frozen_at', width: 25 },
      { header: 'replace_reason', key: 'replace_reason', width: 20 },
      { header: 'profile_link', key: 'profile_link', width: 30 },
      { header: 'archive_link', key: 'archive_link', width: 30 },
      { header: 'account_data', key: 'account_data', width: 20 },
      { header: 'seller_id', key: 'seller_id', width: 10 },
      { header: 'seller_name', key: 'seller_name', width: 15 },
      { header: 'visible_in_bot', key: 'visible_in_bot', width: 15 },
      {
        header: 'account_subcategory_id',
        key: 'account_subcategory_id',
        width: 20,
      },
      {
        header: 'account_subcategory_name',
        key: 'account_subcategory_name',
        width: 20,
      },
      { header: 'account_category_id', key: 'account_category_id', width: 20 },
      { header: 'price_subcategory', key: 'price_subcategory', width: 15 },
      { header: 'cost_price', key: 'cost_price', width: 15 },
      { header: 'description', key: 'description', width: 20 },
      { header: 'output_format_field', key: 'output_format_field', width: 20 },
      { header: 'output_separator', key: 'output_separator', width: 15 },
      {
        header: 'account_category_name',
        key: 'account_category_name',
        width: 20,
      },
      { header: 'destination_id', key: 'destination_id', width: 15 },
      { header: 'browser_id', key: 'browser_id', width: 15 },
      { header: 'username', key: 'username', width: 15 },
      { header: 'browser_name', key: 'browser_name', width: 15 },
    ];

    accounts.forEach((acc: AccountDataWrapper) => {
      worksheet.addRow({
        transfer_requested: acc.transfer_requested,
        transfer_success: acc.transfer_success,
        transfer_message: acc.transfer_message,
        account_id: acc.account.account_id,
        upload_datetime: acc.account.upload_datetime,
        sold_datetime: acc.account.sold_datetime,
        worker_name: acc.account.worker_name,
        teamlead_name: acc.account.teamlead_name,
        client_name: acc.account.client_name,
        account_name: acc.account.account_name,
        price: acc.account.price,
        status: acc.account.status,
        frozen_at: acc.account.frozen_at,
        replace_reason: acc.account.replace_reason,
        profile_link: acc.account.profile_link,
        archive_link: acc.account.archive_link,
        account_data: acc.account.account_data || '',
        seller_id: acc.account.seller?.seller_id || 0,
        seller_name: acc.account.seller?.seller_name || '',
        visible_in_bot: acc.account.seller?.visible_in_bot ?? false,
        account_subcategory_id: acc.account.subcategory.account_subcategory_id,
        account_subcategory_name:
          acc.account.subcategory.account_subcategory_name,
        account_category_id: acc.account.subcategory.account_category_id,
        price_subcategory: acc.account.subcategory.price,
        cost_price: acc.account.subcategory.cost_price,
        description: acc.account.subcategory.description,
        output_format_field:
          acc.account.subcategory.output_format_field?.join(',') || '',
        output_separator: acc.account.subcategory.output_separator || '|',
        account_category_name:
          acc.account.subcategory.category?.account_category_name || '',
        destination_id: acc.account.destination?.destination_id,
        browser_id: acc.account.destination?.browser_id,
        username: acc.account.destination?.username,
        browser_name: acc.account.destination?.browser?.browser_name || '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xlsx`;
    link.click();

    const txtContent = accounts
      .map((acc: AccountDataWrapper) => {
        const formatFields = acc.account.subcategory.output_format_field || [
          'account_name',
        ];
        const separator = acc.account.subcategory.output_separator || '|';
        return formatFields
          .map((field: string) => {
            if (field === 'account_subcategory_id') {
              return acc.account.subcategory.account_subcategory_id;
            } else if (field === 'account_data') {
              return acc.account.account_data === null
                ? 'null'
                : acc.account.account_data || '';
            } else if (field === 'archive_link') {
              return acc.account.archive_link || '';
            } else {
              const value = acc.account[field as keyof typeof acc.account];
              return value === null ? 'null' : value || '';
            }
          })
          .join(separator);
      })
      .join('\n');
    const txtBlob = new Blob([txtContent], { type: 'text/plain' });
    const txtLink = document.createElement('a');
    txtLink.href = URL.createObjectURL(txtBlob);
    txtLink.download = `${fileName}.txt`;
    txtLink.click();
  };

  const onSubmit = async (data: FormData) => {
    if (!filteredAccounts.length || !currentUser?.seller?.seller_id) {
      toast.error(t('ReplacementSection.modalReplace.validationError'));
      return;
    }

    const requestBody: ReplaceRequest = {
      account_ids: filteredAccounts.map(acc => acc.account_id),
      subcategory_id: majoritySubcategory!.account_subcategory_id,
      seller_id: currentUser.seller.seller_id,
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
      generateFiles(response); // Генерація та завантаження файлів
      reset();
      setCheckedSettings({}); // Очищення чекбоксу
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
        <div className={ownStyles.label_wrap}>
          <label className={styles.label}>
            {t('ReplacementSection.modalReplace.seller')}
          </label>
          <input
            className={`${styles.input} ${
              errors.seller_name ? styles.input_error : ''
            }`}
            readOnly
            {...register('seller_name', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
        </div>
        {errors.seller_name && (
          <p className={styles.error}>{errors.seller_name.message}</p>
        )}
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
