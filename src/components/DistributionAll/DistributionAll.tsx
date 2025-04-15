'use client';

import styles from './DistributionAll.module.css';
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
import SearchInput from '../Buttons/SearchInput/SearchInput';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import Icon from '@/helpers/Icon';
import ModalComponent from '../ModalComponent/ModalComponent';
import UploadNamesDistribution from '../ModalComponent/UploadNamesDistribution/UploadNamesDistribution';
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';

interface Category {
  id: number;
  name: string;
  distributionSettings: string;
  creationDate: string;
}

const data: Category[] = [
  {
    id: 1,
    name: 'Гів 16.09.2024',
    distributionSettings: 'Щотижневий розіграш',
    creationDate: '12.09.2024 12:00',
  },
  {
    id: 2,
    name: 'Гів 23.09.2024',
    distributionSettings: 'Щоденна акція',
    creationDate: '20.09.2024 10:00',
  },
  {
    id: 3,
    name: 'Гів 30.09.2024',
    distributionSettings: 'Тижневий бонус',
    creationDate: '27.09.2024 14:30',
  },
  {
    id: 4,
    name: 'Гів 07.10.2024',
    distributionSettings: 'Місячна пропозиція',
    creationDate: '04.10.2024 09:15',
  },
  {
    id: 5,
    name: 'Гів 14.10.2024',
    distributionSettings: 'Спеціальна подія',
    creationDate: '11.10.2024 16:45',
  },
  {
    id: 6,
    name: 'Гів 21.10.2024',
    distributionSettings: 'Вихідний розпродаж',
    creationDate: '18.10.2024 11:00',
  },
  {
    id: 7,
    name: 'Гів 28.10.2024',
    distributionSettings: 'Нічна знижка',
    creationDate: '25.10.2024 23:59',
  },
  {
    id: 8,
    name: 'Гів 04.11.2024',
    distributionSettings: 'Ранкова акція',
    creationDate: '01.11.2024 08:30',
  },
  {
    id: 9,
    name: 'Гів 11.11.2024',
    distributionSettings: 'Святковий бонус',
    creationDate: '08.11.2024 15:00',
  },
  {
    id: 10,
    name: 'Гів 18.11.2024',
    distributionSettings: 'Ексклюзивна пропозиція',
    creationDate: '15.11.2024 17:20',
  },
  {
    id: 11,
    name: 'Гів 25.11.2024',
    distributionSettings: 'Лояльність',
    creationDate: '22.11.2024 12:00',
  },
  {
    id: 12,
    name: 'Гів 02.12.2024',
    distributionSettings: 'Флеш-розпродаж',
    creationDate: '29.11.2024 13:10',
  },
  {
    id: 13,
    name: 'Гів 09.12.2024',
    distributionSettings: 'Денна акція',
    creationDate: '06.12.2024 14:00',
  },
  {
    id: 14,
    name: 'Гів 16.12.2024',
    distributionSettings: 'Вечірній бонус',
    creationDate: '13.12.2024 19:30',
  },
  {
    id: 15,
    name: 'Гів 23.12.2024',
    distributionSettings: 'Тематична подія',
    creationDate: '20.12.2024 10:45',
  },
  {
    id: 16,
    name: 'Гів 30.12.2024',
    distributionSettings: 'Сюрприз дня',
    creationDate: '27.12.2024 11:30',
  },
  {
    id: 17,
    name: 'Гів 06.01.2025',
    distributionSettings: 'Щасливі години',
    creationDate: '03.01.2025 18:00',
  },
  {
    id: 18,
    name: 'Гів 13.01.2025',
    distributionSettings: 'Ранковий розіграш',
    creationDate: '10.01.2025 07:00',
  },
  {
    id: 19,
    name: 'Гів 20.01.2025',
    distributionSettings: 'Вечірній сюрприз',
    creationDate: '17.01.2025 20:15',
  },
  {
    id: 20,
    name: 'Гів 27.01.2025',
    distributionSettings: 'Тижнева лотерея',
    creationDate: '24.01.2025 12:00',
  },
  {
    id: 21,
    name: 'Гів 03.02.2025',
    distributionSettings: 'Акція вихідного',
    creationDate: '31.01.2025 15:30',
  },
  {
    id: 22,
    name: 'Гів 10.02.2025',
    distributionSettings: 'Секретна знижка',
    creationDate: '07.02.2025 09:00',
  },
  {
    id: 23,
    name: 'Гів 17.02.2025',
    distributionSettings: 'Додатковий бонус',
    creationDate: '14.02.2025 14:20',
  },
  {
    id: 24,
    name: 'Гів 24.02.2025',
    distributionSettings: 'Швидка акція',
    creationDate: '21.02.2025 16:00',
  },
  {
    id: 25,
    name: 'Гів 03.03.2025',
    distributionSettings: 'Особлива пропозиція',
    creationDate: '28.02.2025 10:10',
  },
  {
    id: 26,
    name: 'Гів 10.03.2025',
    distributionSettings: 'Денний розіграш',
    creationDate: '07.03.2025 13:00',
  },
  {
    id: 27,
    name: 'Гів 17.03.2025',
    distributionSettings: 'Нічна подія',
    creationDate: '14.03.2025 22:00',
  },
];
export default function DistributionAll() {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');

  const [selectCategory, setSelectCategory] = useState(['']);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Початковий розмір сторінки
  });

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
      header: t('DistributionAll.name'),
    },
    {
      accessorKey: 'distributionSettings',
      header: t('DistributionAll.distributionSettings'),
    },
    {
      accessorKey: 'creationDate',
      header: t('DistributionAll.creationDate'),
    },
    {
      id: 'actions',
      header: t('DistributionAll.action'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => toggleUpdateModal(row.original.name)}
            text={'DistributionAll.infoBtn'}
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
          {t('Sidebar.accParMenu.distributionAll')}
        </h2>
        <p className={styles.header_text}>{t('DistributionAll.headerText')}</p>
        <div className={styles.buttons_wrap}>
          <CustomSelect
            label={t('DistributionAll.distributionSetting')}
            options={['Еженедельный розыгрыш', 'Еженедневний розыгрыш']}
            selected={selectCategory}
            onSelect={setSelectCategory}
            width={560}
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
            {[5, 10, 20, 50, 100].map(size => (
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
        isOpen={isOpenUpdate}
        onClose={toggleUpdateModal}
        title="DistributionAll.modalCreate.title"
        editedTitle={`"${updateTitle}"`}
      >
        <UploadNamesDistribution />
      </ModalComponent>
    </section>
  );
}
