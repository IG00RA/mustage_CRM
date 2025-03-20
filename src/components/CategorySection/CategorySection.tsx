'use client';

import styles from './CategorySection.module.css';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useMemo, useState } from 'react';
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
import CreateCategory from '../ModalComponent/CreateCategory/CreateCategory';
import UpdateCategory from '../ModalComponent/EditCategory/EditCategory';
import { useSalesStore } from '@/store/salesStore';
import Loader from '../Loader/Loader';

interface Category {
  id: number;
  name: string;
  description: string;
}

const CategorySection = () => {
  const t = useTranslations();
  const { categories, fetchCategories, loading, error } = useSalesStore();
  const didFetchRef = useRef(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        !didFetchRef.current &&
        categories.length === 0 &&
        !loading &&
        !error
      ) {
        didFetchRef.current = true;
        fetchCategories().catch(err => {
          console.error('Fetch failed:', err);
          didFetchRef.current = false;
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isOpenCreate, setIsOpenCreate] = React.useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = React.useState(false);
  const [updateTitle, setUpdateTitle] = React.useState('');
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const toggleCreateModal = () => setIsOpenCreate(prev => !prev);

  const openUpdateModal = (title = '') => {
    setUpdateTitle(title);
    setIsOpenUpdate(true);
  };

  const closeUpdateModal = () => {
    setIsOpenUpdate(false);
  };

  // Мемоізуємо data, щоб уникнути повторних обчислень
  const data: Category[] = useMemo(
    () =>
      categories.map(category => ({
        id: category.account_category_id,
        name: category.account_category_name,
        description: category.description || '',
      })),
    [categories]
  );

  useEffect(() => {
    if (categories.length !== 0) {
      setShowLoader(false);
    }
  }, [categories]);

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: t('Category.table.name') },
    { accessorKey: 'description', header: t('Category.table.description') },
    {
      id: 'actions',
      header: t('Category.table.actions'),
      cell: ({ row }) => (
        <WhiteBtn
          onClick={() => openUpdateModal(row.original.name)}
          text={'Category.table.editBtn'}
          icon="icon-edit-pencil"
          iconFill="icon-edit-pencil"
        />
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter, pagination },
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

  const categoryNames = useMemo(
    () => [...new Set(data.map(category => category.name))],
    [data]
  );

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.category')}</h2>
        <p className={styles.header_text}>{t('Category.headerText')}</p>
        <div className={styles.buttons_wrap}>
          <AddBtn onClick={toggleCreateModal} text={'Category.addBtn'} />
          <SearchInput
            onSearch={query => setGlobalFilter(query)}
            text={'Category.searchBtn'}
            options={categoryNames}
          />
        </div>
      </div>
      <div className={styles.table_container}>
        {showLoader && <Loader error={error} />}
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
        title="Category.modalCreate.title"
        text="Category.modalCreate.description"
      >
        <CreateCategory />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={closeUpdateModal}
        title="Category.modalUpdate.title"
        text="Category.modalUpdate.description"
        editedTitle={updateTitle}
      >
        <UpdateCategory />
      </ModalComponent>
    </section>
  );
};

export default CategorySection;
