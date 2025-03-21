'use client';

import styles from './UserSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
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
import CreateUser from '../ModalComponent/CreateUser/CreateUser';
import UserRoles from '../ModalComponent/UserRoles/UserRoles';

interface Category {
  id: number;
  fullName: string;
  telegramId: string;
}

const data: Category[] = [
  {
    id: 1,
    fullName: 'Максим Куролап',
    telegramId: '156131',
  },
  {
    id: 2,
    fullName: 'Олена Петренко',
    telegramId: '245789',
  },
  {
    id: 3,
    fullName: 'Іван Шевченко',
    telegramId: '378912',
  },
  {
    id: 4,
    fullName: 'Софія Коваленко',
    telegramId: '412356',
  },
  {
    id: 5,
    fullName: 'Дмитро Бондар',
    telegramId: '589123',
  },
  {
    id: 6,
    fullName: 'Анна Грищенко',
    telegramId: '674890',
  },
  {
    id: 7,
    fullName: 'Олег Ткачук',
    telegramId: '723451',
  },
  {
    id: 8,
    fullName: 'Юлія Савчук',
    telegramId: '891234',
  },
  {
    id: 9,
    fullName: 'Павло Литвин',
    telegramId: '956781',
  },
  {
    id: 10,
    fullName: 'Марія Зайцева',
    telegramId: '103214',
  },
  {
    id: 11,
    fullName: 'Андрій Мельник',
    telegramId: '117890',
  },
  {
    id: 12,
    fullName: 'Катерина Дубова',
    telegramId: '128934',
  },
  {
    id: 13,
    fullName: 'Сергій Кравець',
    telegramId: '134567',
  },
  {
    id: 14,
    fullName: 'Наталія Сидоренко',
    telegramId: '145678',
  },
  {
    id: 15,
    fullName: 'Віталій Руденко',
    telegramId: '156789',
  },
  {
    id: 16,
    fullName: 'Тетяна Мороз',
    telegramId: '167890',
  },
  {
    id: 17,
    fullName: 'Олександр Яременко',
    telegramId: '178901',
  },
  {
    id: 18,
    fullName: 'Людмила Гордієнко',
    telegramId: '189012',
  },
  {
    id: 19,
    fullName: 'Роман Левчук',
    telegramId: '190123',
  },
  {
    id: 20,
    fullName: 'Вікторія Олійник',
    telegramId: '201234',
  },
  {
    id: 21,
    fullName: 'Михайло Соколов',
    telegramId: '212345',
  },
  {
    id: 22,
    fullName: 'Дарина Лозова',
    telegramId: '223456',
  },
  {
    id: 23,
    fullName: 'Євген Козлов',
    telegramId: '234567',
  },
  {
    id: 24,
    fullName: 'Ірина Білик',
    telegramId: '245678',
  },
  {
    id: 25,
    fullName: 'Артем Дорошенко',
    telegramId: '256789',
  },
  {
    id: 26,
    fullName: 'Оксана Власенко',
    telegramId: '267890',
  },
  {
    id: 27,
    fullName: 'Владислав Гринько',
    telegramId: '278901',
  },
];

export default function UserSection() {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Початковий розмір сторінки
  });

  const toggleCreateModal = () => {
    setIsOpenCreate(!isOpenCreate);
  };

  const editUpdateModal = () => {
    toggleUpdateModal();
  };

  const toggleUpdateModal = () => {
    setIsOpenUpdate(!isOpenUpdate);
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'fullName',
      header: t('UserSection.table.name'),
    },
    {
      accessorKey: 'telegramId',
      header: t('UserSection.table.tgId'),
    },
    {
      id: 'actions',
      header: t('Names.table.actions'),
      cell: () => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => editUpdateModal()}
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

  const categoryNames = [...new Set(data.map(category => category.fullName))];

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.otherParMenu.users')}</h2>
        <p className={styles.header_text}>{t('UserSection.headerText')}</p>
        <div className={styles.buttons_wrap}>
          <AddBtn onClick={toggleCreateModal} text={'UserSection.addBtn'} />
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
        title="UserSection.modalCreate.title"
      >
        <CreateUser />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={toggleUpdateModal}
        title="UserSection.modalRoles.title"
      >
        <UserRoles />
      </ModalComponent>
    </section>
  );
}
