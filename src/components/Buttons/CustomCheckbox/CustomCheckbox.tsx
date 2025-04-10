import Icon from '@/helpers/Icon';
import styles from './CustomCheckbox.module.css';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
}: CustomCheckboxProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange();
    }
  };

  return (
    <div
      className={`${styles.checkbox_container} ${
        disabled ? styles.disabled : ''
      }`}
      onClick={handleClick}
    >
      <span
        className={`${styles.checkbox} ${
          checked ? styles.checkbox_check : ''
        } ${disabled ? styles.checkbox_disabled : ''}`}
      >
        <Icon
          name="icon-check-box_checked"
          className={styles.check_icon}
          width={18}
          height={18}
        />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
