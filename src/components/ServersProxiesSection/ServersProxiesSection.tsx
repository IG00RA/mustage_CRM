'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import styles from './ServersProxiesSection.module.css';
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import ModalComponent from '../ModalComponent/ModalComponent';
import EditProxyModal from '../ModalComponent/EditProxyModal/EditProxyModal';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import Loader from '../Loader/Loader';
import { useAutofarmStore } from '@/store/autofarmStore';
import { Server, Proxy } from '@/types/autofarmTypes';

export default function ServersProxiesSection() {
  const t = useTranslations();
  const {
    servers,
    proxies,
    geosModesStatuses,
    error,
    fetchGeosModesStatuses,
    fetchServers,
    fetchProxies,
    deleteProxy,
  } = useAutofarmStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectGeo, setSelectGeo] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState<string[]>([]);
  const [selectStatus, setSelectStatus] = useState<string[]>([]);
  const [selectProxyGeo, setSelectProxyGeo] = useState<string[]>([]);
  const [selectProxyMode, setSelectProxyMode] = useState<string[]>([]);
  const [isOpenEditProxy, setIsOpenEditProxy] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const toggleEditProxyModal = useCallback((proxy?: Proxy) => {
    setSelectedProxy(proxy || null);
    setIsOpenEditProxy(previous => !previous);
  }, []);

  useEffect(() => {
    fetchGeosModesStatuses();
  }, [fetchGeosModesStatuses]);

  useEffect(() => {
    if (servers.length > 0) {
      setShowLoader(false);
    }
  }, [servers]);

  const fetchData = useCallback(() => {
    fetchServers({
      geo: selectGeo.length > 0 ? selectGeo : undefined,
      activity_mode: selectMode.length > 0 ? selectMode : undefined,
      server_status: selectStatus.length > 0 ? selectStatus : undefined,
    });
    fetchProxies({
      geo: selectProxyGeo.length > 0 ? selectProxyGeo : undefined,
      server_activity_mode:
        selectProxyMode.length > 0 ? selectProxyMode : undefined,
    });
  }, [
    selectGeo,
    selectMode,
    selectStatus,
    selectProxyGeo,
    selectProxyMode,
    fetchServers,
    fetchProxies,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const geoOptions = useMemo(() => {
    const options = [t('AutoFarmSection.geoSelect')];
    if (geosModesStatuses?.geos) {
      options.push(
        ...geosModesStatuses.geos.map(geo => geo.user_friendly_name)
      );
    }
    return options;
  }, [geosModesStatuses, t]);

  const modeOptions = useMemo(() => {
    const options = [t('AutoFarmSection.typeSelect')];
    if (geosModesStatuses?.activity_modes) {
      options.push(
        ...geosModesStatuses.activity_modes.map(mode => mode.user_friendly_name)
      );
    }
    return options;
  }, [geosModesStatuses, t]);

  const statusOptions = useMemo(() => {
    const options = [t('ServersProxiesSection.statusSelect')];
    if (geosModesStatuses?.server_statuses) {
      options.push(
        ...geosModesStatuses.server_statuses.map(
          status => status.user_friendly_name
        )
      );
    }
    return options;
  }, [geosModesStatuses, t]);

  const serverColumns: ColumnDef<Server>[] = [
    {
      accessorKey: 'geo',
      header: t('ServersProxiesSection.geo'),
    },
    {
      accessorKey: 'activity_mode',
      header: t('ServersProxiesSection.activityMode'),
    },
    {
      accessorKey: 'server_status',
      header: t('ServersProxiesSection.serverStatus'),
    },
    {
      accessorKey: 'update_datetime',
      header: t('ServersProxiesSection.updateTime'),
      cell: ({ row }) =>
        new Date(row.original.update_datetime).toLocaleString(),
    },
    {
      accessorKey: 'proxy',
      header: t('ServersProxiesSection.proxy'),
      cell: ({ row }) =>
        row.original.proxy
          ? `${row.original.proxy.host}:${row.original.proxy.port}@${row.original.proxy.modem}:${row.original.proxy.password}`
          : '-',
    },
    {
      accessorKey: 'server_id',
      header: t('ServersProxiesSection.serverId'),
    },
    {
      accessorKey: 'server_name',
      header: t('ServersProxiesSection.serverName'),
    },
  ];

  const proxyColumns: ColumnDef<Proxy>[] = [
    {
      accessorKey: 'proxy_id',
      header: t('ServersProxiesSection.proxyId'),
    },
    {
      accessorKey: 'host',
      header: t('ServersProxiesSection.host'),
    },
    {
      accessorKey: 'port',
      header: t('ServersProxiesSection.port'),
    },
    {
      accessorKey: 'modem',
      header: t('ServersProxiesSection.login'),
    },
    {
      accessorKey: 'password',
      header: t('ServersProxiesSection.password'),
    },
    {
      accessorKey: 'change_ip_link',
      header: t('ServersProxiesSection.rotationLink'),
    },
    {
      accessorKey: 'provider',
      header: t('ServersProxiesSection.provider'),
    },
    {
      accessorKey: 'operator',
      header: t('ServersProxiesSection.operator'),
    },
    {
      accessorKey: 'server.server_name',
      header: t('ServersProxiesSection.serverName'),
      cell: ({ row }) => row.original.server?.server_name || '-',
    },
    {
      accessorKey: 'server.activity_mode',
      header: t('ServersProxiesSection.serverActivityMode'),
      cell: ({ row }) => row.original.server?.activity_mode || '-',
    },
    {
      accessorKey: 'server.update_datetime',
      header: t('ServersProxiesSection.updateDate'),
      cell: ({ row }) =>
        row.original.server
          ? new Date(row.original.server.update_datetime).toLocaleString()
          : '-',
    },
    {
      id: 'actions',
      header: t('ServersProxiesSection.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => toggleEditProxyModal(row.original)}
            text={'ServersProxiesSection.edit'}
          />
          <WhiteBtn
            onClick={() => {
              if (
                window.confirm(
                  t('ServersProxiesSection.confirmDelete', {
                    proxyId: row.original.proxy_id,
                  })
                )
              ) {
                console.log('запит на видалення ');
                // deleteProxy(row.original.proxy_id);
              }
            }}
            text={'ServersProxiesSection.delete'}
            icon="icon-trash"
            iconFill="icon-fill_trash"
          />
        </div>
      ),
    },
  ];

  const serversTable = useReactTable({
    data: servers,
    columns: serverColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const proxiesTable = useReactTable({
    data: proxies,
    columns: proxyColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <section className={styles.section}>
      {showLoader && <Loader error={error} />}
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('AutoFarmSection.titleServers')}</h2>
        <p className={styles.header_text}>
          {t('AutoFarmSection.headerServersText')}
        </p>
      </div>

      <div className={styles.table_container}>
        <h3 className={styles.table_header}>
          {t('ServersProxiesSection.servers')}
        </h3>
        <div className={styles.buttons_wrap}>
          <CustomSelect
            label={`${t('ServersProxiesSection.geo')}:`}
            options={geoOptions}
            selected={selectGeo}
            onSelect={setSelectGeo}
            width={250}
          />
          <CustomSelect
            label={`${t('ServersProxiesSection.activityMode')}:`}
            options={modeOptions}
            selected={selectMode}
            onSelect={setSelectMode}
            width={320}
          />
          <CustomSelect
            label={`${t('ServersProxiesSection.serverStatus')}:`}
            options={statusOptions}
            selected={selectStatus}
            onSelect={setSelectStatus}
            width={300}
          />
        </div>
        <div className={styles.table_wrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {serversTable.getHeaderGroups().map(headerGroup => (
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
              {serversTable.getRowModel().rows.map(row => (
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

      <div className={styles.table_container}>
        <h3 className={styles.table_header}>
          {t('ServersProxiesSection.proxies')}
        </h3>
        <div className={styles.buttons_wrap}>
          <CustomSelect
            label={`${t('ServersProxiesSection.geo')}:`}
            options={geoOptions}
            selected={selectProxyGeo}
            onSelect={setSelectProxyGeo}
            width={250}
          />
          <CustomSelect
            label={`${t('ServersProxiesSection.activityMode')}:`}
            options={modeOptions}
            selected={selectProxyMode}
            onSelect={setSelectProxyMode}
            width={320}
          />
        </div>
        <div className={styles.table_wrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {proxiesTable.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      className={styles.th}
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: header.column.getCanSort()
                          ? 'pointer'
                          : 'default',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted()
                        ? header.column.getIsSorted() === 'desc'
                          ? ' ↓'
                          : ' ↑'
                        : ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={styles.tbody}>
              {proxiesTable.getRowModel().rows.map(row => (
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
        isOpen={isOpenEditProxy}
        onClose={() => toggleEditProxyModal()}
        title="ServersProxiesSection.editProxy"
      >
        {selectedProxy && (
          <EditProxyModal
            proxy={selectedProxy}
            onClose={() => toggleEditProxyModal()}
          />
        )}
      </ModalComponent>
    </section>
  );
}
