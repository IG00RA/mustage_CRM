'use client';

import styles from './CategorySection.module.css';
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
import { toast } from 'react-toastify';
import SearchInput from '../Buttons/SearchInput/SearchInput';

interface Category {
  id: number;
  name: string;
  description: string;
}

const data: Category[] = [
  { id: 1, name: 'Категория 1', description: 'Описание категории 1' },
  { id: 2, name: 'Категория 2', description: 'Описание категории 2' },
  { id: 3, name: 'Категория 3', description: 'Описание категории 3' },
  { id: 4, name: 'Категория 4', description: 'Описание категории 4' },
  { id: 5, name: 'Категория 5', description: 'Описание категории 5' },
  { id: 6, name: 'Категория 6', description: 'Описание категории 6' },
  { id: 7, name: 'Категория 7', description: 'Описание категории 7' },
  { id: 8, name: 'Категория 8', description: 'Описание категории 8' },
  { id: 9, name: 'Категория 9', description: 'Описание категории 9' },
  { id: 10, name: 'Категория 10', description: 'Описание категории 10' },
  { id: 11, name: 'Категория 11', description: 'Описание категории 11' },
  { id: 12, name: 'Категория 12', description: 'Описание категории 12' },
  { id: 13, name: 'Категория 13', description: 'Описание категории 13' },
  { id: 14, name: 'Категория 14', description: 'Описание категории 14' },
  { id: 15, name: 'Категория 15', description: 'Описание категории 15' },
  { id: 16, name: 'Категория 16', description: 'Описание категории 16' },
  { id: 17, name: 'Категория 17', description: 'Описание категории 17' },
  { id: 18, name: 'Категория 18', description: 'Описание категории 18' },
  { id: 19, name: 'Категория 19', description: 'Описание категории 19' },
  { id: 20, name: 'Категория 20', description: 'Описание категории 20' },
  { id: 21, name: 'Категория 21', description: 'Описание категории 21' },
  { id: 22, name: 'Категория 22', description: 'Описание категории 22' },
  { id: 23, name: 'Категория 23', description: 'Описание категории 23' },
  { id: 24, name: 'Категория 24', description: 'Описание категории 24' },
  { id: 25, name: 'Категория 25', description: 'Описание категории 25' },
  { id: 26, name: 'Категория 26', description: 'Описание категории 26' },
  { id: 27, name: 'Категория 27', description: 'Описание категории 27' },
];

const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Название категории',
  },
  {
    accessorKey: 'description',
    header: 'Описание категории',
  },
  {
    id: 'actions',
    header: 'Действия',
    cell: ({ row }) => (
      <button onClick={() => toast.info(`Редактирование ${row.original.name}`)}>
        ✏️
      </button>
    ),
  },
];

const CategorySection = () => {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Початковий розмір сторінки
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Додаємо підтримку фільтрації
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter, // Додаємо зміни глобального фільтру
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
        <h2 className={styles.header}>{t('Sidebar.accParMenu.category')}</h2>
        <p className={styles.header_text}>{t('Category.headerText')}</p>
        <div className={styles.buttons_wrap}>
          <AddBtn
            onClick={() => toast.success('Добавление категории')}
            text={'Category.addBtn'}
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
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ◀️
          </button>
          <span>
            Страница {table.getState().pagination.pageIndex + 1} из{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ▶️
          </button>
          <select
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
                {size} на странице
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
