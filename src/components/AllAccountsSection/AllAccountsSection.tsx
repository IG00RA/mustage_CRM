'use client';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import styles from './AllAccountsSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import SearchInput from '../Buttons/SearchInput/SearchInput';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import Icon from '@/helpers/Icon';
import ModalComponent from '../ModalComponent/ModalComponent';
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import ViewSettings from '../ModalComponent/ViewSettings/ViewSettings';
import Loader from '../Loader/Loader';
import { Account, RangeType } from '@/types/salesTypes';
import { useAccountsStore } from '@/store/accountsStore';
import { useSellersStore } from '@/store/sellersStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { PaginationState } from '@/types/componentsTypes';
import DateRangeSelector from '../Buttons/DateRangeSelector/DateRangeSelector';
import { useSalesStore } from '@/store/salesStore';

const LOCAL_STORAGE_KEY = 'allAccountsTableSettings';

const settingsOptions = [
  'AllAccounts.modalUpdate.selects.id',
  'AllAccounts.modalUpdate.selects.name',
  'AllAccounts.modalUpdate.selects.category',
  'AllAccounts.modalUpdate.selects.seller',
  'AllAccounts.modalUpdate.selects.transfer',
  'AllAccounts.modalUpdate.selects.data',
  'AllAccounts.modalUpdate.selects.mega',
];

const ACCOUNTS_PAGINATION_KEY = 'accountsPaginationSettings';

export default function AllAccountsSection() {
  const t = useTranslations();

  const { accounts, fetchAccounts, error: accountsError } = useAccountsStore();
  const {
    categories,
    subcategories,
    fetchCategories,
    fetchSubcategories,
    error: categoriesError,
  } = useCategoriesStore();

  const { sellers, fetchSellers, error: sellersError } = useSellersStore();

  const error =
    [accountsError, categoriesError, sellersError].filter(Boolean).join('; ') ||
    null;

  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDownload, setIsOpenDownload] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    string[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [totalRows, setTotalRows] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACCOUNTS_PAGINATION_KEY);
      return saved
        ? (JSON.parse(saved) as PaginationState)
        : {
            pageIndex: 0,
            pageSize: 5,
          };
    }
    return {
      pageIndex: 0,
      pageSize: 5,
    };
  });
 
  const { dateRange, customPeriodLabel, setDateRange, setCustomPeriodLabel } =
    useSalesStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCOUNTS_PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [pagination]);


  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(settingsOptions);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) setSelectedColumns(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (accounts.length !== 0) setShowLoader(false);
  }, [accounts]);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchCategories();
      await fetchSubcategories();
      await fetchSellers();
      const { total_rows } = await fetchAccounts({
        limit: pagination.pageSize,
        offset: 0,
      });
      setTotalRows(total_rows);
    };
    loadInitialData();
  }, [
    fetchCategories,
    fetchSubcategories,
    fetchSellers,
    fetchAccounts,
    pagination.pageSize,
  ]);

  useEffect(() => {
    const loadAccounts = async () => {
      const { total_rows } = await fetchAccounts({
        subcategory_ids:
          selectedSubcategoryIds.length > 0
            ? selectedSubcategoryIds.map(Number)
            : undefined,
        category_ids:
          selectedSubcategoryIds.length === 0 && selectedCategoryIds.length > 0
            ? selectedCategoryIds.map(Number)
            : undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        seller_id:
          selectedSellerIds.length > 0
            ? selectedSellerIds.map(Number)
            : undefined,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      });
      setTotalRows(total_rows);
    };
    loadAccounts();
  }, [
    selectedCategoryIds,
    selectedSubcategoryIds,
    selectedStatuses,
    selectedSellerIds,
    pagination,
    fetchAccounts,
  ]);

  const toggleEditModal = useCallback(() => setIsOpenEdit(prev => !prev), []);
  const toggleDownload = useCallback(
    () => setIsOpenDownload(prev => !prev),
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
  const sellerMap = useMemo(
    () =>
      new Map(sellers.map(seller => [seller.seller_id, seller.seller_name])),
    [sellers]
  );

  const columnDataMap: Record<
    string,
    (account: Account) => string | number | undefined
  > = {
    'AllAccounts.modalUpdate.selects.id': account => account.account_id,
    'AllAccounts.modalUpdate.selects.name': account => account.account_name,
    'AllAccounts.modalUpdate.selects.category': account =>
      categoryMap.get(account.subcategory?.account_category_id) || 'N/A',
    'AllAccounts.modalUpdate.selects.seller': account =>
      account.seller?.seller_name || 'N/A',
    'AllAccounts.modalUpdate.selects.transfer': () => 'Передан',
    'AllAccounts.modalUpdate.selects.data': account => account.account_data,
    'AllAccounts.modalUpdate.selects.mega': account => account.archive_link,
  };

  const fieldMap: Record<string, string> = {
    'AllAccounts.modalUpdate.selects.id': 'account_id',
    'AllAccounts.modalUpdate.selects.name': 'account_name',
    'AllAccounts.modalUpdate.selects.category': 'category',
    'AllAccounts.modalUpdate.selects.seller': 'seller',
    'AllAccounts.modalUpdate.selects.transfer': 'status',
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
          return columnDataMap[colId](row.original);
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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Accounts');
    sheet.addRow(selectedColumns.map(colId => t(colId)));
    table.getFilteredRowModel().rows.forEach(row => {
      const account = row.original;
      sheet.addRow(selectedColumns.map(colId => columnDataMap[colId](account)));
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'accounts_report.xlsx');
  };

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
  const statusOptionsRaw = ['SOLD', 'NOTSOLD', 'REPLACED'];
  const statusOptions = useMemo(
    () => [
      t('AllAccounts.selects.allStatus'),
      ...statusOptionsRaw.map(status =>
        t(`AllAccounts.selects.status${status}`)
      ),
    ],
    [t]
  );
  const transferOptions = useMemo(
    () => [
      t('AllAccounts.selects.allTransfer'),
      t('AllAccounts.selects.transferYes'),
      t('AllAccounts.selects.transferNot'),
    ],
    [t]
  );
  const sellerOptions = useMemo(
    () => [
      t('AllAccounts.selects.sellerAll'),
      ...sellers.map(seller => seller.seller_name),
    ],
    [sellers, t]
  );

  const columnFilters = useMemo(() => {
    const filters = [];
    if (categoryFilter) filters.push({ id: 'category', value: categoryFilter });
    return filters;
  }, [categoryFilter]);

  const table = useReactTable({
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter, pagination, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue?.toLowerCase?.() || '';
      const categoryName =
        categoryMap.get(row.original.subcategory?.account_category_id) || 'N/A';
      const matchesSearch =
        searchValue === '' ||
        String(row.original.account_id).includes(searchValue) ||
        row.original.account_name.toLowerCase().includes(searchValue) ||
        categoryName.toLowerCase().includes(searchValue) ||
        (row.original.seller?.seller_name || '')
          .toLowerCase()
          .includes(searchValue) ||
        (row.original.status || '').toLowerCase().includes(searchValue) ||
        (row.original.account_data || '').toLowerCase().includes(searchValue) ||
        (row.original.archive_link || '').toLowerCase().includes(searchValue);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(row.original.status);

      const matchesTransfer =
        selectedTransfers.length === 0 ||
        (selectedTransfers.includes(t('AllAccounts.selects.transferYes')) &&
          row.original.isTransferred) ||
        (selectedTransfers.includes(t('AllAccounts.selects.transferNot')) &&
          !row.original.isTransferred);

      const matchesSeller =
        selectedSellerIds.length === 0 ||
        selectedSellerIds.includes(String(row.original.seller?.seller_id));

      return matchesSearch && matchesStatus && matchesTransfer && matchesSeller;
    },
  });

  const handleSaveSettings = (newSelectedColumns: string[]) => {
    setSelectedColumns(newSelectedColumns);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSelectedColumns));
    setIsOpenEdit(false);
  };

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
        value => value !== t('AllAccounts.selects.allStatus')
      );
      if (filteredValues.length === 0) {
        setSelectedStatuses([]);
      } else {
        const rawStatuses = filteredValues
          .map(value => {
            const index = statusOptions.indexOf(value);
            return index > 0 ? statusOptionsRaw[index - 1] : null;
          })
          .filter((status): status is string => status !== null);
        setSelectedStatuses(rawStatuses);
      }
    },
    [t, statusOptions, statusOptionsRaw]
  );

  const handleTransferSelect = useCallback(
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('AllAccounts.selects.allTransfer')
      );
      if (filteredValues.length === 0) {
        setSelectedTransfers([]);
      } else {
        setSelectedTransfers(filteredValues);
      }
    },
    [t]
  );

  const handleSellerSelect = useCallback(
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('AllAccounts.selects.sellerAll')
      );
      if (filteredValues.length === 0) {
        setSelectedSellerIds([]);
      } else {
        const newSelectedIds = filteredValues
          .map(value => {
            const seller = sellers.find(seller => seller.seller_name === value);
            return seller ? String(seller.seller_id) : null;
          })
          .filter((id): id is string => id !== null);
        setSelectedSellerIds(newSelectedIds);
      }
    },
    [sellers, t]
  );

  const handleDateRangeChange = (newRange: RangeType) => {
    setDateRange(newRange);
    setCustomPeriodLabel('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleCustomDatesChange = (start: string, end: string) => {
    setCustomPeriodLabel(`${start} - ${end}`);
    setDateRange('custom');
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.allAcc')}</h2>
        <p className={styles.header_text}>{t('Category.headerText')}</p>
        <div className={styles.select_wrap}>
          <CustomSelect
            label={t('AllAccounts.selects.status')}
            options={statusOptions}
            selected={
              selectedStatuses.length > 0
                ? selectedStatuses.map(status =>
                    t(`AllAccounts.selects.status${status}`)
                  )
                : [t('AllAccounts.selects.allStatus')]
            }
            onSelect={handleStatusSelect}
            width={508}
            selectWidth={383}
          />
          <CustomSelect
            label={t('AllAccounts.selects.transfer')}
            options={transferOptions}
            selected={
              selectedTransfers.length > 0
                ? selectedTransfers
                : [t('AllAccounts.selects.allTransfer')]
            }
            onSelect={handleTransferSelect}
            width={508}
            selectWidth={383}
          />
          <CustomSelect
            label={t('AllAccounts.selects.seller')}
            options={sellerOptions}
            selected={
              selectedSellerIds.length > 0
                ? selectedSellerIds.map(id => sellerMap.get(parseInt(id)) || '')
                : [t('AllAccounts.selects.sellerAll')]
            }
            onSelect={handleSellerSelect}
            width={508}
            selectWidth={383}
          />
          <CustomSelect
            label={t('AllAccounts.selects.categories')}
            options={categoryOptions}
            selected={
              selectedCategoryIds.length > 0
                ? selectedCategoryIds.map(
                    id => categoryMap.get(parseInt(id)) || ''
                  )
                : [t('AllAccounts.selects.allCategories')]
            }
            onSelect={handleCategorySelect}
            width={508}
            selectWidth={383}
          />
          <CustomSelect
            label={t('AllAccounts.selects.names')}
            options={subcategoryOptions}
            selected={
              selectedSubcategoryIds.length > 0
                ? selectedSubcategoryIds.map(
                    id => subcategoryMap.get(parseInt(id)) || ''
                  )
                : [t('AllAccounts.selects.allNames')]
            }
            onSelect={handleSubcategorySelect}
            width={508}
            selectWidth={383}
          />
        </div>
        <div className={styles.search_wrap}>
          <DateRangeSelector
            dateRange={dateRange}
            customPeriodLabel={customPeriodLabel}
            onDateRangeChange={handleDateRangeChange}
            onCustomDatesChange={handleCustomDatesChange}
            initialStartDate={customStartDate}
            initialEndDate={customEndDate}
          />
          <SearchInput
            onSearch={query => setCategoryFilter(query)}
            text={'Category.searchBtn'}
            options={Array.from(
              new Set(
                accounts.map(
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
                totalRows
              )}{' '}
              {t('Category.table.pages')} {totalRows}
            </span>
            <div className={styles.pagination_btn_wrap}>
              <button
                className={styles.pagination_btn}
                onClick={() =>
                  setPagination(prev => ({
                    ...prev,
                    pageIndex: prev.pageIndex - 1,
                  }))
                }
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
                onClick={() =>
                  setPagination(prev => ({
                    ...prev,
                    pageIndex: prev.pageIndex + 1,
                  }))
                }
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
        isOpen={isOpenEdit}
        onClose={toggleEditModal}
        title="AllAccounts.modalUpdate.title"
        text="AllAccounts.modalUpdate.description"
      >
        <ViewSettings
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
          <WhiteBtn
            onClick={exportToExcel}
            text={'AllAccounts.downloadBtnAll'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
        </div>
      </ModalComponent>
    </section>
  );
}
