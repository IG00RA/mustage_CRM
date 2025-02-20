import { useState } from 'react';
import styles from './CustomButtonsInput.module.css';
import Icon from '@/helpers/Icon';

interface CustomButtonsInputProps {
  buttons: string[];
}

const CustomButtonsInput: React.FC<CustomButtonsInputProps> = ({ buttons }) => {
  const [activeButtons, setActiveButtons] = useState(buttons);

  const removeButton = (label: string) => {
    setActiveButtons(activeButtons.filter(btn => btn !== label));
  };

  return (
    <div className={styles.container}>
      {activeButtons.map(btn => (
        <div key={btn} className={styles.button}>
          {btn}
          <button
            type="button"
            className={styles.close}
            onClick={() => removeButton(btn)}
          >
            <Icon
              name="icon-close-small"
              className={styles.check_icon}
              width={16}
              height={16}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CustomButtonsInput;
