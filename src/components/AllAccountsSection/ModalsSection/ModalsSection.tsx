import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import ViewSettings from '@/components/ModalComponent/ViewSettings/ViewSettings';
import styles from '../AllAccountsSection.module.css';

interface ModalsSectionProps {
  isOpenEdit: boolean; // Чи відкрите модальне вікно редагування
  isOpenDownload: boolean; // Чи відкрите модальне вікно завантаження
  onToggleEditModal: () => void; // Функція для перемикання модального вікна редагування
  onToggleDownload: () => void; // Функція для перемикання модального вікна завантаження
  selectedColumns: string[]; // Обрані колонки для відображення в таблиці
  onSaveSettings: (newSelectedColumns: string[]) => void; // Функція для збереження налаштувань колонок
  onExportFilteredToExcel: () => Promise<void>; // Функція для експорту відфільтрованих даних у Excel
  onExportAllToExcel: () => Promise<void>; // Функція для експорту всіх даних у Excel
  t: (key: string) => string; // Функція перекладу з next-intl
}

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
