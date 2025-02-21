'use client';

import styles from './RemoveSaleSection.module.css';
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
import CreateDistributionSettings from '../ModalComponent/CreateDistributionSettings/CreateDistributionSettings';
import UploadNamesDistribution from '../ModalComponent/UploadNamesDistribution/UploadNamesDistribution';

interface Category {
  id: number;
  name: string;
  quantity: string;
  last: string;
}

const data: Category[] = [
  { id: 1, name: 'Щоденна акція', quantity: '15', last: '01.02.2025 10:00' },
  { id: 2, name: 'Тижневий бонус', quantity: '25', last: '03.02.2025 14:30' },
  {
    id: 3,
    name: 'Місячна пропозиція',
    quantity: '10',
    last: '05.02.2025 09:15',
  },
  { id: 4, name: 'Спеціальна подія', quantity: '30', last: '07.02.2025 16:45' },
  {
    id: 5,
    name: 'Вихідний розпродаж',
    quantity: '18',
    last: '09.02.2025 11:00',
  },
  { id: 6, name: 'Нічна знижка', quantity: '12', last: '10.02.2025 23:59' },
  { id: 7, name: 'Ранкова акція', quantity: '22', last: '11.02.2025 08:30' },
  { id: 8, name: 'Святковий бонус', quantity: '35', last: '12.02.2025 15:00' },
  {
    id: 9,
    name: 'Ексклюзивна пропозиція',
    quantity: '8',
    last: '13.02.2025 17:20',
  },
  { id: 10, name: 'Лояльність', quantity: '20', last: '14.02.2025 12:00' },
  { id: 11, name: 'Флеш-розпродаж', quantity: '40', last: '15.02.2025 13:10' },
  { id: 12, name: 'Денна акція', quantity: '17', last: '16.02.2025 14:00' },
  { id: 13, name: 'Вечірній бонус', quantity: '23', last: '17.02.2025 19:30' },
  { id: 14, name: 'Тематична подія', quantity: '14', last: '18.02.2025 10:45' },
  { id: 15, name: 'Сюрприз дня', quantity: '19', last: '19.02.2025 11:30' },
  { id: 16, name: 'Щасливі години', quantity: '28', last: '20.02.2025 18:00' },
  {
    id: 17,
    name: 'Ранковий розіграш',
    quantity: '16',
    last: '21.02.2025 07:00',
  },
  {
    id: 18,
    name: 'Вечірній сюрприз',
    quantity: '21',
    last: '22.02.2025 20:15',
  },
  { id: 19, name: 'Тижнева лотерея', quantity: '33', last: '23.02.2025 12:00' },
  { id: 20, name: 'Акція вихідного', quantity: '11', last: '24.02.2025 15:30' },
  { id: 21, name: 'Секретна знижка', quantity: '27', last: '25.02.2025 09:00' },
  {
    id: 22,
    name: 'Додатковий бонус',
    quantity: '24',
    last: '26.02.2025 14:20',
  },
  { id: 23, name: 'Швидка акція', quantity: '13', last: '27.02.2025 16:00' },
  {
    id: 24,
    name: 'Особлива пропозиція',
    quantity: '29',
    last: '28.02.2025 10:10',
  },
  { id: 25, name: 'Денний розіграш', quantity: '15', last: '01.03.2025 13:00' },
  { id: 26, name: 'Нічна подія', quantity: '31', last: '02.03.2025 22:00' },
  {
    id: 27,
    name: 'Щотижневий розіграш',
    quantity: '20',
    last: '12.09.2024 12:00',
  },
];
const RemoveSaleSection = () => {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Початковий розмір сторінки
  });

  const toggleCreateModal = () => {
    setIsOpenCreate(!isOpenCreate);
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
      header: t('DistributionSettings.table.name'),
    },
    {
      accessorKey: 'quantity',
      header: t('DistributionSettings.table.quantity'),
    },
    {
      accessorKey: 'last',
      header: t('DistributionSettings.table.last'),
    },
    {
      id: 'actions',
      header: t('DistributionSettings.table.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <CancelBtn
            text="DistributionSettings.table.btn"
            onClick={() => toggleUpdateModal(row.original.name)}
          />
          <WhiteBtn
            onClick={() => toggleCreateModal()}
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
        <h2 className={styles.header}>
          {t('Sidebar.accParMenu.distributionSettings')}
        </h2>
        <p className={styles.header_text}>
          {t('DistributionSettings.headerText')}
          <br />
          {t('DistributionSettings.headerTextBottom')}
        </p>
        <div className={styles.buttons_wrap}>
          <AddBtn
            onClick={toggleCreateModal}
            text={'DistributionSettings.addBtn'}
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
        title="DistributionSettings.modalCreate.title"
      >
        <CreateDistributionSettings />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={toggleUpdateModal}
        title="DistributionSettings.modalUpload.title"
        editedTitle={`"${updateTitle}"`}
      >
        <UploadNamesDistribution />
      </ModalComponent>
    </section>
  );
};

export default RemoveSaleSection;
