'use client';

import styles from './PromoCodeSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import CreatePromoCode from '../ModalComponent/CreatePromoCode/CreatePromoCode';
import { usePromoCodesStore } from '@/store/promoCodesStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import Loader from '../Loader/Loader';
import { PromoCode } from '@/types/componentsTypes';

export default function PromoCodeSection() {
  const t = useTranslations();

  const {
    promoCodes,
    fetchPromoCodes,
    error: promoCodesError,
    totalRows,
  } = usePromoCodesStore();
  const {
    categories,
    subcategories,
    fetchCategories,
    fetchSubcategories,
    error: categoriesError,
  } = useCategoriesStore();

  const error =
    [promoCodesError, categoriesError].filter(Boolean).join('; ') || null;

  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenResult, setIsOpenResult] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    string[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    if (categories.length !== 0) setShowLoader(false);
  }, [categories]);

  const loadPromoCodes = useCallback(
    async (updatedPagination: { pageIndex: number; pageSize: number }) => {
      const fetchParams: any = {
        subcategory_ids:
          selectedSubcategoryIds.length > 0
            ? selectedSubcategoryIds.map(Number)
            : undefined,
        category_ids:
          selectedSubcategoryIds.length === 0 && selectedCategoryIds.length > 0
            ? selectedCategoryIds.map(Number)
            : undefined,
        status: selectedStatuses.length === 1 ? selectedStatuses[0] : undefined,
        search_query: globalFilter || undefined,
        limit: updatedPagination.pageSize,
        offset: updatedPagination.pageIndex * updatedPagination.pageSize,
      };

      await fetchPromoCodes(fetchParams);
    },
    [
      selectedCategoryIds,
      selectedSubcategoryIds,
      selectedStatuses,
      globalFilter,
      fetchPromoCodes,
    ]
  );

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchSubcategories(),
        loadPromoCodes(pagination),
      ]);
    };
    loadInitialData();
  }, []); // Empty dependency array to run only once on mount

  // Reload promo codes when filters or pagination change
  useEffect(() => {
    loadPromoCodes(pagination);
  }, [
    selectedCategoryIds,
    selectedSubcategoryIds,
    selectedStatuses,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  const toggleResultModal = useCallback(
    () => setIsOpenResult(prev => !prev),
    []
  );

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map(cat => [
          cat.account_category_id,
          cat.account_category_name,
        ])
      ),
    [categories]
  );
  const subcategoryMap = useMemo(
    () =>
      new Map(
        subcategories.map(sub => [
          sub.account_subcategory_id,
          sub.account_subcategory_name,
        ])
      ),
    [subcategories]
  );

  const columns: ColumnDef<PromoCode>[] = useMemo(
    () => [
      { accessorKey: 'promocode_id', header: 'ID' },
      { accessorKey: 'name', header: t('PromoCodeSection.table.name') },
      { accessorKey: 'discount', header: t('PromoCodeSection.table.discount') },
      { accessorKey: 'promocode', header: t('PromoCodeSection.table.code') },
      {
        accessorKey: 'promocode_status',
        header: t('PromoCodeSection.table.status'),
      },
      { accessorKey: 'expires_at', header: t('PromoCodeSection.table.data') },
      {
        id: 'actions',
        header: t('Names.table.actions'),
        cell: () => (
          <div className={styles.table_buttons}>
            <WhiteBtn
              onClick={toggleResultModal}
              text={'Names.table.editBtn'}
              icon="icon-edit-pencil"
            />
            <WhiteBtn
              onClick={toggleResultModal}
              text={'PromoCodeSection.table.btn'}
              icon="icon-archive-box"
            />
          </div>
        ),
      },
    ],
    [t, toggleResultModal]
  );

  const table = useReactTable({
    data: promoCodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    filterFns: {
      global: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const cellValue = String(row.getValue(columnId) ?? '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      },
    },
  });

  const categoryOptions = useMemo(
    () => [
      t('AllAccounts.selects.allCategories'),
      ...categories.map(cat => cat.account_category_name),
    ],
    [categories, t]
  );
  const subcategoryOptions = useMemo(
    () => [
      t('AllAccounts.selects.allNames'),
      ...subcategories.map(sub => sub.account_subcategory_name),
    ],
    [subcategories, t]
  );
  const statusOptions = useMemo(
    () => [
      t('PromoCodeSection.selects.allStatus'),
      t('PromoCodeSection.selects.active'),
      t('PromoCodeSection.selects.deactivated'),
    ],
    [t]
  );

  const handleCategorySelect = useCallback(
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('AllAccounts.selects.allCategories')
      );
      if (filteredValues.length === 0) {
        setSelectedCategoryIds([]);
        setSelectedSubcategoryIds([]);
      } else {
        const newSelectedIds = filteredValues
          .map(value => {
            const category = categories.find(
              cat => cat.account_category_name === value
            );
            return category ? String(category.account_category_id) : null;
          })
          .filter((id): id is string => id !== null);
        setSelectedCategoryIds(newSelectedIds);
        if (newSelectedIds.length > 0) setSelectedSubcategoryIds([]);
      }
    },
    [categories, t]
  );

  const handleSubcategorySelect = useCallback(
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('AllAccounts.selects.allNames')
      );
      if (filteredValues.length === 0) {
        setSelectedSubcategoryIds([]);
        setSelectedCategoryIds([]);
      } else {
        const newSelectedIds = filteredValues
          .map(value => {
            const subcategory = subcategories.find(
              sub => sub.account_subcategory_name === value
            );
            return subcategory
              ? String(subcategory.account_subcategory_id)
              : null;
          })
          .filter((id): id is string => id !== null);
        setSelectedSubcategoryIds(newSelectedIds);
        if (newSelectedIds.length > 0) setSelectedCategoryIds([]);
      }
    },
    [subcategories, t]
  );

  const handleStatusSelect = useCallback(
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('PromoCodeSection.selects.allStatus')
      );
      const mappedStatuses = filteredValues.map(value => {
        if (value === t('PromoCodeSection.selects.active')) return 'ACTIVE';
        if (value === t('PromoCodeSection.selects.deactivated'))
          return 'DEACTIVATED';
        return value;
      });
      setSelectedStatuses(mappedStatuses);
    },
    [t]
  );

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.otherParMenu.promo')}</h2>
        <p className={styles.header_text}>{t('PromoCodeSection.headerText')}</p>
        <div className={styles.top_btn_wrap}>
          <CustomSelect
            label={t('PromoCodeSection.category')}
            options={categoryOptions}
            selected={
              selectedCategoryIds.length > 0
                ? selectedCategoryIds.map(
                    id => categoryMap.get(parseInt(id)) || ''
                  )
                : [t('AllAccounts.selects.allCategories')]
            }
            onSelect={handleCategorySelect}
            width={496}
          />
          <CustomSelect
            label={t('PromoCodeSection.names')}
            options={subcategoryOptions}
            selected={
              selectedSubcategoryIds.length > 0
                ? selectedSubcategoryIds.map(
                    id => subcategoryMap.get(parseInt(id)) || ''
                  )
                : [t('AllAccounts.selects.allNames')]
            }
            onSelect={handleSubcategorySelect}
            width={496}
          />
          <CustomSelect
            label={t('PromoCodeSection.status')}
            options={statusOptions}
            selected={
              selectedStatuses.length > 0
                ? selectedStatuses.map(status =>
                    status === 'ACTIVE'
                      ? t('PromoCodeSection.selects.active')
                      : t('PromoCodeSection.selects.deactivated')
                  )
                : [t('PromoCodeSection.selects.allStatus')]
            }
            onSelect={handleStatusSelect}
            width={496}
            multiSelections={false}
          />
        </div>
        <div className={styles.search_wrap}>
          <AddBtn
            onClick={toggleResultModal}
            text={'PromoCodeSection.addBtn'}
          />
          <SearchInput
            onSearch={query => setGlobalFilter(query)}
            text={'PromoCodeSection.searchBtn'}
            options={Array.from(new Set(promoCodes.map(promo => promo.name)))}
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
            onChange={e => {
              const newPageSize = Number(e.target.value);
              const newPagination = {
                ...pagination,
                pageSize: newPageSize,
                pageIndex: 0,
              };
              setPagination(newPagination);
            }}
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
              totalRows
            )}
            {t('Category.table.pages')}
            {totalRows}
          </span>
          <div className={styles.pagination_btn_wrap}>
            <button
              className={styles.pagination_btn}
              onClick={() => {
                const newPagination = {
                  ...pagination,
                  pageIndex: pagination.pageIndex - 1,
                };
                setPagination(newPagination);
              }}
              disabled={pagination.pageIndex === 0}
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
              onClick={() => {
                const newPagination = {
                  ...pagination,
                  pageIndex: pagination.pageIndex + 1,
                };
                setPagination(newPagination);
              }}
              disabled={
                (pagination.pageIndex + 1) * pagination.pageSize >= totalRows
              }
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
        isOpen={isOpenResult}
        onClose={toggleResultModal}
        title="PromoCodeSection.modal.title"
        text="PromoCodeSection.modal.text"
      >
        <CreatePromoCode />
      </ModalComponent>
    </section>
  );
}
