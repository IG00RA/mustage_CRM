'use client';

import styles from './ReplacementSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import ModalComponent from '../ModalComponent/ModalComponent';
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import SubmitBtn from '../Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import CustomCheckbox from '../Buttons/CustomCheckbox/CustomCheckbox';
import SearchInput from '../Buttons/SearchInput/SearchInput';
import ReplacementAccount from '../ModalComponent/ReplacementAccount/ReplacementAccount';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

interface Table {
  id: number;
  name: string;
  category: string;
  seller: string;
  status: string;
}

const data: Table[] = [
  {
    id: 1,
    name: 'Reece Chung',
    category: 'Аккаунты Facebook UA-гео ручного фарма',
    seller: 'Шоп',
    status: 'Передан',
  },
  {
    id: 2,
    name: 'Lucian Obrien',
    category: 'Hegmann, Kreiger and Bayer',
    seller: 'Максим Куролап',
    status: 'Не передан',
  },
  {
    id: 3,
    name: 'farm # 11712 - Chloe Cox',
    category: 'Facebook PL (самореги)',
    seller: 'Шоп',
    status: 'Передан',
  },
  {
    id: 4,
    name: 'Dejafarm # 11170 - Mia HayesBrady',
    category: 'Facebook UA (самореги)',
    seller: 'Максим Куролап',
    status: 'Не передан',
  },
  {
    id: 5,
    name: '1 farm # 11513 - Harper Perry',
    category: 'Facebook UA (ручной фарм)',
    seller: 'Шоп',
    status: 'Передан',
  },
  {
    id: 6,
    name: 'Reece Chung',
    category: 'Аккаунты Facebook UA-гео ручного фарма',
    seller: 'Максим Куролап',
    status: 'Не передан',
  },
  {
    id: 7,
    name: 'Lucian Obrien',
    category: 'Hegmann, Kreiger and Bayer',
    seller: 'Шоп',
    status: 'Передан',
  },
  {
    id: 8,
    name: 'farm # 11712 - Chloe Cox',
    category: 'Facebook PL (самореги)',
    seller: 'Максим Куролап',
    status: 'Не передан',
  },
  {
    id: 9,
    name: 'Dejafarm # 11170 - Mia HayesBrady',
    category: 'Facebook UA (самореги)',
    seller: 'Шоп',
    status: 'Передан',
  },
  {
    id: 10,
    name: '1 farm # 11513 - Harper Perry',
    category: 'Facebook UA (ручной фарм)',
    seller: 'Максим Куролап',
    status: 'Не передан',
  },
];

const settingsOptions = ['ReplacementSection.check'];

export default function ReplacementSection() {
  const t = useTranslations();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);

  const [selectCategory, setSelectCategory] = useState('');
  const [selectNames, setSelectNames] = useState('');
  const [settings, setSettings] = useState(settingsOptions);

  console.log(globalFilter);
  console.log(setSettings);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    setFormData(data);
    toggleConfirmModal();
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

  const toggleConfirmModal = () => {
    setIsOpenConfirm(!isOpenConfirm);
  };

  const categoryNames = [...new Set(data.map(category => category.name))];

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.replacement')}</h2>
        <p className={styles.header_text}>
          {t('ReplacementSection.headerText')}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.label_wrap}>
              <label className={styles.label}>
                {t('ReplacementSection.search')}
              </label>
              <SearchInput
                onSearch={query => setGlobalFilter(query)}
                text={'ReplacementSection.searchBtn'}
                options={categoryNames}
                width="100%"
              />
            </div>
            {errors.nameField && (
              <p className={styles.error}>{errors.nameField.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <CustomSelect
              label={t('ReplacementSection.category')}
              options={[t('Names.selectBtn'), t('Names.selectBtn')]}
              selected={selectCategory}
              onSelect={setSelectCategory}
              width={602}
            />
            {errors.price && (
              <p className={styles.error}>{errors.price.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <CustomSelect
              label={t('ReplacementSection.name')}
              options={['Все наименования']}
              selected={selectNames}
              onSelect={setSelectNames}
              width={602}
            />
            {errors.price && (
              <p className={styles.error}>{errors.price.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <div className={styles.label_wrap}>
              <label className={styles.label}>
                {t('ReplacementSection.accQuantity')}
              </label>
              <input
                className={`${styles.input} ${
                  errors.nameCategoryField ? styles.input_error : ''
                }`}
                placeholder={t('DBSettings.form.placeholder')}
                {...register('nameCategoryField', {
                  required: t('DBSettings.form.errorMessage'),
                })}
              />
            </div>
            {errors.nameCategoryField && (
              <p className={styles.error}>{errors.nameCategoryField.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <CustomSelect
              label={t('ReplacementSection.seller')}
              options={['Максим Куролап']}
              selected={selectNames}
              onSelect={setSelectNames}
              width={602}
            />
            {errors.price && (
              <p className={styles.error}>{errors.price.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <CustomSelect
              label={t('ReplacementSection.tgNick')}
              options={['@storewonderweb']}
              selected={selectNames}
              onSelect={setSelectNames}
              width={602}
            />
            {errors.price && (
              <p className={styles.error}>{errors.price.message}</p>
            )}
          </div>
          <div className={styles.checkbox}>
            <CustomCheckbox
              checked={checkedSettings[settings[0]] || false}
              onChange={() => toggleCheckbox(settings[0])}
              label={t(settings[0])}
            />
          </div>
          <div className={styles.field}>
            <div className={styles.label_wrap}>
              <label className={styles.label}>
                {t('ReplacementSection.dolphinMail')}
              </label>
              <input
                className={`${styles.input} ${
                  errors.nameField ? styles.input_error : ''
                }`}
                placeholder={t('DBSettings.form.placeholder')}
                {...register('nameField', {
                  required: t('DBSettings.form.errorMessage'),
                })}
              />
            </div>
            {errors.nameField && (
              <p className={styles.error}>{errors.nameField.message}</p>
            )}
          </div>
          <div className={styles.buttons_wrap}>
            <SubmitBtn text="ReplacementSection.btn" />
          </div>
        </form>
      </div>

      <ModalComponent
        isOpen={isOpenConfirm}
        onClose={toggleConfirmModal}
        title="ReplacementSection.modalCreate.title"
      >
        <ReplacementAccount
          category={formData?.nameCategoryField || ''}
          names={formData?.nameField || ''}
          accQuantity={formData?.price || ''}
          seller={formData?.cost || ''}
          sellSum={formData?.nameDescription || ''}
          tgNick={selectNames}
        />
      </ModalComponent>
    </section>
  );
}
