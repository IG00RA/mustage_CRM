'use client';

import styles from './UserSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
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
import CreateUser from '../ModalComponent/CreateUser/CreateUser';
import UserRoles from '../ModalComponent/UserRoles/UserRoles';
import { useUsersStore } from '@/store/usersStore';
import { PaginationState } from '@/types/componentsTypes';
import Loader from '../Loader/Loader';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  telegram_id: number;
}

const PAGINATION_KEY = 'userSectionPaginationSettings';

export default function UserSection() {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const { users, totalRows, error, fetchUsers } = useUsersStore();
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PAGINATION_KEY);
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
  useEffect(() => {
    fetchUsers({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    });
  }, [pagination.pageIndex, pagination.pageSize, fetchUsers]);

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

  const toggleCreateModal = () => {
    setIsOpenCreate(!isOpenCreate);
  };

  const toggleUpdateModal = () => {
    setIsOpenUpdate(!isOpenUpdate);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'user_id',
      header: 'ID',
    },
    {
      accessorKey: 'fullName',
      header: t('UserSection.table.name'),
      cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
    },
    {
      accessorKey: 'telegram_id',
      header: t('UserSection.table.tgId'),
    },
    {
      id: 'actions',
      header: t('Names.table.actions'),
      cell: () => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={toggleUpdateModal}
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
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      global: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const cellValue = String(row.getValue(columnId) ?? '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      },
    },
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
            onSearch={query => setGlobalFilter(query)}
            text={'UserSection.searchBtn'}
            options={userNames}
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
        <CreateUser onClose={toggleCreateModal} />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={toggleUpdateModal}
        title="UserSection.modalRoles.title"
      >
        <UserRoles />
      </ModalComponent>
    </section>
  );
}
