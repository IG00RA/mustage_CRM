import styles from '../AllAccountsSection.module.css';
import { Table } from '@tanstack/react-table';
import { PaginationState } from '@/types/componentsTypes'; // Передбачається, що тип уже визначений
import { Account } from '@/types/salesTypes'; // Передбачається, що тип Account визначений
import Loader from '@/components/Loader/Loader';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import Icon from '@/helpers/Icon';
import { flexRender } from '@tanstack/react-table';

interface TableSectionProps {
  table: Table<Account>; // Тип таблиці з TanStack Table, параметризований типом Account
  totalRows: number; // Загальна кількість рядків для пагінації
  pagination: PaginationState; // Стан пагінації (pageIndex, pageSize)
  onPaginationChange: (newPagination: PaginationState) => void; // Функція для оновлення стану пагінації
  showLoader: boolean; // Показувати чи ні завантажувач
  error: string | null; // Помилка для відображення в Loader
  onToggleDownload: () => void; // Функція для перемикання модального вікна завантаження
  onToggleEditModal: () => void; // Функція для перемикання модального вікна редагування
  loadAccounts: (updatedPagination: PaginationState) => Promise<void>; // Функція для завантаження даних з новою пагінацією
  t: (key: string) => string; // Функція перекладу з next-intl
}

export const TableSection = ({
  table,
  totalRows,
  pagination,
  onPaginationChange,
  showLoader,
  error,
  onToggleDownload,
  onToggleEditModal,
  loadAccounts,
  t,
}: TableSectionProps) => (
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
          onClick={onToggleDownload}
          text={'AllAccounts.downloadBtn'}
          icon="icon-cloud-download"
          iconFill="icon-cloud-download-fill"
        />
        <WhiteBtn
          onClick={onToggleEditModal}
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
            onPaginationChange(newPagination);
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
              onPaginationChange(newPagination);
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
              onPaginationChange(newPagination);
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
);
