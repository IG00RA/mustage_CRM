import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import ViewSettings from '@/components/ModalComponent/ViewSettings/ViewSettings';
import styles from '../AllAccountsSection.module.css';

interface ModalsSectionProps {
  isOpenEdit: boolean;
  isOpenDownload: boolean;
  onToggleEditModal: () => void;
  onToggleDownload: () => void;
  selectedColumns: string[];
  onSaveSettings: (newSelectedColumns: string[]) => void;
  onExportFilteredToExcel: () => Promise<void>;
  onExportAllToExcel: () => Promise<void>;
  t: (key: string) => string;
}

const settingsOptions = [
  'AllAccounts.modalUpdate.selects.id',
  'AllAccounts.modalUpdate.selects.name',
  'AllAccounts.modalUpdate.selects.category',
  'AllAccounts.modalUpdate.selects.seller',
  'AllAccounts.modalUpdate.selects.transfer',
  'AllAccounts.modalUpdate.selects.data',
  'AllAccounts.modalUpdate.selects.mega',
];

export const ModalsSection = ({
  isOpenEdit,
  isOpenDownload,
  onToggleEditModal,
  onToggleDownload,
  selectedColumns,
  onSaveSettings,
  onExportFilteredToExcel,
  onExportAllToExcel,
  t,
}: ModalsSectionProps) => (
  <>
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
      <div className={styles.modal_btn_wrap}>
        <WhiteBtn
          onClick={onExportFilteredToExcel}
          text={'AllAccounts.downloadBtn'}
          icon="icon-cloud-download"
          iconFill="icon-cloud-download-fill"
        />
        <WhiteBtn
          onClick={onExportAllToExcel}
          text={'AllAccounts.downloadBtnAll'}
          icon="icon-cloud-download"
          iconFill="icon-cloud-download-fill"
        />
      </div>
    </ModalComponent>
  </>
);
