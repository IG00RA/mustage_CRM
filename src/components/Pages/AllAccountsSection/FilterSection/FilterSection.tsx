import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import DateRangeSelector from '@/components/Buttons/DateRangeSelector/DateRangeSelector';
import SearchInput from '@/components/Buttons/SearchInput/SearchInput';
import styles from '../AllAccountsSection.module.css';
import { Account } from '@/types/accountsTypes';
import { RangeType } from '@/types/salesTypes';
import { useEffect, useState } from 'react';

interface FilterSectionProps {
  categoryOptions: string[];
  subcategoryOptions: string[];
  statusOptions: string[];
  transferOptions: string[];
  inSetOptions: string[];
  sellerOptions: string[];
  selectedCategoryIds: string[];
  selectedSubcategoryIds: string[];
  selectedStatuses: string[];
  selectedTransfers: string[];
  selectedInSet: string[];
  selectedSellerIds: string[];
  sellDateRange: RangeType;
  loadDateRange: RangeType;
  sellCustomStartDate: string;
  sellCustomEndDate: string;
  loadCustomStartDate: string;
  loadCustomEndDate: string;
  onCategorySelect: (values: string[]) => void;
  onSubcategorySelect: (values: string[]) => void;
  onStatusSelect: (values: string[]) => void;
  onTransferSelect: (values: string[]) => void;
  onInSetSelect: (values: string[]) => void;
  onSellerSelect: (values: string[]) => void;
  onSellDateRangeChange: (newRange: RangeType) => void;
  onSellCustomDatesChange: (start: string, end: string) => void;
  onLoadDateRangeChange: (newRange: RangeType) => void;
  onLoadCustomDatesChange: (start: string, end: string) => void;
  onSearch: (query: string) => void;
  accounts: Account[];
  categoryMap: Map<number, string>;
  subcategoryMap: Map<number, string>;
  sellerMap: Map<number, string | null | undefined>;
  t: (key: string) => string;
  hasReadCategories: boolean;
  hasReadSubcategories: boolean;
}

export const FilterSection = ({
  categoryOptions,
  subcategoryOptions,
  statusOptions,
  transferOptions,
  inSetOptions,
  sellerOptions,
  selectedCategoryIds,
  selectedSubcategoryIds,
  selectedStatuses,
  selectedTransfers,
  selectedInSet,
  selectedSellerIds,
  sellDateRange,
  loadDateRange,
  sellCustomStartDate,
  sellCustomEndDate,
  loadCustomStartDate,
  loadCustomEndDate,
  onCategorySelect,
  onSubcategorySelect,
  onStatusSelect,
  onTransferSelect,
  onInSetSelect,
  onSellerSelect,
  onSellDateRangeChange,
  onSellCustomDatesChange,
  onLoadDateRangeChange,
  onLoadCustomDatesChange,
  onSearch,
  accounts,
  categoryMap,
  subcategoryMap,
  sellerMap,
  t,
  hasReadCategories,
  hasReadSubcategories,
}: FilterSectionProps) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className={styles.select_wrap}>
        <CustomSelect
          label={t('AllAccounts.selects.status')}
          options={statusOptions}
          selected={
            selectedStatuses.length > 0
              ? selectedStatuses.map(status =>
                  t(`AllAccounts.selects.status${status}`)
                )
              : [t('AllAccounts.selects.allStatus')]
          }
          onSelect={onStatusSelect}
          width={isMobile ? '' : 508}
          selectWidth={isMobile ? '' : 383}
        />
        <CustomSelect
          label={t('AllAccounts.selects.transfer')}
          options={transferOptions}
          selected={
            selectedTransfers.length > 0
              ? selectedTransfers
              : [t('AllAccounts.selects.allTransfer')]
          }
          multiSelections={false}
          onSelect={onTransferSelect}
          width={isMobile ? '' : 508}
          selectWidth={isMobile ? '' : 383}
        />
        <CustomSelect
          label={t('AllAccounts.selects.inSet')}
          options={inSetOptions}
          selected={
            selectedInSet.length > 0
              ? selectedInSet
              : [t('AllAccounts.selects.allInSet')]
          }
          multiSelections={false}
          onSelect={onInSetSelect}
          width={isMobile ? '' : 508}
          selectWidth={isMobile ? '' : 383}
        />
        <CustomSelect
          label={t('AllAccounts.selects.seller')}
          options={sellerOptions}
          selected={
            selectedSellerIds.length > 0
              ? selectedSellerIds.map(id => sellerMap.get(parseInt(id)) || '')
              : [t('AllAccounts.selects.sellerAll')]
          }
          onSelect={onSellerSelect}
          width={isMobile ? '' : 508}
          selectWidth={isMobile ? '' : 383}
        />
        {hasReadCategories && (
          <CustomSelect
            label={t('AllAccounts.selects.categories')}
            options={categoryOptions}
            selected={
              selectedCategoryIds.length > 0
                ? selectedCategoryIds.map(
                    id => categoryMap.get(parseInt(id)) || ''
                  )
                : [t('AllAccounts.selects.allCategories')]
            }
            onSelect={onCategorySelect}
            width={isMobile ? '' : 508}
            selectWidth={isMobile ? '' : 383}
          />
        )}
        {hasReadSubcategories && (
          <CustomSelect
            label={t('AllAccounts.selects.names')}
            options={subcategoryOptions}
            selected={
              selectedSubcategoryIds.length > 0
                ? selectedSubcategoryIds.map(
                    id => subcategoryMap.get(parseInt(id)) || ''
                  )
                : [t('AllAccounts.selects.allNames')]
            }
            onSelect={onSubcategorySelect}
            width={isMobile ? '' : 508}
            selectWidth={isMobile ? '' : 383}
          />
        )}
      </div>
      <div className={styles.sell_wrap}>
        <DateRangeSelector
          label="AllAccounts.sellDate"
          dateRange={sellDateRange}
          customPeriodLabel={
            sellCustomStartDate && sellCustomEndDate
              ? `${sellCustomStartDate} - ${sellCustomEndDate}`
              : ''
          }
          onDateRangeChange={onSellDateRangeChange}
          onCustomDatesChange={onSellCustomDatesChange}
          initialStartDate={sellCustomStartDate}
          initialEndDate={sellCustomEndDate}
        />
      </div>
      <div className={styles.search_wrap}>
        <DateRangeSelector
          label="AllAccounts.loadDate"
          dateRange={loadDateRange}
          customPeriodLabel={
            loadCustomStartDate && loadCustomEndDate
              ? `${loadCustomStartDate} - ${loadCustomEndDate}`
              : ''
          }
          onDateRangeChange={onLoadDateRangeChange}
          onCustomDatesChange={onLoadCustomDatesChange}
          initialStartDate={loadCustomStartDate}
          initialEndDate={loadCustomEndDate}
        />
        <SearchInput
          onSearch={onSearch}
          text={'AllAccounts.searchBtn'}
          options={Array.from(
            new Set(
              accounts?.map(
                acc =>
                  categoryMap.get(acc.subcategory?.account_category_id) || 'N/A'
              )
            )
          )}
        />
      </div>
    </>
  );
};
