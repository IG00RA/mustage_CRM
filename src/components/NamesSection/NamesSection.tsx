'use client';

import styles from './NamesSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import AddBtn from '../Buttons/AddBtn/AddBtn';
import SearchInput from '../Buttons/SearchInput/SearchInput';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import Icon from '@/helpers/Icon';
import ModalComponent from '../ModalComponent/ModalComponent';
import CancelBtn from '../Buttons/CancelBtn/CancelBtn';
import { CustomSelect } from '../Buttons/CustomSelect/CustomSelect';
import CreateNames from '../ModalComponent/CreateNames/CreateNames';
import EditNames from '../ModalComponent/EditNames/EditNames';
import CreateNamesSet from '../ModalComponent/CreateNamesSet/CreateNamesSet';
import AddNamesDescription from '../ModalComponent/AddNamesDescription/AddNamesDescription';

interface Category {
  id: number;
  name: string;
  category: string;
  quantity: number;
  cost: number;
  price: number;
}

const data: Category[] = [
  {
    id: 1,
    name: 'Facebook Ads',
    category: 'Таргетована реклама',
    quantity: 100,
    cost: 500,
    price: 700,
  },
  {
    id: 2,
    name: 'Google Ads',
    category: 'Контекстна реклама',
    quantity: 150,
    cost: 800,
    price: 1100,
  },
  {
    id: 3,
    name: 'TikTok Ads',
    category: 'Відеореклама',
    quantity: 120,
    cost: 600,
    price: 900,
  },
  {
    id: 4,
    name: 'Instagram Influencers',
    category: 'Інфлюенс-маркетинг',
    quantity: 50,
    cost: 400,
    price: 650,
  },
  {
    id: 5,
    name: 'YouTube Pre-Roll',
    category: 'Відеореклама',
    quantity: 90,
    cost: 700,
    price: 1000,
  },
  {
    id: 6,
    name: 'Push-трафік',
    category: 'Push-сповіщення',
    quantity: 200,
    cost: 500,
    price: 850,
  },
  {
    id: 7,
    name: 'Email-розсилка',
    category: 'Email-маркетинг',
    quantity: 130,
    cost: 300,
    price: 550,
  },
  {
    id: 8,
    name: 'Native Ads',
    category: 'Нативна реклама',
    quantity: 110,
    cost: 600,
    price: 950,
  },
  {
    id: 9,
    name: 'SEO-трафік',
    category: 'Органічний трафік',
    quantity: 80,
    cost: 700,
    price: 1200,
  },
  {
    id: 10,
    name: 'Telegram-боти',
    category: 'Месенджер-маркетинг',
    quantity: 140,
    cost: 400,
    price: 750,
  },
  {
    id: 11,
    name: 'CPA-сітки',
    category: 'Партнерські мережі',
    quantity: 200,
    cost: 1000,
    price: 1600,
  },
  {
    id: 12,
    name: 'Popunder Ads',
    category: 'Попандер реклама',
    quantity: 300,
    cost: 500,
    price: 900,
  },
  {
    id: 13,
    name: 'In-App Ads',
    category: 'Мобільна реклама',
    quantity: 250,
    cost: 800,
    price: 1300,
  },
  {
    id: 14,
    name: 'Facebook Groups',
    category: 'Соціальні мережі',
    quantity: 60,
    cost: 300,
    price: 500,
  },
  {
    id: 15,
    name: 'Twitter Ads',
    category: 'Соціальні мережі',
    quantity: 100,
    cost: 500,
    price: 750,
  },
  {
    id: 16,
    name: 'LinkedIn B2B',
    category: 'B2B-реклама',
    quantity: 50,
    cost: 1000,
    price: 1800,
  },
  {
    id: 17,
    name: 'Snapchat Ads',
    category: 'Відеореклама',
    quantity: 80,
    cost: 600,
    price: 950,
  },
  {
    id: 18,
    name: 'Reddit Ads',
    category: 'Соціальні мережі',
    quantity: 90,
    cost: 400,
    price: 650,
  },
  {
    id: 19,
    name: 'Pinterest Ads',
    category: 'Візуальна реклама',
    quantity: 70,
    cost: 500,
    price: 850,
  },
  {
    id: 20,
    name: 'Quora Ads',
    category: 'Контентна реклама',
    quantity: 75,
    cost: 550,
    price: 900,
  },
  {
    id: 21,
    name: 'Adult Traffic',
    category: 'Дорослий контент',
    quantity: 500,
    cost: 1200,
    price: 1800,
  },
  {
    id: 22,
    name: 'Sweepstakes Traffic',
    category: 'Оффери',
    quantity: 400,
    cost: 900,
    price: 1400,
  },
  {
    id: 23,
    name: 'Gambling Traffic',
    category: 'Азартні ігри',
    quantity: 350,
    cost: 1100,
    price: 1700,
  },
  {
    id: 24,
    name: 'Crypto Traffic',
    category: 'Криптовалюта',
    quantity: 220,
    cost: 1300,
    price: 2000,
  },
  {
    id: 25,
    name: 'Forex Leads',
    category: 'Фінансові послуги',
    quantity: 180,
    cost: 900,
    price: 1500,
  },
  {
    id: 26,
    name: 'App Installs',
    category: 'Мобільний маркетинг',
    quantity: 270,
    cost: 750,
    price: 1200,
  },
  {
    id: 27,
    name: 'Dating Traffic',
    category: 'Знайомства',
    quantity: 300,
    cost: 800,
    price: 1400,
  },
];

const NamesSection = () => {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenCreateNamesSet, setIsOpenCreateNamesSet] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isOpenAddNamesDescription, setIsOpenAddNamesDescription] =
    useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [selectCategory, setSelectCategory] = useState('');

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Початковий розмір сторінки
  });

  const toggleAddNamesDescription = () => {
    setIsOpenAddNamesDescription(!isOpenAddNamesDescription);
  };

  const toggleCreateModal = () => {
    setIsOpenCreate(!isOpenCreate);
  };
  const toggleCreateNamesSet = () => {
    setIsOpenCreateNamesSet(!isOpenCreateNamesSet);
  };
  const toggleUpdateModal = (title = '') => {
    setUpdateTitle(title);
    setIsOpenUpdate(!isOpenUpdate);
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: t('Names.table.name'),
    },
    {
      accessorKey: 'category',
      header: t('Names.table.category'),
    },
    {
      accessorKey: 'quantity',
      header: t('Names.table.quantity'),
    },
    {
      accessorKey: 'cost',
      header: t('Names.table.cost'),
    },
    {
      accessorKey: 'price',
      header: t('Names.table.price'),
    },
    {
      id: 'actions',
      header: t('Names.table.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <CancelBtn
            text="Names.table.enterBtn"
            onClick={() => toggleAddNamesDescription()}
          />
          <WhiteBtn
            onClick={() => toggleUpdateModal(row.original.name)}
            text={'Names.table.editBtn'}
            icon="icon-edit-pencil"
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      global: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const cellValue = String(row.getValue(columnId) ?? '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      },
    },
    onPaginationChange: setPagination,
  });

  const categoryNames = [...new Set(data.map(category => category.name))];

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.names')}</h2>
        <p className={styles.header_text}>{t('Category.headerText')}</p>
        <div className={styles.buttons_wrap}>
          <AddBtn onClick={toggleCreateModal} text={'Names.addBtn'} />
          <WhiteBtn
            onClick={toggleCreateNamesSet}
            text={'Names.addSetBtn'}
            icon="icon-add-color"
            iconFill="icon-add-color"
          />
          <CustomSelect
            label={t('Names.selectText')}
            options={[t('Names.selectBtn'), t('Names.selectBtn')]}
            selected={selectCategory}
            onSelect={setSelectCategory}
            width={298}
          />
          <SearchInput
            onSearch={query => setGlobalFilter(query)}
            text={'Category.searchBtn'}
            options={categoryNames}
          />
        </div>
      </div>
      <div className={styles.table_container}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th className={styles.th} key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={styles.tbody}>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td className={styles.td} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <span className={styles.pagination_text}>
            {t('Category.table.pagination')}
          </span>
          <select
            className={styles.pagination_select}
            value={pagination.pageSize}
            onChange={e =>
              setPagination(prev => ({
                ...prev,
                pageSize: Number(e.target.value),
              }))
            }
          >
            {[5, 10, 20].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className={styles.pagination_text}>
            {pagination.pageIndex * pagination.pageSize + 1}-
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              data.length
            )}
            {t('Category.table.pages')}
            {data.length}
          </span>
          <div className={styles.pagination_btn_wrap}>
            <button
              className={styles.pagination_btn}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <Icon
                className={styles.icon_back}
                name="icon-table_arrow"
                width={20}
                height={20}
              />
            </button>
            <button
              className={styles.pagination_btn}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <Icon
                className={styles.icon_forward}
                name="icon-table_arrow"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      </div>
      <ModalComponent
        isOpen={isOpenCreate}
        onClose={toggleCreateModal}
        title="Names.modalCreate.title"
        text="Names.modalCreate.description"
      >
        <CreateNames />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenCreateNamesSet}
        onClose={toggleCreateNamesSet}
        title="Names.modalCreateSet.title"
        text="Names.modalCreateSet.description"
      >
        <CreateNamesSet />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenAddNamesDescription}
        onClose={toggleAddNamesDescription}
        title="Names.modalAddNamesDescription.title"
        text="Names.modalAddNamesDescription.description"
      >
        <AddNamesDescription />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={toggleUpdateModal}
        title="Names.modalUpdate.title"
        text="Names.modalUpdate.description"
        editedTitle={updateTitle}
      >
        <EditNames />
      </ModalComponent>
    </section>
  );
};

export default NamesSection;
