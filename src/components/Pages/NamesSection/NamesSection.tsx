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
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import AddBtn from '../../Buttons/AddBtn/AddBtn';
import SearchInput from '@/components/Buttons/SearchInput/SearchInput';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import Icon from '@/helpers/Icon';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import CancelBtn from '../../Buttons/CancelBtn/CancelBtn';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import CreateNames from '../../ModalComponent/CreateNames/CreateNames';
import EditNames from '../../ModalComponent/EditNames/EditNames';
import ShowNamesDescription from '../../ModalComponent/ShowNamesDescription/ShowNamesDescription';
import Loader from '../../Loader/Loader';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useUsersStore } from '@/store/usersStore';
import { toast } from 'react-toastify';
import { Subcategory } from '@/types/categoriesTypes';
import { PaginationState } from '@/types/componentsTypes';
import ViewSettings from '@/components/ModalComponent/ViewSettings/ViewSettings';

const NAMES_PAGINATION_KEY = 'namesPaginationSettings';
const NAMES_COLUMNS_KEY = 'namesColumnsSettings';
const NAMES_COLUMN_WIDTHS_KEY = 'namesColumnWidths';

interface TableSubcategory {
  account_subcategory_id: number;
  account_subcategory_name: string;
  account_category_id: number;
  price: number;
  cost_price: number;
  description: string | null | undefined;
  output_separator: string | null | undefined;
  output_format_field: string[] | null | undefined;
  available_crm_accounts: number;
  available_shop_accounts: number;
}

export default function NamesSection() {
  const t = useTranslations();
  const { currentUser } = useUsersStore();
  const {
    subcategories,
    categories,
    fetchSubcategories,
    fetchCategories,
    loading,
    error,
  } = useCategoriesStore();

  const didFetchRef = useRef(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenShowNamesDescription, setIsOpenShowNamesDescription] =
    useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [selectedDescription, setSelectedDescription] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isMounted, setIsMounted] = useState(false);

  const configurableColumns = useMemo<string[]>(
    () => [
      'Names.table.id',
      'Names.table.name',
      'Names.table.category',
      'Names.table.cost',
      'Names.table.price',
      'Names.table.crmAvailability',
      'Names.table.shopAvailability',
    ],
    []
  );

  const defaultColumns = useMemo<string[]>(
    () => configurableColumns,
    [configurableColumns]
  );

  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(defaultColumns);

  const fieldMap = useMemo<Record<string, string>>(
    () => ({
      'Names.table.id': 'account_subcategory_id',
      'Names.table.name': 'account_subcategory_name',
      'Names.table.category': 'account_category_id',
      'Names.table.cost': 'cost_price',
      'Names.table.price': 'price',
      'Names.table.crmAvailability': 'available_crm_accounts',
      'Names.table.shopAvailability': 'available_shop_accounts',
      'Names.table.actions': 'actions',
    }),
    []
  );

  const defaultColumnWidths = useMemo<Record<string, number>>(
    () => ({
      ...defaultColumns.reduce(
        (acc, col) => ({ ...acc, [fieldMap[col]]: 150 }),
        {}
      ),
      [fieldMap['Names.table.actions']]: 150,
    }),
    [defaultColumns, fieldMap]
  );

  const [columnWidths, setColumnWidths] =
    useState<Record<string, number>>(defaultColumnWidths);

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load persisted settings from localStorage after mount
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const savedPagination = localStorage.getItem(NAMES_PAGINATION_KEY);
      if (savedPagination) {
        setPagination(JSON.parse(savedPagination) as PaginationState);
      }

      const savedColumns = localStorage.getItem(NAMES_COLUMNS_KEY);
      if (savedColumns) {
        const parsed = JSON.parse(savedColumns) as string[];
        setSelectedColumns(
          parsed.filter(col => configurableColumns.includes(col))
        );
      }

      const savedWidths = localStorage.getItem(NAMES_COLUMN_WIDTHS_KEY);
      if (savedWidths) {
        setColumnWidths(JSON.parse(savedWidths));
      }
    }
  }, [isMounted, configurableColumns]);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem(NAMES_COLUMNS_KEY, JSON.stringify(selectedColumns));
      localStorage.setItem(
        NAMES_COLUMN_WIDTHS_KEY,
        JSON.stringify(columnWidths)
      );
      localStorage.setItem(NAMES_PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [isMounted, selectedColumns, columnWidths, pagination]);

  const isFunctionsEmpty = currentUser?.functions.length === 0;
  const subcategoryPermissions =
    currentUser?.functions.find(
      func => func.function_id === 3 && func.function_name === 'Подкатегории'
    )?.operations || [];
  const hasCreateSubcategories =
    isFunctionsEmpty || subcategoryPermissions.includes('CREATE');
  const hasUpdateSubcategories =
    isFunctionsEmpty || subcategoryPermissions.includes('UPDATE');
  const hasReadSubcategories =
    isFunctionsEmpty ||
    subcategoryPermissions.includes('READ') ||
    hasCreateSubcategories ||
    hasUpdateSubcategories;

  const categoryPermissions =
    currentUser?.functions.find(
      func => func.function_id === 2 && func.function_name === 'Категории'
    )?.operations || [];
  const hasReadCategories =
    isFunctionsEmpty || categoryPermissions.includes('READ');

  const toggleEditModal = useCallback(() => setIsOpenEdit(prev => !prev), []);

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
          toast.error(t('Names.errorMessage'), err || '');
          didFetchRef.current = false;
        });
      }
      if (hasReadCategories && categories.length === 0 && !loading && !error) {
        fetchCategories().catch(err => {
          toast.error(t('Category.errorMessage'), err || '');
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [
    fetchSubcategories,
    fetchCategories,
    subcategories,
    categories,
    loading,
    error,
    t,
    hasReadCategories,
  ]);

  useEffect(() => {
    if (subcategories.length > 0 && showLoader) {
      setShowLoader(false);
    }
  }, [subcategories, showLoader]);

  const toggleCreateModal = useCallback(
    () => setIsOpenCreate(prev => !prev),
    []
  );
  const openUpdateModal = useCallback((subcategory: Subcategory) => {
    setUpdateTitle(subcategory.account_subcategory_name);
    setSelectedSubcategory(subcategory);
    setIsOpenUpdate(true);
  }, []);
  const closeUpdateModal = useCallback(() => {
    setIsOpenUpdate(false);
    setSelectedSubcategory(null);
  }, []);
  const openShowNamesDescription = useCallback(
    (title = '', description = '') => {
      setUpdateTitle(title);
      setSelectedDescription(description);
      setIsOpenShowNamesDescription(true);
    },
    []
  );
  const closeShowNamesDescription = useCallback(() => {
    setIsOpenShowNamesDescription(false);
    setSelectedDescription('');
  }, []);

  const handleSort = useCallback((columnId: string) => {
    setSorting(prev => {
      const currentSort = prev.find(sort => sort.id === columnId);
      const newSort = currentSort
        ? [
            {
              id: columnId,
              desc: !currentSort.desc,
            },
          ]
        : [{ id: columnId, desc: true }];
      return newSort;
    });
  }, []);

  const data = useMemo<TableSubcategory[]>(
    () =>
      subcategories.map(subcategory => ({
        account_subcategory_id: subcategory.account_subcategory_id,
        account_subcategory_name: subcategory.account_subcategory_name,
        account_category_id: subcategory.account_category_id,
        price: subcategory.price,
        cost_price: subcategory.cost_price,
        description: subcategory.description,
        output_separator: subcategory.output_separator,
        output_format_field: subcategory.output_format_field,
        available_crm_accounts: subcategory.available_crm_accounts,
        available_shop_accounts: subcategory.available_shop_accounts,
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
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('Names.selectAllBtn')
      );
      if (filteredValues.length === 0) {
        setSelectedCategoryIds([]);
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
      }
    },
    [categories, t]
  );

  const columns = useMemo<ColumnDef<TableSubcategory>[]>(() => {
    const baseColumns: ColumnDef<TableSubcategory>[] = [
      {
        id: fieldMap['Names.table.id'],
        accessorKey: fieldMap['Names.table.id'],
        header: t('Names.table.id'),
        enableSorting: true,
      },
      {
        id: fieldMap['Names.table.name'],
        accessorKey: fieldMap['Names.table.name'],
        header: t('Names.table.name'),
        enableSorting: true,
      },
      {
        id: fieldMap['Names.table.category'],
        accessorKey: fieldMap['Names.table.category'],
        header: t('Names.table.category'),
        cell: ({ row }) => {
          const categoryName = categoryMap.get(
            row.original.account_category_id
          );
          return categoryName || row.original.account_category_id;
        },
        filterFn: (row, columnId, filterValue) => {
          const rowValue = row.getValue(columnId) as number;
          return (
            filterValue.length === 0 || filterValue.includes(String(rowValue))
          );
        },
        enableSorting: true,
      },
      {
        id: fieldMap['Names.table.cost'],
        accessorKey: fieldMap['Names.table.cost'],
        header: t('Names.table.cost'),
        cell: ({ getValue }) => Number(getValue()).toFixed(2),
        enableSorting: true,
      },
      {
        id: fieldMap['Names.table.price'],
        accessorKey: fieldMap['Names.table.price'],
        header: t('Names.table.price'),
        cell: ({ getValue }) => Number(getValue()).toFixed(2),
        enableSorting: true,
      },
      {
        id: fieldMap['Names.table.crmAvailability'],
        accessorKey: fieldMap['Names.table.crmAvailability'],
        header: t('Names.table.crmAvailability'),
        enableSorting: true,
      },
      {
        id: fieldMap['Names.table.shopAvailability'],
        accessorKey: fieldMap['Names.table.shopAvailability'],
        header: t('Names.table.shopAvailability'),
        enableSorting: true,
      },
    ];

    if (hasUpdateSubcategories) {
      baseColumns.push({
        id: fieldMap['Names.table.actions'],
        header: t('Names.table.actions'),
        cell: ({ row }) => (
          <div className={styles.table_buttons}>
            <CancelBtn
              text="Names.table.enterBtn"
              onClick={() =>
                openShowNamesDescription(
                  row.original.account_subcategory_name,
                  row.original.description || ''
                )
              }
            />
            <WhiteBtn
              onClick={() => openUpdateModal(row.original as Subcategory)}
              text={'Names.table.editBtn'}
              icon="icon-edit-pencil"
            />
          </div>
        ),
        enableSorting: false,
      });
    }

    return baseColumns;
  }, [
    t,
    categoryMap,
    openShowNamesDescription,
    openUpdateModal,
    hasUpdateSubcategories,
    fieldMap,
  ]);

  // Handle column resizing
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, columnId: string) => {
      e.preventDefault();
      setResizingColumn(columnId);
      setStartX(e.clientX);
      setStartWidth(columnWidths[columnId] || 150);
      document.body.style.cursor = 'col-resize';
    },
    [columnWidths]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizingColumn) {
        const delta = e.clientX - startX;
        const newWidth = Math.max(30, startWidth + delta);
        setColumnWidths(prev => ({
          ...prev,
          [resizingColumn]: newWidth,
        }));
      }
    },
    [resizingColumn, startX, startWidth]
  );

  const handleMouseUp = useCallback(() => {
    setResizingColumn(null);
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, handleMouseMove, handleMouseUp]);

  const columnFilters = useMemo(
    () =>
      selectedCategoryIds.length > 0
        ? [{ id: fieldMap['Names.table.category'], value: selectedCategoryIds }]
        : [],
    [selectedCategoryIds, fieldMap]
  );

  const handleSaveColumns = useCallback(
    (newSelectedColumns: string[]) => {
      setSelectedColumns(newSelectedColumns);
      toggleEditModal();
    },
    [toggleEditModal]
  );

  const initialColumnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    defaultColumns.forEach(col => {
      visibility[fieldMap[col]] = selectedColumns.includes(col);
    });
    if (hasUpdateSubcategories) {
      visibility[fieldMap['Names.table.actions']] = true;
    }
    return visibility;
  }, [defaultColumns, selectedColumns, fieldMap, hasUpdateSubcategories]);

  const columnOrder = useMemo(() => {
    const selected = selectedColumns.filter(col =>
      defaultColumns.includes(col)
    );
    const unselected = defaultColumns.filter(
      col => !selectedColumns.includes(col)
    );
    const order = [...selected, ...unselected].map(col => fieldMap[col]);
    if (hasUpdateSubcategories) {
      order.push(fieldMap['Names.table.actions']);
    }
    return order;
  }, [selectedColumns, defaultColumns, fieldMap, hasUpdateSubcategories]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      pagination,
      columnFilters,
      sorting,
      columnVisibility: initialColumnVisibility,
      columnOrder,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
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
        <p className={styles.header_text}>{t('Names.headerText')}</p>
        {(hasCreateSubcategories || hasReadSubcategories) && (
          <div className={styles.buttons_wrap}>
            {hasCreateSubcategories && (
              <AddBtn onClick={toggleCreateModal} text={'Names.addBtn'} />
            )}
            {hasReadCategories && (
              <CustomSelect
                label={t('Names.selectText')}
                options={categoryOptions}
                selected={
                  selectedCategoryIds.length > 0
                    ? selectedCategoryIds.map(
                        id => categoryMap.get(parseInt(id)) || ''
                      )
                    : [t('Names.selectAllBtn')]
                }
                onSelect={handleCategorySelect}
                width={'100%'}
              />
            )}
            <SearchInput
              onSearch={query => setGlobalFilter(query)}
              text={'Names.searchBtn'}
              options={subcategoryNames}
            />
          </div>
        )}
        {!hasReadSubcategories && hasUpdateSubcategories && (
          <div className={styles.buttons_wrap}>
            {hasReadCategories && (
              <CustomSelect
                label={t('Names.selectText')}
                options={categoryOptions}
                selected={
                  selectedCategoryIds.length > 0
                    ? selectedCategoryIds.map(
                        id => categoryMap.get(parseInt(id)) || ''
                      )
                    : [t('Names.selectAllBtn')]
                }
                onSelect={handleCategorySelect}
                width={270}
              />
            )}
            <SearchInput
              onSearch={query => setGlobalFilter(query)}
              text={'Names.searchBtn'}
              options={subcategoryNames}
            />
          </div>
        )}
      </div>
      <div className={styles.table_container}>
        {showLoader && <Loader error={error} />}
        <div className={styles.table_wrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      className={styles.th}
                      key={header.id}
                      style={{
                        cursor: header.column.getCanSort()
                          ? 'pointer'
                          : 'default',
                        display: header.column.getIsVisible()
                          ? 'table-cell'
                          : 'none',
                        width: columnWidths[header.id] || 150,
                        minWidth: 30,
                        maxWidth: 500,
                      }}
                    >
                      <div
                        className={styles.header_cell}
                        onClick={
                          header.column.getCanSort()
                            ? () => handleSort(header.column.id)
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className={styles.sort_icons}>↕</span>
                        )}
                      </div>
                      <div
                        className={styles.resize_handle}
                        onMouseDown={e => handleMouseDown(e, header.id)}
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={styles.tbody}>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td
                      className={styles.td}
                      key={cell.id}
                      style={{
                        width: columnWidths[cell.column.id] || 150,
                        minWidth: 30,
                        maxWidth: 500,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.bottom_wrap}>
          <div className={styles.download_wrap}>
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
      </div>
      <ModalComponent
        isOpen={isOpenEdit}
        onClose={toggleEditModal}
        title="AllAccounts.modalUpdate.title"
        text="AllAccounts.modalUpdate.description"
      >
        <ViewSettings
          selectedColumns={selectedColumns}
          defaultColumns={defaultColumns}
          onClose={toggleEditModal}
          onSave={handleSaveColumns}
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenCreate}
        onClose={toggleCreateModal}
        title="Names.modalCreate.title"
        text="Names.modalCreate.description"
      >
        <CreateNames onClose={toggleCreateModal} />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenShowNamesDescription}
        onClose={closeShowNamesDescription}
        title="Names.modalShowNamesDescription.title"
        editedTitle={updateTitle}
      >
        <ShowNamesDescription
          description={selectedDescription}
          onClose={closeShowNamesDescription}
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={closeUpdateModal}
        title="Names.modalUpdate.title"
        text="Names.modalUpdate.description"
        editedTitle={updateTitle}
      >
        <EditNames
          onClose={closeUpdateModal}
          subcategory={selectedSubcategory}
        />
      </ModalComponent>
    </section>
  );
}
