import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';

export default function ShowNamesDescription({
  description = '',
  onClose,
}: {
  description: string;
  onClose: () => void;
}) {
  return (
    <>
      <div className={styles.field}>
        <p className={`${styles.input} ${styles.textarea}`}>{description}</p>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="Names.modalShowNamesDescription.closeBtn"
          onClick={() => {
            onClose();
          }}
        />
      </div>
    </>
  );
}
