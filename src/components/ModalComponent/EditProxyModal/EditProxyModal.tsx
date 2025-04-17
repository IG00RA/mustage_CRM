'use client';

import React, { useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import styles from '../ModalComponent.module.css';
import { useAutofarmStore } from '@/store/autofarmStore';
import { Proxy } from '@/types/autofarmTypes';
import CustomSelect from '../../Buttons/CustomSelect/CustomSelect';
import SubmitBtn from '../../Buttons/SubmitBtn/SubmitBtn';
import CancelBtn from '../../Buttons/CancelBtn/CancelBtn';

interface EditProxyModalProps {
  proxy: Proxy;
  onClose: () => void;
}

interface UpdateProxyFormData {
  host: string;
  port: number;
  modem: string;
  password: string;
  change_ip_link: string;
  geo: string;
  provider: string;
  operator: string;
  server_id: number;
}

export default function EditProxyModal({
  proxy,
  onClose,
}: EditProxyModalProps) {
  const t = useTranslations();
  const { servers, updateProxy, geosModesStatuses } = useAutofarmStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProxyFormData>({
    defaultValues: {
      host: proxy.host,
      port: proxy.port,
      modem: proxy.modem,
      password: proxy.password,
      change_ip_link: proxy.change_ip_link,
      geo: proxy.geo,
      provider: proxy.provider,
      operator: proxy.operator,
      server_id: proxy.server?.server_id || 0,
    },
  });

  useEffect(() => {
    setValue('host', proxy.host);
    setValue('port', proxy.port);
    setValue('modem', proxy.modem);
    setValue('password', proxy.password);
    setValue('change_ip_link', proxy.change_ip_link);
    setValue('geo', proxy.geo);
    setValue('provider', proxy.provider);
    setValue('operator', proxy.operator);
    setValue('server_id', proxy.server?.server_id || 0);
  }, [proxy, setValue]);

  const onSubmit = async (data: UpdateProxyFormData) => {
    try {
      await updateProxy(proxy.proxy_id, data);
      toast.success(t('ServersProxiesSection.updateSuccess'));
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('ServersProxiesSection.updateError')
      );
    }
  };

  // Опції для вибору серверів
  const serverOptions = useMemo(() => {
    const options = [t('ServersProxiesSection.selectServer')];
    options.push(...servers.map(server => server.server_name));
    return options;
  }, [servers, t]);

  // Опції для вибору гео
  const geoOptions = useMemo(() => {
    const options = [t('AutoFarmSection.geoSelect')];
    if (geosModesStatuses?.geos) {
      options.push(
        ...geosModesStatuses.geos.map(geo => geo.user_friendly_name)
      );
    }
    return options;
  }, [geosModesStatuses, t]);

  // Отримання поточного server_id для відображення в CustomSelect
  const currentServerId = watch('server_id');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.host')}:
        </label>
        <input
          className={`${styles.input} ${errors.host ? styles.input_error : ''}`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('host', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.host && <p className={styles.error}>{errors.host.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.port')}:
        </label>
        <input
          className={`${styles.input} ${errors.port ? styles.input_error : ''}`}
          type="number"
          placeholder={t('DBSettings.form.placeholder')}
          {...register('port', {
            required: t('DBSettings.form.errorMessage'),
            valueAsNumber: true,
          })}
        />
        {errors.port && <p className={styles.error}>{errors.port.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.login')}:
        </label>
        <input
          className={`${styles.input} ${
            errors.modem ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('modem', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.modem && <p className={styles.error}>{errors.modem.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.password')}:
        </label>
        <input
          className={`${styles.input} ${
            errors.password ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('password', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.password && (
          <p className={styles.error}>{errors.password.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.rotationLink')}:
        </label>
        <input
          className={`${styles.input} ${
            errors.change_ip_link ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('change_ip_link')}
        />
        {errors.change_ip_link && (
          <p className={styles.error}>{errors.change_ip_link.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.geo')}:
        </label>
        <CustomSelect
          options={geoOptions}
          selected={[watch('geo')]}
          onSelect={([geo]) => setValue('geo', geo)}
          width={200}
          multiSelections={false}
        />
        {errors.geo && <p className={styles.error}>{errors.geo.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.provider')}:
        </label>
        <input
          className={`${styles.input} ${
            errors.provider ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('provider')}
        />
        {errors.provider && (
          <p className={styles.error}>{errors.provider.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.operator')}:
        </label>
        <input
          className={`${styles.input} ${
            errors.operator ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('operator')}
        />
        {errors.operator && (
          <p className={styles.error}>{errors.operator.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('ServersProxiesSection.serverName')}:
        </label>
        <CustomSelect
          options={serverOptions}
          selected={
            currentServerId
              ? [
                  servers.find(s => s.server_id === currentServerId)
                    ?.server_name || t('ServersProxiesSection.selectServer'),
                ]
              : [t('ServersProxiesSection.selectServer')]
          }
          onSelect={([serverName]) =>
            setValue(
              'server_id',
              serverName === t('ServersProxiesSection.selectServer')
                ? 0
                : servers.find(s => s.server_name === serverName)?.server_id ||
                    0
            )
          }
          width={200}
          multiSelections={false}
        />
        {errors.server_id && (
          <p className={styles.error}>{errors.server_id.message}</p>
        )}
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn text="ServersProxiesSection.cancel" onClick={onClose} />
        <SubmitBtn text="ServersProxiesSection.save" />
      </div>
    </form>
  );
}
