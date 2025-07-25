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
import {
  AccountDataWrapper,
  SellAccountsResponse,
} from '@/types/accountsTypes';
import { useUsersStore } from '@/store/usersStore';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import LoadAccountsConfirm from '@/components/ModalComponent/LoadAccountsConfirm/LoadAccountsConfirm';

type FormData = {
  nameField: string;
  accQuantity: string;
  price: string;
  cost: string;
  seller_name: string;
  nameDescription: string;
  tgNick: string;
  dolphinMail?: string;
  settings: string[];
};

const settingsOptions = ['Load.check'];

export default function LoadSection() {
  const t = useTranslations();
  const {
    categories,
    fetchCategories,
    subcategoriesWithParams: subcategories,
    fetchSubcategories,
  } = useCategoriesStore();
  const { fetchAccounts, sellAccounts } = useAccountsStore();
  const { currentUser, fetchCurrentUser } = useUsersStore();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isLoadComplete, setIsLoadComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string[]>([]);
  const [totalAvailableAccounts, setTotalAvailableAccounts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        await fetchCategories();
        await fetchCurrentUser();
        if (isMounted && currentUser?.seller?.seller_name) {
          setValue('seller_name', currentUser.seller.seller_name);
        }
      } catch (error) {
        toast.error(`Error fetching data: ${error}`);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchCategories, fetchCurrentUser, setValue]);

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
        cost: '',
        nameDescription: '',
        tgNick: '',
        dolphinMail: '',
        seller_name: '',
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
        setValue('cost', subcategory.cost_price.toString());
        setValue('nameDescription', subcategory.price.toString());
        fetchAccounts({
          subcategory_ids: [subcategory.account_subcategory_id],
          status: ['NOT SOLD'],
          platform: 'CRM',
          set_item_id: null,
        }).then(data => {
          setTotalAvailableAccounts(data.total_rows);
          setValue('nameField', data.total_rows.toString());
          setValue('seller_name', currentUser?.seller?.seller_name || '');
        });
      }
    } else {
      setTotalAvailableAccounts(0);
      reset({
        nameField: '',
        accQuantity: '',
        cost: '',
        nameDescription: '',
        tgNick: '',
        dolphinMail: '',
        seller_name: '',
      });
    }
  }, [selectedSubcategory, subcategories, fetchAccounts, setValue, t, reset]);

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
      seller_id: currentUser?.seller?.seller_id || 0,
      quantity: parseInt(formData?.accQuantity || '0'),
      price: parseFloat(formData?.nameDescription || '0'),
      client_name: formData?.tgNick || '',
      client_dolphin_email: checkedSettings[settingsOptions[0]]
        ? formData?.dolphinMail
        : undefined,
    };
    try {
      const data = await sellAccounts(requestBody);
      if (data.success) {
        generateFiles(data);
        toast.success(t('Load.successMessage'));
        setIsLoadComplete(true);
        reset({
          nameField: '',
          accQuantity: '',
          cost: '',
          nameDescription: '',
          tgNick: '',
          dolphinMail: '',
          seller_name: '',
        });
        setCheckedSettings({});
      } else {
        toast.error(t('Load.errorMessage'));
      }
    } catch (error) {
      toast.error(`${t('Load.errorMessage')} : ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFiles = async (data: SellAccountsResponse) => {
    const accounts: AccountDataWrapper[] = data.account_data;
    const date = new Date();
    const fileName = `${accounts.length}_${
      selectedSubcategory[0]
    }_${date.getDate()}_${
      date.getMonth() + 1
    }_${date.getFullYear()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Accounts');

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
        cost: '',
        nameDescription: '',
        tgNick: '',
        dolphinMail: '',
        seller_name: '',
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
        cost: '',
        nameDescription: '',
        tgNick: '',
        dolphinMail: '',
        seller_name: '',
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.load')}</h2>
        <p className={styles.header_text}>{t('Load.headerText')}</p>
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
                  <label className={styles.label}>{t('Load.seller')}</label>
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
                <div className={styles.label_wrap}>
                  <label className={styles.label}>{t('Load.namesCost')}</label>
                  <input
                    type="number"
                    step="any"
                    className={`${styles.input} ${
                      errors.cost ? styles.input_error : ''
                    }`}
                    {...register('cost', {
                      required: t('DBSettings.form.errorMessage'),
                    })}
                  />
                </div>
                {errors.cost && (
                  <p className={styles.error}>{errors.cost.message}</p>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.label_wrap}>
                  <label className={styles.label}>{t('Load.sellSum')}</label>
                  <input
                    type="number"
                    step="any"
                    className={`${styles.input} ${
                      errors.nameDescription ? styles.input_error : ''
                    }`}
                    placeholder={t('DBSettings.form.placeholder')}
                    {...register('nameDescription', {
                      required: t('DBSettings.form.errorMessage'),
                    })}
                  />
                </div>
                {errors.nameDescription && (
                  <p className={styles.error}>
                    {errors.nameDescription.message}
                  </p>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.label_wrap}>
                  <label className={styles.label}>{t('Load.tgNick')}</label>
                  <input
                    className={`${styles.input} ${
                      errors.tgNick ? styles.input_error : ''
                    }`}
                    placeholder={t('DBSettings.form.placeholder')}
                    {...register('tgNick', {
                      required: t('DBSettings.form.errorMessage'),
                    })}
                  />
                </div>
                {errors.tgNick && (
                  <p className={styles.error}>{errors.tgNick.message}</p>
                )}
              </div>
              <div className={styles.field}>
                <CustomCheckbox
                  checked={checkedSettings[settingsOptions[0]] || false}
                  onChange={() => toggleCheckbox(settingsOptions[0])}
                  label={t(settingsOptions[0])}
                />
              </div>
              {checkedSettings[settingsOptions[0]] && (
                <div className={styles.field}>
                  <div className={styles.label_wrap}>
                    <label className={styles.label}>
                      {t('Load.dolphinMail')}
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
        <LoadAccountsConfirm
          category={selectedCategory[0] || ''}
          names={selectedSubcategory[0] || ''}
          accQuantity={formData?.accQuantity || ''}
          seller={currentUser?.seller?.seller_name || ''}
          sellSum={formData?.nameDescription || ''}
          tgNick={formData?.tgNick || ''}
          onConfirm={handleConfirmSubmit}
          isLoading={isLoading}
          onClose={toggleConfirmModal}
          isLoadComplete={isLoadComplete}
        />
      </ModalComponent>
    </section>
  );
}
