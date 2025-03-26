'use client';

import styles from './PromoCodeSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
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
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import CreatePromoCode from '../ModalComponent/CreatePromoCode/CreatePromoCode';

interface Category {
  id: number;
  promoName: string; // Название промокода
  discount: string; // Скидка (в %), як рядок для сумісності з вашим прикладом
  promoCode: string; // Промокод
  status: string; // Статус
  endDate: string; // Дата завершения
}

const data: Category[] = [
  {
    id: 1,
    promoName: 'Новогодняя скидка',
    discount: '15%',
    promoCode: 'NEW_YEAR_MUSTAGE',
    status: 'Деактивирован',
    endDate: '07.01.2024',
  },
  {
    id: 2,
    promoName: 'Весенняя акция',
    discount: '10%',
    promoCode: 'SPRING_SALE',
    status: 'Активен',
    endDate: '15.04.2025',
  },
  {
    id: 3,
    promoName: 'Летний бонус',
    discount: '20%',
    promoCode: 'SUMMER20',
    status: 'Активен',
    endDate: '31.08.2025',
  },
  {
    id: 4,
    promoName: 'Осенний сюрприз',
    discount: '25%',
    promoCode: 'FALL25',
    status: 'Ожидание',
    endDate: '30.11.2025',
  },
  {
    id: 5,
    promoName: 'Черная пятница',
    discount: '30%',
    promoCode: 'BLACK_FRIDAY',
    status: 'Деактивирован',
    endDate: '01.12.2024',
  },
  {
    id: 6,
    promoName: 'Киберпонедельник',
    discount: '35%',
    promoCode: 'CYBER_MONDAY',
    status: 'Деактивирован',
    endDate: '03.12.2024',
  },
  {
    id: 7,
    promoName: 'День святого Валентина',
    discount: '12%',
    promoCode: 'VALENTINE12',
    status: 'Активен',
    endDate: '15.02.2025',
  },
  {
    id: 8,
    promoName: 'Пасхальная скидка',
    discount: '18%',
    promoCode: 'EASTER18',
    status: 'Ожидание',
    endDate: '20.04.2025',
  },
  {
    id: 9,
    promoName: 'День рождения компании',
    discount: '22%',
    promoCode: 'BDAY22',
    status: 'Активен',
    endDate: '10.06.2025',
  },
  {
    id: 10,
    promoName: 'Лояльность',
    discount: '10%',
    promoCode: 'LOYALTY10',
    status: 'Активен',
    endDate: '31.12.2025',
  },
  {
    id: 11,
    promoName: 'Зимний распродаж',
    discount: '40%',
    promoCode: 'WINTER40',
    status: 'Ожидание',
    endDate: '15.01.2026',
  },
  {
    id: 12,
    promoName: 'Скидка для новых клиентов',
    discount: '5%',
    promoCode: 'WELCOME5',
    status: 'Активен',
    endDate: '31.03.2025',
  },
  {
    id: 13,
    promoName: 'Хеллоуин',
    discount: '13%',
    promoCode: 'HALLOWEEN13',
    status: 'Деактивирован',
    endDate: '01.11.2024',
  },
  {
    id: 14,
    promoName: 'День независимости',
    discount: '17%',
    promoCode: 'INDEP17',
    status: 'Ожидание',
    endDate: '04.07.2025',
  },
  {
    id: 15,
    promoName: 'Скидка на подписку',
    discount: '20%',
    promoCode: 'SUB20',
    status: 'Активен',
    endDate: '30.06.2025',
  },
  {
    id: 16,
    promoName: 'Акция выходного дня',
    discount: '15%',
    promoCode: 'WEEKEND15',
    status: 'Активен',
    endDate: '28.02.2025',
  },
  {
    id: 17,
    promoName: 'Сезонный бонус',
    discount: '25%',
    promoCode: 'SEASON25',
    status: 'Ожидание',
    endDate: '15.09.2025',
  },
  {
    id: 18,
    promoName: 'Скидка на первый заказ',
    discount: '10%',
    promoCode: 'FIRST10',
    status: 'Активен',
    endDate: '31.12.2025',
  },
  {
    id: 19,
    promoName: 'Рождественская акция',
    discount: '30%',
    promoCode: 'XMAS30',
    status: 'Деактивирован',
    endDate: '26.12.2024',
  },
  {
    id: 20,
    promoName: 'День матери',
    discount: '15%',
    promoCode: 'MOTHER15',
    status: 'Ожидание',
    endDate: '11.05.2025',
  },
  {
    id: 21,
    promoName: 'День отца',
    discount: '15%',
    promoCode: 'FATHER15',
    status: 'Ожидание',
    endDate: '15.06.2025',
  },
  {
    id: 22,
    promoName: 'Скидка для студентов',
    discount: '20%',
    promoCode: 'STUDENT20',
    status: 'Активен',
    endDate: '30.09.2025',
  },
  {
    id: 23,
    promoName: 'Акция для друзей',
    discount: '10%',
    promoCode: 'FRIENDS10',
    status: 'Активен',
    endDate: '31.12.2025',
  },
  {
    id: 24,
    promoName: 'Скидка на второй товар',
    discount: '25%',
    promoCode: 'SECOND25',
    status: 'Активен',
    endDate: '15.03.2025',
  },
  {
    id: 25,
    promoName: 'Флеш-распродажа',
    discount: '50%',
    promoCode: 'FLASH50',
    status: 'Ожидание',
    endDate: '20.07.2025',
  },
  {
    id: 26,
    promoName: 'Скидка на выходные',
    discount: '15%',
    promoCode: 'WEEKEND15_OFF',
    status: 'Активен',
    endDate: '31.05.2025',
  },
  {
    id: 27,
    promoName: 'Летний фест',
    discount: '20%',
    promoCode: 'SUMMER_FEST',
    status: 'Ожидание',
    endDate: '15.08.2025',
  },
];

export default function PromoCodeSection() {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenResult, setIsOpenResult] = useState(false);
  const [selectSell, setSelectSell] = useState('');
  const [selectLoad, setSelectLoad] = useState('');

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Початковий розмір сторінки
  });

  const toggleResultModal = () => {
    setIsOpenResult(!isOpenResult);
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'promoName',
      header: t('PromoCodeSection.table.name'),
    },
    {
      accessorKey: 'discount',
      header: t('PromoCodeSection.table.discount'),
    },
    {
      accessorKey: 'promoCode',
      header: t('PromoCodeSection.table.code'),
    },
    {
      accessorKey: 'status',
      header: t('PromoCodeSection.table.status'),
    },
    {
      accessorKey: 'endDate',
      header: t('PromoCodeSection.table.data'),
    },
    {
      id: 'actions',
      header: t('Names.table.actions'),
      cell: () => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            // onClick={() => toggleUpdateModal(row.original.name)}
            onClick={() => toggleResultModal()}
            text={'Names.table.editBtn'}
            icon="icon-edit-pencil"
          />
          <WhiteBtn
            // onClick={() => toggleUpdateModal(row.original.name)}
            onClick={() => toggleResultModal()}
            text={'PromoCodeSection.table.btn'}
            icon="icon-archive-box"
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
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
  });

  const categoryNames = [...new Set(data.map(category => category.promoName))];

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.otherParMenu.promo')}</h2>
        <p className={styles.header_text}>{t('PromoCodeSection.headerText')}</p>
        <div className={styles.top_btn_wrap}>
          <CustomSelect
            label={t('PromoCodeSection.category')}
            options={['Facebook UA (ручной фарм)']}
            selected={selectLoad}
            onSelect={setSelectLoad}
            width={496}
          />
          <CustomSelect
            label={t('PromoCodeSection.names')}
            options={['Facebook UA-фарм 7-дней']}
            selected={selectSell}
            onSelect={setSelectSell}
            width={496}
          />
          <CustomSelect
            label={t('PromoCodeSection.status')}
            options={['Все статусы']}
            selected={selectSell}
            onSelect={setSelectSell}
            width={496}
          />
        </div>
        <div className={styles.search_wrap}>
          <AddBtn
            onClick={toggleResultModal}
            text={'PromoCodeSection.addBtn'}
          />
          <SearchInput
            onSearch={query => setGlobalFilter(query)}
            text={'Category.searchBtn'}
            options={categoryNames}
          />
        </div>
      </div>
      <div className={styles.table_container}>
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
        isOpen={isOpenResult}
        onClose={toggleResultModal}
        title="PromoCodeSection.modal.title"
        text="PromoCodeSection.modal.text"
      >
        <CreatePromoCode />
      </ModalComponent>
    </section>
  );
}
