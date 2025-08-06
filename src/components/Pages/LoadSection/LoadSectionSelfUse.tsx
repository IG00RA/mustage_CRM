'use client';

import styles from './LoadSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAccountsStore } from '@/store/accountsStore';
import { Account } from '@/types/accountsTypes';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import LoadAccountsConfirmSelfUse from '@/components/ModalComponent/LoadAccountsConfirm/LoadAccountsConfirmSelfUse';

type FormData = {
  nameField: string;
  accQuantity: string;
  purpose: string;
};

export default function LoadSectionSelfUse() {
  const t = useTranslations();
  const {
    categories,
    fetchCategories,
    subcategoriesWithParams: subcategories,
    fetchSubcategories,
  } = useCategoriesStore();
  const { fetchAccounts, downloadInternalAccounts } = useAccountsStore();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isLoadComplete, setIsLoadComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string[]>([]);
  const [totalAvailableAccounts, setTotalAvailableAccounts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCategories();
      } catch (error) {
        toast.error(`Error fetching data: ${error}`);
      }
    };

    fetchData();
  }, [fetchCategories]);

  useEffect(() => {
    if (
      selectedCategory.length > 0 &&
      selectedCategory[0] !== t('Load.category')
    ) {
      const categoryId = categories.find(
        cat => cat.account_category_name === selectedCategory[0]
      )?.account_category_id;
      if (categoryId) fetchSubcategories(categoryId, false);
    } else {
      setSelectedSubcategory([]);
      setTotalAvailableAccounts(0);
      reset({
        nameField: '',
        accQuantity: '',
        purpose: '',
      });
    }
  }, [selectedCategory, categories, fetchSubcategories, t, reset]);

  useEffect(() => {
    if (
      selectedSubcategory.length > 0 &&
      selectedSubcategory[0] !== t('Load.names')
    ) {
      const subcategory = subcategories.find(
        sub => sub.account_subcategory_name === selectedSubcategory[0]
      );
      if (subcategory) {
        fetchAccounts({
          subcategory_ids: [subcategory.account_subcategory_id],
          status: ['NOT SOLD'],
          platform: 'CRM',
          set_item_id: null,
        }).then(data => {
          setTotalAvailableAccounts(data.total_rows);
          setValue('nameField', data.total_rows.toString());
        });
      }
    } else {
      setTotalAvailableAccounts(0);
      reset({
        nameField: '',
        accQuantity: '',
        purpose: '',
      });
    }
  }, [selectedSubcategory, subcategories, fetchAccounts, setValue, t, reset]);

  const toggleConfirmModal = () => {
    setIsOpenConfirm(!isOpenConfirm);
    if (isLoadComplete) {
      setSelectedCategory([]);
    }
    setIsLoadComplete(false);
  };

  const onSubmit = (data: FormData) => {
    if (parseInt(data.accQuantity) > totalAvailableAccounts) {
      toast.error(
        `${t('Load.errorQuantityExceeds')}${totalAvailableAccounts}${t(
          'Load.errorQuantityExceedsSec'
        )}`
      );
      return;
    }
    setFormData(data);
    toggleConfirmModal();
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    const subcategory = subcategories.find(
      sub => sub.account_subcategory_name === selectedSubcategory[0]
    );

    const requestBody = {
      subcategory_id: subcategory?.account_subcategory_id || 0,
      quantity: parseInt(formData?.accQuantity || '0'),
      purpose: formData?.purpose || '',
    };
    try {
      const accounts = await downloadInternalAccounts(requestBody);
      generateFiles(accounts);
      toast.success(t('Load.successMessage'));
      setIsLoadComplete(true);
      reset({
        nameField: '',
        accQuantity: '',
        purpose: '',
      });
    } catch (error) {
      toast.error(`${t('Load.errorMessage')} : ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFiles = async (accounts: Account[]) => {
    const date = new Date();
    const fileName = `${accounts.length}_${
      selectedSubcategory[0]
    }_${date.getDate()}_${
      date.getMonth() + 1
    }_${date.getFullYear()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Accounts');

    worksheet.columns = [
      { header: 'account_id', key: 'account_id', width: 10 },
      { header: 'upload_datetime', key: 'upload_datetime', width: 25 },
      { header: 'sold_datetime', key: 'sold_datetime', width: 25 },
      { header: 'worker_name', key: 'worker_name', width: 15 },
      { header: 'teamlead_name', key: 'teamlead_name', width: 15 },
      { header: 'client_name', key: 'client_name', width: 15 },
      { header: 'account_name', key: 'account_name', width: 20 },
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

    accounts.forEach((acc: Account) => {
      worksheet.addRow({
        account_id: acc.account_id,
        upload_datetime: acc.upload_datetime,
        sold_datetime: acc.sold_datetime,
        worker_name: acc.worker_name,
        teamlead_name: acc.teamlead_name,
        client_name: acc.client_name,
        account_name: acc.account_name,
        status: acc.status,
        frozen_at: acc.frozen_at,
        replace_reason: acc.replace_reason,
        profile_link: acc.profile_link,
        archive_link: acc.archive_link,
        account_data: acc.account_data || '',
        seller_id: acc.seller?.seller_id || 0,
        seller_name: acc.seller?.seller_name || '',
        visible_in_bot: acc.seller?.visible_in_bot ?? false,
        account_subcategory_id: acc.subcategory.account_subcategory_id,
        account_subcategory_name: acc.subcategory.account_subcategory_name,
        account_category_id: acc.subcategory.account_category_id,
        description: acc.subcategory.description,
        output_format_field:
          acc.subcategory.output_format_field?.join(',') || '',
        output_separator: acc.subcategory.output_separator || '|',
        account_category_name:
          acc.subcategory.category?.account_category_name || '',
        destination_id: acc.destination?.destination_id,
        browser_id: acc.destination?.browser_id,
        username: acc.destination?.username,
        browser_name: acc.destination?.browser?.browser_name || '',
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
      .map((acc: Account) => {
        const formatFields = acc.subcategory.output_format_field || [
          'account_name',
        ];
        const separator = acc.subcategory.output_separator || '|';
        return formatFields
          .map((field: string) => {
            if (field === 'account_subcategory_id') {
              return acc.subcategory.account_subcategory_id;
            } else if (field === 'account_data') {
              return acc.account_data === null
                ? 'null'
                : acc.account_data || '';
            } else if (field === 'archive_link') {
              return acc.archive_link || '';
            } else {
              const value = acc[field as keyof typeof acc];
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

  const handleCategorySelect = (values: string[]) => {
    setSelectedSubcategory([]);
    const value = values[0] || '';
    setSelectedCategory([value]);
    if (value === t('Load.category')) {
      setSelectedSubcategory([]);
      setTotalAvailableAccounts(0);
      reset({
        nameField: '',
        accQuantity: '',
        purpose: '',
      });
    }
  };

  const handleSubcategorySelect = (values: string[]) => {
    const value = values[0] || '';
    setSelectedSubcategory([value]);
    if (value === t('Load.names')) {
      setTotalAvailableAccounts(0);
      reset({
        nameField: '',
        accQuantity: '',
        purpose: '',
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Load.headerSelf')}</h2>
        <p className={styles.header_text}>{t('Load.headerTextSelf')}</p>
        <div className={styles.selects_wrap}>
          <CustomSelect
            label={t('Load.selectCategory')}
            options={[
              t('Load.category'),
              ...categories.map(cat => cat.account_category_name),
            ]}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
            width={'100%'}
            multiSelections={false}
          />
          <CustomSelect
            label={t('Load.selectNames')}
            options={[
              t('Load.names'),
              ...subcategories.map(sub => sub.account_subcategory_name),
            ]}
            selected={selectedSubcategory}
            onSelect={handleSubcategorySelect}
            width={'100%'}
            multiSelections={false}
          />
        </div>
        {selectedSubcategory.length > 0 &&
          selectedSubcategory[0] !== t('Load.names') && (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.field}>
                <div className={styles.label_wrap}>
                  <label className={styles.label}>
                    {t('Load.namesQuantity')}
                  </label>
                  <input
                    className={`${styles.input} ${
                      errors.nameField ? styles.input_error : ''
                    }`}
                    readOnly
                    {...register('nameField', {
                      required: t('DBSettings.form.errorMessage'),
                    })}
                  />
                </div>
                {errors.nameField && (
                  <p className={styles.error}>{errors.nameField.message}</p>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.label_wrap}>
                  <label className={styles.label}>
                    {t('Load.accQuantity')}
                  </label>
                  <input
                    type="number"
                    className={`${styles.input} ${
                      errors.accQuantity ? styles.input_error : ''
                    }`}
                    placeholder={t('DBSettings.form.placeholder')}
                    {...register('accQuantity', {
                      required: t('DBSettings.form.errorMessage'),
                      max: {
                        value: totalAvailableAccounts,
                        message: `${t(
                          'Load.errorQuantityExceeds'
                        )}${totalAvailableAccounts}${t(
                          'Load.errorQuantityExceedsSec'
                        )}`,
                      },
                    })}
                  />
                </div>
                {errors.accQuantity && (
                  <p className={styles.error}>{errors.accQuantity.message}</p>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.label_wrap}>
                  <label className={styles.label}>{t('Load.purpose')}</label>
                  <input
                    className={`${styles.input} ${
                      errors.purpose ? styles.input_error : ''
                    }`}
                    placeholder={t('DBSettings.form.placeholder')}
                    {...register('purpose', {
                      required: t('DBSettings.form.errorMessage'),
                    })}
                  />
                </div>
                {errors.purpose && (
                  <p className={styles.error}>{errors.purpose.message}</p>
                )}
              </div>
              <div className={styles.buttons_wrap}>
                <SubmitBtn text="Load.button" />
              </div>
            </form>
          )}
      </div>

      <ModalComponent
        isOpen={isOpenConfirm}
        onClose={toggleConfirmModal}
        title={
          isLoadComplete
            ? 'Load.modalConfirm.titleOk'
            : 'Load.modalConfirm.title'
        }
        icon={isLoadComplete ? 'icon-ok-load' : ''}
      >
        <LoadAccountsConfirmSelfUse
          category={selectedCategory[0] || ''}
          names={selectedSubcategory[0] || ''}
          accQuantity={formData?.accQuantity || ''}
          purpose={formData?.purpose || ''}
          onConfirm={handleConfirmSubmit}
          isLoading={isLoading}
          onClose={toggleConfirmModal}
          isLoadComplete={isLoadComplete}
        />
      </ModalComponent>
    </section>
  );
}
