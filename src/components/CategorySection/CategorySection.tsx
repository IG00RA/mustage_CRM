'use client';

import styles from './CategorySection.module.css';
import { useTranslations } from 'next-intl';
import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from 'react';
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
import UpdateCategory from '../ModalComponent/UpdateCategory/UpdateCategory';
import Loader from '../Loader/Loader';
import { useCategoriesStore } from '@/store/categoriesStore';
import { PaginationState } from '@/types/componentsTypes';
import { Category } from '@/types/salesTypes';
import { toast } from 'react-toastify';

const CATEGORY_PAGINATION_KEY = 'categoryPaginationSettings';

export default function CategorySection() {
  const t = useTranslations();
  const { categories, fetchCategories, loading, error } = useCategoriesStore();
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
          toast.error(t('Category.errorMessage', err));
          console.error('Fetch failed:', err);
          didFetchRef.current = false;
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchCategories, categories, loading, error]);

  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isOpenCreate, setIsOpenCreate] = React.useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<{
    account_category_id: number;
    account_category_name: string;
    description: string;
    is_set_category: boolean;
  } | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CATEGORY_PAGINATION_KEY);
      return saved
        ? (JSON.parse(saved) as PaginationState)
        : { pageIndex: 0, pageSize: 5 };
    }
    return { pageIndex: 0, pageSize: 5 };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CATEGORY_PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [pagination]);

  const toggleCreateModal = () => setIsOpenCreate(prev => !prev);

  const openUpdateModal = (
    account_category_id: number,
    account_category_name: string,
    description: string,
    is_set_category: boolean
  ) => {
    setSelectedCategory({
      account_category_id,
      account_category_name,
      description,
      is_set_category,
    });
    setIsOpenUpdate(true);
  };

  const closeUpdateModal = () => {
    setIsOpenUpdate(false);
    setSelectedCategory(null);
  };

  const data: Category[] = useMemo(
    () =>
      categories.map(category => ({
        account_category_id: category.account_category_id,
        account_category_name: category.account_category_name,
        description: category.description || '',
        is_set_category: category.is_set_category || false,
      })),
    [categories]
  );

  useEffect(() => {
    if (categories.length !== 0) {
      setShowLoader(false);
    }
  }, [categories]);

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'account_category_id', header: 'ID' },
    { accessorKey: 'account_category_name', header: t('Category.table.name') },
    { accessorKey: 'description', header: t('Category.table.description') },
    {
      id: 'actions',
      header: t('Category.table.actions'),
      cell: ({ row }) => (
        <WhiteBtn
          onClick={() =>
            openUpdateModal(
              row.original.account_category_id,
              row.original.account_category_name,
              row.original.description || '',
              row.original.is_set_category || false
            )
          }
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
    () => [...new Set(data.map(category => category.account_category_name))],
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
                pageIndex: 0,
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
        isOpen={isOpenCreate}
        onClose={toggleCreateModal}
        title="Category.modalCreate.title"
        text="Category.modalCreate.description"
      >
        <CreateCategory onClose={toggleCreateModal} />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={closeUpdateModal}
        title="Category.modalUpdate.title"
        text="Category.modalUpdate.description"
        editedTitle={selectedCategory?.account_category_name || ''}
      >
        {selectedCategory && (
          <UpdateCategory
            categoryId={selectedCategory.account_category_id}
            initialName={selectedCategory.account_category_name}
            initialDescription={selectedCategory.description}
            initialIsSetCategory={selectedCategory.is_set_category}
            onClose={closeUpdateModal}
          />
        )}
      </ModalComponent>
    </section>
  );
}
