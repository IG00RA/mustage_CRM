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
  getSortedRowModel,
  useReactTable,
  SortingState,
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
  const [totalRows, setTotalRows] = useState<number>(0); // For paginated table
  const [totalAllRows, setTotalAllRows] = useState<number>(0); // For all accounts
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACCOUNTS_PAGINATION_KEY);
      return saved
        ? (JSON.parse(saved) as PaginationState)
        : { pageIndex: 0, pageSize: 5 };
    }
    return { pageIndex: 0, pageSize: 5 };
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
    async (updatedPagination: PaginationState) => {
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

      const { total_rows } = await fetchAccounts(fetchParams, true);
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
      fetchAccounts,
      t,
    ]
  );

  // Fetch total count of all accounts
  const fetchTotalAllRows = useCallback(async () => {
    const { total_rows } = await fetchAccounts({}, false); // Empty params to get total count
    setTotalAllRows(total_rows);
  }, [fetchAccounts]);

  useEffect(() => {
    const loadData = async () => {
      if (isInitialLoad) {
        await Promise.all([
          fetchCategories(),
          fetchSubcategories(),
          fetchSellers(),
          fetchTotalAllRows(), // Fetch total count of all accounts
        ]);
        setIsInitialLoad(false);
      }
      await loadAccounts(pagination);
    };
    loadData();
  }, [
    fetchCategories,
    fetchSubcategories,
    fetchSellers,
    fetchTotalAllRows,
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
    loadAccounts,
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
      limit: totalRows, // Use filtered total
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

    const { items } = await fetchAccounts({ limit: totalAllRows }, false); // Use total of all accounts

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
            multiSelections={false}
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
        <div className={styles.sell_wrap}>
          <DateRangeSelector
            label="AllAccounts.sellDate"
            dateRange={sellDateRange}
            customPeriodLabel={
              sellCustomStartDate && sellCustomEndDate
                ? `${sellCustomStartDate} - ${sellCustomEndDate}`
                : ''
            }
            onDateRangeChange={handleSellDateRangeChange}
            onCustomDatesChange={handleSellCustomDatesChange}
            initialStartDate={sellCustomStartDate}
            initialEndDate={sellCustomEndDate}
          />
        </div>
        <div className={styles.search_wrap}>
          <DateRangeSelector
            label="AllAccounts.loadDate"
            dateRange={loadDateRange}
            customPeriodLabel={
              loadCustomStartDate && loadCustomEndDate
                ? `${loadCustomStartDate} - ${loadCustomEndDate}`
                : ''
            }
            onDateRangeChange={handleLoadDateRangeChange}
            onCustomDatesChange={handleLoadCustomDatesChange}
            initialStartDate={loadCustomStartDate}
            initialEndDate={loadCustomEndDate}
          />
          <SearchInput
            onSearch={query => setCategoryFilter(query)}
            text={'AllAccounts.searchBtn'}
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
              )}{' '}
              {t('Category.table.pages')} {totalRows}
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
            onClick={exportFilteredToExcel}
            text={'AllAccounts.downloadBtn'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
          <WhiteBtn
            onClick={exportAllToExcel}
            text={'AllAccounts.downloadBtnAll'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
        </div>
      </ModalComponent>
    </section>
  );
}
