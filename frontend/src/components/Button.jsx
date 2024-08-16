import styles from './Button.module.css';

const Button = ({
  title,
  disabled,
  onClick,
  buttonStyles,
  containerStyles,
  type,
}) => {
  return (
    <div className={styles.wrp} styles={containerStyles}>
      <button
        style={buttonStyles}
        className={styles.button}
        disabled={disabled}
        onClick={onClick}
        type={type}
      >
        {title}
      </button>
    </div>
  );
};

export default Button;
