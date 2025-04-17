'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import { useAutofarmStore } from '@/store/autofarmStore';
import { Proxy } from '@/types/autofarmTypes';
import CustomSelect from '../../Buttons/CustomSelect/CustomSelect';

interface EditProxyModalProps {
  proxy: Proxy;
  onClose: () => void;
}

export default function EditProxyModal({
  proxy,
  onClose,
}: EditProxyModalProps) {
  const translations = useTranslations();
  const { servers, updateProxy, geosModesStatuses } = useAutofarmStore();

  const [formData, setFormData] = useState({
    host: proxy.host,
    port: proxy.port,
    modem: proxy.modem,
    password: proxy.password,
    change_ip_link: proxy.change_ip_link,
    geo: proxy.geo,
    provider: proxy.provider,
    operator: proxy.operator,
    server_id: proxy.server?.server_id || 0,
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData(previous => ({
      ...previous,
      [name]: name === 'port' || name === 'server_id' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateProxy(proxy.proxy_id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating proxy:', error);
    }
  };

  const serverOptions = useMemo(() => {
    const options = [translations('ServersProxiesSection.selectServer')];
    options.push(...servers.map(server => server.server_name));
    return options;
  }, [servers, translations]);

  const geoOptions = useMemo(() => {
    const options = [translations('AutoFarmSection.geoSelect')];
    if (geosModesStatuses?.geos) {
      options.push(
        ...geosModesStatuses.geos.map(geo => geo.user_friendly_name)
      );
    }
    return options;
  }, [geosModesStatuses, translations]);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.host')}:</label>
        <input
          type="text"
          name="host"
          value={formData.host}
          onChange={handleChange}
          required
        />
      </div>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.port')}:</label>
        <input
          type="number"
          name="port"
          value={formData.port}
          onChange={handleChange}
          required
        />
      </div>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.login')}:</label>
        <input
          type="text"
          name="modem"
          value={formData.modem}
          onChange={handleChange}
          required
        />
      </div>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.password')}:</label>
        <input
          type="text"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.rotationLink')}:</label>
        <input
          type="text"
          name="change_ip_link"
          value={formData.change_ip_link}
          onChange={handleChange}
        />
      </div>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.geo')}:</label>
        <CustomSelect
          options={geoOptions}
          selected={[formData.geo]}
          onSelect={([geo]) => setFormData(previous => ({ ...previous, geo }))}
          width={200}
          multiSelections={false}
        />
      </div>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.provider')}:</label>
        <input
          type="text"
          name="provider"
          value={formData.provider}
          onChange={handleChange}
        />
      </div>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.operator')}:</label>
        <input
          type="text"
          name="operator"
          value={formData.operator}
          onChange={handleChange}
        />
      </div>
      <div className={styles.input_group}>
        <label>{translations('ServersProxiesSection.serverName')}:</label>
        <CustomSelect
          options={serverOptions}
          selected={
            formData.server_id
              ? [
                  servers.find(s => s.server_id === formData.server_id)
                    ?.server_name || '',
                ]
              : []
          }
          onSelect={([serverName]) =>
            setFormData(previous => ({
              ...previous,
              server_id:
                servers.find(s => s.server_name === serverName)?.server_id || 0,
            }))
          }
          width={200}
          multiSelections={false}
        />
      </div>
      <div className={styles.button_group}>
        <button type="submit">
          {translations('ServersProxiesSection.save')}
        </button>
        <button type="button" onClick={onClose}>
          {translations('ServersProxiesSection.cancel')}
        </button>
      </div>
    </form>
  );
}
