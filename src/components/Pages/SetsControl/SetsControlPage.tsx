'use client';

import styles from './SetsControlPage.module.css';
import { useTranslations } from 'next-intl';
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getExpandedRowModel,
} from '@tanstack/react-table';
import SetsItemCreateSection from './SetsItemCreateSection/SetsItemCreateSection';
import SetsUploadSection from './SetsUploadSection/SetsUploadSection';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import CreateNamesSet from '@/components/ModalComponent/SetModals/CreateNamesSet/CreateNamesSet';
import UpdateNamesSet from '@/components/ModalComponent/SetModals/UpdateNamesSet/UpdateNamesSet';
import AddBtn from '@/components/Buttons/AddBtn/AddBtn';
import { useAccountSetsStore } from '@/store/accountSetsStore';
import { useUsersStore } from '@/store/usersStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { toast } from 'react-toastify';
import Loader from '@/components/Loader/Loader';
import Icon from '@/helpers/Icon';
import { AccountSet } from '@/types/accountSetsTypes';
import SearchInput from '@/components/Buttons/SearchInput/SearchInput';
import { debounce } from 'lodash';

const SETS_PAGINATION_KEY = 'setsPaginationSettings';

export default function SetsControlPage() {
  const t = useTranslations();
  const {
    sets,
    fetchSets,
    loading: setsLoading,
    error: setsError,
  } = useAccountSetsStore();
  const { currentUser } = useUsersStore();
  const {
    categoriesWithParams,
    subcategories,
    fetchCategories,
    fetchSubcategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesStore();
  const didFetchSetsRef = useRef(false);
  const didFetchCategoriesRef = useRef(false);
  const didFetchSubcategoriesRef = useRef(false);
  const isFetchingSetsRef = useRef(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isOpenCreateNamesSet, setIsOpenCreateNamesSet] = useState(false);
  const [isOpenSetsItemCreate, setIsOpenSetsItemCreate] = useState(false);
  const [isOpenSetsUpload, setIsOpenSetsUpload] = useState(false);
  const [isOpenUpdateNamesSet, setIsOpenUpdateNamesSet] = useState(false);
  const [selectedSet, setSelectedSet] = useState<AccountSet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const prevPaginationRef = useRef({ pageIndex: 0, pageSize: 5 });
  const prevSearchQueryRef = useRef('');

  const isFunctionsEmpty = currentUser?.functions.length === 0;
  const setPermissions =
    currentUser?.functions.find(
      func =>
        func.function_id === 14 && func.function_name === 'Наборы акаунтов'
    )?.operations || [];
  const hasCreate = isFunctionsEmpty || setPermissions.includes('CREATE');
  const hasRead =
    isFunctionsEmpty || setPermissions.includes('READ') || hasCreate;
  const hasUpdate = currentUser?.is_admin || setPermissions.includes('UPDATE');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SETS_PAGINATION_KEY);
      if (saved) {
        setPagination(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETS_PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [pagination]);

  useEffect(() => {
    if (
      !didFetchCategoriesRef.current &&
      !categoriesLoading &&
      !categoriesError
    ) {
      didFetchCategoriesRef.current = true;
      fetchCategories({ is_set_category: true }).catch(err => {
        toast.error(`${t('Sets.errorMessage')} : ${err}`);
        didFetchCategoriesRef.current = false;
      });
    }
  }, [fetchCategories, categoriesLoading, categoriesError, t]);

  useEffect(() => {
    if (
      !didFetchSubcategoriesRef.current &&
      !categoriesLoading &&
      !categoriesError
    ) {
      didFetchSubcategoriesRef.current = true;
      fetchSubcategories().catch(err => {
        toast.error(t('Sets.errorMessage', { err }));
        didFetchSubcategoriesRef.current = false;
      });
    }
  }, [fetchSubcategories, categoriesLoading, categoriesError, t]);

  const debouncedFetchSets = useMemo(
    () =>
      debounce(
        (params: { limit: number; offset: number; like_query?: string }) => {
          if (isFetchingSetsRef.current) {
            return;
          }
          isFetchingSetsRef.current = true;
          fetchSets(params)
            .then(() => {
              isFetchingSetsRef.current = false;
            })
            .catch(error => {
              toast.error(`${t('Sets.errorMessage')} : ${error}`);
              isFetchingSetsRef.current = false;
            });
        },
        300
      ),
    [fetchSets, t]
  );

  useEffect(() => {
    if (!didFetchSetsRef.current && !isFetchingSetsRef.current) {
      didFetchSetsRef.current = true;
      isFetchingSetsRef.current = true;
      fetchSets({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      })
        .then(() => {
          isFetchingSetsRef.current = false;
        })
        .catch(error => {
          toast.error(`${t('Sets.errorMessage')} : ${error}`);
          didFetchSetsRef.current = false;
          isFetchingSetsRef.current = false;
        });
    }
  }, [fetchSets, pagination, t]);

  useEffect(() => {
    if (
      didFetchSetsRef.current &&
      !isFetchingSetsRef.current &&
      (searchQuery !== prevSearchQueryRef.current ||
        pagination.pageIndex !== prevPaginationRef.current.pageIndex ||
        pagination.pageSize !== prevPaginationRef.current.pageSize)
    ) {
      debouncedFetchSets({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        like_query: searchQuery || undefined,
      });
      prevSearchQueryRef.current = searchQuery;
      prevPaginationRef.current = { ...pagination };
    }
    return () => {
      debouncedFetchSets.cancel();
    };
  }, [debouncedFetchSets, searchQuery, pagination]);

  useEffect(() => {
    if (
      !setsLoading &&
      !categoriesLoading &&
      !setsError &&
      !categoriesError &&
      didFetchSetsRef.current &&
      didFetchCategoriesRef.current &&
      didFetchSubcategoriesRef.current
    ) {
      setShowLoader(false);
    }
  }, [
    setsLoading,
    categoriesLoading,
    setsError,
    categoriesError,
    didFetchSetsRef,
    didFetchCategoriesRef,
    didFetchSubcategoriesRef,
  ]);

  const openUpdateModal = useCallback((set: AccountSet) => {
    setSelectedSet(set);
    setIsOpenUpdateNamesSet(true);
  }, []);

  const toggleSetsUpload = useCallback(
    () => setIsOpenSetsUpload(prev => !prev),
    []
  );
  const toggleSetsItemCreate = useCallback(
    () => setIsOpenSetsItemCreate(prev => !prev),
    []
  );
  const toggleCreateNamesSet = useCallback(
    () => setIsOpenCreateNamesSet(prev => !prev),
    []
  );

  const closeUpdateModal = useCallback(() => {
    setIsOpenUpdateNamesSet(false);
    setSelectedSet(null);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const subCategoryMap = useMemo(
    () =>
      new Map(
        subcategories.map(subcategory => [
          subcategory.account_subcategory_id,
          subcategory,
        ])
      ),
    [subcategories]
  );

  const categoryMap = useMemo(
    () =>
      new Map(
        categoriesWithParams.map(category => [
          category.account_category_id,
          category.account_category_name,
        ])
      ),
    [categoriesWithParams]
  );

  const columns: ColumnDef<AccountSet>[] = useMemo(() => {
    const baseColumns: ColumnDef<AccountSet>[] = [
      { accessorKey: 'set_id', header: 'ID' },
      {
        accessorKey: 'name',
        header: t('Sets.table.name'),
        cell: ({ row }) => (
          <div className={styles.name_wrap}>
            <p>{row.original.name}</p>
            <button
              onClick={() => row.toggleExpanded()}
              className={styles.expander}
            >
              <Icon
                name="icon-table_arrow"
                width={20}
                height={20}
                className={`${styles.icon} ${
                  row.getIsExpanded()
                    ? styles.icon_expanded
                    : styles.icon_collapsed
                }`}
              />
            </button>
          </div>
        ),
      },
      {
        id: 'category',
        header: t('Sets.table.category'),
        cell: ({ row }) =>
          categoryMap.get(row.original.set_category_id) || 'N/A',
      },
      {
        accessorKey: 'description',
        header: t('Sets.table.description'),
      },
      {
        accessorKey: 'items_available',
        header: t('Sets.table.itemsAvailable'),
      },
      {
        accessorKey: 'cost_price',
        header: t('Sets.table.costPrice'),
        cell: ({ row }) =>
          typeof row.original.cost_price === 'number'
            ? row.original.cost_price.toFixed(1)
            : 'N/A',
      },
      {
        accessorKey: 'price',
        header: t('Sets.table.price'),
        cell: ({ row }) =>
          typeof row.original.price === 'number'
            ? row.original.price.toFixed(1)
            : 'N/A',
      },
    ];

    if (hasUpdate) {
      baseColumns.push({
        id: 'actions',
        header: t('Sets.table.actions'),
        cell: ({ row }) => (
          <WhiteBtn
            onClick={() => openUpdateModal(row.original)}
            text={'Sets.table.editBtn'}
            icon="icon-edit-pencil"
            iconFill="icon-edit-pencil"
          />
        ),
      });
    }

    return baseColumns;
  }, [t, hasUpdate, categoryMap, openUpdateModal]);

  const data = useMemo(() => sets, [sets]);

  const setNames = useMemo(
    () => [...new Set(data.map(set => set.name))],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
  });

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sets.header')}</h2>
        <p className={styles.header_text}>{t('Sets.headerText')}</p>
        <div className={styles.btns_wrap}>
          {(hasCreate || hasRead) && (
            <>
              {hasCreate && (
                <>
                  <AddBtn
                    onClick={toggleCreateNamesSet}
                    text={'Names.modalCreateSet.createSetBtn'}
                  />
                  <AddBtn
                    onClick={toggleSetsItemCreate}
                    icon="icon-user-add"
                    iconFill="icon-user-add"
                    text={'Names.modalCreateSet.createItemBtn'}
                  />
                  <WhiteBtn
                    onClick={toggleSetsUpload}
                    text={'Names.modalCreateSet.uploadBtn'}
                    icon="icon-cloud-download"
                    iconFill="icon-cloud-download-fill"
                  />
                </>
              )}
              <SearchInput
                onSearch={handleSearch}
                text={'Names.modalCreateSet.search'}
                options={setNames}
              />
            </>
          )}
          {!hasRead && hasUpdate && (
            <SearchInput
              onSearch={handleSearch}
              text={'Names.modalCreateSet.search'}
              options={setNames}
            />
          )}
        </div>
      </div>

      <div className={styles.table_container}>
        {showLoader && <Loader error={setsError || categoriesError} />}
        {!showLoader && data.length === 0 && (
          <div className={styles.empty_state}>{t('Sets.table.noResults')}</div>
        )}
        <div className={styles.table_wrap}>
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
                <React.Fragment key={row.id}>
                  <tr>
                    {row.getVisibleCells().map(cell => (
                      <td className={styles.td} key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                  {row.getIsExpanded() && (
                    <tr>
                      <td colSpan={columns.length}>
                        <div className={styles.subcategory_list}>
                          <ul>
                            {row.original.set_content.map(sub => {
                              const subcategory = subcategories.find(
                                sc =>
                                  sc.account_subcategory_id ===
                                  sub.subcategory_id
                              );
                              return (
                                <li
                                  className={
                                    hasUpdate ? styles.subcategory_edit : ''
                                  }
                                  key={sub.subcategory_id}
                                >
                                  <p>
                                    {subCategoryMap.get(sub.subcategory_id)
                                      ?.account_subcategory_name || 'N/A'}
                                  </p>
                                  <span>
                                    {sub.accounts_quantity}{' '}
                                    {t('Sets.table.quantity')}
                                  </span>
                                  <p
                                    className={`${
                                      styles.subcategory_list_cost_price
                                    } ${
                                      hasUpdate ? styles.subcategory_edit : ''
                                    }`}
                                  >
                                    {typeof subcategory?.cost_price ===
                                      'number' &&
                                    typeof sub.accounts_quantity === 'number'
                                      ? (
                                          subcategory.cost_price *
                                          sub.accounts_quantity
                                        ).toFixed(1)
                                      : 'N/A'}
                                  </p>
                                  <span
                                    className={styles.subcategory_list_price}
                                  >
                                    {typeof subcategory?.price === 'number' &&
                                    typeof sub.accounts_quantity === 'number'
                                      ? (
                                          subcategory.price *
                                          sub.accounts_quantity
                                        ).toFixed(1)
                                      : 'N/A'}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
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
        isOpen={isOpenCreateNamesSet}
        onClose={toggleCreateNamesSet}
        title="Names.modalCreateSet.title"
        text="Names.modalCreateSet.description"
      >
        <CreateNamesSet onClose={toggleCreateNamesSet} />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenSetsItemCreate}
        onClose={toggleSetsItemCreate}
        title="Sets.createItem.header"
        text="Sets.createItem.headerText"
      >
        <SetsItemCreateSection onClose={toggleSetsItemCreate} />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenSetsUpload}
        onClose={toggleSetsUpload}
        title="Sets.upload.header"
        text="Sets.upload.headerText"
      >
        <SetsUploadSection onClose={toggleSetsUpload} />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdateNamesSet}
        onClose={closeUpdateModal}
        title="Sets.modalUpdate.title"
        text="Sets.modalUpdate.description"
        editedTitle={selectedSet?.name || ''}
      >
        {selectedSet && (
          <UpdateNamesSet
            setId={selectedSet.set_id}
            initialName={selectedSet.name}
            initialCategoryId={selectedSet.set_category_id}
            initialPrice={selectedSet.price}
            initialCostPrice={selectedSet.cost_price}
            initialDescription={selectedSet.description}
            initialSubcategories={selectedSet.set_content.map(sub => ({
              subcategory_id: sub.subcategory_id,
              quantity: sub.accounts_quantity,
            }))}
            onClose={closeUpdateModal}
          />
        )}
      </ModalComponent>
    </section>
  );
}
