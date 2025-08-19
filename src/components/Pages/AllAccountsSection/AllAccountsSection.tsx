'use client';

import { debounce } from 'lodash';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import styles from './AllAccountsSection.module.css';
import { useTranslations } from 'next-intl';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  Row,
} from '@tanstack/react-table';
import { Account, FetchAllAccountsParams } from '@/types/accountsTypes';
import { useAccountsStore } from '@/store/accountsStore';
import { useSellersStore } from '@/store/sellersStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useUsersStore } from '@/store/usersStore';
import { FilterSection } from './FilterSection/FilterSection';
import { TableSection } from './TableSection/TableSection';
import { ModalsSection } from './ModalsSection/ModalsSection';
import { PaginationState } from '@/types/componentsTypes';
import { RangeType } from '@/types/salesTypes';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';

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
  'AllAccounts.modalUpdate.selects.profileLink',
  'AllAccounts.modalUpdate.selects.loadDate',
  'AllAccounts.modalUpdate.selects.sellDate',
  'AllAccounts.modalUpdate.selects.destination',
];

export default function AllAccountsSection() {
  const t = useTranslations();
  const { currentUser } = useUsersStore();

  const { accounts, fetchAccounts, error: accountsError } = useAccountsStore();
  const {
    categories,
    subcategories,
    fetchCategories,
    fetchSubcategories,
    error: categoriesError,
  } = useCategoriesStore();
  const { sellers, fetchSellers, error: sellersError } = useSellersStore();

  const isFunctionsEmpty = currentUser?.functions.length === 0;
  const categoryPermissions =
    currentUser?.functions.find(
      func => func.function_id === 2 && func.function_name === 'Категории'
    )?.operations || [];
  const subcategoryPermissions =
    currentUser?.functions.find(
      func => func.function_id === 3 && func.function_name === 'Подкатегории'
    )?.operations || [];
  const hasReadCategories =
    isFunctionsEmpty || categoryPermissions.includes('READ');
  const hasReadSubcategories =
    isFunctionsEmpty || subcategoryPermissions.includes('READ');

  const error =
    [accountsError, categoriesError, sellersError].filter(Boolean).join('; ') ||
    null;

  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDownload, setIsOpenDownload] = useState(false);
  const [isOpenAccHistory, setIsOpenAccHistory] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    string[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);
  const [selectedInSet, setSelectedInSet] = useState<string[]>([]);
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
      const fetchParams: FetchAllAccountsParams = {
        subcategory_ids:
          hasReadSubcategories && selectedSubcategoryIds.length > 0
            ? selectedSubcategoryIds.map(Number)
            : undefined,
        category_ids:
          hasReadCategories &&
          selectedSubcategoryIds.length === 0 &&
          selectedCategoryIds.length > 0
            ? selectedCategoryIds.map(Number)
            : undefined,
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        seller_id:
          selectedSellerIds.length > 0
            ? selectedSellerIds.map(Number)
            : undefined,
        like_query: globalFilter,
        limit: updatedPagination.pageSize,
        offset: updatedPagination.pageIndex * updatedPagination.pageSize,
      };
      if (selectedInSet.length === 1) {
        fetchParams.in_set =
          selectedInSet[0] === t('AllAccounts.selects.inSetYes')
            ? true
            : selectedInSet[0] === t('AllAccounts.selects.inSetNo')
            ? false
            : undefined;
      }
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
      const { total_rows } = await fetchAccounts(fetchParams, updateState);
      setTotalRows(total_rows);
    },
    [
      selectedCategoryIds,
      selectedSubcategoryIds,
      selectedStatuses,
      selectedTransfers,
      selectedInSet,
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
      hasReadCategories,
      hasReadSubcategories,
    ]
  );

  const debouncedLoadAccounts = useRef(
    debounce(
      (
        query: string,
        loadAccountsFn: (
          pagination: PaginationState,
          updateState: boolean
        ) => Promise<void>,
        pagination: PaginationState
      ) => {
        loadAccountsFn(pagination, true);
      },
      100
    )
  ).current;

  const handleSearch = useCallback(
    (query: string) => {
      if (query === globalFilter) return;
      console.log('handleSearch called with query:', query);
      debouncedLoadAccounts.cancel();
      setGlobalFilter(query);
      setPagination(prev => ({
        ...prev,
        pageIndex: 0,
      }));
      debouncedLoadAccounts(query, loadAccounts, pagination);
    },
    [debouncedLoadAccounts, globalFilter, loadAccounts, pagination]
  );

  const fetchTotalAllRows = useCallback(async () => {
    const { total_rows } = await fetchAccounts({}, false);
    setTotalAllRows(total_rows);
  }, [fetchAccounts]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isInitialLoad) return;
      const promises = [
        fetchSellers(),
        fetchTotalAllRows(),
        loadAccounts(pagination),
      ];
      if (hasReadCategories) promises.unshift(fetchCategories());
      if (hasReadSubcategories) promises.unshift(fetchSubcategories());
      await Promise.all(promises);
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
    hasReadCategories,
    hasReadSubcategories,
  ]);

  useEffect(() => {
    if (!isInitialLoad) {
      debouncedLoadAccounts(globalFilter, loadAccounts, pagination);
    }
  }, [
    selectedCategoryIds,
    selectedSubcategoryIds,
    selectedStatuses,
    selectedTransfers,
    selectedInSet,
    selectedSellerIds,
    sellDateRange,
    sellCustomStartDate,
    sellCustomEndDate,
    loadDateRange,
    loadCustomStartDate,
    loadCustomEndDate,
    pagination,
    globalFilter,
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
  const toggleAccHistoryModal = useCallback(() => {
    setIsOpenAccHistory(prev => !prev);
    if (isOpenAccHistory) setSelectedAccount(null);
  }, [isOpenAccHistory]);

  const handleEditButtonClick = useCallback(
    (accountId: number, accountName: string) => {
      setSelectedAccount({ id: accountId, name: accountName });
      setIsOpenAccHistory(true);
    },
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
    'AllAccounts.modalUpdate.selects.profileLink': account =>
      account.profile_link,
    'AllAccounts.modalUpdate.selects.uploadDate': account =>
      account.upload_datetime || 'N/A',
    'AllAccounts.modalUpdate.selects.soldDate': account =>
      account.sold_datetime || 'N/A',
    'AllAccounts.modalUpdate.selects.destination': account =>
      account.client_name || 'N/A',
    'AllAccounts.modalUpdate.selects.loadDate': account =>
      account.upload_datetime || 'N/A',
    'AllAccounts.modalUpdate.selects.sellDate': account =>
      account.sold_datetime || 'N/A',
  };

  const fieldMap: Record<string, string> = {
    'AllAccounts.modalUpdate.selects.id': 'account_id',
    'AllAccounts.modalUpdate.selects.name': 'account_name',
    'AllAccounts.modalUpdate.selects.category': 'category',
    'AllAccounts.modalUpdate.selects.seller': 'seller',
    'AllAccounts.modalUpdate.selects.transfer': 'status',
    'AllAccounts.modalUpdate.selects.data': 'account_data',
    'AllAccounts.modalUpdate.selects.mega': 'archive_link',
    'AllAccounts.modalUpdate.selects.profileLink': 'profile_link',
    'AllAccounts.modalUpdate.selects.uploadDate': 'upload_datetime',
    'AllAccounts.modalUpdate.selects.soldDate': 'sold_datetime',
    'AllAccounts.modalUpdate.selects.destination': 'client_name',
    'AllAccounts.modalUpdate.selects.loadDate': 'upload_datetime',
    'AllAccounts.modalUpdate.selects.sellDate': 'sold_datetime',
  };

  const columns: ColumnDef<Account>[] = useMemo(() => {
    const dynamicColumns = selectedColumns.map(colId => {
      const field = fieldMap[colId];
      const column: ColumnDef<Account> = {
        accessorKey: field,
        header: t(colId),
        cell: ({ row }) => {
          if (
            colId === 'AllAccounts.modalUpdate.selects.mega' ||
            colId === 'AllAccounts.modalUpdate.selects.profileLink'
          ) {
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

    const editColumn: ColumnDef<Account> = {
      id: 'edit',
      header: t('Names.table.actions'),
      cell: ({ row }) => (
        <WhiteBtn
          onClick={() =>
            handleEditButtonClick(
              row.original.account_id,
              row.original.account_name
            )
          }
          text={'AllAccounts.historyBtn'}
          icon="icon-history"
        />
      ),
      enableSorting: false,
    };

    return [...dynamicColumns, editColumn];
  }, [
    selectedColumns,
    t,
    columnDataMap,
    fieldMap,
    categoryMap,
    handleEditButtonClick,
  ]);

  const exportFilteredToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Filtered Accounts');
    const columnHeaders = selectedColumns.map(colId => t(colId));
    if (!selectedColumns.includes('AllAccounts.modalUpdate.selects.loadDate')) {
      columnHeaders.push(t('AllAccounts.modalUpdate.selects.loadDate'));
    }
    if (!selectedColumns.includes('AllAccounts.modalUpdate.selects.sellDate')) {
      columnHeaders.push(t('AllAccounts.modalUpdate.selects.sellDate'));
    }
    if (
      !selectedColumns.includes('AllAccounts.modalUpdate.selects.destination')
    ) {
      columnHeaders.push(t('AllAccounts.modalUpdate.selects.destination'));
    }
    sheet.addRow(columnHeaders);

    const fetchParams: FetchAllAccountsParams = {
      subcategory_ids:
        hasReadSubcategories && selectedSubcategoryIds.length > 0
          ? selectedSubcategoryIds.map(Number)
          : undefined,
      category_ids:
        hasReadCategories &&
        selectedSubcategoryIds.length === 0 &&
        selectedCategoryIds.length > 0
          ? selectedCategoryIds.map(Number)
          : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      seller_id:
        selectedSellerIds.length > 0
          ? selectedSellerIds.map(Number)
          : undefined,
      limit: totalRows,
      like_query: globalFilter.length >= 2 ? globalFilter : undefined,
    };

    if (selectedInSet.length === 1) {
      fetchParams.in_set =
        selectedInSet[0] === t('AllAccounts.selects.inSetYes')
          ? true
          : selectedInSet[0] === t('AllAccounts.selects.inSetNo')
          ? false
          : undefined;
    }

    const { items } = await fetchAccounts(fetchParams, false);
    items.forEach(account => {
      const rowData = selectedColumns.map(colId =>
        columnDataMap[colId](account)
      );
      if (
        !selectedColumns.includes('AllAccounts.modalUpdate.selects.loadDate')
      ) {
        rowData.push(account.upload_datetime || 'N/A');
      }
      if (
        !selectedColumns.includes('AllAccounts.modalUpdate.selects.sellDate')
      ) {
        rowData.push(account.sold_datetime || 'N/A');
      }
      if (
        !selectedColumns.includes('AllAccounts.modalUpdate.selects.destination')
      ) {
        rowData.push(account.client_name || 'N/A');
      }
      sheet.addRow(rowData);
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

    const fetchParams: FetchAllAccountsParams = { limit: totalAllRows };
    const { items } = await fetchAccounts(fetchParams, false);
    items.forEach(account => {
      sheet.addRow(selectedColumns.map(colId => columnDataMap[colId](account)));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'all_accounts_report.xlsx');
  };

  const exportSalesReport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales Report');
    const columns = [
      'Account ID',
      'Дата загрузки',
      'Дата продажи',
      'Имя воркера',
      'Имя тимлида',
      'Имя клиента',
      'Имся акаунта',
      'Цена',
      'Статус',
      'Селлер',
      'Причина замены',
      'Категория',
      'Наименование',
      'Ссылка на профиль',
    ];
    sheet.addRow(columns);

    const fetchParams: FetchAllAccountsParams = {
      status: ['SOLD', 'REPLACED', 'SELF USE'],
      limit: totalAllRows,
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

    const { items } = await fetchAccounts(fetchParams, false);
    items.forEach(account => {
      sheet.addRow([
        account.account_id,
        account.upload_datetime || 'N/A',
        account.sold_datetime || 'N/A',
        account.worker_name || 'N/A',
        account.teamlead_name || 'N/A',
        account.client_name || 'N/A',
        account.account_name || 'N/A',
        account.price !== null ? account.price : 'N/A',
        account.status || 'N/A',
        account.seller?.seller_name || 'N/A',
        account.replace_reason || 'N/A',
        account.subcategory?.category?.account_category_name || 'N/A',
        account.subcategory?.account_subcategory_name || 'N/A',
        account.profile_link || 'N/A',
      ]);
    });

    const period =
      sellDateRange === 'custom' && sellCustomStartDate && sellCustomEndDate
        ? `${sellCustomStartDate}_to_${sellCustomEndDate}`
        : sellDateRange !== 'all'
        ? sellDateRange
        : 'all_time';
    const fileName = `sales_accounts_report_${period}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, fileName);
  };

  const globalFilterFn = useCallback(
    (row: Row<Account>, columnId: string, filterValue: string) => {
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
        (row.original.archive_link || '').toLowerCase().includes(searchValue) ||
        (row.original.profile_link || '').toLowerCase().includes(searchValue);

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
      const matchesInSet =
        selectedInSet.length === 0 ||
        (selectedInSet.includes(t('AllAccounts.selects.inSetYes')) &&
          row.original.in_set) ||
        (selectedInSet.includes(t('AllAccounts.selects.inSetNo')) &&
          !row.original.in_set);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTransfer &&
        matchesSeller &&
        matchesInSet
      );
    },
    [
      selectedStatuses,
      selectedTransfers,
      selectedSellerIds,
      selectedInSet,
      categoryMap,
      t,
    ]
  );

  const categoryOptions = useMemo(
    () => [
      t('AllAccounts.selects.allCategories'),
      ...(hasReadCategories
        ? categories.map(cat => cat.account_category_name)
        : []),
    ],
    [categories, t, hasReadCategories]
  );
  const subcategoryOptions = useMemo(
    () => [
      t('AllAccounts.selects.allNames'),
      ...(hasReadSubcategories
        ? subcategories.map(sub => sub.account_subcategory_name)
        : []),
    ],
    [subcategories, t, hasReadSubcategories]
  );
  const statusOptionsRaw = useMemo(
    () => ['SOLD', 'NOT SOLD', 'REPLACED', 'EXCLUDED', 'SELF USE'],
    []
  );

  const statusOptions = useMemo(
    () => [
      t('AllAccounts.selects.allStatus'),
      ...statusOptionsRaw.map(status =>
        t(`AllAccounts.selects.status${status}`)
      ),
    ],
    [t, statusOptionsRaw]
  );
  const transferOptions = useMemo(
    () => [
      t('AllAccounts.selects.allTransfer'),
      t('AllAccounts.selects.transferYes'),
      t('AllAccounts.selects.transferNot'),
    ],
    [t]
  );
  const inSetOptions = useMemo(
    () => [
      t('AllAccounts.selects.allInSet'),
      t('AllAccounts.selects.inSetYes'),
      t('AllAccounts.selects.inSetNo'),
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
    globalFilterFn,
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

  const handleInSetSelect = useCallback(
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('AllAccounts.selects.allInSet')
      );
      setSelectedInSet(filteredValues);
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
          inSetOptions={inSetOptions}
          sellerOptions={sellerOptions}
          selectedCategoryIds={selectedCategoryIds}
          selectedSubcategoryIds={selectedSubcategoryIds}
          selectedStatuses={selectedStatuses}
          selectedTransfers={selectedTransfers}
          selectedInSet={selectedInSet}
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
          onInSetSelect={handleInSetSelect}
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
          hasReadCategories={hasReadCategories}
          hasReadSubcategories={hasReadSubcategories}
        />
      </div>
      {accounts.length === 0 && !showLoader ? (
        <p className={styles.no_acc}>{t('AllAccounts.noAcc')}</p>
      ) : (
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
      )}
      <ModalsSection
        isOpenEdit={isOpenEdit}
        isOpenDownload={isOpenDownload}
        isOpenAccHistory={isOpenAccHistory}
        selectedAccount={selectedAccount}
        onToggleEditModal={toggleEditModal}
        onToggleDownload={toggleDownload}
        onToggleAccHistoryModal={toggleAccHistoryModal}
        selectedColumns={selectedColumns}
        onSaveSettings={handleSaveSettings}
        onExportFilteredToExcel={exportFilteredToExcel}
        onExportAllToExcel={exportAllToExcel}
        onExportSalesReport={exportSalesReport}
        t={t}
      />
    </section>
  );
}
