'use client';

import styles from './UserSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import AddBtn from '@/components/Buttons/AddBtn/AddBtn';
import SearchInput from '@/components/Buttons/SearchInput/SearchInput';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import Icon from '@/helpers/Icon';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import { useUsersStore } from '@/store/usersStore';
import Loader from '@/components/Loader/Loader';
import { User } from '@/types/usersTypes';
import { PaginationState } from '@/types/componentsTypes';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import CreateUser from '@/components/ModalComponent/CreateUser/CreateUser';
import EditUser from '@/components/ModalComponent/EditUser/EditUser';

const PAGINATION_KEY = 'userSectionPaginationSettings';

export default function UserSection() {
  const t = useTranslations();
  const router = useRouter();
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { users, totalRows, error, fetchUsers, currentUser } = useUsersStore();

  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PAGINATION_KEY);
      const initialPagination = saved
        ? (JSON.parse(saved) as PaginationState)
        : { pageIndex: 0, pageSize: 5 };

      return initialPagination;
    }
    return { pageIndex: 0, pageSize: 5 };
  });

  const userAccess = useMemo(() => {
    if (!currentUser) return { hasAccess: false, hasUpdate: false };

    if (currentUser.is_admin) {
      return { hasAccess: true, hasUpdate: true };
    }

    const userFunction = currentUser.functions.find(
      func => func.function_name === 'Пользователи'
    );
    if (!userFunction) return { hasAccess: false, hasUpdate: false };
    const hasRead = userFunction.operations.includes('READ');
    const hasUpdate = userFunction.operations.includes('UPDATE');
    return { hasAccess: hasRead, hasUpdate };
  }, [currentUser]);

  useEffect(() => {
    if (!userAccess.hasAccess && currentUser) {
      router.push('/ru/dashboard');
    }
  }, [userAccess, router, currentUser]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(prev => {
        if (prev !== query) {
          setPagination(prevPagination => ({
            ...prevPagination,
            pageIndex: 0,
          }));
          return query;
        }
        return prev;
      });
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setShowLoader(true);
      try {
        const response = await fetchUsers({
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          like_query: searchQuery.length >= 2 ? searchQuery : undefined,
        });

        if (isMounted) {
          const maxPageIndex = Math.max(
            0,
            Math.ceil(response.total_rows / pagination.pageSize) - 1
          );

          if (pagination.pageIndex > maxPageIndex && response.total_rows > 0) {
            setPagination(prev => {
              const newPagination = { ...prev, pageIndex: 0 };
              localStorage.setItem(
                PAGINATION_KEY,
                JSON.stringify(newPagination)
              );
              return newPagination;
            });
          } else if (
            response.items.length === 0 &&
            response.total_rows > 0 &&
            pagination.pageIndex > 0
          ) {
            setPagination(prev => {
              const newPagination = { ...prev, pageIndex: 0 };
              localStorage.setItem(
                PAGINATION_KEY,
                JSON.stringify(newPagination)
              );
              return newPagination;
            });
          } else {
            setShowLoader(false);
          }
        }
      } catch {
        if (isMounted) {
          setShowLoader(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [pagination.pageIndex, pagination.pageSize, searchQuery, fetchUsers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [pagination]);

  useEffect(() => {
    if (users.length > 0 && showLoader) {
      setShowLoader(false);
    }
  }, [users, showLoader]);

  const toggleCreateModal = () => setIsOpenCreate(!isOpenCreate);
  const toggleUpdateModal = () => setIsOpenUpdate(!isOpenUpdate);

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'user_id', header: 'ID' },
    {
      accessorKey: 'fullName',
      header: t('UserSection.table.name'),
      cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
    },
    { accessorKey: 'telegram_id', header: t('UserSection.table.tgId') },
    {
      accessorKey: 'role.name',
      header: 'Должность',
      cell: ({ row }) =>
        row.original.is_admin ? 'Admin' : row.original.role?.name || '—',
    },
    {
      accessorKey: 'role.description',
      header: 'Описание должности',
      cell: ({ row }) =>
        row.original.is_admin ? 'Admin' : row.original.role?.description || '—',
    },
    {
      id: 'actions',
      header: t('Names.table.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => {
              setSelectedUser(row.original);
              toggleUpdateModal();
            }}
            text={'Names.table.editBtn'}
            icon="icon-edit-pencil"
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
  });

  const userNames = [
    ...new Set(users.map(user => `${user.first_name} ${user.last_name}`)),
  ];

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.otherParMenu.users')}</h2>
        <p className={styles.header_text}>{t('UserSection.headerText')}</p>
        <div className={styles.buttons_wrap}>
          <AddBtn onClick={toggleCreateModal} text={'UserSection.addBtn'} />
          <SearchInput
            onSearch={debouncedSearch}
            text={'UserSection.searchBtn'}
            options={userNames}
          />
        </div>
      </div>
      <div className={styles.table_container}>
        {showLoader && <Loader error={error} />}
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
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td className={styles.td} key={cell.id}>
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
            )}
            {t('Category.table.pages')}
            {totalRows}
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
        title="UserSection.modalCreate.title"
      >
        <CreateUser
          isAdmin={currentUser?.is_admin || false}
          pagination={pagination}
          onClose={toggleCreateModal}
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={toggleUpdateModal}
        title="UserSection.modalEdit.title"
      >
        {selectedUser && (
          <EditUser
            isAdmin={currentUser?.is_admin || false}
            onClose={toggleUpdateModal}
            pagination={pagination}
            user={selectedUser}
          />
        )}
      </ModalComponent>
    </section>
  );
}
