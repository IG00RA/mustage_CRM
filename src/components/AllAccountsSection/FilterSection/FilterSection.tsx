import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import DateRangeSelector from '@/components/Buttons/DateRangeSelector/DateRangeSelector';
import SearchInput from '@/components/Buttons/SearchInput/SearchInput';
import { Account, RangeType } from '@/types/salesTypes';
import styles from '../AllAccountsSection.module.css';

interface FilterSectionProps {
  categoryOptions: string[];
  subcategoryOptions: string[];
  statusOptions: string[];
  transferOptions: string[];
  sellerOptions: string[];
  selectedCategoryIds: string[];
  selectedSubcategoryIds: string[];
  selectedStatuses: string[];
  selectedTransfers: string[];
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
  onSellerSelect: (values: string[]) => void;
  onSellDateRangeChange: (newRange: RangeType) => void;
  onSellCustomDatesChange: (start: string, end: string) => void;
  onLoadDateRangeChange: (newRange: RangeType) => void;
  onLoadCustomDatesChange: (start: string, end: string) => void;
  onSearch: (query: string) => void;
  accounts: Account[];
  categoryMap: Map<number, string>;
  t: (key: string) => string;
}

export const FilterSection = ({
  categoryOptions,
  subcategoryOptions,
  statusOptions,
  transferOptions,
  sellerOptions,
  selectedCategoryIds,
  selectedSubcategoryIds,
  selectedStatuses,
  selectedTransfers,
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
  onSellerSelect,
  onSellDateRangeChange,
  onSellCustomDatesChange,
  onLoadDateRangeChange,
  onLoadCustomDatesChange,
  onSearch,
  accounts,
  categoryMap,
  t,
}: FilterSectionProps) => (
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
      width={508}
      selectWidth={383}
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
      width={508}
      selectWidth={383}
    />
    <CustomSelect
      label={t('AllAccounts.selects.seller')}
      options={sellerOptions}
      selected={
        selectedSellerIds.length > 0
          ? selectedSellerIds.map(id => categoryMap.get(parseInt(id)) || '')
          : [t('AllAccounts.selects.sellerAll')]
      }
      onSelect={onSellerSelect}
      width={508}
      selectWidth={383}
    />
    <CustomSelect
      label={t('AllAccounts.selects.categories')}
      options={categoryOptions}
      selected={
        selectedCategoryIds.length > 0
          ? selectedCategoryIds.map(id => categoryMap.get(parseInt(id)) || '')
          : [t('AllAccounts.selects.allCategories')]
      }
      onSelect={onCategorySelect}
      width={508}
      selectWidth={383}
    />
    <CustomSelect
      label={t('AllAccounts.selects.names')}
      options={subcategoryOptions}
      selected={
        selectedSubcategoryIds.length > 0
          ? selectedSubcategoryIds.map(
              id => categoryMap.get(parseInt(id)) || ''
            )
          : [t('AllAccounts.selects.allNames')]
      }
      onSelect={onSubcategorySelect}
      width={508}
      selectWidth={383}
    />
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
  </div>
);
