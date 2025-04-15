'use client';

import { debounce } from 'lodash';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import styles from './RemoveSaleSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { Account, SearchResponse } from '@/types/accountsTypes';
import { useAccountsStore } from '@/store/accountsStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import SearchInput from '../Buttons/SearchInput/SearchInput';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import Icon from '@/helpers/Icon';
import ModalComponent from '../ModalComponent/ModalComponent';
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import SearchResult from '../ModalComponent/SearchResult/SearchResult';
import ViewSettings from '../ModalComponent/ViewSettings/ViewSettings';
import Loader from '@/components/Loader/Loader';
import { PaginationState } from '@/types/componentsTypes';

const LOCAL_STORAGE_KEY = 'removeSaleTableSettings';
const PAGINATION_KEY = 'removeSalePaginationSettings';

const settingsOptions = [
  'AllAccounts.modalUpdate.selects.id',
  'AllAccounts.modalUpdate.selects.name',
  'RemoveSaleSection.table.category',
  'RemoveSaleSection.table.status',
  'AllAccounts.modalUpdate.selects.data',
  'AllAccounts.modalUpdate.selects.mega',
];

const defaultColumns = [
  'AllAccounts.modalUpdate.selects.id',
  'AllAccounts.modalUpdate.selects.name',
  'RemoveSaleSection.table.category',
  'RemoveSaleSection.table.status',
  'AllAccounts.modalUpdate.selects.data',
  'AllAccounts.modalUpdate.selects.mega',
];

export default function RemoveSaleSection() {
  const t = useTranslations();

  const {
    accounts,
    fetchAccounts,
    searchAccounts,
    error: accountsError,
  } = useAccountsStore();
  const {
    categories,
    fetchCategories,
    fetchSubcategories,
    error: categoriesError,
  } = useCategoriesStore();

  const error =
    [accountsError, categoriesError].filter(Boolean).join('; ') || null;

  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenResult, setIsOpenResult] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDownload, setIsOpenDownload] = useState(false);
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(settingsOptions);
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PAGINATION_KEY);
      return saved ? JSON.parse(saved) : { pageIndex: 0, pageSize: 5 };
    }
    return { pageIndex: 0, pageSize: 5 };
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [sortByUpload, setSortByUpload] = useState<'DESC' | 'ASC'>('DESC');
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [pagination]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const savedColumns = JSON.parse(saved);
        const validColumns = savedColumns.filter((col: string) =>
          settingsOptions.includes(col)
        );
        setSelectedColumns(
          validColumns.length > 0 ? validColumns : settingsOptions
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validColumns));
      } else {
        setSelectedColumns(settingsOptions);
      }
    }
  }, []);

  useEffect(() => {
    if (accounts.length !== 0) setShowLoader(false);
  }, [accounts]);

  const loadAccounts = useCallback(
    async (updatedPagination: PaginationState, updateState = true) => {
      const fetchParams = {
        status: ['NOT SOLD'],
        limit: updatedPagination.pageSize,
        offset: updatedPagination.pageIndex * updatedPagination.pageSize,
        like_query: globalFilter.length >= 2 ? globalFilter : undefined,
        sort_by_upload: sortByUpload,
      };

      const { total_rows } = await fetchAccounts(fetchParams, updateState);
      setTotalRows(total_rows);
    },
    [globalFilter, fetchAccounts, sortByUpload]
  );

  const debouncedLoadAccounts = useCallback(
    debounce((query: string) => {
      if (query.length < 2) {
        loadAccounts(pagination);
        return;
      }
      loadAccounts(pagination);
    }, 300),
    [loadAccounts, pagination]
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (query === globalFilter) return;
      setGlobalFilter(query);
      debouncedLoadAccounts(query);
    },
    [debouncedLoadAccounts, globalFilter]
  );

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isInitialLoad) return;
      await Promise.all([
        fetchCategories(),
        fetchSubcategories(),
        loadAccounts(pagination),
      ]);
      setIsInitialLoad(false);
    };
    loadInitialData();
  }, [
    fetchCategories,
    fetchSubcategories,
    loadAccounts,
    pagination,
    isInitialLoad,
  ]);

  useEffect(() => {
    if (!isInitialLoad) {
      debouncedLoadAccounts(globalFilter);
    }
  }, [
    pagination,
    globalFilter,
    debouncedLoadAccounts,
    isInitialLoad,
    sortByUpload,
  ]);

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

  const columnDataMap: Record<
    string,
    (account: Account) => string | null | undefined | number
  > = {
    'AllAccounts.modalUpdate.selects.id': account => account.account_id,
    'AllAccounts.modalUpdate.selects.name': account => account.account_name,
    'RemoveSaleSection.table.category': account =>
      categoryMap.get(account.subcategory?.account_category_id) || 'N/A',
    'RemoveSaleSection.table.status': account =>
      account.destination
        ? t('AllAccounts.selects.transferYes')
        : t('AllAccounts.selects.transferNot'),
    'AllAccounts.modalUpdate.selects.data': account => account.account_data,
    'AllAccounts.modalUpdate.selects.mega': account => account.archive_link,
  };

  const fieldMap: Record<string, string> = {
    'AllAccounts.modalUpdate.selects.id': 'account_id',
    'AllAccounts.modalUpdate.selects.name': 'account_name',
    'RemoveSaleSection.table.category': 'category',
    'RemoveSaleSection.table.status': 'status',
    'AllAccounts.modalUpdate.selects.data': 'account_data',
    'AllAccounts.modalUpdate.selects.mega': 'archive_link',
  };

  const columns: ColumnDef<Account>[] = useMemo(() => {
    return selectedColumns.map(colId => {
      const field = fieldMap[colId];
      const column: ColumnDef<Account> = {
        accessorKey: field,
        header: t(colId),
        cell: ({ row }) => {
          if (colId === 'AllAccounts.modalUpdate.selects.mega') {
            const link = columnDataMap[colId](row.original);
            return link ? (
              <a
                href={link.toString()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link}
              </a>
            ) : (
              'N/A'
            );
          }
          if (!columnDataMap[colId]) {
            return 'N/A';
          }
          return columnDataMap[colId](row.original);
        },
        enableSorting: colId === 'RemoveSaleSection.table.status',
        sortingFn: (rowA, rowB) => {
          if (colId === 'RemoveSaleSection.table.status') {
            const aTransferred = !!rowA.original.destination;
            const bTransferred = !!rowB.original.destination;
            return aTransferred === bTransferred ? 0 : aTransferred ? -1 : 1;
          }
          return 0;
        },
      };
      if (field === 'category') {
        column.filterFn = (row, columnId, filterValue) => {
          const categoryName =
            categoryMap.get(row.original.subcategory?.account_category_id) ||
            'N/A';
          return categoryName.toLowerCase().includes(filterValue.toLowerCase());
        };
      }
      return column;
    });
  }, [selectedColumns, t, columnDataMap, fieldMap, categoryMap]);

  const table = useReactTable({
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { globalFilter, pagination, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    autoResetPageIndex: false,
  });

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Not Sold Accounts');
    sheet.addRow(selectedColumns.map(colId => t(colId)));

    const fetchParams = {
      status: ['NOT SOLD'],
      limit: totalRows,
      like_query: globalFilter.length >= 2 ? globalFilter : undefined,
      sort_by_upload: sortByUpload,
    };

    const { items } = await fetchAccounts(fetchParams, false);
    items.forEach(account => {
      sheet.addRow(selectedColumns.map(colId => columnDataMap[colId](account)));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'not_sold_accounts_report.xlsx');
  };

  const toggleResultModal = () => setIsOpenResult(prev => !prev);
  const toggleEditModal = () => setIsOpenEdit(prev => !prev);
  const toggleDownload = () => setIsOpenDownload(prev => !prev);

  const handleSaveSettings = (newSelectedColumns: string[]) => {
    setSelectedColumns(newSelectedColumns);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSelectedColumns));
    setIsOpenEdit(false);
  };

  const handleSearchAccounts = async () => {
    const accountNames = searchInput
      .split('\n')
      .map(name => name.trim())
      .filter(name => name);

    if (accountNames.length === 0) return;

    const result = await searchAccounts(accountNames);
    setSearchResult(result);
    toggleResultModal();
  };

  const handleSortChange = (selected: string[]) => {
    setSortByUpload(
      selected[0] === t('RemoveSaleSection.descending') ? 'DESC' : 'ASC'
    );
  };

  const handleClear = () => {
    loadAccounts(pagination);
    setSearchInput('');
  };

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
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
        <div className={styles.top_btn_wrap}>
          <WhiteBtn
            onClick={handleSearchAccounts}
            text={'RemoveSaleSection.searchBtn'}
            icon="icon-search-btn-fill"
          />
        </div>
        <div className={styles.search_wrap}>
          <CustomSelect
            label={t('RemoveSaleSection.loadSelect')}
            options={[
              t('RemoveSaleSection.descending'),
              t('RemoveSaleSection.ascending'),
            ]}
            selected={[
              sortByUpload === 'DESC'
                ? t('RemoveSaleSection.descending')
                : t('RemoveSaleSection.ascending'),
            ]}
            onSelect={handleSortChange}
            width={350}
            multiSelections={false}
          />
          <SearchInput
            onSearch={handleSearch}
            text={'AllAccounts.searchBtn'}
            options={Array.from(
              new Set(
                accounts?.map(
                  acc =>
                    categoryMap.get(acc.subcategory?.account_category_id) ||
                    'N/A'
                )
              )
            )}
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
                  <th
                    className={styles.th}
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{ asc: ' ↑', desc: ' ↓' }[
                      header.column.getIsSorted() as string
                    ] ?? null}
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
              onClick={toggleDownload}
              text={'AllAccounts.downloadBtn'}
              icon="icon-cloud-download"
              iconFill="icon-cloud-download-fill"
            />
            <WhiteBtn
              onClick={toggleEditModal}
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
              onChange={e => {
                const newPageSize = Number(e.target.value);
                const newPagination = {
                  ...pagination,
                  pageSize: newPageSize,
                  pageIndex: 0,
                };
                setPagination(newPagination);
                loadAccounts(newPagination);
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
                  loadAccounts(newPagination);
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
                  loadAccounts(newPagination);
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
      </div>
      <ModalComponent
        isOpen={isOpenResult}
        onClose={toggleResultModal}
        title="RemoveSaleSection.modal.title"
        text="RemoveSaleSection.modal.text"
      >
        <SearchResult
          searchResult={searchResult}
          onRemove={handleClear}
          onClose={toggleResultModal}
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenEdit}
        onClose={toggleEditModal}
        title="AllAccounts.modalUpdate.title"
        text="AllAccounts.modalUpdate.description"
      >
        <ViewSettings
          defaultColumns={defaultColumns}
          onClose={toggleEditModal}
          selectedColumns={selectedColumns}
          onSave={handleSaveSettings}
        />
      </ModalComponent>
      <ModalComponent
        title="AllAccounts.modalUpdate.titleDownload"
        isOpen={isOpenDownload}
        onClose={toggleDownload}
      >
        <div className={styles.modal_btn_wrap}>
          <WhiteBtn
            onClick={exportToExcel}
            text={'AllAccounts.downloadBtn'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
        </div>
      </ModalComponent>
    </section>
  );
}
