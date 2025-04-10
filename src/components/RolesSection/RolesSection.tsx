'use client';

import styles from './RolesSection.module.css';
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
import { useRolesStore, Role } from '@/store/rolesStore';
import { PaginationState } from '@/types/componentsTypes';
import Loader from '../Loader/Loader';
import CreateRole from '../ModalComponent/CreateRole/CreateRole';
import EditRole from '../ModalComponent/EditRole/EditRole';

const PAGINATION_KEY = 'roleSectionPaginationSettings';

export default function RoleSection() {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const { roles, totalRows, error, fetchRoles } = useRolesStore();

  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PAGINATION_KEY);
      return saved
        ? (JSON.parse(saved) as PaginationState)
        : { pageIndex: 0, pageSize: 5 };
    }
    return { pageIndex: 0, pageSize: 5 };
  });

  useEffect(() => {
    fetchRoles({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      like_query: globalFilter || undefined,
    }).catch(() => setShowLoader(false));
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, fetchRoles]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [pagination]);

  useEffect(() => {
    // if (roles.length > 0 && showLoader) {
    setShowLoader(false);
    // }
  }, [roles, showLoader]);

  const toggleCreateModal = () => setIsOpenCreate(!isOpenCreate);
  const toggleUpdateModal = () => setIsOpenUpdate(!isOpenUpdate);

  const columns: ColumnDef<Role>[] = [
    { accessorKey: 'role_id', header: 'ID' },
    { accessorKey: 'name', header: t('RoleSection.table.name') },
    {
      accessorKey: 'description',
      header: t('RoleSection.table.description'),
      cell: ({ row }) => row.original.description || '—',
    },
    {
      id: 'actions',
      header: t('Names.table.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => {
              setSelectedRole(row.original);
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
    data: roles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
  });

  const roleNames = [...new Set(roles.map(role => role.name))];

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.otherParMenu.roles')}</h2>
        <p className={styles.header_text}>{t('RoleSection.headerText')}</p>
        <div className={styles.buttons_wrap}>
          <AddBtn onClick={toggleCreateModal} text={'RoleSection.addBtn'} />
          <SearchInput
            onSearch={query => setGlobalFilter(query)}
            text={'RoleSection.searchBtn'}
            options={roleNames}
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
        title="RoleSection.modalCreate.title"
      >
        <CreateRole pagination={pagination} onClose={toggleCreateModal} />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={toggleUpdateModal}
        title="RoleSection.modalEdit.title"
      >
        {selectedRole && (
          <EditRole
            onClose={toggleUpdateModal}
            pagination={pagination}
            role={selectedRole}
          />
        )}
      </ModalComponent>
    </section>
  );
}
