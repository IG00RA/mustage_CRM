'use client';

import styles from './NamesSection.module.css';
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
import CancelBtn from '../Buttons/CancelBtn/CancelBtn';
import { CustomSelect } from '../Buttons/CustomSelect/CustomSelect';
import CreateNames from '../ModalComponent/CreateNames/CreateNames';
import EditNames from '../ModalComponent/EditNames/EditNames';
import CreateNamesSet from '../ModalComponent/CreateNamesSet/CreateNamesSet';
import AddNamesDescription from '../ModalComponent/AddNamesDescription/AddNamesDescription';
import { useSalesStore } from '@/store/salesStore';
import Loader from '../Loader/Loader';

interface Subcategory {
  account_subcategory_id: number;
  account_subcategory_name: string;
  account_category_id: number;
  price: number;
  cost_price: number;
  description: string | null;
}

interface Category {
  account_category_id: number;
  account_category_name: string;
  description: string | null;
}

const NamesSection = () => {
  const t = useTranslations();
  const {
    subcategories,
    categories,
    fetchSubcategories,
    fetchCategories,
    loading,
    error,
  } = useSalesStore();
  const didFetchRef = useRef(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        !didFetchRef.current &&
        subcategories.length === 0 &&
        !loading &&
        !error
      ) {
        didFetchRef.current = true;
        fetchSubcategories().catch(err => {
          console.error('Fetch subcategories failed:', err);
          didFetchRef.current = false;
        });
      }
      if (categories.length === 0 && !loading && !error) {
        fetchCategories().catch(err => {
          console.error('Fetch categories failed:', err);
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSubcategories, fetchCategories]);

  useEffect(() => {
    if (subcategories.length > 0 && showLoader) {
      setShowLoader(false);
    }
  }, [subcategories, showLoader]);

  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenCreateNamesSet, setIsOpenCreateNamesSet] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isOpenAddNamesDescription, setIsOpenAddNamesDescription] =
    useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const toggleAddNamesDescription = useCallback(() => {
    setIsOpenAddNamesDescription(prev => !prev);
  }, []);

  const toggleCreateModal = useCallback(() => {
    setIsOpenCreate(prev => !prev);
  }, []);

  const toggleCreateNamesSet = useCallback(() => {
    setIsOpenCreateNamesSet(prev => !prev);
  }, []);

  const openUpdateModal = useCallback((title = '') => {
    setUpdateTitle(title);
    setIsOpenUpdate(true);
  }, []);

  const closeUpdateModal = useCallback(() => {
    setIsOpenUpdate(false);
  }, []);

  const data = useMemo(
    () =>
      subcategories.map(subcategory => ({
        account_subcategory_id: subcategory.account_subcategory_id,
        account_subcategory_name: subcategory.account_subcategory_name,
        account_category_id: subcategory.account_category_id,
        price: subcategory.price,
        cost_price: subcategory.cost_price,
        description: subcategory.description,
      })),
    [subcategories]
  );

  const categoryOptions = useMemo(
    () => [
      t('Names.selectAllBtn'),
      ...categories.map(cat => cat.account_category_name),
    ],
    [categories, t]
  );

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map(category => [
          category.account_category_id,
          category.account_category_name,
        ])
      ),
    [categories]
  );

  const handleCategorySelect = useCallback(
    (categoryName: string) => {
      if (categoryName === t('Names.selectAllBtn')) {
        setSelectedCategoryId(null);
      } else {
        const selectedCategory = categories.find(
          cat => cat.account_category_name === categoryName
        );
        setSelectedCategoryId(
          selectedCategory ? String(selectedCategory.account_category_id) : null
        );
      }
    },
    [categories, t]
  );

  const columns = useMemo<ColumnDef<Subcategory>[]>(
    () => [
      { accessorKey: 'account_subcategory_id', header: 'ID' },
      {
        accessorKey: 'account_subcategory_name',
        header: t('Names.table.name'),
      },
      {
        accessorKey: 'account_category_id',
        header: t('Names.table.category'),
        cell: ({ row }) => {
          const categoryName = categoryMap.get(
            row.original.account_category_id
          );
          return categoryName || row.original.account_category_id;
        },
        filterFn: (row, columnId, filterValue) => {
          // Перевіряємо точну відповідність числового значення
          const rowValue = row.getValue(columnId) as number;
          const filterNum = Number(filterValue);
          return rowValue === filterNum;
        },
      },
      { accessorKey: 'cost_price', header: t('Names.table.cost') },
      { accessorKey: 'price', header: t('Names.table.price') },
      {
        id: 'actions',
        header: t('Names.table.actions'),
        cell: ({ row }) => (
          <div className={styles.table_buttons}>
            <CancelBtn
              text="Names.table.enterBtn"
              onClick={toggleAddNamesDescription}
            />
            <WhiteBtn
              onClick={() =>
                openUpdateModal(row.original.account_subcategory_name)
              }
              text={'Names.table.editBtn'}
              icon="icon-edit-pencil"
            />
          </div>
        ),
      },
    ],
    [t, categoryMap, toggleAddNamesDescription, openUpdateModal]
  );

  const columnFilters = useMemo(
    () =>
      selectedCategoryId
        ? [{ id: 'account_category_id', value: selectedCategoryId }]
        : [],
    [selectedCategoryId]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      pagination,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    filterFns: {
      global: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const cellValue = String(row.getValue(columnId) ?? '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      },
    },
  });

  const subcategoryNames = useMemo(
    () => [
      ...new Set(data.map(subcategory => subcategory.account_subcategory_name)),
    ],
    [data]
  );

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
            options={categoryOptions}
            selected={
              selectedCategoryId
                ? categoryMap.get(parseInt(selectedCategoryId)) || ''
                : t('Names.selectBtn')
            }
            onSelect={handleCategorySelect}
            width={298}
          />
          <SearchInput
            onSearch={query => setGlobalFilter(query)}
            text={'Category.searchBtn'}
            options={subcategoryNames}
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
              table.getFilteredRowModel().rows.length
            )}
            {t('Category.table.pages')}
            {table.getFilteredRowModel().rows.length}
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
        onClose={closeUpdateModal}
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
