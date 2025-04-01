'use client';

import styles from './RemoveSaleSection.module.css';
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
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import SearchResult from '../ModalComponent/SearchResult/SearchResult';

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

export default function RemoveSaleSection() {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenResult, setIsOpenResult] = useState(false);
  const [selectSell, setSelectSell] = useState('');
  const [selectLoad, setSelectLoad] = useState('');

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Початковий розмір сторінки
  });

  const toggleResultModal = () => {
    setIsOpenResult(!isOpenResult);
  };

  const columns: ColumnDef<Table>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: t('RemoveSaleSection.table.name'),
    },
    {
      accessorKey: 'category',
      header: t('RemoveSaleSection.table.category'),
    },
    {
      accessorKey: 'seller',
      header: t('RemoveSaleSection.table.seller'),
    },
    {
      accessorKey: 'status',
      header: t('RemoveSaleSection.table.status'),
    },
  ];

  const exportToExcel = () => {
    console.log(1233);
  };

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

  const add = () => {};

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.removeSale')}</h2>
        <p className={styles.header_text}>
          {t('RemoveSaleSection.headerText')}
        </p>
        <div className={styles.input_wrap}>
          <label className={styles.label}>{t('RemoveSaleSection.field')}</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            placeholder={t('RemoveSaleSection.fieldName')}
          />
        </div>
        <div className={styles.top_btn_wrap}>
          <WhiteBtn
            onClick={toggleResultModal}
            text={'RemoveSaleSection.searchBtn'}
            icon="icon-search-btn-fill"
          />
          <AddBtn
            onClick={add}
            icon="icon-trash-btn-white"
            iconFill="icon-trash-btn-white"
            text={'RemoveSaleSection.removeBtn'}
          />
        </div>
        <div className={styles.search_wrap}>
          <CustomSelect
            label={t('RemoveSaleSection.loadSelect')}
            options={[
              t('RemoveSaleSection.descending'),
              t('RemoveSaleSection.ascending'),
            ]}
            selected={selectLoad}
            onSelect={setSelectLoad}
            width={331}
          />
          <CustomSelect
            label={t('RemoveSaleSection.sellSelect')}
            options={[
              t('RemoveSaleSection.descending'),
              t('RemoveSaleSection.ascending'),
            ]}
            selected={selectSell}
            onSelect={setSelectSell}
            width={331}
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
        <div className={styles.bottom_wrap}>
          <div className={styles.download_wrap}>
            <WhiteBtn
              onClick={exportToExcel}
              text={'AllAccounts.downloadBtn'}
              icon="icon-cloud-download"
              iconFill="icon-cloud-download-fill"
            />
            <WhiteBtn
              onClick={exportToExcel}
              text={'AllAccounts.editBtn'}
              icon="icon-palette"
            />
          </div>
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
      </div>
      <ModalComponent
        isOpen={isOpenResult}
        onClose={toggleResultModal}
        title="RemoveSaleSection.modal.title"
        text="RemoveSaleSection.modal.text"
      >
        <SearchResult />
      </ModalComponent>
    </section>
  );
}
