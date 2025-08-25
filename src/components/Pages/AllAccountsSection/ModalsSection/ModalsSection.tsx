import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import ViewSettings from '@/components/ModalComponent/ViewSettings/ViewSettings';
import styles from '../AllAccountsSection.module.css';
import { useState } from 'react';
import AccHistory from '@/components/ModalComponent/AccHistory/AccHistory';

interface ModalsSectionProps {
  isOpenEdit: boolean;
  isOpenDownload: boolean;
  onToggleEditModal: () => void;
  onToggleDownload: () => void;
  selectedColumns: string[];
  isOpenAccHistory: boolean;
  selectedAccount: {
    id: number;
    name: string;
  } | null;
  onToggleAccHistoryModal: () => void;
  onSaveSettings: (newSelectedColumns: string[]) => void;
  onExportFilteredToExcel: () => Promise<void>;
  onExportAllToExcel: () => Promise<void>;
  onExportSalesReport: () => Promise<void>;
  t?: (key: string) => string;
  settingsOptions: string[];
}

export const ModalsSection = ({
  isOpenEdit,
  isOpenDownload,
  onToggleEditModal,
  onToggleDownload,
  selectedColumns,
  isOpenAccHistory,
  selectedAccount,
  onToggleAccHistoryModal,
  onSaveSettings,
  onExportFilteredToExcel,
  onExportAllToExcel,
  onExportSalesReport,
  settingsOptions,
}: ModalsSectionProps) => {
  const [isExportFilteredLoading, setIsExportFilteredLoading] = useState(false);
  const [isExportAllLoading, setIsExportAllLoading] = useState(false);
  const [isExportSalesLoading, setIsExportSalesLoading] = useState(false);

  const handleExportFiltered = async () => {
    setIsExportFilteredLoading(true);
    try {
      await onExportFilteredToExcel();
    } finally {
      setIsExportFilteredLoading(false);
    }
  };

  const handleExportAll = async () => {
    setIsExportAllLoading(true);
    try {
      await onExportAllToExcel();
    } finally {
      setIsExportAllLoading(false);
    }
  };

  const handleExportSales = async () => {
    setIsExportSalesLoading(true);
    try {
      await onExportSalesReport();
    } finally {
      setIsExportSalesLoading(false);
    }
  };

  return (
    <>
      <ModalComponent
        isOpen={isOpenAccHistory}
        onClose={onToggleAccHistoryModal}
        title="AllAccounts.historyTitle"
        editedTitle={selectedAccount?.name}
      >
        <AccHistory
          onClose={onToggleAccHistoryModal}
          accountId={selectedAccount?.id}
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenEdit}
        onClose={onToggleEditModal}
        title="AllAccounts.modalUpdate.title"
        text="AllAccounts.modalUpdate.description"
      >
        <ViewSettings
          defaultColumns={settingsOptions}
          onClose={onToggleEditModal}
          selectedColumns={selectedColumns}
          onSave={onSaveSettings}
        />
      </ModalComponent>
      <ModalComponent
        title="AllAccounts.modalUpdate.titleDownload"
        isOpen={isOpenDownload}
        onClose={onToggleDownload}
      >
        <div className={styles.modal_btns_wrap}>
          <div className={styles.modal_btn_wrap}>
            <WhiteBtn
              onClick={handleExportFiltered}
              disabled={isExportFilteredLoading}
              text={
                isExportFilteredLoading
                  ? 'AllAccounts.downloadBtLoad'
                  : 'AllAccounts.downloadBtn'
              }
              icon="icon-cloud-download"
              iconFill="icon-cloud-download-fill"
            />
            <WhiteBtn
              disabled={isExportAllLoading}
              onClick={handleExportAll}
              text={
                isExportAllLoading
                  ? 'AllAccounts.downloadBtLoad'
                  : 'AllAccounts.downloadBtnAll'
              }
              icon="icon-cloud-download"
              iconFill="icon-cloud-download-fill"
            />
          </div>
          <WhiteBtn
            disabled={isExportSalesLoading}
            onClick={handleExportSales}
            text={
              isExportSalesLoading
                ? 'AllAccounts.downloadBtLoad'
                : 'AllAccounts.salesReportBtn'
            }
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
        </div>
      </ModalComponent>
    </>
  );
};
