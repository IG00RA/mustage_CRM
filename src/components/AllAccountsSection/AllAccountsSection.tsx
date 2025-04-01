'use client';

import { debounce } from 'lodash';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import styles from './AllAccountsSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { Account, RangeType } from '@/types/salesTypes';
import { useAccountsStore } from '@/store/accountsStore';
import { useSellersStore } from '@/store/sellersStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { PaginationState } from '@/types/componentsTypes';
import { FilterSection } from './FilterSection/FilterSection';
import { TableSection } from './TableSection/TableSection';
import { ModalsSection } from './ModalsSection/ModalsSection';

const LOCAL_STORAGE_KEY = 'allAccountsTableSettings';
const ACCOUNTS_PAGINATION_KEY = 'accountsPaginationSettings';

const settingsOptions = [
  'AllAccounts.modalUpdate.selects.id',
  'AllAccounts.modalUpdate.selects.name',
  'AllAccounts.modalUpdate.selects.category',
  'AllAccounts.modalUpdate.selects.seller',
  'AllAccounts.modalUpdate.selects.transfer',
  'AllAccounts.modalUpdate.selects.data',
  'AllAccounts.modalUpdate.selects.mega',
];

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
  const [totalRows, setTotalRows] = useState<number>(0);
  const [totalAllRows, setTotalAllRows] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACCOUNTS_PAGINATION_KEY);
      return saved ? JSON.parse(saved) : { pageIndex: 0, pageSize: 20 };
    }
    return { pageIndex: 0, pageSize: 20 };
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sellDateRange, setSellDateRange] = useState<RangeType>('all');
  const [sellCustomStartDate, setSellCustomStartDate] = useState<string>('');
  const [sellCustomEndDate, setSellCustomEndDate] = useState<string>('');
  const [loadDateRange, setLoadDateRange] = useState<RangeType>('all');
  const [loadCustomStartDate, setLoadCustomStartDate] = useState<string>('');
  const [loadCustomEndDate, setLoadCustomEndDate] = useState<string>('');

  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(settingsOptions);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCOUNTS_PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [pagination]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) setSelectedColumns(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (accounts.length !== 0) setShowLoader(false);
  }, [accounts]);

  const loadAccounts = useCallback(
    async (updatedPagination: PaginationState, updateState = true) => {
      const fetchParams: any = {
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
        limit: updatedPagination.pageSize,
        offset: updatedPagination.pageIndex * updatedPagination.pageSize,
        like_query: globalFilter.length >= 2 ? globalFilter : undefined, // Додаємо like_query
      };

      if (
        sellDateRange === 'custom' &&
        sellCustomStartDate &&
        sellCustomEndDate
      ) {
        fetchParams.sold_start_date = sellCustomStartDate;
        fetchParams.sold_end_date = sellCustomEndDate;
      } else if (sellDateRange !== 'custom' && sellDateRange !== 'all') {
        const { start, end } = getDateRange(sellDateRange);
        fetchParams.sold_start_date = formatDate(start);
        fetchParams.sold_end_date = formatDate(end);
      }

      if (
        loadDateRange === 'custom' &&
        loadCustomStartDate &&
        loadCustomEndDate
      ) {
        fetchParams.upload_start_date = loadCustomStartDate;
        fetchParams.upload_end_date = loadCustomEndDate;
      } else if (loadDateRange !== 'custom' && loadDateRange !== 'all') {
        const { start, end } = getDateRange(loadDateRange);
        fetchParams.upload_start_date = formatDate(start);
        fetchParams.upload_end_date = formatDate(end);
      }

      if (selectedTransfers.length === 1) {
        fetchParams.with_destination =
          selectedTransfers[0] === t('AllAccounts.selects.transferYes');
      }

      const { total_rows, items } = await fetchAccounts(
        fetchParams,
        updateState
      );
      setTotalRows(total_rows);
    },
    [
      selectedCategoryIds,
      selectedSubcategoryIds,
      selectedStatuses,
      selectedTransfers,
      selectedSellerIds,
      sellDateRange,
      sellCustomStartDate,
      sellCustomEndDate,
      loadDateRange,
      loadCustomStartDate,
      loadCustomEndDate,
      globalFilter,
      fetchAccounts,
      t,
    ]
  );

  const debouncedLoadAccounts = useCallback(
    debounce((query: string) => {
      if (query.length < 2) {
        loadAccounts(pagination);
        return;
      }
      loadAccounts(pagination); // Використовуємо loadAccounts із like_query
    }, 300),
    [loadAccounts, pagination]
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (query === globalFilter) {
        return; // Уникаємо повторних викликів із тим самим запитом
      }
      setGlobalFilter(query);
      debouncedLoadAccounts(query);
    },
    [debouncedLoadAccounts, globalFilter]
  );

  const fetchTotalAllRows = useCallback(async () => {
    const { total_rows } = await fetchAccounts({}, false);
    setTotalAllRows(total_rows);
  }, [fetchAccounts]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isInitialLoad) {
        return;
      }
      await Promise.all([
        fetchCategories(),
        fetchSubcategories(),
        fetchSellers(),
        fetchTotalAllRows(),
        loadAccounts(pagination),
      ]);
      setIsInitialLoad(false);
    };
    loadInitialData();
  }, [
    fetchCategories,
    fetchSubcategories,
    fetchSellers,
    fetchTotalAllRows,
    loadAccounts,
    pagination,
    isInitialLoad,
  ]);

  useEffect(() => {
    if (!isInitialLoad) {
      debouncedLoadAccounts(globalFilter);
    }
  }, [
    selectedCategoryIds,
    selectedSubcategoryIds,
    selectedStatuses,
    selectedTransfers,
    selectedSellerIds,
    sellDateRange,
    sellCustomStartDate,
    sellCustomEndDate,
    loadDateRange,
    loadCustomStartDate,
    loadCustomEndDate,
    pagination,
    globalFilter,
    debouncedLoadAccounts,
    isInitialLoad,
  ]);

  const getDateRange = (range: RangeType): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'all':
        start.setFullYear(2000, 0, 1);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        break;
    }
    return { start, end };
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    (account: Account) => string | null | undefined | number
  > = {
    'AllAccounts.modalUpdate.selects.id': account => account.account_id,
    'AllAccounts.modalUpdate.selects.name': account => account.account_name,
    'AllAccounts.modalUpdate.selects.category': account =>
      categoryMap.get(account.subcategory?.account_category_id) || 'N/A',
    'AllAccounts.modalUpdate.selects.seller': account =>
      account.seller?.seller_name || 'N/A',
    'AllAccounts.modalUpdate.selects.transfer': account =>
      account.destination
        ? t('AllAccounts.selects.transferYes')
        : t('AllAccounts.selects.transferNot'),
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
        enableSorting: colId === 'AllAccounts.modalUpdate.selects.transfer',
        sortingFn: (rowA, rowB) => {
          if (colId === 'AllAccounts.modalUpdate.selects.transfer') {
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

  const exportFilteredToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Filtered Accounts');
    sheet.addRow(selectedColumns.map(colId => t(colId)));

    const fetchParams: any = {
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
      limit: totalRows,
      like_query: globalFilter.length >= 2 ? globalFilter : undefined, // Додаємо like_query
    };

    if (
      sellDateRange === 'custom' &&
      sellCustomStartDate &&
      sellCustomEndDate
    ) {
      fetchParams.sold_start_date = sellCustomStartDate;
      fetchParams.sold_end_date = sellCustomEndDate;
    } else if (sellDateRange !== 'custom' && sellDateRange !== 'all') {
      const { start, end } = getDateRange(sellDateRange);
      fetchParams.sold_start_date = formatDate(start);
      fetchParams.sold_end_date = formatDate(end);
    }

    if (
      loadDateRange === 'custom' &&
      loadCustomStartDate &&
      loadCustomEndDate
    ) {
      fetchParams.upload_start_date = loadCustomStartDate;
      fetchParams.upload_end_date = loadCustomEndDate;
    } else if (loadDateRange !== 'custom' && loadDateRange !== 'all') {
      const { start, end } = getDateRange(loadDateRange);
      fetchParams.upload_start_date = formatDate(start);
      fetchParams.upload_end_date = formatDate(end);
    }

    if (selectedTransfers.length === 1) {
      fetchParams.with_destination =
        selectedTransfers[0] === t('AllAccounts.selects.transferYes');
    }

    const { items } = await fetchAccounts(fetchParams, false);
    items.forEach(account => {
      sheet.addRow(selectedColumns.map(colId => columnDataMap[colId](account)));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'filtered_accounts_report.xlsx');
  };

  const exportAllToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('All Accounts');
    sheet.addRow(selectedColumns.map(colId => t(colId)));

    const { items } = await fetchAccounts({ limit: totalAllRows }, false);
    items.forEach(account => {
      sheet.addRow(selectedColumns.map(colId => columnDataMap[colId](account)));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'all_accounts_report.xlsx');
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
  const statusOptionsRaw = ['SOLD', 'NOT SOLD', 'REPLACED', 'EXCLUDED'];
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
      ...sellers.map(seller => String(seller.seller_name)),
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
    getSortedRowModel: getSortedRowModel(),
    state: { globalFilter, pagination, columnFilters, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
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
          row.original.destination) ||
        (selectedTransfers.includes(t('AllAccounts.selects.transferNot')) &&
          !row.original.destination);
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

  const handleSellDateRangeChange = (newRange: RangeType) => {
    setSellDateRange(newRange);
    setSellCustomStartDate('');
    setSellCustomEndDate('');
  };

  const handleSellCustomDatesChange = (start: string, end: string) => {
    setSellDateRange('custom');
    setSellCustomStartDate(start);
    setSellCustomEndDate(end);
  };

  const handleLoadDateRangeChange = (newRange: RangeType) => {
    setLoadDateRange(newRange);
    setLoadCustomStartDate('');
    setLoadCustomEndDate('');
  };

  const handleLoadCustomDatesChange = (start: string, end: string) => {
    setLoadDateRange('custom');
    setLoadCustomStartDate(start);
    setLoadCustomEndDate(end);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.allAcc')}</h2>
        <p className={styles.header_text}>{t('Category.headerText')}</p>
        <FilterSection
          categoryOptions={categoryOptions}
          subcategoryOptions={subcategoryOptions}
          statusOptions={statusOptions}
          transferOptions={transferOptions}
          sellerOptions={sellerOptions}
          selectedCategoryIds={selectedCategoryIds}
          selectedSubcategoryIds={selectedSubcategoryIds}
          selectedStatuses={selectedStatuses}
          selectedTransfers={selectedTransfers}
          selectedSellerIds={selectedSellerIds}
          sellDateRange={sellDateRange}
          loadDateRange={loadDateRange}
          sellCustomStartDate={sellCustomStartDate}
          sellCustomEndDate={sellCustomEndDate}
          loadCustomStartDate={loadCustomStartDate}
          loadCustomEndDate={loadCustomEndDate}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          onStatusSelect={handleStatusSelect}
          onTransferSelect={handleTransferSelect}
          onSellerSelect={handleSellerSelect}
          onSellDateRangeChange={handleSellDateRangeChange}
          onSellCustomDatesChange={handleSellCustomDatesChange}
          onLoadDateRangeChange={handleLoadDateRangeChange}
          onLoadCustomDatesChange={handleLoadCustomDatesChange}
          onSearch={handleSearch}
          accounts={accounts}
          categoryMap={categoryMap}
          subcategoryMap={subcategoryMap}
          sellerMap={sellerMap}
          t={t}
        />
      </div>
      <TableSection
        table={table}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={setPagination}
        showLoader={showLoader}
        error={error}
        onToggleDownload={toggleDownload}
        onToggleEditModal={toggleEditModal}
        loadAccounts={loadAccounts}
        t={t}
      />
      <ModalsSection
        isOpenEdit={isOpenEdit}
        isOpenDownload={isOpenDownload}
        onToggleEditModal={toggleEditModal}
        onToggleDownload={toggleDownload}
        selectedColumns={selectedColumns}
        onSaveSettings={handleSaveSettings}
        onExportFilteredToExcel={exportFilteredToExcel}
        onExportAllToExcel={exportAllToExcel}
        t={t}
      />
    </section>
  );
}
