import Icon from '@/helpers/Icon';
import styles from './CustomCheckbox.module.css';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
}: CustomCheckboxProps) {
  return (
    <div className={styles.checkbox_container} onClick={onChange}>
      <span
        className={`${styles.checkbox} ${checked ? styles.checkbox_check : ''}`}
      >
        <Icon
          name="icon-check-box_checked"
          className={styles.check_icon}
          width={18}
          height={18}
        />
      </span>
      {label}
    </div>
  );
}
