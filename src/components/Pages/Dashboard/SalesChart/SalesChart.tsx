'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import styles from './SalesChart.module.css';
import useExportToExcel from '@/hooks/useExportToExcel';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import { useSalesStore } from '@/store/salesStore';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import ChartDisplay from './ChartDisplay';
import Loader from '@/components/Loader/Loader';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useUsersStore } from '@/store/usersStore';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import DateRangeSelector from '@/components/Buttons/DateRangeSelector/DateRangeSelector';
import { RangeType, AggregationType } from '@/types/salesTypes';
import { useSellersStore } from '@/store/sellersStore';

interface SalesChartProps {
  selectedSellerIds: string[];
  setSelectedSellerIds: (ids: string[]) => void;
}

const SalesChart: React.FC<SalesChartProps> = ({
  selectedSellerIds,
  setSelectedSellerIds,
}) => {
  const t = useTranslations();
  const { currentUser } = useUsersStore();
  const [isOpenDownload, setIsOpenDownload] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [dataType, setDataType] = useState<'amount' | 'quantity'>('amount');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    number[]
  >([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [aggregationType, setAggregationType] = useState<AggregationType>(null);

  const { sellers, fetchSellers, error: sellersError } = useSellersStore();

  const {
    chartSales,
    error: salesError,
    dateRange,
    yearlyChange,
    customPeriodLabel,
    setsDisplay,
    setDateRange,
    setCustomPeriodLabel,
    setSetsDisplay,
  } = useSalesStore();

  const {
    categories,
    subcategories,
    fetchCategories,
    fetchSubcategories,
    error: categoriesError,
  } = useCategoriesStore();

  const isFunctionsEmpty = currentUser?.functions.length === 0;
  const categoryPermissions =
    currentUser?.functions.find(
      func => func.function_id === 2 && func.function_name === 'Категории'
    )?.operations || [];
  const subcategoryPermissions =
    currentUser?.functions.find(
      func => func.function_id === 3 && func.function_name === 'Подкатегории'
    )?.operations || [];
  const hasReadCategories =
    isFunctionsEmpty || categoryPermissions.includes('READ');
  const hasReadSubcategories =
    isFunctionsEmpty || subcategoryPermissions.includes('READ');

  useEffect(() => {
    if (chartSales.length !== 0) {
      setShowLoader(false);
    } else {
      setShowLoader(true);
    }
  }, [chartSales]);

  useEffect(() => {
    if (hasReadCategories && categories.length === 0) {
      fetchCategories();
    }
  }, [categories, fetchCategories, hasReadCategories]);

  useEffect(() => {
    if (currentUser?.is_admin && sellers.length === 0) {
      fetchSellers();
    }
  }, [sellers, fetchSellers, currentUser]);

  useEffect(() => {
    if (hasReadSubcategories) {
      fetchSubcategories();
    }
  }, [selectedCategoryIds, fetchSubcategories, hasReadSubcategories]);

  useEffect(() => {
    if (
      (dateRange !== 'custom' ||
        (dateRange === 'custom' && customPeriodLabel)) &&
      (dateRange !== 'all' || (dateRange === 'all' && aggregationType))
    ) {
      useSalesStore
        .getState()
        .fetchSalesAndYearlyChange(
          dateRange,
          dateRange === 'custom' && customStartDate
            ? customStartDate.split('.').reverse().join('-')
            : undefined,
          dateRange === 'custom' && customEndDate
            ? customEndDate.split('.').reverse().join('-')
            : undefined,
          hasReadCategories && selectedCategoryIds.length > 0
            ? selectedCategoryIds.length === 1
              ? selectedCategoryIds[0]
              : selectedCategoryIds
            : undefined,
          hasReadSubcategories && selectedSubcategoryIds.length > 0
            ? selectedSubcategoryIds.length === 1
              ? selectedSubcategoryIds[0]
              : selectedSubcategoryIds
            : undefined,
          currentUser?.is_admin && selectedSellerIds.length > 0
            ? selectedSellerIds
            : undefined,
          dateRange === 'all' ? aggregationType : undefined
        );
    }
  }, [
    dateRange,
    customPeriodLabel,
    selectedCategoryIds,
    selectedSubcategoryIds,
    selectedSellerIds,
    hasReadCategories,
    hasReadSubcategories,
    currentUser,
    setsDisplay,
    aggregationType,
    customStartDate,
    customEndDate,
  ]);

  const toggleDownload = useCallback(
    () => setIsOpenDownload(prev => !prev),
    []
  );

  const handleDateRangeChange = (newRange: RangeType) => {
    setDateRange(newRange);
    if (newRange !== 'all') {
      setAggregationType(null);
    }
    setCustomPeriodLabel('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleCustomDatesChange = (start: string, end: string) => {
    setCustomPeriodLabel(`${start} - ${end}`);
    setDateRange('custom');
    setAggregationType(null);
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  const handleAggregationChange = (aggregation: typeof aggregationType) => {
    setAggregationType(aggregation);
  };

  const exportToExcel = useExportToExcel({
    sales: chartSales,
    dateRange: dateRange === 'custom' ? customPeriodLabel : dateRange,
  });

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map(cat => [
          cat.account_category_id,
          cat.account_category_name,
        ])
      ),
    [categories]
  );

  const subcategoryMap = useMemo(
    () =>
      new Map(
        subcategories.map(sub => [
          sub.account_subcategory_id,
          sub.account_subcategory_name,
        ])
      ),
    [subcategories, selectedCategoryIds]
  );

  const handleCategorySelect = (values: string[]) => {
    const filteredValues = values.filter(
      value => value !== t('Statistics.chart.toggler.togglerAllCategory')
    );
    if (filteredValues.length === 0) {
      setSelectedCategoryIds([]);
      setSelectedSubcategoryIds([]);
    } else {
      const newSelectedIds = filteredValues
        .map(value => {
          const category = categories.find(
            cat => cat.account_category_name === value
          );
          return category ? category.account_category_id : null;
        })
        .filter((id): id is number => id !== null);
      setSelectedCategoryIds(newSelectedIds);
      if (newSelectedIds.length > 0) setSelectedSubcategoryIds([]);
    }
  };

  // const handleSubcategorySelect = (values: string[]) => {
  //   // if (selectedCategoryIds.length > 0) setSelectedCategoryIds([]);

  //   const filteredValues = values.filter(
  //     value => value !== t('Statistics.chart.toggler.togglerAllName')
  //   );

  //   if (filteredValues.length === 0) {
  //     setSelectedSubcategoryIds([]);
  //     setSelectedCategoryIds([]);
  //   } else {
  //     const newSelectedIds = filteredValues
  //       .map(value => {
  //         const subcategory = subcategories.find(
  //           sub => sub.account_subcategory_name === value
  //         );
  //         return subcategory ? subcategory.account_subcategory_id : null;
  //       })
  //       .filter((id): id is number => id !== null);
  //     setSelectedSubcategoryIds(newSelectedIds);
  //     if (newSelectedIds.length > 0) setSelectedCategoryIds([]);
  //   }
  // };

  const handleSubcategorySelect = useCallback(
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('AllAccounts.selects.allNames')
      );
      if (filteredValues.length === 0) {
        setSelectedSubcategoryIds([]);
        setSelectedCategoryIds([]);
      } else {
        const newSelectedIds = filteredValues
          .map(value => {
            const subcategory = subcategories.find(
              sub => sub.account_subcategory_name === value
            );
            return subcategory ? subcategory.account_subcategory_id : null;
          })
          .filter((id): id is number => id !== null);
        setSelectedSubcategoryIds(newSelectedIds);
        if (newSelectedIds.length > 0) setSelectedCategoryIds([]);
      }
    },
    [subcategories, t]
  );

  const handleSetsDisplaySelect = (values: string[]) => {
    const selectedValue = values[0];
    if (selectedValue === t('AllAccounts.selects.setsDisplayAcc')) {
      setSetsDisplay('setsDisplayAcc');
    } else if (selectedValue === t('AllAccounts.selects.setsDisplaySets')) {
      setSetsDisplay('setsDisplaySets');
    }
  };

  const error = salesError || categoriesError || sellersError;

  const handleSellerSelect = useCallback(
    (values: string[]) => {
      const filteredValues = values.filter(
        value => value !== t('AllAccounts.selects.sellerAll')
      );
      if (filteredValues.length === 0) {
        setSelectedSellerIds([]);
      } else {
        const newSelectedIds = filteredValues
          .map(value => {
            const seller = sellers.find(seller => seller.seller_name === value);
            return seller ? String(seller.seller_id) : null;
          })
          .filter((id): id is string => id !== null);
        setSelectedSellerIds(newSelectedIds);
      }
    },
    [sellers, t, setSelectedSellerIds]
  );

  const sellerOptions = useMemo(
    () => [
      t('AllAccounts.selects.sellerAll'),
      ...sellers.map(seller => String(seller.seller_name)).filter(name => name),
    ],
    [sellers, t]
  );

  const sellerMap = useMemo(
    () =>
      new Map(
        sellers
          .filter(seller => seller.seller_id && seller.seller_name)
          .map(seller => [seller.seller_id, seller.seller_name])
      ),
    [sellers]
  );

  return (
    <>
      <div className={styles.chart_wrap} id="chart-container">
        {showLoader && <Loader error={error} />}
        <h3 className={styles.chart_header}>{t('Statistics.chart.header')}</h3>
        <span className={styles.chart_year_text}>
          {yearlyChange !== null
            ? `(${yearlyChange > 0 ? '+' : ''}${yearlyChange}%)`
            : '(0%)'}{' '}
          {t('Statistics.chart.headerText')}
        </span>
        <div className={styles.chart_togglers_wrap}>
          <div className={styles.chart_toggler_block}>
            <span className={styles.chart_toggler_label}>
              {t('Statistics.chart.toggler.togglerType')}
            </span>
            <div className={styles.chart_toggler_buttons}>
              <button
                onClick={() => setDataType('amount')}
                className={`${styles.chart_button} ${
                  dataType === 'amount' ? styles.active : ''
                }`}
              >
                {t('Statistics.chart.toggler.togglerSum')}
              </button>
              <button
                onClick={() => setDataType('quantity')}
                className={`${styles.chart_button} ${
                  dataType === 'quantity' ? styles.active : ''
                }`}
              >
                {t('Statistics.chart.toggler.togglerQuantity')}
              </button>
            </div>
          </div>
          <DateRangeSelector
            dateRange={dateRange}
            customPeriodLabel={customPeriodLabel}
            onDateRangeChange={handleDateRangeChange}
            onCustomDatesChange={handleCustomDatesChange}
            onAggregationChange={handleAggregationChange}
            aggregationType={aggregationType}
            initialStartDate={customStartDate}
            initialEndDate={customEndDate}
            showAggregationSelect={true}
          />
        </div>

        <div className={styles.chart_category_wrap}>
          {hasReadCategories && (
            <CustomSelect
              label={t('Statistics.chart.toggler.togglerCategory')}
              options={[
                t('Statistics.chart.toggler.togglerAllCategory'),
                ...(Array.isArray(categories)
                  ? categories
                      .map(cat => cat.account_category_name)
                      .filter(name => name)
                  : []),
              ]}
              selected={
                selectedCategoryIds.length > 0
                  ? selectedCategoryIds.map(id => categoryMap.get(id) || '')
                  : [t('Statistics.chart.toggler.togglerAllCategory')]
              }
              onSelect={handleCategorySelect}
              width={350}
            />
          )}
          {hasReadSubcategories && (
            <CustomSelect
              label={t('Statistics.chart.toggler.togglerName')}
              options={[
                t('Statistics.chart.toggler.togglerAllName'),
                ...(Array.isArray(subcategories)
                  ? subcategories
                      .map(sub => sub.account_subcategory_name)
                      .filter(name => name)
                  : []),
              ]}
              selected={
                selectedSubcategoryIds.length > 0
                  ? selectedSubcategoryIds.map(
                      id => subcategoryMap.get(id) || ''
                    )
                  : [t('Statistics.chart.toggler.togglerAllName')]
              }
              onSelect={handleSubcategorySelect}
              width={430}
            />
          )}
        </div>
        <div className={styles.chart_category_wrap_bottom}>
          {currentUser?.is_admin && (
            <CustomSelect
              label={t('AllAccounts.selects.seller')}
              options={sellerOptions}
              selected={
                selectedSellerIds.length > 0
                  ? selectedSellerIds.map(
                      id => sellerMap.get(parseInt(id)) || ''
                    )
                  : [t('AllAccounts.selects.sellerAll')]
              }
              onSelect={handleSellerSelect}
              multiSelections={false}
              width={350}
            />
          )}
          <CustomSelect
            label={t('AllAccounts.selects.setsDisplay')}
            options={[
              t('AllAccounts.selects.setsDisplayAcc'),
              t('AllAccounts.selects.setsDisplaySets'),
            ]}
            selected={[
              setsDisplay === 'setsDisplayAcc'
                ? t('AllAccounts.selects.setsDisplayAcc')
                : t('AllAccounts.selects.setsDisplaySets'),
            ]}
            onSelect={handleSetsDisplaySelect}
            multiSelections={false}
            width={430}
          />
        </div>

        <ChartDisplay
          chartSales={chartSales}
          chartType={chartType}
          dataType={dataType}
        />

        <div className={styles.bottom_wrap}>
          <WhiteBtn
            onClick={toggleDownload}
            text="Statistics.chart.buttonText"
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
          <div className={styles.chart_toggler_block}>
            <span className={styles.chart_toggler_label}>
              {t('Statistics.chart.chartView')}
            </span>
            <div className={styles.chart_toggler_buttons}>
              <button
                onClick={() => setChartType('line')}
                className={`${styles.chart_button} ${
                  chartType === 'line' ? styles.active : ''
                }`}
              >
                {t('Statistics.chart.chartViewLinear')}
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`${styles.chart_button} ${
                  chartType === 'bar' ? styles.active : ''
                }`}
              >
                {t('Statistics.chart.chartViewHistogram')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ModalComponent
        title="AllAccounts.modalUpdate.titleDownload"
        isOpen={isOpenDownload}
        onClose={toggleDownload}
      >
        <div className={styles.modal_btn_wrap}>
          <WhiteBtn
            onClick={exportToExcel}
            text={'AllAccounts.downloadBtn'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
          <WhiteBtn
            onClick={exportToExcel}
            text={'AllAccounts.downloadBtnAll'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
        </div>
      </ModalComponent>
    </>
  );
};

export default SalesChart;
