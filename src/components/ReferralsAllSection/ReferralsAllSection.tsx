'use client';

import styles from './ReferralsAllSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import ModalComponent from '../ModalComponent/ModalComponent';
import CreateDistributionSettings from '../ModalComponent/CreateDistributionSettings/CreateDistributionSettings';
import UploadNamesDistribution from '../ModalComponent/UploadNamesDistribution/UploadNamesDistribution';
import { CustomSelect } from '../Buttons/CustomSelect/CustomSelect';
import AddBtn from '../Buttons/AddBtn/AddBtn';
import EditTypeFarmModal from '../ModalComponent/EditTypeFarmModal/EditTypeFarmModal';
import UploadAccountsAutoFarm from '../ModalComponent/UploadAccountsAutoFarm/UploadAccountsAutoFarm';
import ReplenishmentAccountsFarm from '../ModalComponent/ReplenishmentAccountsFarm/ReplenishmentAccountsFarm';
import EditServerFarmModal from '../ModalComponent/EditServerFarmModal/EditServerFarmModal';
import SearchInput from '../Buttons/SearchInput/SearchInput';
import CreateReferral from '../ModalComponent/CreateReferral/CreateReferral';
import WithdrawalPay from '../ModalComponent/WithdrawalPay/WithdrawalPay';

interface Category {
  fullName: string; // Полное имя
  telegram: string; // Telegram
  email: string; // E-mail
  geo: string; // ГЕО
  type: string; // Тип
  servers: string; // Серверов
  accountsInUse: string; // Аккаунтов в работе
  readyAccounts: string; // Готовых аккаунтов
  name: string; // Наименование
}

const data: Category[] = [
  {
    fullName: 'Рэндом Нэйм',
    telegram: 'https://t.me/rn_first',
    email: 'first_person@gmail.com',
    geo: 'UA',
    type: '7 дней',
    servers: '20',
    accountsInUse: '1520',
    readyAccounts: '782',
    name: 'Facebook UA-автофарм 7-дней',
  },
  {
    fullName: 'Олена Петрова',
    telegram: 'https://t.me/olena_p',
    email: 'olena.petrova@gmail.com',
    geo: 'UA',
    type: '14 дней',
    servers: '15',
    accountsInUse: '750',
    readyAccounts: '600',
    name: 'Facebook UA-автофарм 14-дней',
  },
  {
    fullName: 'Іван Шевчук',
    telegram: 'https://t.me/ivan_sh',
    email: 'ivan.shevchuk@gmail.com',
    geo: 'UA',
    type: '30 дней',
    servers: '25',
    accountsInUse: '1200',
    readyAccounts: '950',
    name: 'Facebook UA-автофарм 30-дней',
  },
  {
    fullName: 'Софія Коваленко',
    telegram: 'https://t.me/sofia_k',
    email: 'sofia.kovalenko@gmail.com',
    geo: 'PL',
    type: '7 дней',
    servers: '18',
    accountsInUse: '900',
    readyAccounts: '700',
    name: 'Facebook PL-автофарм 7-дней',
  },
  {
    fullName: 'Дмитро Бондар',
    telegram: 'https://t.me/dmytro_b',
    email: 'dmytro.bondar@gmail.com',
    geo: 'PL',
    type: '14 дней',
    servers: '22',
    accountsInUse: '1100',
    readyAccounts: '880',
    name: 'Facebook PL-автофарм 14-дней',
  },
  {
    fullName: 'Марія Грищенко',
    telegram: 'https://t.me/maria_g',
    email: 'maria.gryshchenko@gmail.com',
    geo: 'PL',
    type: '30 дней',
    servers: '30',
    accountsInUse: '1300',
    readyAccounts: '1000',
    name: 'Facebook PL-автофарм 30-дней',
  },
  {
    fullName: 'Павло Ткачук',
    telegram: 'https://t.me/pavlo_t',
    email: 'pavlo.tkachuk@gmail.com',
    geo: 'DE',
    type: '7 дней',
    servers: '17',
    accountsInUse: '800',
    readyAccounts: '650',
    name: 'Facebook DE-автофарм 7-дней',
  },
  {
    fullName: 'Юлія Савчук',
    telegram: 'https://t.me/yulia_s',
    email: 'yulia.savchuk@gmail.com',
    geo: 'DE',
    type: '14 дней',
    servers: '23',
    accountsInUse: '950',
    readyAccounts: '720',
    name: 'Facebook DE-автофарм 14-дней',
  },
  {
    fullName: 'Олександр Яременко',
    telegram: 'https://t.me/oleksandr_y',
    email: 'oleksandr.yaremenko@gmail.com',
    geo: 'DE',
    type: '30 дней',
    servers: '28',
    accountsInUse: '1400',
    readyAccounts: '1100',
    name: 'Facebook DE-автофарм 30-дней',
  },
  {
    fullName: 'Наталія Сидоренко',
    telegram: 'https://t.me/natalia_s',
    email: 'natalia.sydorenko@gmail.com',
    geo: 'US',
    type: '7 дней',
    servers: '19',
    accountsInUse: '850',
    readyAccounts: '680',
    name: 'Facebook US-автофарм 7-дней',
  },
  {
    fullName: 'Віталій Руденко',
    telegram: 'https://t.me/vitaliy_r',
    email: 'vitaliy.rudenko@gmail.com',
    geo: 'US',
    type: '14 дней',
    servers: '21',
    accountsInUse: '1000',
    readyAccounts: '800',
    name: 'Facebook US-автофарм 14-дней',
  },
  {
    fullName: 'Тетяна Мороз',
    telegram: 'https://t.me/tetyana_m',
    email: 'tetyana.moroz@gmail.com',
    geo: 'US',
    type: '30 дней',
    servers: '27',
    accountsInUse: '1500',
    readyAccounts: '1200',
    name: 'Facebook US-автофарм 30-дней',
  },
  {
    fullName: 'Сергій Кравець',
    telegram: 'https://t.me/serhiy_k',
    email: 'serhiy.kravets@gmail.com',
    geo: 'UA',
    type: '7 дней',
    servers: '16',
    accountsInUse: '700',
    readyAccounts: '550',
    name: 'Instagram UA-автофарм 7-дней',
  },
  {
    fullName: 'Катерина Дубова',
    telegram: 'https://t.me/kateryna_d',
    email: 'kateryna.dubova@gmail.com',
    geo: 'UA',
    type: '14 дней',
    servers: '24',
    accountsInUse: '1150',
    readyAccounts: '900',
    name: 'Instagram UA-автофарм 14-дней',
  },
  {
    fullName: 'Андрій Мельник',
    telegram: 'https://t.me/andriy_m',
    email: 'andriy.melnyk@gmail.com',
    geo: 'UA',
    type: '30 дней',
    servers: '29',
    accountsInUse: '1350',
    readyAccounts: '1050',
    name: 'Instagram UA-автофарм 30-дней',
  },
  {
    fullName: 'Марія Зайцева',
    telegram: 'https://t.me/maria_z',
    email: 'maria.zaytseva@gmail.com',
    geo: 'PL',
    type: '7 дней',
    servers: '14',
    accountsInUse: '650',
    readyAccounts: '500',
    name: 'Instagram PL-автофарм 7-дней',
  },
  {
    fullName: 'Олена Григоренко',
    telegram: 'https://t.me/olena_g',
    email: 'olena.grygorenko@gmail.com',
    geo: 'PL',
    type: '14 дней',
    servers: '20',
    accountsInUse: '950',
    readyAccounts: '760',
    name: 'Instagram PL-автофарм 14-дней',
  },
  {
    fullName: 'Максим Куролап',
    telegram: 'https://t.me/maksym_k',
    email: 'maksym.kurolap@gmail.com',
    geo: 'PL',
    type: '30 дней',
    servers: '26',
    accountsInUse: '1250',
    readyAccounts: '980',
    name: 'Instagram PL-автофарм 30-дней',
  },
  {
    fullName: 'Людмила Гордієнко',
    telegram: 'https://t.me/lyudmyla_g',
    email: 'lyudmyla.gordiienko@gmail.com',
    geo: 'DE',
    type: '7 дней',
    servers: '15',
    accountsInUse: '720',
    readyAccounts: '580',
    name: 'Instagram DE-автофарм 7-дней',
  },
  {
    fullName: 'Роман Левчук',
    telegram: 'https://t.me/roman_l',
    email: 'roman.levchuk@gmail.com',
    geo: 'DE',
    type: '14 дней',
    servers: '22',
    accountsInUse: '1050',
    readyAccounts: '820',
    name: 'Instagram DE-автофарм 14-дней',
  },
  {
    fullName: 'Вікторія Олійник',
    telegram: 'https://t.me/viktoriya_o',
    email: 'viktoriya.oliynyk@gmail.com',
    geo: 'DE',
    type: '30 дней',
    servers: '28',
    accountsInUse: '1450',
    readyAccounts: '1150',
    name: 'Instagram DE-автофарм 30-дней',
  },
  {
    fullName: 'Михайло Соколов',
    telegram: 'https://t.me/mykhaylo_s',
    email: 'mykhaylo.sokolov@gmail.com',
    geo: 'US',
    type: '7 дней',
    servers: '18',
    accountsInUse: '780',
    readyAccounts: '620',
    name: 'Instagram US-автофарм 7-дней',
  },
  {
    fullName: 'Дарина Лозова',
    telegram: 'https://t.me/daryna_l',
    email: 'daryna.lozova@gmail.com',
    geo: 'US',
    type: '14 дней',
    servers: '23',
    accountsInUse: '1100',
    readyAccounts: '870',
    name: 'Instagram US-автофарм 14-дней',
  },
  {
    fullName: 'Євген Козлов',
    telegram: 'https://t.me/yevhen_k',
    email: 'yevhen.kozlov@gmail.com',
    geo: 'US',
    type: '30 дней',
    servers: '30',
    accountsInUse: '1550',
    readyAccounts: '1250',
    name: 'Instagram US-автофарм 30-дней',
  },
  {
    fullName: 'Ірина Білик',
    telegram: 'https://t.me/iryna_b',
    email: 'iryna.bilyk@gmail.com',
    geo: 'UA',
    type: '7 дней',
    servers: '17',
    accountsInUse: '670',
    readyAccounts: '530',
    name: 'Twitter UA-автофарм 7-дней',
  },
  {
    fullName: 'Артем Дорошенко',
    telegram: 'https://t.me/artem_d',
    email: 'artem.doroshenko@gmail.com',
    geo: 'UA',
    type: '14 дней',
    servers: '21',
    accountsInUse: '980',
    readyAccounts: '790',
    name: 'Twitter UA-автофарм 14-дней',
  },
  {
    fullName: 'Оксана Власенко',
    telegram: 'https://t.me/oksana_v',
    email: 'oksana.vlasenko@gmail.com',
    geo: 'UA',
    type: '30 дней',
    servers: '25',
    accountsInUse: '1300',
    readyAccounts: '1000',
    name: 'Twitter UA-автофарм 30-дней',
  },
];
const ReferralsAllSection = () => {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenEditType, setIsOpenEditType] = useState(false);
  const [isOpenServer, setIsOpenServer] = useState(false);
  const [isOpenWithdrawal, setIsOpenWithdrawal] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [selectGeoServer, setSelectGeoServer] = useState('');
  const [isOpenResult, setIsOpenResult] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const toggleCreateModal = () => {
    setIsOpenCreate(!isOpenCreate);
  };
  const toggleWithdrawalModal = () => {
    setIsOpenWithdrawal(!isOpenWithdrawal);
  };

  const toggleUpdateModal = (title = '', titleSecond = '') => {
    setIsOpenUpdate(!isOpenUpdate);
  };

  const mainColumns: ColumnDef<Category>[] = [
    {
      accessorKey: 'fullName',
      header: t('ReferralsAll.tableTop.fullName'),
    },
    {
      accessorKey: 'telegram',
      header: t('ReferralsAll.tableTop.telegram'),
    },
    {
      accessorKey: 'email',
      header: t('ReferralsAll.tableTop.email'),
    },
    {
      id: 'actions',
      header: t('AutoFarmSection.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => toggleUpdateModal()}
            text={'AutoFarmSection.tableAcc.btnEdit'}
            icon="icon-edit-pencil"
          />
        </div>
      ),
    },
  ];

  const serverColumns: ColumnDef<Category>[] = [
    { accessorKey: 'geo', header: t('ReferralsAll.tableBottom.geo') },
    { accessorKey: 'type', header: t('ReferralsAll.tableBottom.type') },
    {
      accessorKey: 'servers',
      header: t('ReferralsAll.tableBottom.servers'),
    },
    {
      accessorKey: 'accountsInUse',
      header: t('ReferralsAll.tableBottom.accountsInUse'),
    },
    {
      accessorKey: 'readyAccounts',
      header: t('ReferralsAll.tableBottom.readyAccounts'),
    },
    {
      accessorKey: 'name',
      header: t('ReferralsAll.tableBottom.name'),
    },
    {
      id: 'actions',
      header: t('AutoFarmSection.action'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => toggleWithdrawalModal()}
            text={'AutoFarmSection.tableAcc.btnLoad'}
            icon="icon-upload"
          />
          <WhiteBtn
            onClick={() => toggleCreateModal()}
            text={'AutoFarmSection.tableAcc.btnEdit'}
            icon="icon-edit-pencil"
          />
        </div>
      ),
    },
  ];

  const mainTable = useReactTable({
    data,
    columns: mainColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      global: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const cellValue = String(row.getValue(columnId) ?? '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      },
    },
  });

  const serverTable = useReactTable({
    data,
    columns: serverColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const toggleResultModal = () => {
    setIsOpenResult(!isOpenResult);
  };

  const categoryNames = [...new Set(data.map(category => category.fullName))];

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <div className={styles.header_wrap}>
          <h2 className={styles.header}>{t('ReferralsAll.header')}</h2>
          <p className={styles.header_text}>{t('ReferralsAll.headerText')}</p>
          <div className={styles.buttons_wrap}>
            <AddBtn
              onClick={toggleCreateModal}
              text={'ReferralsAll.refCreate'}
            />
            <SearchInput
              onSearch={query => setGlobalFilter(query)}
              text={'Category.searchBtn'}
              options={categoryNames}
            />
          </div>
        </div>
        <div className={styles.table_wrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {mainTable.getHeaderGroups().map(headerGroup => (
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
              {mainTable.getRowModel().rows.map(row => (
                <tr className={styles.tr} key={row.id}>
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
      </div>
      <div className={styles.header_container}>
        <div className={styles.header_wrap}>
          <h3 className={styles.header}>{t('ReferralsAll.headerBottom')}</h3>
          <p className={styles.header_text}>
            {t('ReferralsAll.headerTextBottom')}
          </p>
          <div className={styles.buttons_wrap}>
            <CustomSelect
              label={t('ReferralsStat.referral')}
              options={['Все рефералы']}
              selected={selectGeoServer}
              onSelect={setSelectGeoServer}
              width={338}
            />
            <CustomSelect
              label={t('ReferralsAll.sum')}
              options={['По убыванию']}
              selected={selectGeoServer}
              onSelect={setSelectGeoServer}
              width={338}
            />
            <CustomSelect
              label={t('ReferralsAll.status')}
              options={['Не оплачена']}
              selected={selectGeoServer}
              onSelect={setSelectGeoServer}
              width={339}
            />
            <CustomSelect
              label={t('ReferralsAll.date')}
              options={['По убыванию']}
              selected={selectGeoServer}
              onSelect={setSelectGeoServer}
              width={516}
            />
            <CustomSelect
              label={t('ReferralsAll.paySystem')}
              options={['Все платежные системы']}
              selected={selectGeoServer}
              onSelect={setSelectGeoServer}
              width={516}
            />
          </div>
        </div>
        <div className={styles.server_table_wrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {serverTable.getHeaderGroups().map(headerGroup => (
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
              {serverTable.getRowModel().rows.map(row => (
                <tr className={styles.tr} key={row.id}>
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
      </div>
      <ModalComponent
        isOpen={isOpenCreate}
        onClose={toggleCreateModal}
        title="ReferralsAll.modalCreate.title"
      >
        <CreateReferral />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenWithdrawal}
        onClose={toggleWithdrawalModal}
        title="ReferralsAll.modalPay.title"
      >
        <WithdrawalPay />
      </ModalComponent>
    </section>
  );
};

export default ReferralsAllSection;
