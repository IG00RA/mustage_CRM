'use client';

import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './CreateReferral.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import { useUsersStore } from '@/store/usersStore';
import { PaymentModel, useReferralsStore } from '@/store/referralsStore';

interface FormData {
  login: string;
  pass: string;
  name: string;
  secondName: string;
  tgId: number;
  tgNick: string;
  email: string;
  sellPay?: number;
  sellSum?: number;
  addPay?: number;
  addSum?: number;
  minPay?: number;
  minPaySell?: number;
}

export default function CreateReferral({ onClose }: { onClose: () => void }) {
  const t = useTranslations('');
  const { createUser, loading: userLoading } = useUsersStore();
  const { savePaymentSettings, loading: referralLoading } = useReferralsStore();

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({
    'ReferralsAll.modalCreate.sellCheck': false,
    'ReferralsAll.modalCreate.add': false,
  });
  const [sellModel, setSellModel] = useState<string[]>([]);
  const [addModel, setAddModel] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      minPay: 0,
      minPaySell: 0,
    },
  });

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const userData = {
        login: data.login,
        password: data.pass,
        first_name: data.name,
        last_name: data.secondName,
        email: data.email,
        is_admin: false,
        is_referral: true,
        telegram_id: data.tgId,
        telegram_username: data.tgNick,
        functions: [],
        notifications_for_subcategories: [],
      };

      const userResponse = await createUser(userData);
      const referrerId = userResponse.id || Number(userResponse.login);

      const paymentModels: PaymentModel[] = [];

      if (
        checkedSettings['ReferralsAll.modalCreate.sellCheck'] &&
        sellModel.length > 0
      ) {
        const selectedSellModel = sellModel[0];
        paymentModels.push({
          payment_model: selectedSellModel as 'RevShare' | 'CPA',
          payment_reason: 'AccountsSold',
          ...(selectedSellModel === 'RevShare' && { percentage: data.sellPay }),
          ...(selectedSellModel === 'CPA' && { fixed: data.sellSum }),
          ...(selectedSellModel === 'CPA' && {
            min_amount: data.minPaySell || 0,
          }),
        });
      }

      if (
        checkedSettings['ReferralsAll.modalCreate.add'] &&
        addModel.length > 0
      ) {
        const selectedAddModel = addModel[0];
        paymentModels.push({
          payment_model: selectedAddModel as 'RevShare' | 'CPA',
          payment_reason: 'BalanceTopUp',
          ...(selectedAddModel === 'RevShare' && { percentage: data.addPay }),
          ...(selectedAddModel === 'CPA' && { fixed: data.addSum }),
          ...(selectedAddModel === 'CPA' && { min_amount: data.minPay || 0 }),
        });
      }

      if (paymentModels.length > 0) {
        await savePaymentSettings({
          referrer_id: referrerId,
          payment_models: paymentModels,
        });
      }

      toast.success(
        t('ReferralsAll.modalCreate.successMessage') ||
          'Referral created successfully'
      );
      reset();
    } catch (error) {
      console.log('error', error);
      toast.error(
        t('ReferralsAll.modalCreate.errorMessage') ||
          'Failed to create referral'
      );
    }
  };

  const isSellChecked = checkedSettings['ReferralsAll.modalCreate.sellCheck'];
  const isAddChecked = checkedSettings['ReferralsAll.modalCreate.add'];
  const selectedSellModel = sellModel[0] || '';
  const selectedAddModel = addModel[0] || '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={ownStyles.field_wrap_main}>
        <div className={ownStyles.field_wrap}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.name')}
            </label>
            <input
              className={`${styles.input} ${
                errors.name ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('name', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.name && (
              <p className={styles.error}>{errors.name.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.secondName')}
            </label>
            <input
              className={`${styles.input} ${
                errors.secondName ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('secondName', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.secondName && (
              <p className={styles.error}>{errors.secondName.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.tg')}
            </label>
            <input
              className={`${styles.input} ${
                errors.tgId ? styles.input_error : ''
              }`}
              type="number"
              placeholder={t('DBSettings.form.placeholder')}
              {...register('tgId', {
                required: t('DBSettings.form.errorMessage'),
                min: {
                  value: 0,
                  message: t('ReferralsAll.modalCreate.minValueError'),
                },
              })}
            />
            {errors.tgId && (
              <p className={styles.error}>{errors.tgId.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.tgNick')}
            </label>
            <input
              className={`${styles.input} ${
                errors.tgNick ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('tgNick', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.tgNick && (
              <p className={styles.error}>{errors.tgNick.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.email')}
            </label>
            <input
              className={`${styles.input} ${
                errors.email ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              type="email"
              {...register('email', {
                required: t('DBSettings.form.errorMessage'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('ReplacementSection.invalidEmail'),
                },
              })}
            />
            {errors.email && (
              <p className={styles.error}>{errors.email.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.login')}
            </label>
            <input
              className={`${styles.input} ${
                errors.login ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('login', {
                required: t('DBSettings.form.errorMessage'),
                minLength: {
                  value: 5,
                  message: `${t('DBSettings.form.minLengthError')} 5 ${t(
                    'DBSettings.form.minLengthErrorSec'
                  )}`,
                },
              })}
            />
            {errors.login && (
              <p className={styles.error}>{errors.login.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('ReferralsAll.modalCreate.pass')}
            </label>
            <input
              className={`${styles.input} ${
                errors.pass ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              type="password"
              {...register('pass', {
                required: t('DBSettings.form.errorMessage'),
                minLength: {
                  value: 8,
                  message: `${t('DBSettings.form.minLengthPassError')} 8 ${t(
                    'DBSettings.form.minLengthPassErrorSec'
                  )}`,
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                  message: t('DBSettings.form.passwordPatternError'),
                },
              })}
            />
            {errors.pass && (
              <p className={styles.error}>{errors.pass.message}</p>
            )}
          </div>
        </div>
        <div className={ownStyles.field_wrap_second}>
          <div className={styles.field}>
            <label className={`${styles.label} ${ownStyles.label}`}>
              {t('ReferralsAll.modalCreate.defaultModel')}
            </label>
            <CustomCheckbox
              checked={checkedSettings['ReferralsAll.modalCreate.sellCheck']}
              onChange={() =>
                toggleCheckbox('ReferralsAll.modalCreate.sellCheck')
              }
              label={t('ReferralsAll.modalCreate.sellCheck')}
            />
          </div>
          {isSellChecked && (
            <div className={ownStyles.buttons_wrap}>
              <div className={styles.field}>
                <label className={styles.label}>
                  {t('ReferralsAll.modalCreate.sellModel')}
                </label>
                <CustomSelect
                  options={[
                    t('ReferralsAll.modalCreate.all'),
                    'RevShare',
                    'CPA',
                  ]}
                  selected={sellModel}
                  width={180}
                  onSelect={values => setSellModel(values)}
                  multiSelections={false}
                />
              </div>
              {selectedSellModel === 'RevShare' && (
                <div className={`${styles.field} ${ownStyles.field}`}>
                  <label className={styles.label}>
                    {t('ReferralsAll.modalCreate.percent')}
                  </label>
                  <input
                    className={`${styles.input} ${
                      errors.sellPay ? styles.input_error : ''
                    }`}
                    type="number"
                    placeholder="10%"
                    {...register('sellPay', {
                      required: t('DBSettings.form.errorMessage'),
                      min: {
                        value: 0,
                        message: t('ReferralsAll.modalCreate.minValueError'),
                      },
                      max: {
                        value: 100,
                        message: t('ReferralsAll.modalCreate.maxPercentError'),
                      },
                    })}
                  />
                  {errors.sellPay && (
                    <p className={styles.error}>{errors.sellPay.message}</p>
                  )}
                </div>
              )}
              {selectedSellModel === 'CPA' && (
                <div className={`${styles.field} ${ownStyles.field}`}>
                  <label className={styles.label}>
                    {t('ReferralsAll.modalCreate.sum')}
                  </label>
                  <input
                    className={`${styles.input} ${
                      errors.sellSum ? styles.input_error : ''
                    }`}
                    type="number"
                    placeholder="10$"
                    {...register('sellSum', {
                      required: t('DBSettings.form.errorMessage'),
                      min: {
                        value: 0,
                        message: t('ReferralsAll.modalCreate.minValueError'),
                      },
                    })}
                  />
                  {errors.sellSum && (
                    <p className={styles.error}>{errors.sellSum.message}</p>
                  )}
                </div>
              )}
            </div>
          )}
          {selectedSellModel === 'CPA' && isSellChecked && (
            <div className={styles.field}>
              <label className={styles.label}>
                {t('ReferralsAll.modalCreate.minSum')}
              </label>
              <input
                className={`${styles.input} ${
                  errors.minPay ? styles.input_error : ''
                }`}
                type="number"
                placeholder="100$"
                {...register('minPay', {
                  min: {
                    value: 0,
                    message: t('ReferralsAll.modalCreate.minValueError'),
                  },
                })}
              />
              {errors.minPay && (
                <p className={styles.error}>{errors.minPay.message}</p>
              )}
            </div>
          )}
          <div className={styles.field}>
            <CustomCheckbox
              checked={checkedSettings['ReferralsAll.modalCreate.add']}
              onChange={() => toggleCheckbox('ReferralsAll.modalCreate.add')}
              label={t('ReferralsAll.modalCreate.add')}
            />
          </div>
          {isAddChecked && (
            <div className={ownStyles.buttons_wrap}>
              <div className={styles.field}>
                <label className={styles.label}>
                  {t('ReferralsAll.modalCreate.sellModel')}
                </label>
                <CustomSelect
                  options={[
                    t('ReferralsAll.modalCreate.all'),
                    'RevShare',
                    'CPA',
                  ]}
                  width={180}
                  selected={addModel}
                  onSelect={values => setAddModel(values)}
                  multiSelections={false}
                />
              </div>
              {selectedAddModel === 'RevShare' && (
                <div className={`${styles.field} ${ownStyles.field}`}>
                  <label className={styles.label}>
                    {t('ReferralsAll.modalCreate.percent')}
                  </label>
                  <input
                    className={`${styles.input} ${
                      errors.addPay ? styles.input_error : ''
                    }`}
                    type="number"
                    placeholder="10%"
                    {...register('addPay', {
                      required: t('DBSettings.form.errorMessage'),
                      min: {
                        value: 0,
                        message: t('ReferralsAll.modalCreate.minValueError'),
                      },
                      max: {
                        value: 100,
                        message: t('ReferralsAll.modalCreate.maxPercentError'),
                      },
                    })}
                  />
                  {errors.addPay && (
                    <p className={styles.error}>{errors.addPay.message}</p>
                  )}
                </div>
              )}
              {selectedAddModel === 'CPA' && (
                <div className={`${styles.field} ${ownStyles.field}`}>
                  <label className={styles.label}>
                    {t('ReferralsAll.modalCreate.sum')}
                  </label>
                  <input
                    className={`${styles.input} ${
                      errors.addSum ? styles.input_error : ''
                    }`}
                    type="number"
                    placeholder="10$"
                    {...register('addSum', {
                      required: t('DBSettings.form.errorMessage'),
                      min: {
                        value: 0,
                        message: t('ReferralsAll.modalCreate.minValueError'),
                      },
                    })}
                  />
                  {errors.addSum && (
                    <p className={styles.error}>{errors.addSum.message}</p>
                  )}
                </div>
              )}
            </div>
          )}
          {selectedAddModel === 'CPA' && isAddChecked && (
            <div className={styles.field}>
              <label className={styles.label}>
                {t('ReferralsAll.modalCreate.minSumSell')}
              </label>
              <input
                className={`${styles.input} ${
                  errors.minPaySell ? styles.input_error : ''
                }`}
                type="number"
                placeholder="100$"
                {...register('minPaySell', {
                  min: {
                    value: 0,
                    message: t('ReferralsAll.modalCreate.minValueError'),
                  },
                })}
              />
              {errors.minPaySell && (
                <p className={styles.error}>{errors.minPaySell.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DBSettings.form.cancelBtn"
          onClick={() => {
            reset();
            onClose();
          }}
        />
        <SubmitBtn
          text={
            userLoading || referralLoading
              ? 'ReferralsAll.modalCreate.loading'
              : 'ReferralsAll.modalCreate.addBtn'
          }
          disabled={userLoading || referralLoading}
        />
      </div>
    </form>
  );
}
