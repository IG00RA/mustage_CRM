'use client';

import { useSalesStore } from '@/store/salesStore';
import styles from './ReferralsStatSection.module.css';
import SalesChart from './SalesChart/SalesChart';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import AddBtn from '../Buttons/AddBtn/AddBtn';
import SearchInput from '../Buttons/SearchInput/SearchInput';
import Icon from '@/helpers/Icon';
import ModalComponent from '../ModalComponent/ModalComponent';
import CreateReferralLink from '../ModalComponent/CreateReferralLink/CreateReferralLink';

interface Category {
  referral: string; // Реферал (name)
  refParam: string; // Ref-параметр
  distributionCount: number; // Количество раздач
  purchaseAmount: string; // Сумма покупок (з $)
  refillCount: number; // Количество пополнений
  refillAmount: string; // Сумма пополнений (з $)
  creationDate: string; // Дата создания
}

const data: Category[] = [
  {
    referral: 'Олег Петров',
    refParam: 'ref-123',
    distributionCount: 150,
    purchaseAmount: '300$',
    refillCount: 5,
    refillAmount: '600$',
    creationDate: '24.09.2024 10:00',
  },
  {
    referral: 'Анна Коваленко',
    refParam: 'ref-456',
    distributionCount: 120,
    purchaseAmount: '250$',
    refillCount: 3,
    refillAmount: '450$',
    creationDate: '25.09.2024 14:30',
  },
  {
    referral: 'Іван Шевчук',
    refParam: 'ref-789',
    distributionCount: 200,
    purchaseAmount: '500$',
    refillCount: 8,
    refillAmount: '900$',
    creationDate: '26.09.2024 09:15',
  },
  {
    referral: 'Софія Литвин',
    refParam: 'ref-101',
    distributionCount: 80,
    purchaseAmount: '150$',
    refillCount: 2,
    refillAmount: '300$',
    creationDate: '27.09.2024 16:00',
  },
  {
    referral: 'Дмитро Бондар',
    refParam: 'ref-112',
    distributionCount: 170,
    purchaseAmount: '400$',
    refillCount: 6,
    refillAmount: '750$',
    creationDate: '28.09.2024 11:45',
  },
  {
    referral: 'Марія Грищенко',
    refParam: 'ref-134',
    distributionCount: 90,
    purchaseAmount: '200$',
    refillCount: 4,
    refillAmount: '500$',
    creationDate: '29.09.2024 13:20',
  },
  {
    referral: 'Павло Ткачук',
    refParam: 'ref-156',
    distributionCount: 130,
    purchaseAmount: '350$',
    refillCount: 7,
    refillAmount: '800$',
    creationDate: '30.09.2024 08:30',
  },
  {
    referral: 'Юлія Савчук',
    refParam: 'ref-178',
    distributionCount: 110,
    purchaseAmount: '280$',
    refillCount: 3,
    refillAmount: '420$',
    creationDate: '01.10.2024 15:10',
  },
  {
    referral: 'Олександр Яременко',
    refParam: 'ref-190',
    distributionCount: 140,
    purchaseAmount: '320$',
    refillCount: 5,
    refillAmount: '650$',
    creationDate: '02.10.2024 12:00',
  },
  {
    referral: 'Наталія Сидоренко',
    refParam: 'ref-212',
    distributionCount: 160,
    purchaseAmount: '450$',
    refillCount: 6,
    refillAmount: '700$',
    creationDate: '03.10.2024 17:25',
  },
  {
    referral: 'Віталій Руденко',
    refParam: 'ref-234',
    distributionCount: 180,
    purchaseAmount: '600$',
    refillCount: 9,
    refillAmount: '1000$',
    creationDate: '04.10.2024 10:45',
  },
  {
    referral: 'Тетяна Мороз',
    refParam: 'ref-256',
    distributionCount: 100,
    purchaseAmount: '220$',
    refillCount: 4,
    refillAmount: '480$',
    creationDate: '05.10.2024 14:00',
  },
  {
    referral: 'Сергій Кравець',
    refParam: 'ref-278',
    distributionCount: 125,
    purchaseAmount: '300$',
    refillCount: 5,
    refillAmount: '550$',
    creationDate: '06.10.2024 09:30',
  },
  {
    referral: 'Катерина Дубова',
    refParam: 'ref-290',
    distributionCount: 95,
    purchaseAmount: '180$',
    refillCount: 3,
    refillAmount: '400$',
    creationDate: '07.10.2024 16:15',
  },
  {
    referral: 'Андрій Мельник',
    refParam: 'ref-312',
    distributionCount: 145,
    purchaseAmount: '370$',
    refillCount: 7,
    refillAmount: '820$',
    creationDate: '08.10.2024 11:00',
  },
  {
    referral: 'Марія Зайцева',
    refParam: 'ref-334',
    distributionCount: 155,
    purchaseAmount: '410$',
    refillCount: 6,
    refillAmount: '670$',
    creationDate: '09.10.2024 13:50',
  },
  {
    referral: 'Олена Петренко',
    refParam: 'ref-356',
    distributionCount: 135,
    purchaseAmount: '340$',
    refillCount: 5,
    refillAmount: '590$',
    creationDate: '10.10.2024 15:30',
  },
  {
    referral: 'Максим Куролап',
    refParam: 'ref-378',
    distributionCount: 175,
    purchaseAmount: '470$',
    refillCount: 8,
    refillAmount: '850$',
    creationDate: '11.10.2024 10:20',
  },
  {
    referral: 'Людмила Гордієнко',
    refParam: 'ref-390',
    distributionCount: 115,
    purchaseAmount: '260$',
    refillCount: 4,
    refillAmount: '510$',
    creationDate: '12.10.2024 12:45',
  },
  {
    referral: 'Роман Левчук',
    refParam: 'ref-412',
    distributionCount: 165,
    purchaseAmount: '430$',
    refillCount: 7,
    refillAmount: '780$',
    creationDate: '13.10.2024 14:10',
  },
  {
    referral: 'Вікторія Олійник',
    refParam: 'ref-434',
    distributionCount: 185,
    purchaseAmount: '550$',
    refillCount: 9,
    refillAmount: '950$',
    creationDate: '14.10.2024 09:00',
  },
  {
    referral: 'Михайло Соколов',
    refParam: 'ref-456',
    distributionCount: 105,
    purchaseAmount: '240$',
    refillCount: 3,
    refillAmount: '460$',
    creationDate: '15.10.2024 16:25',
  },
  {
    referral: 'Дарина Лозова',
    refParam: 'ref-478',
    distributionCount: 140,
    purchaseAmount: '380$',
    refillCount: 6,
    refillAmount: '720$',
    creationDate: '16.10.2024 11:30',
  },
  {
    referral: 'Євген Козлов',
    refParam: 'ref-490',
    distributionCount: 190,
    purchaseAmount: '620$',
    refillCount: 10,
    refillAmount: '1100$',
    creationDate: '17.10.2024 13:00',
  },
  {
    referral: 'Ірина Білик',
    refParam: 'ref-512',
    distributionCount: 130,
    purchaseAmount: '310$',
    refillCount: 5,
    refillAmount: '580$',
    creationDate: '18.10.2024 15:45',
  },
  {
    referral: 'Артем Дорошенко',
    refParam: 'ref-534',
    distributionCount: 150,
    purchaseAmount: '390$',
    refillCount: 7,
    refillAmount: '690$',
    creationDate: '19.10.2024 10:10',
  },
  {
    referral: 'Оксана Власенко',
    refParam: 'ref-556',
    distributionCount: 170,
    purchaseAmount: '440$',
    refillCount: 8,
    refillAmount: '800$',
    creationDate: '20.10.2024 12:00',
  },
];

export default function ReferralsStatSection() {
  const salesData = useSalesStore(state => state.sales);
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [selectSell, setSelectSell] = useState(['']);
  const [selectLoad, setSelectLoad] = useState(['']);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const toggleAddModal = () => {
    setIsOpenAdd(!isOpenAdd);
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'referral',
      header: t('ReferralsStat.tableTop.name'),
    },
    {
      accessorKey: 'refParam',
      header: t('ReferralsStat.tableTop.refParam'),
    },
    {
      accessorKey: 'distributionCount',
      header: t('ReferralsStat.tableTop.numberDistributions'),
    },
    {
      accessorKey: 'purchaseAmount',
      header: t('ReferralsStat.tableTop.buySum'),
    },
    {
      accessorKey: 'refillCount',
      header: t('ReferralsStat.tableTop.numberRefills'),
    },
    {
      accessorKey: 'refillAmount',
      header: t('ReferralsStat.tableTop.sumRefills'),
    },
    {
      accessorKey: 'creationDate',
      header: t('ReferralsStat.tableTop.createDate'),
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

  const categoryNames = [...new Set(data.map(category => category.referral))];
  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('ReferralsStat.header')}</h2>
        <p className={styles.header_text}>{t('ReferralsStat.headerText')}</p>
      </div>
      <div className={styles.table_container}>
        <div className={styles.top_wrap}>
          <h3 className={styles.table_title}>{t('ReferralsStat.refLinks')}</h3>
          <div className={styles.top_btn_wrap}>
            <CustomSelect
              label={t('ReferralsStat.referral')}
              options={['Все рефералы']}
              selected={selectLoad}
              onSelect={setSelectLoad}
              width={338}
            />
            <CustomSelect
              label={t('ReferralsStat.buyQuantity')}
              options={['По убыванию']}
              selected={selectSell}
              onSelect={setSelectSell}
              width={338}
            />
            <CustomSelect
              label={t('ReferralsStat.buySum')}
              options={['По убыванию']}
              selected={selectSell}
              onSelect={setSelectSell}
              width={339}
            />
            <CustomSelect
              label={t('ReferralsStat.numberRefills')}
              options={['По убыванию']}
              selected={selectSell}
              onSelect={setSelectSell}
              width={516}
            />
            <CustomSelect
              label={t('ReferralsStat.sumRefills')}
              options={['По убыванию']}
              selected={selectSell}
              onSelect={setSelectSell}
              width={516}
            />
          </div>
          <div className={styles.search_wrap}>
            <AddBtn onClick={toggleAddModal} text={'ReferralsStat.createBtn'} />
            <SearchInput
              onSearch={query => setGlobalFilter(query)}
              text={'Category.searchBtn'}
              options={categoryNames}
            />
          </div>
        </div>
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
      <SalesChart salesData={salesData} />
      <ModalComponent
        isOpen={isOpenAdd}
        onClose={toggleAddModal}
        title="ReferralsStat.modalCreate.title"
        text="ReferralsStat.modalCreate.text"
      >
        <CreateReferralLink />
      </ModalComponent>
    </section>
  );
}
