import styles from './Icon.module.css';

interface IconProps {
  name: string;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  width = 24,
  height = 24,
  color = 'currentColor',
  className,
}) => {
  return (
    <svg
      className={`${className} ${styles.icon}`}
      width={width}
      height={height}
      fill={color}
    >
      <use href={`/assets/icons.svg#${name}`} />
    </svg>
  );
};

export default Icon;
