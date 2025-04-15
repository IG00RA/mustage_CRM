'use client';

import styles from './AutoFarmSection.module.css';
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
// import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import AddBtn from '../Buttons/AddBtn/AddBtn';
import EditTypeFarmModal from '../ModalComponent/EditTypeFarmModal/EditTypeFarmModal';
import UploadAccountsAutoFarm from '../ModalComponent/UploadAccountsAutoFarm/UploadAccountsAutoFarm';
import ReplenishmentAccountsFarm from '../ModalComponent/ReplenishmentAccountsFarm/ReplenishmentAccountsFarm';
import EditServerFarmModal from '../ModalComponent/EditServerFarmModal/EditServerFarmModal';

interface Category {
  geo: string;
  type: string;
  servers: string;
  accountsInUse: string;
  readyAccounts: string;
  name: string;
  shortageAccounts: string;
  serverName: string;
  serverStatus: string;
  statusUpdated: string;
}

const data: Category[] = [
  {
    geo: 'UA',
    type: '7 дней',
    servers: '20',
    accountsInUse: '1025',
    readyAccounts: '850',
    name: 'Facebook UA-автофарм 7-дней',
    shortageAccounts: '80',
    serverName: 'srv01',
    serverStatus: 'Прокси не работает',
    statusUpdated: '21.09.2024 19:25',
  },
  {
    geo: 'UA',
    type: '14 дней',
    servers: '15',
    accountsInUse: '750',
    readyAccounts: '600',
    name: 'Facebook UA-автофарм 14-дней',
    shortageAccounts: '50',
    serverName: 'srv02',
    serverStatus: 'Работает',
    statusUpdated: '22.09.2024 10:15',
  },
  {
    geo: 'UA',
    type: '30 дней',
    servers: '25',
    accountsInUse: '1200',
    readyAccounts: '950',
    name: 'Facebook UA-автофарм 30-дней',
    shortageAccounts: '120',
    serverName: 'srv03',
    serverStatus: 'Ожидание',
    statusUpdated: '23.09.2024 14:30',
  },
  {
    geo: 'PL',
    type: '7 дней',
    servers: '18',
    accountsInUse: '900',
    readyAccounts: '700',
    name: 'Facebook PL-автофарм 7-дней',
    shortageAccounts: '90',
    serverName: 'srv04',
    serverStatus: 'Прокси не работает',
    statusUpdated: '24.09.2024 09:00',
  },
  {
    geo: 'PL',
    type: '14 дней',
    servers: '22',
    accountsInUse: '1100',
    readyAccounts: '880',
    name: 'Facebook PL-автофарм 14-дней',
    shortageAccounts: '70',
    serverName: 'srv05',
    serverStatus: 'Работает',
    statusUpdated: '25.09.2024 16:45',
  },
  {
    geo: 'PL',
    type: '30 дней',
    servers: '30',
    accountsInUse: '1300',
    readyAccounts: '1000',
    name: 'Facebook PL-автофарм 30-дней',
    shortageAccounts: '150',
    serverName: 'srv06',
    serverStatus: 'Ожидание',
    statusUpdated: '26.09.2024 12:00',
  },
  {
    geo: 'DE',
    type: '7 дней',
    servers: '17',
    accountsInUse: '800',
    readyAccounts: '650',
    name: 'Facebook DE-автофарм 7-дней',
    shortageAccounts: '60',
    serverName: 'srv07',
    serverStatus: 'Прокси не работает',
    statusUpdated: '27.09.2024 08:30',
  },
  {
    geo: 'DE',
    type: '14 дней',
    servers: '23',
    accountsInUse: '950',
    readyAccounts: '720',
    name: 'Facebook DE-автофарм 14-дней',
    shortageAccounts: '85',
    serverName: 'srv08',
    serverStatus: 'Работает',
    statusUpdated: '28.09.2024 15:20',
  },
  {
    geo: 'DE',
    type: '30 дней',
    servers: '28',
    accountsInUse: '1400',
    readyAccounts: '1100',
    name: 'Facebook DE-автофарм 30-дней',
    shortageAccounts: '130',
    serverName: 'srv09',
    serverStatus: 'Ожидание',
    statusUpdated: '29.09.2024 11:10',
  },
  {
    geo: 'US',
    type: '7 дней',
    servers: '19',
    accountsInUse: '850',
    readyAccounts: '680',
    name: 'Facebook US-автофарм 7-дней',
    shortageAccounts: '75',
    serverName: 'srv10',
    serverStatus: 'Прокси не работает',
    statusUpdated: '30.09.2024 17:00',
  },
  {
    geo: 'US',
    type: '14 дней',
    servers: '21',
    accountsInUse: '1000',
    readyAccounts: '800',
    name: 'Facebook US-автофарм 14-дней',
    shortageAccounts: '90',
    serverName: 'srv11',
    serverStatus: 'Работает',
    statusUpdated: '01.10.2024 13:25',
  },
  {
    geo: 'US',
    type: '30 дней',
    servers: '27',
    accountsInUse: '1500',
    readyAccounts: '1200',
    name: 'Facebook US-автофарм 30-дней',
    shortageAccounts: '140',
    serverName: 'srv12',
    serverStatus: 'Ожидание',
    statusUpdated: '02.10.2024 09:40',
  },
  {
    geo: 'UA',
    type: '7 дней',
    servers: '16',
    accountsInUse: '700',
    readyAccounts: '550',
    name: 'Instagram UA-автофарм 7-дней',
    shortageAccounts: '65',
    serverName: 'srv13',
    serverStatus: 'Прокси не работает',
    statusUpdated: '03.10.2024 18:15',
  },
  {
    geo: 'UA',
    type: '14 дней',
    servers: '24',
    accountsInUse: '1150',
    readyAccounts: '900',
    name: 'Instagram UA-автофарм 14-дней',
    shortageAccounts: '100',
    serverName: 'srv14',
    serverStatus: 'Работает',
    statusUpdated: '04.10.2024 14:00',
  },
  {
    geo: 'UA',
    type: '30 дней',
    servers: '29',
    accountsInUse: '1350',
    readyAccounts: '1050',
    name: 'Instagram UA-автофарм 30-дней',
    shortageAccounts: '125',
    serverName: 'srv15',
    serverStatus: 'Ожидание',
    statusUpdated: '05.10.2024 10:30',
  },
  {
    geo: 'PL',
    type: '7 дней',
    servers: '14',
    accountsInUse: '650',
    readyAccounts: '500',
    name: 'Instagram PL-автофарм 7-дней',
    shortageAccounts: '55',
    serverName: 'srv16',
    serverStatus: 'Прокси не работает',
    statusUpdated: '06.10.2024 16:50',
  },
  {
    geo: 'PL',
    type: '14 дней',
    servers: '20',
    accountsInUse: '950',
    readyAccounts: '760',
    name: 'Instagram PL-автофарм 14-дней',
    shortageAccounts: '80',
    serverName: 'srv17',
    serverStatus: 'Работает',
    statusUpdated: '07.10.2024 12:20',
  },
  {
    geo: 'PL',
    type: '30 дней',
    servers: '26',
    accountsInUse: '1250',
    readyAccounts: '980',
    name: 'Instagram PL-автофарм 30-дней',
    shortageAccounts: '110',
    serverName: 'srv18',
    serverStatus: 'Ожидание',
    statusUpdated: '08.10.2024 08:45',
  },
  {
    geo: 'DE',
    type: '7 дней',
    servers: '15',
    accountsInUse: '720',
    readyAccounts: '580',
    name: 'Instagram DE-автофарм 7-дней',
    shortageAccounts: '60',
    serverName: 'srv19',
    serverStatus: 'Прокси не работает',
    statusUpdated: '09.10.2024 15:10',
  },
  {
    geo: 'DE',
    type: '14 дней',
    servers: '22',
    accountsInUse: '1050',
    readyAccounts: '820',
    name: 'Instagram DE-автофарм 14-дней',
    shortageAccounts: '95',
    serverName: 'srv20',
    serverStatus: 'Работает',
    statusUpdated: '10.10.2024 11:00',
  },
  {
    geo: 'DE',
    type: '30 дней',
    servers: '28',
    accountsInUse: '1450',
    readyAccounts: '1150',
    name: 'Instagram DE-автофарм 30-дней',
    shortageAccounts: '135',
    serverName: 'srv21',
    serverStatus: 'Ожидание',
    statusUpdated: '11.10.2024 17:30',
  },
  {
    geo: 'US',
    type: '7 дней',
    servers: '18',
    accountsInUse: '780',
    readyAccounts: '620',
    name: 'Instagram US-автофарм 7-дней',
    shortageAccounts: '70',
    serverName: 'srv22',
    serverStatus: 'Прокси не работает',
    statusUpdated: '12.10.2024 13:15',
  },
  {
    geo: 'US',
    type: '14 дней',
    servers: '23',
    accountsInUse: '1100',
    readyAccounts: '870',
    name: 'Instagram US-автофарм 14-дней',
    shortageAccounts: '100',
    serverName: 'srv23',
    serverStatus: 'Работает',
    statusUpdated: '13.10.2024 09:50',
  },
  {
    geo: 'US',
    type: '30 дней',
    servers: '30',
    accountsInUse: '1550',
    readyAccounts: '1250',
    name: 'Instagram US-автофарм 30-дней',
    shortageAccounts: '145',
    serverName: 'srv24',
    serverStatus: 'Ожидание',
    statusUpdated: '14.10.2024 16:25',
  },
  {
    geo: 'UA',
    type: '7 дней',
    servers: '17',
    accountsInUse: '670',
    readyAccounts: '530',
    name: 'Twitter UA-автофарм 7-дней',
    shortageAccounts: '60',
    serverName: 'srv25',
    serverStatus: 'Прокси не работает',
    statusUpdated: '15.10.2024 12:40',
  },
  {
    geo: 'UA',
    type: '14 дней',
    servers: '21',
    accountsInUse: '980',
    readyAccounts: '790',
    name: 'Twitter UA-автофарм 14-дней',
    shortageAccounts: '85',
    serverName: 'srv26',
    serverStatus: 'Работает',
    statusUpdated: '16.10.2024 08:55',
  },
  {
    geo: 'UA',
    type: '30 дней',
    servers: '25',
    accountsInUse: '1300',
    readyAccounts: '1000',
    name: 'Twitter UA-автофарм 30-дней',
    shortageAccounts: '120',
    serverName: 'srv27',
    serverStatus: 'Ожидание',
    statusUpdated: '17.10.2024 15:00',
  },
];

export default function AutoFarmSection() {
  const t = useTranslations();
  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenEditType, setIsOpenEditType] = useState(false);
  const [isOpenServer, setIsOpenServer] = useState(false);
  const [isOpenReplenishmentAccounts, setIsOpenReplenishmentAccounts] =
    useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateServerName, setUpdateServerName] = useState('');
  const [updateTitleSecond, setUpdateTitleSecond] = useState('');
  // const [selectGeoAcc, setSelectGeoAcc] = useState('');
  // const [selectTypeAcc, setSelectTypeAcc] = useState('');
  // const [selectGeoReplenishment, setSelectGeoReplenishment] = useState('');
  // const [selectTypeReplenishment, setSelectTypeReplenishment] = useState('');
  // const [selectGeoServer, setSelectGeoServer] = useState('');
  // const [selectTypeServer, setSelectTypeServer] = useState('');

  const toggleEditTypeModal = () => {
    setIsOpenEditType(!isOpenEditType);
  };
  const toggleServerModal = (server = '') => {
    setUpdateServerName(server);
    setIsOpenServer(!isOpenServer);
  };
  const toggleReplenishmentAccountsModal = () => {
    setIsOpenReplenishmentAccounts(!isOpenReplenishmentAccounts);
  };
  const toggleUpdateModal = (title = '', titleSecond = '') => {
    setUpdateTitle(title);
    setUpdateTitleSecond(titleSecond);
    setIsOpenUpdate(!isOpenUpdate);
  };

  const mainColumns: ColumnDef<Category>[] = [
    {
      accessorKey: 'geo',
      header: t('AutoFarmSection.geoTable'),
    },
    {
      accessorKey: 'type',
      header: t('AutoFarmSection.type'),
    },
    {
      accessorKey: 'servers',
      header: t('AutoFarmSection.tableAcc.servers'),
    },
    {
      accessorKey: 'accountsInUse',
      header: t('AutoFarmSection.tableAcc.workAcc'),
    },
    {
      accessorKey: 'readyAccounts',
      header: t('AutoFarmSection.tableAcc.doneAcc'),
    },

    {
      accessorKey: 'name',
      header: t('AutoFarmSection.names'),
    },
    {
      id: 'actions',
      header: t('AutoFarmSection.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() =>
              toggleUpdateModal(
                `гео - ${row.original.geo}, тип - ${row.original.type}`,
                row.original.name
              )
            }
            text={'AutoFarmSection.tableAcc.btnLoad'}
            icon="icon-upload"
          />
          <WhiteBtn
            onClick={() => toggleEditTypeModal()}
            text={'AutoFarmSection.tableAcc.btnEdit'}
            icon="icon-edit-pencil"
          />
        </div>
      ),
    },
  ];

  const shortageColumns: ColumnDef<Category>[] = [
    { accessorKey: 'geo', header: t('AutoFarmSection.geoTable') },
    { accessorKey: 'type', header: t('AutoFarmSection.type') },
    {
      accessorKey: 'shortageAccounts',
      header: t('AutoFarmSection.tableReplenishment.lackAcc'),
    },
  ];

  const serverColumns: ColumnDef<Category>[] = [
    { accessorKey: 'geo', header: t('AutoFarmSection.geoTable') },
    { accessorKey: 'type', header: t('AutoFarmSection.type') },
    {
      accessorKey: 'serverName',
      header: t('AutoFarmSection.tableServers.name'),
    },
    {
      accessorKey: 'serverStatus',
      header: t('AutoFarmSection.tableServers.status'),
    },
    {
      accessorKey: 'statusUpdated',
      header: t('AutoFarmSection.tableServers.statusDate'),
    },
    {
      id: 'actions',
      header: t('AutoFarmSection.action'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => toggleServerModal(row.original.serverName)}
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

  const shortageTable = useReactTable({
    data,
    columns: shortageColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const serverTable = useReactTable({
    data,
    columns: serverColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>
          {t('Sidebar.accParMenu.autoFarmControl')}
        </h2>
        <p className={styles.header_text}>{t('AutoFarmSection.headerText')}</p>
      </div>
      <div className={styles.table_container_first}>
        <h3 className={styles.table_header}>
          {t('AutoFarmSection.tableAcc.header')}
        </h3>
        <div className={styles.buttons_wrap}>
          {/* <CustomSelect
            label={`${t('AutoFarmSection.geo')}:`}
            options={Array.from(new Set(data.map(item => item.geo)))}
            selected={selectGeoAcc}
            onSelect={setSelectGeoAcc}
            width={296}
          />
          <CustomSelect
            label={`${t('AutoFarmSection.type')}:`}
            options={Array.from(new Set(data.map(item => item.type)))}
            selected={selectTypeAcc}
            onSelect={setSelectTypeAcc}
            width={296}
          /> */}
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
      <div className={styles.tables_wrapper}>
        <div className={styles.table_container}>
          <h3 className={styles.table_header}>
            {t('AutoFarmSection.tableReplenishment.header')}
          </h3>
          <div className={styles.buttons_wrap}>
            {/* <CustomSelect
              label={`${t('AutoFarmSection.geo')}:`}
              options={Array.from(new Set(data.map(item => item.geo)))}
              selected={selectGeoReplenishment}
              onSelect={setSelectGeoReplenishment}
              width={140}
            />
            <CustomSelect
              label={`${t('AutoFarmSection.type')}:`}
              options={Array.from(new Set(data.map(item => item.type)))}
              selected={selectTypeReplenishment}
              onSelect={setSelectTypeReplenishment}
              width={140}
            /> */}
          </div>
          <div className={styles.replenishment_table_wrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                {shortageTable.getHeaderGroups().map(headerGroup => (
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
                {shortageTable.getRowModel().rows.map(row => (
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
          <p className={styles.table_text}>
            {t('AutoFarmSection.tableReplenishment.amount')} <span>320</span>
          </p>
          <div className={styles.table_add_btn}>
            <AddBtn
              onClick={toggleReplenishmentAccountsModal}
              text={'AutoFarmSection.tableReplenishment.btn'}
            />
          </div>
        </div>
        <div className={styles.table_container}>
          <h3 className={styles.table_header}>
            {t('AutoFarmSection.tableServers.header')}
          </h3>
          <div className={styles.buttons_wrap}>
            {/* <CustomSelect
              label={`${t('AutoFarmSection.geo')}:`}
              options={Array.from(new Set(data.map(item => item.geo)))}
              selected={selectGeoServer}
              onSelect={setSelectGeoServer}
              width={330}
            />
            <CustomSelect
              label={`${t('AutoFarmSection.type')}:`}
              options={Array.from(new Set(data.map(item => item.type)))}
              selected={selectTypeServer}
              onSelect={setSelectTypeServer}
              width={330}
            /> */}
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
      </div>
      <ModalComponent
        isOpen={isOpenEditType}
        onClose={toggleEditTypeModal}
        title="AutoFarmSection.modalEditType.title"
      >
        <EditTypeFarmModal />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenReplenishmentAccounts}
        onClose={toggleReplenishmentAccountsModal}
        title="AutoFarmSection.modalReplenishmentAcc.title"
      >
        <ReplenishmentAccountsFarm />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenServer}
        onClose={toggleServerModal}
        editedTitle={`"${updateServerName}"`}
        title="AutoFarmSection.modalServerType.title"
      >
        <EditServerFarmModal />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={toggleUpdateModal}
        title="AutoFarmSection.modalLoad.title"
        titleSecond="AutoFarmSection.modalLoad.titleSecond"
        editedTitle={`"${updateTitle}"`}
        editedTitleSecond={`"${updateTitleSecond}"`}
      >
        <UploadAccountsAutoFarm />
      </ModalComponent>
    </section>
  );
}
